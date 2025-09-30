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
    # Employees can only see their own timesheets; admins/managers see all
    if user == "Administrator":
        return ""
    roles = frappe.get_roles(user)
    if "Employee" in roles:
        employee = _get_employee_for_user(user)
        if employee:
            return f"`tabCustom Timesheet`.`employee` = {frappe.db.escape(employee)}"
        # No linked employee: hide all
        return "`tabCustom Timesheet`.`name` = '_NO_ACCESS_'"
    return ""

def custom_timesheet_has_permission(doc: Document, user: str) -> bool:
    # Row-level check: employees can only access their own document
    if user == "Administrator":
        return True
    roles = frappe.get_roles(user)
    if "Employee" in roles:
        employee = _get_employee_for_user(user)
        return bool(employee and getattr(doc, "employee", None) == employee)
    return True
