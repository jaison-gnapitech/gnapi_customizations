#!/usr/bin/env python3

import frappe

def test_approver():
    try:
        # Check if Approver DocType exists
        exists = frappe.db.exists("DocType", "Approver")
        print(f"Approver DocType exists: {exists}")
        
        if exists:
            # Check if there are any Approver records
            count = frappe.db.count("Approver")
            print(f"Number of Approver records: {count}")
            
            # List all Approver records
            approvers = frappe.get_all("Approver", fields=["name", "approver_name"])
            print(f"Approver records: {approvers}")
        else:
            print("Approver DocType does not exist!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_approver()
