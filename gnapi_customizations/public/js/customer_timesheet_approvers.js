frappe.ui.form.on('Customer', {
    refresh: function(frm) {
        // Add any custom logic for Customer timesheet approvers if needed
        if (frm.doc.timesheet_approver) {
            // You can add custom logic here when an approver is selected
            console.log('Timesheet Approver selected:', frm.doc.timesheet_approver);
        }
    },
    
    timesheet_approver: function(frm) {
        // Trigger when timesheet approver is changed
        if (frm.doc.timesheet_approver) {
            // Add any validation or additional logic here
            frappe.msgprint(`Timesheet Approver set to: ${frm.doc.timesheet_approver}`);
        }
    }
});
