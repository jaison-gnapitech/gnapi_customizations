#!/usr/bin/env python3
"""
Force hide the Start Date and End Date fields in Custom Timesheet
Run this in Frappe console: bench console
"""

def force_hide_date_fields():
    try:
        print("🔧 Force hiding Start Date and End Date fields...")
        
        # Get the Custom Timesheet doctype
        doctype = frappe.get_doc("DocType", "Custom Timesheet")
        
        # Find and hide week_start_date field
        for field in doctype.fields:
            if field.fieldname == "week_start_date":
                field.hidden = 1
                field.in_list_view = 0
                field.in_preview = 0
                print(f"✅ Hidden field: {field.fieldname}")
            elif field.fieldname == "week_end_date":
                field.hidden = 1
                field.in_list_view = 0
                field.in_preview = 0
                print(f"✅ Hidden field: {field.fieldname}")
        
        # Save the doctype
        doctype.save(ignore_permissions=True)
        print("✅ DocType updated successfully!")
        
        # Clear cache
        frappe.clear_cache()
        print("✅ Cache cleared!")
        
        print("🎉 Fields should now be hidden!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        frappe.log_error(f"Force hide fields error: {str(e)}", "Force Hide Fields")

# Run the fix
force_hide_date_fields()
