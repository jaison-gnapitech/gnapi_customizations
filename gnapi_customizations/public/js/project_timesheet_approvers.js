frappe.ui.form.on('Project', {
    refresh: function(frm) {
        // Add any custom logic for Project timesheet approvers if needed
        if (frm.doc.approver) {
            // You can add custom logic here when an approver is selected
            console.log('Project Approver selected:', frm.doc.approver);
        }
    },
    
    approver: function(frm) {
        // Trigger when approver is changed
        if (frm.doc.approver) {
            // Add any validation or additional logic here
            frappe.msgprint(`Project Approver set to: ${frm.doc.approver}`);
        }
    }
});
