app_name = "gnapi_customizations"
app_title = "Gnapi Customizations"
app_publisher = "Vamsi Krishna Kothuru"
app_description = "Gnapi Customizations"
app_email = "vamsikothuru@gmail.com"
app_license = "mit"

# Fixtures
fixtures = [
        {"doctype": "Custom Field", "filters": [["module", "=", "Gnapi Customizations"]] },
        {"doctype": "DocType", "filters": [["module", "=", "Gnapi Customizations"]]},
        {"doctype": "Social Login Key", "filters": [["provider_name", "in", ["Office 365"]]]},
        {"doctype": "Property Setter", "filters": [["doc_type", "=", "Employee"]]},
        {"doctype": "Server Script", "filters": [["module", "=", "Gnapi Customizations"]]},
        {"doctype": "Weekly Timesheet", "filters": [["docstatus", "!=", 2]]},
        {"doctype": "Weekly Timesheet Detail", "filters": [["docstatus", "!=", 2]]}
]
# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "gnapi_customizations",
# 		"logo": "/assets/gnapi_customizations/logo.png",
# 		"title": "Gnapi Customizations",
# 		"route": "/gnapi_customizations",
# 		"has_permission": "gnapi_customizations.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/gnapi_customizations/css/gnapi_customizations.css"
# app_include_js = "/assets/gnapi_customizations/js/gnapi_customizations.js"

# include js, css files in header of web template
# web_include_css = "/assets/gnapi_customizations/css/gnapi_customizations.css"
# web_include_js = "/assets/gnapi_customizations/js/gnapi_customizations.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "gnapi_customizations/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {"WeeklyTimesheet": "public/js/weekly_timesheet.js"}
doctype_css = {"WeeklyTimesheet": "public/css/weekly_timesheet.css"}
doctype_list_js = {"WeeklyTimesheet": "public/js/weekly_timesheet_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Website pages
# --------------
# JavaScript files for web pages are automatically loaded based on page structure

# Frappe automatically handles routing for www pages
# /timesheet_dashboard maps to www/timesheet_dashboard.py

# Module definition for WeeklyTimesheet
# This helps Frappe properly route and display the DocType
doc_events = {
    "WeeklyTimesheet": {
        "validate": "gnapi_customizations.doctype.weekly_timesheet.weekly_timesheet.validate",
        "before_save": "gnapi_customizations.doctype.weekly_timesheet.weekly_timesheet.before_save",
        "on_submit": "gnapi_customizations.doctype.weekly_timesheet.weekly_timesheet.on_submit"
    }
}

# Add WeeklyTimesheet to navigation
# This ensures the DocType appears in the module list
app_include_js = "public/js/weekly_timesheet_list.js"
app_include_css = "public/css/weekly_timesheet.css"

# Desk menu configuration
# This adds WeeklyTimesheet to the main navigation
desk_menu = [
    {
        "module_name": "WeeklyTimesheet",
        "color": "#1f77b4",
        "icon": "octicon octicon-calendar",
        "type": "module",
        "label": "Weekly Timesheet"
    }
]

# Module help configuration
# This adds help documentation
module_help = {
    "WeeklyTimesheet": "WeeklyTimesheet is a comprehensive timesheet management system for tracking project activities and generating reports."
}

# Module navigation configuration
# This ensures proper navigation structure
get_module_data = [
    {
        "module_name": "WeeklyTimesheet",
        "category": "Modules",
        "label": "Weekly Timesheet",
        "color": "#1f77b4",
        "icon": "octicon octicon-calendar",
        "type": "module",
        "description": "Manage weekly timesheets and track project activities"
    }
]

# Add WeeklyTimesheet to app modules
# This ensures the module is properly registered
app_modules = [
    "gnapi_customizations.weeklytimesheet"
]

# Navigation configuration
# This adds WeeklyTimesheet to the navigation menu
get_navigation = "gnapi_customizations.weeklytimesheet.navigation.get_data"

# Module configuration
# This ensures the module is properly registered
modules = [
    {
        "module_name": "WeeklyTimesheet",
        "category": "Modules",
        "label": "Weekly Timesheet",
        "color": "#1f77b4",
        "icon": "octicon octicon-calendar",
        "type": "module",
        "description": "Manage weekly timesheets and track project activities"
    }
]

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "gnapi_customizations/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Frappe automatically routes /timesheet_dashboard to the www/timesheet_dashboard.py file
# No additional routing configuration needed for standard www pages

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "gnapi_customizations.utils.jinja_methods",
# 	"filters": "gnapi_customizations.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "gnapi_customizations.install.before_install"
# after_install = "gnapi_customizations.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "gnapi_customizations.uninstall.before_uninstall"
# after_uninstall = "gnapi_customizations.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "gnapi_customizations.utils.before_app_install"
# after_app_install = "gnapi_customizations.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "gnapi_customizations.utils.before_app_uninstall"
# after_app_uninstall = "gnapi_customizations.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "gnapi_customizations.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"gnapi_customizations.tasks.all"
# 	],
# 	"daily": [
# 		"gnapi_customizations.tasks.daily"
# 	],
# 	"hourly": [
# 		"gnapi_customizations.tasks.hourly"
# 	],
# 	"weekly": [
# 		"gnapi_customizations.tasks.weekly"
# 	],
# 	"monthly": [
# 		"gnapi_customizations.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "gnapi_customizations.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "gnapi_customizations.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "gnapi_customizations.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["gnapi_customizations.utils.before_request"]
# after_request = ["gnapi_customizations.utils.after_request"]

# Job Events
# ----------
# before_job = ["gnapi_customizations.utils.before_job"]
# after_job = ["gnapi_customizations.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"gnapi_customizations.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

