#!/usr/bin/env python3
"""
Fix existing timesheet hours calculation
Run this in Frappe console: bench console
"""

def fix_timesheet_hours():
    try:
        # Get the specific timesheet
        timesheet_name = "6im5dmec6h"
        
        print(f"🔧 Fixing timesheet: {timesheet_name}")
        
        # Get timesheet document
        timesheet = frappe.get_doc("Custom Timesheet", timesheet_name)
        
        print(f"📊 Current total hours: {timesheet.total_hours}")
        
        # Recalculate all time logs
        total_hours = 0
        for time_log in timesheet.time_logs:
            if time_log.start_date_time and time_log.end_date_time:
                start_dt = frappe.utils.get_datetime(time_log.start_date_time)
                end_dt = frappe.utils.get_datetime(time_log.end_date_time)
                
                if start_dt and end_dt:
                    time_diff_seconds = frappe.utils.time_diff_in_seconds(end_dt, start_dt)
                    hours = time_diff_seconds / 3600.0
                    
                    # Handle same start and end time (minimum 0.1 hours)
                    if hours <= 0:
                        print(f"⚠️ Same start/end time for {time_log.name}, setting 0.1 hours")
                        hours = 0.1
                    
                    time_log.taken_hours = round(hours, 2)
                    total_hours += time_log.taken_hours
                    print(f"✅ Time log {time_log.name}: {time_log.taken_hours} hours")
        
        # Update total hours
        timesheet.total_hours = round(total_hours, 2)
        
        # Save the timesheet
        timesheet.save(ignore_permissions=True)
        
        print(f"🎉 Timesheet fixed!")
        print(f"📊 New total hours: {timesheet.total_hours}")
        print(f"📝 Time logs updated: {len(timesheet.time_logs)}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        frappe.log_error(f"Timesheet fix error: {str(e)}", "Timesheet Fix")

# Run the fix
fix_timesheet_hours()
