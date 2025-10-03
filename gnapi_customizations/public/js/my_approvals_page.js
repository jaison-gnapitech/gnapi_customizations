// My Approvals Page - Simple list view for Timesheet Approvals
frappe.listview_settings['Timesheet Approval'] = {
    add_fields: ["timesheet", "employee", "project", "approval_status", "approver", "approval_date"],
    
    get_indicator: function(doc) {
        if (doc.approval_status === "Approved") {
            return [__("Approved"), "green", "approval_status,=,Approved"];
        } else if (doc.approval_status === "Rejected") {
            return [__("Rejected"), "red", "approval_status,=,Rejected"];
        } else {
            return [__("Pending"), "orange", "approval_status,=,Pending"];
        }
    },
    
    onload: function(listview) {
        console.log('My Approvals page loaded');
        
        // Add filter for current user's approvals
        if (frappe.session.user !== 'Administrator') {
            listview.filter_area.add([['Timesheet Approval', 'approver', '=', frappe.session.user]]);
        }
        
        // Add quick action buttons
        listview.page.add_menu_item(__('Approve Selected'), function() {
            approveSelected(listview);
        });
        
        listview.page.add_menu_item(__('Reject Selected'), function() {
            rejectSelected(listview);
        });
    }
};

function approveSelected(listview) {
    const selected = listview.get_checked_items();
    if (selected.length === 0) {
        frappe.msgprint(__('Please select items to approve'));
        return;
    }
    
    frappe.confirm(__('Approve {0} timesheet(s)?', [selected.length]), function() {
        frappe.call({
            method: 'gnapi_customizations.customizations.timesheet_approval_events.bulk_approve',
            args: {
                approvals: selected.map(item => item.name)
            },
            callback: function(r) {
                if (r.message) {
                    frappe.show_alert({
                        message: __('Approved {0} timesheet(s)', [selected.length]),
                        indicator: 'green'
                    });
                    listview.refresh();
                }
            }
        });
    });
}

function rejectSelected(listview) {
    const selected = listview.get_checked_items();
    if (selected.length === 0) {
        frappe.msgprint(__('Please select items to reject'));
        return;
    }
    
    frappe.prompt({
        title: __('Reject Timesheets'),
        fields: [
            {
                fieldtype: 'Small Text',
                fieldname: 'comments',
                label: __('Rejection Comments'),
                reqd: 1
            }
        ]
    }, function(values) {
        frappe.call({
            method: 'gnapi_customizations.customizations.timesheet_approval_events.bulk_reject',
            args: {
                approvals: selected.map(item => item.name),
                comments: values.comments
            },
            callback: function(r) {
                if (r.message) {
                    frappe.show_alert({
                        message: __('Rejected {0} timesheet(s)', [selected.length]),
                        indicator: 'red'
                    });
                    listview.refresh();
                }
            }
        });
    });
}
