#!/usr/bin/env python3

import frappe

def create_project_timesheet_approver_doctype():
    """Create the Project Timesheet Approver DocType"""
    
    # Check if DocType already exists
    if frappe.db.exists("DocType", "Project Timesheet Approver"):
        print("DocType 'Project Timesheet Approver' already exists")
        return
    
    # Create the DocType
    doctype = frappe.new_doc("DocType")
    doctype.name = "Project Timesheet Approver"
    doctype.module = "Gnapi Customizations"
    doctype.custom = 1
    doctype.istable = 1
    doctype.editable_grid = 1
    
    # Add the user field
    doctype.append("fields", {
        "fieldname": "user",
        "fieldtype": "Link",
        "label": "User",
        "options": "User",
        "reqd": 1,
        "in_list_view": 1
    })
    
    # Save the DocType
    doctype.insert()
    frappe.db.commit()
    
    print("DocType 'Project Timesheet Approver' created successfully")

if __name__ == "__main__":
    create_project_timesheet_approver_doctype()
