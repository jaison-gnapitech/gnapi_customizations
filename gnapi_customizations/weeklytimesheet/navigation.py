# WeeklyTimesheet Navigation Configuration
# This file defines the navigation structure for the WeeklyTimesheet module

from frappe import _

def get_data():
    """Return navigation data for WeeklyTimesheet module"""

    return [
        {
            "label": _("Weekly Timesheet"),
            "icon": "octicon octicon-calendar",
            "items": [
                {
                    "type": "doctype",
                    "name": "WeeklyTimesheet",
                    "label": _("Weekly Timesheet"),
                    "description": _("Manage weekly timesheets"),
                    "route": "/app/weeklytimesheet"
                },
                {
                    "type": "page",
                    "name": "timesheet-dashboard",
                    "label": _("Dashboard"),
                    "description": _("Timesheet Dashboard"),
                    "route": "/timesheet_dashboard"
                }
            ]
        }
    ]

def get_module_data():
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
