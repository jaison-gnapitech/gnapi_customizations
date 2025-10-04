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

    # Default status handling
    if not doc.status:
        doc.status = "Draft"
    
    # Set approval status based on user role
    if "Employee" in frappe.get_roles() and "System Manager" not in frappe.get_roles():
        # Employees can only set status to Draft or Submitted
        allowed_statuses = ["Draft", "Submitted"]
        if doc.status and doc.status not in allowed_statuses:
            frappe.throw(
                f"Employees can only set status to Draft or Submitted. Current status '{doc.status}' is not allowed."
            )
        
        # Set approval status to Pending for employees
        doc.approval_status = "Pending"
    
    # Calculate total hours from start/end times
    if hasattr(doc, 'start_date') and hasattr(doc, 'start_time') and hasattr(doc, 'end_date') and hasattr(doc, 'end_time'):
        if doc.start_date and doc.start_time and doc.end_date and doc.end_time:
            from frappe.utils import get_datetime, time_diff_in_seconds
            
            start_datetime = get_datetime(f"{doc.start_date} {doc.start_time}")
            end_datetime = get_datetime(f"{doc.end_date} {doc.end_time}")
            
            if end_datetime > start_datetime:
                total_seconds = time_diff_in_seconds(end_datetime, start_datetime)
                doc.total_hours = round(total_seconds / 3600, 2)  # Convert seconds to hours
            else:
                frappe.throw("End date/time must be after start date/time")
    
    # Validate required fields only if they exist on this DocType
    meta = frappe.get_meta(doc.doctype)

    if meta.has_field("project"):
        if not getattr(doc, "project", None):
            frappe.throw("Project is required")

    if meta.has_field("start_date") or meta.has_field("start_time"):
        if not getattr(doc, "start_date", None) or not getattr(doc, "start_time", None):
            frappe.throw("Start Date and Start Time are required")

    if meta.has_field("end_date") or meta.has_field("end_time"):
        if not getattr(doc, "end_date", None) or not getattr(doc, "end_time", None):
            frappe.throw("End Date and End Time are required")
    
    # Validate Custom Timesheet Detail child table (Time Logs)
    # First check if at least one row exists
    if not hasattr(doc, 'time_logs') or not doc.time_logs or len(doc.time_logs) == 0:
        frappe.throw("At least one row is required in Custom Timesheet Details table")
    
    # Validate each row in the time_logs table
    for i, row in enumerate(doc.time_logs, 1):
        # Check if any required field is missing
        missing_fields = []
        
        # Debug: Log the row data to see what's actually there
        frappe.logger().info(f"Row {i} data: {dict(row)}")
        
        # Check for empty, None, or whitespace-only values
        if not row.get('project') or not str(row.get('project', '')).strip():
            missing_fields.append("Project")
        if not row.get('task') or not str(row.get('task', '')).strip():
            missing_fields.append("Task")
        if not row.get('start_date_time'):
            missing_fields.append("Start Date and Time")
        if not row.get('end_date_time'):
            missing_fields.append("End Date and Time")
        
        if missing_fields:
            frappe.throw(f"Mandatory fields required in Custom Timesheet Details, Row {i}: {', '.join(missing_fields)}")
        
        # Validate that end time is after start time
        if row.get('start_date_time') and row.get('end_date_time'):
            start_dt = get_datetime(row.start_date_time)
            end_dt = get_datetime(row.end_date_time)
            if end_dt <= start_dt:
                frappe.throw(f"End Date and Time must be after Start Date and Time in Custom Timesheet Details row {i}")

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
    
    # Users who are approvers for projects can see timesheets for those projects (Submitted/Approved/Rejected only)
    # Get all projects where this user is an approver (using new direct user-based approver field)
    projects_where_approver = frappe.db.sql("""
        SELECT DISTINCT name 
        FROM `tabProject` 
        WHERE approver IS NOT NULL 
        AND (approver LIKE %s OR approver LIKE %s OR approver LIKE %s OR approver = %s)
    """, (f"%{user},%", f"%,{user}%", f"%,{user},%", user), as_dict=False)
    
    if projects_where_approver:
        project_list = "','".join([frappe.db.escape(p[0]) for p in projects_where_approver])
        conditions.append(
            f"(EXISTS (SELECT 1 FROM `tabCustom Timesheet Detail` "
            f"WHERE `tabCustom Timesheet Detail`.`parent` = `tabCustom Timesheet`.`name` "
            f"AND `tabCustom Timesheet Detail`.`project` IN ('{project_list}')) "
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
    
    # Check if user is an approver for any project in this timesheet
    status = getattr(doc, "status", None)
    if status in ["Submitted", "Approved", "Rejected"]:
        for time_log in (doc.time_logs or []):
            project = getattr(time_log, "project", None)
            if project:
                # Check if user is an approver for this project
                is_approver = frappe.db.sql("""
                    SELECT 1 FROM `tabProject` p
                    INNER JOIN `tabApprover` a ON p.approver = a.name
                    INNER JOIN `tabApprover User` au ON a.name = au.parent
                    WHERE p.name = %s AND au.employee = %s
                    LIMIT 1
                """, (project, employee))
                if is_approver:
                    return True
    
    return False

# ==================== APPROVAL WORKFLOW METHODS ====================

@frappe.whitelist()
def approve_timesheet(timesheet_name: str, comments: str = "") -> dict:
    """Approve a timesheet"""
    try:
        doc = frappe.get_doc("Custom Timesheet", timesheet_name)
        
        # Check if user is authorized to approve this timesheet
        if not _can_user_approve_timesheet(doc, frappe.session.user):
            frappe.throw("You are not authorized to approve this timesheet")
        
        # Update approval fields
        doc.approval_status = "Approved"
        doc.approved_by = frappe.session.user
        doc.approval_date = frappe.utils.now()
        doc.approval_comments = comments
        
        doc.save(ignore_permissions=True)
        
        # Send notification to employee
        _send_approval_notification(doc, "approved", comments)
        
        return {"success": True, "message": "Timesheet approved successfully"}
        
    except Exception as e:
        frappe.log_error(f"Error approving timesheet {timesheet_name}: {str(e)}")
        frappe.throw(f"Error approving timesheet: {str(e)}")

@frappe.whitelist()
def reject_timesheet(timesheet_name: str, comments: str) -> dict:
    """Reject a timesheet"""
    try:
        doc = frappe.get_doc("Custom Timesheet", timesheet_name)
        
        # Check if user is authorized to reject this timesheet
        if not _can_user_approve_timesheet(doc, frappe.session.user):
            frappe.throw("You are not authorized to reject this timesheet")
        
        # Update approval fields
        doc.approval_status = "Rejected"
        doc.approved_by = frappe.session.user
        doc.approval_date = frappe.utils.now()
        doc.approval_comments = comments
        
        doc.save(ignore_permissions=True)
        
        # Send notification to employee
        _send_approval_notification(doc, "rejected", comments)
        
        return {"success": True, "message": "Timesheet rejected"}
        
    except Exception as e:
        frappe.log_error(f"Error rejecting timesheet {timesheet_name}: {str(e)}")
        frappe.throw(f"Error rejecting timesheet: {str(e)}")

def _can_user_approve_timesheet(timesheet_doc: Document, user: str) -> bool:
    """Check if user can approve the given timesheet"""
    
    # System Manager can approve any timesheet
    if "System Manager" in frappe.get_roles(user):
        return True
    
    # Get projects from timesheet time logs
    project_names = []
    for row in (timesheet_doc.time_logs or []):
        if getattr(row, "project", None):
            project_names.append(row.project)
    
    if not project_names:
        return False
    
    # Check if user is an approver for any of these projects
    projects = frappe.get_all("Project", 
        filters={"name": ["in", project_names]}, 
        fields=["name", "approver"])
    
    for project in projects:
        if project.approver:
            approvers = [a.strip() for a in project.approver.split(",")]
            if user in approvers:
                return True
    
    return False

def _send_approval_notification(timesheet_doc: Document, action: str, comments: str):
    """Send notification to employee about timesheet approval/rejection"""
    try:
        # Get employee's user ID
        employee_user = frappe.db.get_value("Employee", timesheet_doc.employee, "user_id")
        if not employee_user:
            return
        
        subject = f"Timesheet {action.title()}: {timesheet_doc.name}"
        
        message = f"""
        <p>Your timesheet <strong>{timesheet_doc.name}</strong> has been <strong>{action}</strong>.</p>
        
        <p><strong>Details:</strong></p>
        <ul>
            <li>Employee: {timesheet_doc.employee}</li>
            <li>Status: {action.title()}</li>
            <li>Approved/Rejected by: {frappe.session.user}</li>
            <li>Date: {frappe.utils.format_datetime(frappe.utils.now())}</li>
        </ul>
        
        {f"<p><strong>Comments:</strong><br>{comments}</p>" if comments else ""}
        
        <p>You can view your timesheet <a href="/app/custom-timesheet/{timesheet_doc.name}">here</a>.</p>
        """
        
        frappe.sendmail(
            recipients=[employee_user],
            subject=subject,
            message=message,
            reference_doctype="Custom Timesheet",
            reference_name=timesheet_doc.name
        )
        
    except Exception as e:
        frappe.log_error(f"Error sending approval notification: {str(e)}")

# Removed duplicate function - using the one above

def custom_timesheet_has_permission(doc, user):
    """Custom has_permission for Custom Timesheet"""
    
    if not user:
        user = frappe.session.user
    
    # System Manager has full access
    if "System Manager" in frappe.get_roles(user):
        return True
    
    # Employee can access their own timesheets
    employee = frappe.db.get_value("Employee", {"user_id": user}, "name")
    if employee and doc.employee == employee:
        return True
    
    # Check if user is an approver for any project in this timesheet
    if hasattr(doc, 'time_logs') and doc.time_logs:
        project_names = []
        for row in doc.time_logs:
            if getattr(row, "project", None):
                project_names.append(row.project)
        
        if project_names:
            # Check if user is an approver for any of these projects using new structure
            projects = frappe.get_all("Project", 
                filters={"name": ["in", project_names]}, 
                fields=["name", "approver"])
            
            for project in projects:
                if project.approver:
                    # Check if user is in the comma-separated list of approvers
                    approvers = [a.strip() for a in project.approver.split(",")]
                    if user in approvers:
                        return True
    
    return False

@frappe.whitelist()
def debug_approver_access(user_email=None):
    """Debug function to check approver access for a specific user"""
    if not user_email:
        user_email = frappe.session.user
    
    result = {
        "user": user_email,
        "projects_as_approver": [],
        "timesheets_visible": [],
        "permission_query": ""
    }
    
    # Get projects where user is approver
    projects = frappe.db.sql("""
        SELECT name, approver 
        FROM `tabProject` 
        WHERE approver IS NOT NULL 
        AND (approver LIKE %s OR approver LIKE %s OR approver LIKE %s OR approver = %s)
    """, (f"%{user_email},%", f"%,{user_email}%", f"%,{user_email},%", user_email), as_dict=True)
    
    result["projects_as_approver"] = projects
    
    # Get permission query result
    permission_query = custom_timesheet_permission_query(user_email)
    result["permission_query"] = permission_query
    
    # Get timesheets that would be visible
    if permission_query and permission_query != "1=0":
        timesheets = frappe.db.sql(f"""
            SELECT name, employee, status 
            FROM `tabCustom Timesheet` 
            WHERE {permission_query}
            LIMIT 10
        """, as_dict=True)
        result["timesheets_visible"] = timesheets
    
    return result

def on_custom_timesheet_after_submit(doc: Document, method: str | None = None) -> None:
    """Create approval records when timesheet is submitted"""
    try:
        from gnapi_customizations.customizations.timesheet_approval_events import create_approval_for_timesheet
        create_approval_for_timesheet(doc.name)
    except Exception as e:
        frappe.log_error(f"Error creating approval for timesheet {doc.name}: {str(e)}")
