# WeeklyTimesheet Module
# This module contains the WeeklyTimesheet DocType and related functionality

from frappe import _

def get_data():
    """Return module data for WeeklyTimesheet"""
    return {
        "module_name": "WeeklyTimesheet",
        "category": "Modules", 
        "label": _("Weekly Timesheet"),
        "color": "#1f77b4",
        "icon": "octicon octicon-calendar",
        "type": "module",
        "description": _("Manage weekly timesheets and track project activities")
    }
