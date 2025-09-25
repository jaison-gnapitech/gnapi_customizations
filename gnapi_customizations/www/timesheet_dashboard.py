import frappe
from frappe import _
from frappe.utils import getdate, date_diff, add_days, cstr, flt
import datetime


def get_context(context):
    """Context for the timesheet dashboard page"""

    # Set page title and metadata
    context.title = _("Weekly Timesheet Dashboard")
    context.body_class = "timesheet-dashboard"

    # Add breadcrumb
    context.parents = [
        {"label": _("Home"), "route": "/"},
        {"label": _("Weekly Timesheet"), "route": "/timesheet-dashboard"}
    ]

    # Get dashboard statistics
    context.stats = get_dashboard_stats()

    # Get recent timesheets
    context.recent_timesheets = get_recent_timesheets()

    # Add quick actions
    context.show_create_button = True
    context.show_export_button = True

    return context


@frappe.whitelist(allow_guest=False)
def get_dashboard_stats():
    """Get dashboard statistics for the current user"""

    user = frappe.session.user

    # Get employee linked to user
    employee = frappe.db.get_value("Employee", {"user_id": user}, "name")

    if not employee:
        return {
            "total_timesheets": 0,
            "total_hours": 0,
            "avg_hours": 0,
            "pending_approvals": 0
        }

    # Get timesheet statistics
    timesheets = frappe.get_all("WeeklyTimesheet",
        filters={"employee": employee},
        fields=["total_hours", "docstatus"],
        order_by="creation desc"
    )

    if not timesheets:
        return {
            "total_timesheets": 0,
            "total_hours": 0,
            "avg_hours": 0,
            "pending_approvals": 0
        }

    total_timesheets = len(timesheets)
    total_hours = sum(ts.total_hours or 0 for ts in timesheets)
    avg_hours = total_hours / total_timesheets if total_timesheets > 0 else 0
    pending_approvals = len([ts for ts in timesheets if ts.docstatus == 0])

    return {
        "total_timesheets": total_timesheets,
        "total_hours": round(total_hours, 1),
        "avg_hours": round(avg_hours, 1),
        "pending_approvals": pending_approvals
    }


@frappe.whitelist(allow_guest=False)
def get_recent_timesheets(limit=10):
    """Get recent timesheets for the current user"""

    user = frappe.session.user

    # Get employee linked to user
    employee = frappe.db.get_value("Employee", {"user_id": user}, "name")

    if not employee:
        return []

    timesheets = frappe.get_all("WeeklyTimesheet",
        filters={"employee": employee},
        fields=["name", "employee_name", "from_date", "to_date", "total_hours", "docstatus"],
        order_by="creation desc",
        limit=limit
    )

    # Format the data
    formatted_timesheets = []
    for ts in timesheets:
        formatted_timesheets.append({
            "name": ts.name,
            "employee_name": ts.employee_name or "N/A",
            "from_date": ts.from_date.strftime('%Y-%m-%d') if ts.from_date else "",
            "to_date": ts.to_date.strftime('%Y-%m-%d') if ts.to_date else "",
            "total_hours": ts.total_hours or 0,
            "status": "Submitted" if ts.docstatus == 1 else "Draft"
        })

    return formatted_timesheets
