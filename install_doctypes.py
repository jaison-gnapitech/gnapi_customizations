#!/usr/bin/env python3
"""
Simple script to install WeeklyTimesheet DocTypes
"""

import json
import sys
import os

# Add the Frappe bench directory to Python path
sys.path.insert(0, '/home/frappe/frappe-bench')

import frappe

def install_doctypes():
    """Install DocTypes from fixtures"""
    
    # Initialize Frappe
    frappe.init(site='mysite.localhost')
    frappe.connect()
    
    print("Installing DocTypes from fixtures...")
    
    # Read the fixture data
    fixture_path = '/home/frappe/frappe-bench/apps/gnapi_customizations/gnapi_customizations/fixtures/doctype.json'
    
    try:
        with open(fixture_path, 'r') as f:
            fixtures = json.load(f)
        
        print(f"Found {len(fixtures)} fixtures")
        
        # Find and install WeeklyTimesheet
        for fixture in fixtures:
            if fixture.get('name') == 'WeeklyTimesheet':
                print("Installing WeeklyTimesheet...")
                try:
                    from frappe.core.doctype.doctype.doctype import new_doctype
                    doctype = new_doctype(fixture)
                    doctype.insert()
                    print("WeeklyTimesheet installed successfully!")
                except Exception as e:
                    print(f"Error installing WeeklyTimesheet: {e}")
            
            elif fixture.get('name') == 'Weekly Timesheet Detail':
                print("Installing Weekly Timesheet Detail...")
                try:
                    from frappe.core.doctype.doctype.doctype import new_doctype
                    doctype = new_doctype(fixture)
                    doctype.insert()
                    print("Weekly Timesheet Detail installed successfully!")
                except Exception as e:
                    print(f"Error installing Weekly Timesheet Detail: {e}")
        
        frappe.db.commit()
        print("All DocTypes installed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    install_doctypes()
