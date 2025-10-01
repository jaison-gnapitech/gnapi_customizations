// Custom Timesheet List View Enhancements for Approvers
frappe.listview_settings['Custom Timesheet'] = {
    add_fields: ["employee", "status"],
    get_indicator: function(doc) {
        // Use existing status field for now until approval_status is available
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
        console.log('Custom Timesheet List View Loading...'); // Debug log
        
        // Add employee filter button for approvers
        add_employee_filter_for_approvers(listview);
        
        // Add approval status filters  
        add_approval_status_filters(listview);
        
        // Always add My Approvals button for testing
        add_my_approvals_button(listview);
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
    // Add quick filter buttons using existing status field
    listview.page.add_inner_button(__('Submitted'), function() {
        listview.filter_area.clear();
        listview.filter_area.add([[listview.doctype, 'status', '=', 'Submitted']]);
    });
    
    listview.page.add_inner_button(__('Approved'), function() {
        listview.filter_area.clear();
        listview.filter_area.add([[listview.doctype, 'status', '=', 'Approved']]);
    });
    
    listview.page.add_inner_button(__('Draft'), function() {
        listview.filter_area.clear();
        listview.filter_area.add([[listview.doctype, 'status', '=', 'Draft']]);
    });
}

function add_my_approvals_button(listview) {
    // Add My Approvals button for all users (for testing)
    listview.page.add_menu_item(__('My Approvals'), function() {
        show_my_approvals_simple(listview);
    });
    
    listview.page.add_menu_item(__('Filter by Employee'), function() {
        show_employee_filter_dialog(listview);
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
                
                // Also add submitted status filter (pending approval)
                listview.filter_area.add([[listview.doctype, 'status', '=', 'Submitted']]);
                
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

function show_my_approvals_simple(listview) {
    // Simplified version for testing
    console.log('My Approvals clicked - Current user:', frappe.session.user);
    
    // Clear existing filters
    listview.filter_area.clear();
    
    // Show only submitted timesheets for now
    listview.filter_area.add([[listview.doctype, 'status', '=', 'Submitted']]);
    
    frappe.show_alert({
        message: __('Showing submitted timesheets (test mode)'),
        indicator: 'blue'
    });
    
    // Also check if user has approver access
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
            console.log('Projects where user is approver:', r.message);
            if (r.message && r.message.length > 0) {
                frappe.show_alert({
                    message: __(`You are approver for ${r.message.length} project(s)`),
                    indicator: 'green'
                });
            } else {
                frappe.show_alert({
                    message: __('You are not set as approver for any projects'),
                    indicator: 'orange'
                });
            }
        }
    });
}