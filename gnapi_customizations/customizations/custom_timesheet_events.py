from __future__ import annotations

import frappe
from frappe.model.document import Document
from frappe.utils import get_datetime, time_diff_in_seconds

def _get_employee_for_user(user: str) -> str | None:
    return frappe.db.get_value("Employee", {"user_id": user}, "name")

def on_custom_timesheet_validate(doc: Document, method: str | None = None) -> None:
    # Auto-assign employee for non-Administrator employees
    if frappe.session.user != "Administrator" and "Employee" in frappe.get_roles():
        employee = _get_employee_for_user(frappe.session.user)
        if employee:
            doc.employee = employee
        else:
            frappe.throw(f"No Employee record linked to user {frappe.session.user}")

    # Auto-assign approver based on project creator
    if doc.time_logs and len(doc.time_logs) > 0:
        # Get the first project from time logs
        project_name = None
        for row in doc.time_logs:
            if getattr(row, "project", None):
                project_name = row.project
                break
        
        # Set approver to project owner/creator if not already set
        if project_name and not doc.approver:
            project_owner = frappe.db.get_value("Project", project_name, "owner")
            if project_owner:
                # Try to get employee linked to project owner
                approver_employee = frappe.db.get_value("Employee", {"user_id": project_owner}, "name")
                if approver_employee:
                    doc.approver = approver_employee

    # Default status handling for Employees
    if not doc.status:
        if "Employee" in frappe.get_roles():
            doc.status = "Draft"
    
    # Restrict status options for Employee role (not System Manager)
    if "Employee" in frappe.get_roles() and "System Manager" not in frappe.get_roles():
        allowed_statuses = ["Draft", "Submitted"]
        if doc.status and doc.status not in allowed_statuses:
            frappe.throw(f"Employees can only set status to Draft or Submitted. Current status '{doc.status}' is not allowed.")

    # Aggregate total hours from child rows safely
    total_hours = 0.0
    for row in (doc.time_logs or []):
        try:
            if row.taken_hours and float(row.taken_hours) > 0:
                total_hours += float(row.taken_hours)
        except Exception:
            # Ignore malformed values, treat as zero
            continue
    doc.total_hours = round(total_hours, 2)

def on_custom_timesheet_before_save(doc: Document, method: str | None = None) -> None:
    # Recalculate taken_hours for each time log row if both datetimes exist
    for row in (doc.time_logs or []):
        if getattr(row, "start_date_time", None) and getattr(row, "end_date_time", None):
            try:
                start_dt = get_datetime(row.start_date_time)
                end_dt = get_datetime(row.end_date_time)
                if start_dt and end_dt:
                    seconds = time_diff_in_seconds(end_dt, start_dt)
                    hours = seconds / 3600.0
                    if hours <= 0:
                        hours = 0.1
                    row.taken_hours = round(hours, 2)
                else:
                    row.taken_hours = 0
            except Exception as e:
                frappe.log_error(f"Error recalculating time log: {e}", "Custom Timesheet")
                row.taken_hours = 0

def on_custom_timesheet_detail_before_save(doc: Document, method: str | None = None) -> None:
    # Calculate taken_hours for a single detail row
    if getattr(doc, "start_date_time", None) and getattr(doc, "end_date_time", None):
        try:
            start_dt = get_datetime(doc.start_date_time)
            end_dt = get_datetime(doc.end_date_time)
            if start_dt and end_dt:
                seconds = time_diff_in_seconds(end_dt, start_dt)
                hours = seconds / 3600.0
                if hours <= 0:
                    hours = 0.1
                doc.taken_hours = round(hours, 2)
            else:
                doc.taken_hours = 0
        except frappe.ValidationError:
            raise
        except Exception as e:
            frappe.log_error(f"Error recalculating time detail: {e}", "Custom Timesheet")
            doc.taken_hours = 0
    else:
        doc.taken_hours = 0

def custom_timesheet_permission_query(user: str) -> str:
    # Admins see all
    if user == "Administrator":
        return ""
    
    roles = frappe.get_roles(user)
    employee = _get_employee_for_user(user)
    
    # System Managers see all
    if "System Manager" in roles:
        return ""
    
    # Build permission conditions
    conditions = []
    
    # Employees can see their own timesheets (all statuses)
    if "Employee" in roles and employee:
        conditions.append(f"`tabCustom Timesheet`.`employee` = {frappe.db.escape(employee)}")
    
    # Approvers can see timesheets assigned to them, but ONLY Submitted/Approved/Rejected (not Draft)
    if employee:
        conditions.append(
            f"(`tabCustom Timesheet`.`approver` = {frappe.db.escape(employee)} "
            f"AND `tabCustom Timesheet`.`status` IN ('Submitted', 'Approved', 'Rejected'))"
        )
    
    # Combine conditions with OR
    if conditions:
        return f"({' OR '.join(conditions)})"
    
    # No access if no conditions match
    return "`tabCustom Timesheet`.`name` = '_NO_ACCESS_'"

def custom_timesheet_has_permission(doc: Document, user: str) -> bool:
    # Row-level check: employees can access their own timesheets or timesheets they approve
    if user == "Administrator":
        return True
    
    roles = frappe.get_roles(user)
    
    # System Managers have full access
    if "System Manager" in roles:
        return True
    
    employee = _get_employee_for_user(user)
    if not employee:
        return False
    
    # Employee can access their own timesheets (all statuses)
    if getattr(doc, "employee", None) == employee:
        return True
    
    # Approver can access timesheets assigned to them, but ONLY if Submitted/Approved/Rejected
    if getattr(doc, "approver", None) == employee:
        status = getattr(doc, "status", None)
        if status in ["Submitted", "Approved", "Rejected"]:
            return True
    
    return False
