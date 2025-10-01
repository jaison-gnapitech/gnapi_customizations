// Custom Timesheet List View Configuration
// This file configures the list view for Custom Timesheet

frappe.listview_settings['Custom Timesheet'] = {
    // Add custom fields to display in the list
    add_fields: ["employee", "total_hours", "status", "approver"],

    // onload method to initialize the list view and add buttons
    onload: function(listview) {

        // Add custom filters
        listview.page.add_inner_button("Filter by Status", function() {
            frappe.prompt([
                {
                    fieldname: "status",
                    fieldtype: "Select",
                    label: "Status",
                    options: ["", "Draft", "Submitted", "Approved"],
                    default: ""
                }
            ], function(values) {
                if (values.status) {
                    frappe.route_options = { status: values.status };
                    frappe.set_route('List', 'Custom Timesheet');
                }
            });
        });

        // Add employee filter
        listview.page.add_inner_button("Filter by Employee", function() {
            frappe.prompt([
                {
                    fieldname: "employee",
                    fieldtype: "Link",
                    label: "Employee",
                    options: "Employee",
                    default: ""
                }
            ], function(values) {
                if (values.employee) {
                    frappe.route_options = { employee: values.employee };
                    frappe.set_route('List', 'Custom Timesheet');
                }
            });
        });

        // Add date range filter
        listview.page.add_inner_button("Filter by Date Range", function() {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            frappe.prompt([
                {
                    fieldname: "from_date",
                    fieldtype: "Date",
                    label: "From Date",
                    default: startOfMonth.toISOString().split('T')[0]
                },
                {
                    fieldname: "to_date",
                    fieldtype: "Date",
                    label: "To Date",
                    default: endOfMonth.toISOString().split('T')[0]
                }
            ], function(values) {
                frappe.route_options = {
                    from_date: values.from_date,
                    to_date: values.to_date
                };
                frappe.set_route('List', 'Custom Timesheet');
            });
        });
        
        // Clear all filters
        listview.page.add_inner_button("Clear Filters", function() {
            frappe.route_options = {};
            frappe.set_route('List', 'Custom Timesheet');
        });
    },
    
    // Customize row display based on status
    get_indicator: function(doc) {
        if (doc.status === "Draft") {
            return [__("Draft"), "red", "status,=,Draft"];
        } else if (doc.status === "Submitted") {
            return [__("Submitted"), "orange", "status,=,Submitted"];
        } else if (doc.status === "Approved") {
            return [__("Approved"), "green", "status,=,Approved"];
        }
    },
    
    // Add custom columns with formatting
    formatters: {
        total_hours: function(value) {
            return value ? value + " hrs" : "";
        },
        status: function(value) {
            if (value === "Draft") {
                return `<span class="label label-danger">${value}</span>`;
            } else if (value === "Submitted") {
                return `<span class="label label-warning">${value}</span>`;
            } else if (value === "Approved") {
                return `<span class="label label-success">${value}</span>`;
            }
            return value;
        }
    },
    
    // Set default sort order
    order_by: "modified desc",
    
    // Refresh method
    refresh: function(listview) {}
};
