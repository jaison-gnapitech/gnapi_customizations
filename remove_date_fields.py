#!/usr/bin/env python3
"""
Remove Start Date and End Date fields completely from Custom Timesheet
Run this in Frappe console: bench console
"""

def remove_date_fields():
    try:
        print("🗑️ Removing Start Date and End Date fields completely...")
        
        # Get the Custom Timesheet doctype
        doctype = frappe.get_doc("DocType", "Custom Timesheet")
        
        # Remove week_start_date field
        fields_to_remove = ["week_start_date", "week_end_date"]
        
        for field_name in fields_to_remove:
            # Find and remove the field
            fields_to_keep = []
            for field in doctype.fields:
                if field.fieldname != field_name:
                    fields_to_keep.append(field)
                else:
                    print(f"✅ Removing field: {field_name}")
            
            doctype.fields = fields_to_keep
        
        # Save the doctype
        doctype.save(ignore_permissions=True)
        print("✅ Fields removed successfully!")
        
        # Clear cache
        frappe.clear_cache()
        print("✅ Cache cleared!")
        
        print("🎉 Date fields completely removed!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        frappe.log_error(f"Remove date fields error: {str(e)}", "Remove Date Fields")

# Run the fix
remove_date_fields()
