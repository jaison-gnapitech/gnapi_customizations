#!/usr/bin/env python3
"""
Check the current status of Start Date and End Date fields
Run this in Frappe console: bench console
"""

def check_field_status():
    try:
        print("🔍 Checking field status...")
        
        # Get the Custom Timesheet doctype
        doctype = frappe.get_doc("DocType", "Custom Timesheet")
        
        # Check week_start_date field
        for field in doctype.fields:
            if field.fieldname == "week_start_date":
                print(f"📅 week_start_date:")
                print(f"   - Hidden: {field.hidden}")
                print(f"   - In List View: {field.in_list_view}")
                print(f"   - In Preview: {field.in_preview}")
                print(f"   - Label: {field.label}")
            elif field.fieldname == "week_end_date":
                print(f"📅 week_end_date:")
                print(f"   - Hidden: {field.hidden}")
                print(f"   - In List View: {field.in_list_view}")
                print(f"   - In Preview: {field.in_preview}")
                print(f"   - Label: {field.label}")
        
        print("✅ Field status checked!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        frappe.log_error(f"Check field status error: {str(e)}", "Check Field Status")

# Run the check
check_field_status()
