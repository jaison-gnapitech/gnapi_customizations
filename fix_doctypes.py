#!/usr/bin/env python3
"""
Script to manually create WeeklyTimesheet DocTypes
"""

import json
import sys
import os

# Add the Frappe bench directory to Python path
sys.path.insert(0, '/home/frappe/frappe-bench')

import frappe

def create_weekly_timesheet():
    """Create WeeklyTimesheet DocType manually"""
    
    # Initialize Frappe
    frappe.init(site='mysite.localhost')
    frappe.connect()
    
    print("Creating WeeklyTimesheet DocType...")
    
    # Check if already exists
    if frappe.db.exists("DocType", "WeeklyTimesheet"):
        print("WeeklyTimesheet already exists!")
        return True
    
    # Read fixture data
    fixture_path = '/home/frappe/frappe-bench/apps/gnapi_customizations/gnapi_customizations/fixtures/doctype.json'
    
    with open(fixture_path, 'r') as f:
        fixtures = json.load(f)
    
    # Find WeeklyTimesheet fixture
    weekly_timesheet_fixture = None
    for fixture in fixtures:
        if fixture.get('name') == 'WeeklyTimesheet':
            weekly_timesheet_fixture = fixture
            break
    
    if not weekly_timesheet_fixture:
        print("WeeklyTimesheet fixture not found!")
        return False
    
    print(f"Found WeeklyTimesheet fixture: {weekly_timesheet_fixture['name']}")
    
    try:
        # Create the DocType
        from frappe.core.doctype.doctype.doctype import new_doctype
        doctype = new_doctype(weekly_timesheet_fixture)
        doctype.insert()
        print("WeeklyTimesheet DocType created successfully!")
        
        # Commit the changes
        frappe.db.commit()
        return True
        
    except Exception as e:
        print(f"Error creating WeeklyTimesheet DocType: {e}")
        return False

def create_weekly_timesheet_detail():
    """Create Weekly Timesheet Detail DocType manually"""
    
    print("Creating Weekly Timesheet Detail DocType...")
    
    # Check if already exists
    if frappe.db.exists("DocType", "Weekly Timesheet Detail"):
        print("Weekly Timesheet Detail already exists!")
        return True
    
    # Read fixture data
    fixture_path = '/home/frappe/frappe-bench/apps/gnapi_customizations/gnapi_customizations/fixtures/doctype.json'
    
    with open(fixture_path, 'r') as f:
        fixtures = json.load(f)
    
    # Find Weekly Timesheet Detail fixture
    detail_fixture = None
    for fixture in fixtures:
        if fixture.get('name') == 'Weekly Timesheet Detail':
            detail_fixture = fixture
            break
    
    if not detail_fixture:
        print("Weekly Timesheet Detail fixture not found!")
        return False
    
    print(f"Found Weekly Timesheet Detail fixture: {detail_fixture['name']}")
    
    try:
        # Create the DocType
        from frappe.core.doctype.doctype.doctype import new_doctype
        doctype = new_doctype(detail_fixture)
        doctype.insert()
        print("Weekly Timesheet Detail DocType created successfully!")
        
        # Commit the changes
        frappe.db.commit()
        return True
        
    except Exception as e:
        print(f"Error creating Weekly Timesheet Detail DocType: {e}")
        return False

if __name__ == "__main__":
    print("=== Creating WeeklyTimesheet DocTypes ===")
    
    success1 = create_weekly_timesheet()
    success2 = create_weekly_timesheet_detail()
    
    if success1 and success2:
        print("\n✅ All DocTypes created successfully!")
        print("WeeklyTimesheet should now appear in the DocType list!")
    else:
        print("\n❌ Some DocTypes failed to create!")
        sys.exit(1)
