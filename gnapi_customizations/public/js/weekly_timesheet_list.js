// Weekly Timesheet List View
// Provides enhanced functionality for the timesheet list view

frappe.listview_settings['WeeklyTimesheet'] = {
    add_fields: ['employee', 'employee_name', 'from_date', 'to_date', 'total_hours', 'docstatus'],

    get_indicator: function(doc) {
        if (doc.docstatus === 1) {
            return [__('Submitted'), 'green', 'docstatus,=,1'];
        } else if (doc.docstatus === 2) {
            return [__('Cancelled'), 'red', 'docstatus,=,2'];
        } else {
            return [__('Draft'), 'orange', 'docstatus,=,0'];
        }
    },

    formatters: {
        employee_name: function(value, field, doc) {
            if (doc.employee_name) {
                return `<strong>${doc.employee_name}</strong><br>
                        <small class="text-muted">${doc.employee} • ${doc.from_date} to ${doc.to_date}</small>`;
            }
            return value;
        },

        total_hours: function(value, field, doc) {
            if (value) {
                let hours = parseFloat(value);
                let class_name = hours >= 40 ? 'text-success' : hours >= 20 ? 'text-warning' : 'text-danger';
                return `<span class="${class_name}"><strong>${hours.toFixed(1)}h</strong></span>`;
            }
            return '0.0h';
        }
    },

    onload: function(listview) {
        // Add custom buttons to the list view
        listview.page.add_menu_item(__('Create New Week'), function() {
            create_new_week_timesheet();
        });

        listview.page.add_menu_item(__('Bulk Export'), function() {
            bulk_export_timesheets(listview);
        });

        // Add filters
        add_custom_filters(listview);
    },

    refresh: function(listview) {
        // Refresh functionality
        if (listview.$page) {
            // Add custom CSS for better styling
            if (!$('#weekly-timesheet-list-style').length) {
                $('head').append(`
                    <style id="weekly-timesheet-list-style">
                        .timesheet-employee-info {
                            line-height: 1.3;
                        }
                        .timesheet-employee-info strong {
                            display: block;
                            margin-bottom: 2px;
                        }
                        .timesheet-employee-info small {
                            color: #8d99a6;
                            font-size: 11px;
                        }
                        .timesheet-hours-indicator {
                            font-weight: 600;
                            padding: 2px 6px;
                            border-radius: 3px;
                            font-size: 11px;
                        }
                    </style>
                `);
            }
        }
    }
};

// Function to create a new weekly timesheet
function create_new_week_timesheet() {
    let dialog = new frappe.ui.Dialog({
        title: __('Create New Weekly Timesheet'),
        fields: [
            {
                fieldname: 'employee',
                fieldtype: 'Link',
                options: 'Employee',
                label: __('Employee'),
                reqd: 1,
                get_query: function() {
                    return {
                        filters: {
                            status: 'Active'
                        }
                    };
                }
            },
            {
                fieldname: 'from_date',
                fieldtype: 'Date',
                label: __('From Date'),
                reqd: 1,
                default: get_monday_of_current_week()
            },
            {
                fieldname: 'to_date',
                fieldtype: 'Date',
                label: __('To Date'),
                reqd: 1,
                default: get_sunday_of_current_week()
            }
        ],
        primary_action_label: __('Create'),
        primary_action: function(values) {
            if (values.from_date >= values.to_date) {
                frappe.msgprint(__('From Date must be before To Date'));
                return;
            }

            // Check if timesheet already exists
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'WeeklyTimesheet',
                    filters: {
                        employee: values.employee,
                        from_date: values.from_date,
                        to_date: values.to_date
                    }
                },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        frappe.msgprint(__('Timesheet already exists for this period'));
                        return;
                    }

                    // Create new timesheet
                    frappe.new_doc('Weekly Timesheet', {
                        employee: values.employee,
                        from_date: values.from_date,
                        to_date: values.to_date
                    });

                    dialog.hide();
                }
            });
        }
    });

    dialog.show();
}

// Function to get Monday of current week
function get_monday_of_current_week() {
    let today = new Date();
    let monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
}

// Function to get Sunday of current week
function get_sunday_of_current_week() {
    let monday = new Date(get_monday_of_current_week());
    let sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday.toISOString().split('T')[0];
}

// Function to add custom filters
function add_custom_filters(listview) {
    // Add period filter
    listview.page.add_menu_item(__('This Week'), function() {
        let today = new Date();
        let monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        let sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        listview.filter_area.add([
            ['WeeklyTimesheet', 'from_date', '>=', monday.toISOString().split('T')[0]],
            ['WeeklyTimesheet', 'to_date', '<=', sunday.toISOString().split('T')[0]]
        ]);
    });

    listview.page.add_menu_item(__('Last Week'), function() {
        let today = new Date();
        let last_monday = new Date(today);
        last_monday.setDate(today.getDate() - today.getDay() - 6);
        let last_sunday = new Date(last_monday);
        last_sunday.setDate(last_monday.getDate() + 6);

        listview.filter_area.add([
            ['WeeklyTimesheet', 'from_date', '>=', last_monday.toISOString().split('T')[0]],
            ['WeeklyTimesheet', 'to_date', '<=', last_sunday.toISOString().split('T')[0]]
        ]);
    });

    listview.page.add_menu_item(__('This Month'), function() {
        let today = new Date();
        let first_day = new Date(today.getFullYear(), today.getMonth(), 1);
        let last_day = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        listview.filter_area.add([
            ['WeeklyTimesheet', 'from_date', '>=', first_day.toISOString().split('T')[0]],
            ['WeeklyTimesheet', 'to_date', '<=', last_day.toISOString().split('T')[0]]
        ]);
    });
}

// Function for bulk export
function bulk_export_timesheets(listview) {
    let selected = listview.get_checked_items();
    if (selected.length === 0) {
        frappe.msgprint(__('Please select timesheets to export'));
        return;
    }

    let dialog = new frappe.ui.Dialog({
        title: __('Bulk Export Timesheets'),
        fields: [
            {
                fieldname: 'export_format',
                fieldtype: 'Select',
                options: 'CSV\nExcel\nJSON',
                label: __('Export Format'),
                default: 'CSV',
                reqd: 1
            },
            {
                fieldname: 'include_details',
                fieldtype: 'Check',
                label: __('Include Timesheet Details'),
                default: 1
            }
        ],
        primary_action_label: __('Export'),
        primary_action: function(values) {
            let timesheet_names = selected.map(item => item.name);

            frappe.call({
                method: 'gnapi_customizations.doctype.weekly_timesheet.weekly_timesheet.bulk_export_timesheets',
                args: {
                    timesheet_names: timesheet_names,
                    export_format: values.export_format,
                    include_details: values.include_details
                },
                callback: function(r) {
                    if (r.message) {
                        // Create download link
                        let blob = new Blob([r.message.data], {type: 'text/plain'});
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = r.message.filename;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        frappe.show_alert(__('Export completed'));
                    }
                }
            });

            dialog.hide();
        }
    });

    dialog.show();
}

// Add custom actions to list view
frappe.ui.form.on('Weekly Timesheet', {
    refresh: function(frm) {
        if (!frm.doc.__islocal) {
            // Add custom buttons for existing timesheets
            if (frm.doc.docstatus === 0) {
                frm.add_custom_button(__('Duplicate Week'), function() {
                    duplicate_timesheet_dialog(frm);
                });
            }

            if (frm.doc.docstatus === 1) {
                frm.add_custom_button(__('View Approvals'), function() {
                    view_approvals(frm);
                });
            }
        }
    }
});

// Function to duplicate timesheet
function duplicate_timesheet_dialog(frm) {
    let dialog = new frappe.ui.Dialog({
        title: __('Duplicate Timesheet'),
        fields: [
            {
                fieldname: 'target_from_date',
                fieldtype: 'Date',
                label: __('Target Week From Date'),
                reqd: 1,
                description: __('Select the Monday of the week you want to duplicate to')
            }
        ],
        primary_action_label: __('Duplicate'),
        primary_action: function(values) {
            frappe.call({
                method: 'gnapi_customizations.doctype.weekly_timesheet.weekly_timesheet.duplicate_timesheet',
                args: {
                    source_timesheet_name: frm.doc.name,
                    target_from_date: values.target_from_date,
                    target_to_date: frappe.datetime.add_days(values.target_from_date, 6)
                },
                callback: function(r) {
                    if (r.message) {
                        frappe.show_alert(__('Timesheet duplicated successfully'));
                        frappe.set_route('Form', 'Weekly Timesheet', r.message.name);
                    }
                }
            });

            dialog.hide();
        }
    });

    dialog.show();
}

// Function to view approvals
function view_approvals(frm) {
    frappe.call({
        method: 'gnapi_customizations.doctype.weekly_timesheet.weekly_timesheet.get_timesheet_approvals',
        args: {
            timesheet_name: frm.doc.name
        },
        callback: function(r) {
            if (r.message && r.message.length > 0) {
                let approvals_html = `
                    <div class="approvals-list">
                        <h4>Approval Requests</h4>
                        ${r.message.map(approval => `
                            <div class="approval-item" style="padding: 10px; border: 1px solid #d1d8dd; margin: 5px 0; border-radius: 4px;">
                                <strong>${approval.approver}</strong><br>
                                <small>Status: ${approval.status}</small><br>
                                <small>Project: ${approval.project}</small><br>
                                <small>Hours: ${approval.hours}</small>
                            </div>
                        `).join('')}
                    </div>
                `;

                let approval_dialog = new frappe.ui.Dialog({
                    title: __('Timesheet Approvals'),
                    fields: [
                        {
                            fieldname: 'approvals_html',
                            fieldtype: 'HTML',
                            options: approvals_html
                        }
                    ],
                    size: 'small'
                });

                approval_dialog.show();
            } else {
                frappe.msgprint(__('No approval requests found'));
            }
        }
    });
}
