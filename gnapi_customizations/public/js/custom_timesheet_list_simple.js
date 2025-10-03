// Simplified Custom Timesheet List View
(function() {
    "use strict";
    
    // Wait for Frappe to be fully loaded
    function waitForFrappe() {
        if (typeof frappe !== 'undefined' && frappe.listview_settings) {
            setupCustomTimesheetList();
        } else {
            setTimeout(waitForFrappe, 100);
        }
    }
    
    function setupCustomTimesheetList() {
        try {
            frappe.listview_settings['Custom Timesheet'] = {
                add_fields: ["employee", "status"],
                get_indicator: function(doc) {
                    if (doc.status === "Approved") {
                        return [__("Approved"), "green", "status,=,Approved"];
                    } else if (doc.status === "Rejected") {
                        return [__("Rejected"), "red", "status,=,Rejected"];
                    } else if (doc.status === "Submitted") {
                        return [__("Pending Approval"), "orange", "status,=,Submitted"];
                    }
                    return [__("Draft"), "gray", "status,=,Draft"];
                },
                
                onload: function(listview) {
                    console.log('Custom Timesheet List View Loading...');
                    
                    // Add simple My Approvals button
                    if (listview && listview.page && listview.page.add_menu_item) {
                        listview.page.add_menu_item(__('My Approvals'), function() {
                            showMyApprovalsSimple(listview);
                        });
                    }
                }
            };
            console.log('Custom Timesheet list view settings configured successfully');
        } catch (error) {
            console.error('Error setting up Custom Timesheet list view:', error);
        }
    }
    
    function showMyApprovalsSimple(listview) {
        console.log('My Approvals clicked - Current user:', frappe.session.user);
        
        if (listview && listview.filter_area) {
            // Clear existing filters
            listview.filter_area.clear();
            
            // Show only submitted timesheets
            listview.filter_area.add([[listview.doctype, 'status', '=', 'Submitted']]);
            
            frappe.show_alert({
                message: __('Showing submitted timesheets'),
                indicator: 'blue'
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForFrappe);
    } else {
        waitForFrappe();
    }
})();
