#!/usr/bin/env python3

import frappe

def update_doctype_names():
    """Update DocType names from Weekly Timesheet to Timesheet"""
    
    # Update Weekly Timesheet to Timesheet
    frappe.db.sql("""
        UPDATE tabDocType 
        SET name = 'Timesheet' 
        WHERE name = 'Weekly Timesheet'
    """)
    
    # Update Weekly Timesheet Detail to Timesheet Detail
    frappe.db.sql("""
        UPDATE tabDocType 
        SET name = 'Timesheet Detail' 
        WHERE name = 'Weekly Timesheet Detail'
    """)
    
    # Update any references in DocField
    frappe.db.sql("""
        UPDATE tabDocField 
        SET options = 'Timesheet' 
        WHERE options = 'Weekly Timesheet'
    """)
    
    frappe.db.sql("""
        UPDATE tabDocField 
        SET options = 'Timesheet Detail' 
        WHERE options = 'Weekly Timesheet Detail'
    """)
    
    # Update any references in Server Script
    frappe.db.sql("""
        UPDATE tabServer Script 
        SET reference_doctype = 'Timesheet' 
        WHERE reference_doctype = 'Weekly Timesheet'
    """)
    
    # Commit changes
    frappe.db.commit()
    
    print("✅ DocType names updated successfully!")
    print("✅ Weekly Timesheet → Timesheet")
    print("✅ Weekly Timesheet Detail → Timesheet Detail")

if __name__ == "__main__":
    update_doctype_names()
