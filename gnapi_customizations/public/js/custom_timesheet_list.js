// Custom Timesheet List View Enhancements for Approvers
frappe.listview_settings['Custom Timesheet'] = {
    add_fields: ["approval_status", "employee", "approved_by"],
    get_indicator: function(doc) {
        if (doc.approval_status === "Approved") {
            return [__("Approved"), "green", "approval_status,=,Approved"];
        } else if (doc.approval_status === "Rejected") {
            return [__("Rejected"), "red", "approval_status,=,Rejected"];
        } else if (doc.approval_status === "Pending") {
            return [__("Pending Approval"), "orange", "approval_status,=,Pending"];
        }
        return [__("Draft"), "gray", "docstatus,=,0"];
    },
    
    onload: function(listview) {
        // Add employee filter button for approvers
        add_employee_filter_for_approvers(listview);
        
        // Add approval status filters
        add_approval_status_filters(listview);
    }
};

function add_employee_filter_for_approvers(listview) {
    // Check if current user is an approver for any project
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Project',
            fields: ['name', 'approver'],
            filters: {
                approver: ['like', `%${frappe.session.user}%`]
            }
        },
        callback: function(r) {
            if (r.message && r.message.length > 0) {
                // User is an approver, add employee filter
                listview.page.add_menu_item(__('Filter by Employee'), function() {
                    show_employee_filter_dialog(listview);
                });
                
                listview.page.add_menu_item(__('My Approvals'), function() {
                    show_my_approvals(listview);
                });
            }
        }
    });
}

function add_approval_status_filters(listview) {
    // Add quick filter buttons
    listview.page.add_inner_button(__('Pending Approval'), function() {
        listview.filter_area.add([[listview.doctype, 'approval_status', '=', 'Pending']]);
    });
    
    listview.page.add_inner_button(__('Approved'), function() {
        listview.filter_area.add([[listview.doctype, 'approval_status', '=', 'Approved']]);
    });
    
    listview.page.add_inner_button(__('Rejected'), function() {
        listview.filter_area.add([[listview.doctype, 'approval_status', '=', 'Rejected']]);
    });
}

function show_employee_filter_dialog(listview) {
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Employee',
            fields: ['name', 'employee_name'],
            limit_page_length: 0,
            order_by: 'employee_name'
        },
        callback: function(r) {
            if (r.message) {
                const d = new frappe.ui.Dialog({
                    title: 'Filter Timesheets by Employee',
                    fields: [
                        {
                            fieldtype: 'Select',
                            fieldname: 'employee',
                            label: 'Select Employee',
                            options: ['All Employees'].concat(r.message.map(emp => `${emp.employee_name} (${emp.name})`)),
                            default: 'All Employees'
                        },
                        {
                            fieldtype: 'Select',
                            fieldname: 'approval_status',
                            label: 'Approval Status',
                            options: ['All Status', 'Pending', 'Approved', 'Rejected'],
                            default: 'Pending'
                        }
                    ],
                    primary_action_label: 'Apply Filter',
                    primary_action: function() {
                        const employee_selection = d.get_value('employee');
                        const status_selection = d.get_value('approval_status');
                        
                        // Clear existing filters
                        listview.filter_area.clear();
                        
                        // Add employee filter
                        if (employee_selection && employee_selection !== 'All Employees') {
                            const employee_id = employee_selection.match(/\\((.+)\\)$/)[1];
                            listview.filter_area.add([[listview.doctype, 'employee', '=', employee_id]]);
                        }
                        
                        // Add approval status filter
                        if (status_selection && status_selection !== 'All Status') {
                            listview.filter_area.add([[listview.doctype, 'approval_status', '=', status_selection]]);
                        }
                        
                        d.hide();
                    }
                });
                d.show();
            }
        }
    });
}

function show_my_approvals(listview) {
    // Show only timesheets that current user can approve
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Project',
            fields: ['name'],
            filters: {
                approver: ['like', `%${frappe.session.user}%`]
            }
        },
        callback: function(r) {
            if (r.message && r.message.length > 0) {
                const project_names = r.message.map(p => p.name);
                
                // Clear existing filters
                listview.filter_area.clear();
                
                // Add filter to show only timesheets for projects this user approves
                listview.filter_area.add([
                    [listview.doctype, 'name', 'in', 
                        `(SELECT DISTINCT parent FROM \`tabCustom Timesheet Detail\` WHERE project IN ('${project_names.join("','")}'))`
                    ]
                ]);
                
                // Also add pending approval filter
                listview.filter_area.add([[listview.doctype, 'approval_status', '=', 'Pending']]);
                
                frappe.show_alert({
                    message: __('Showing timesheets pending your approval'),
                    indicator: 'blue'
                });
            } else {
                frappe.msgprint(__('You are not set as an approver for any projects'));
            }
        }
    });
}