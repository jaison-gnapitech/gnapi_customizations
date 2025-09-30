// Project: Timesheet Approvals - Multi-select user picker to populate approvers table

frappe.ui.form.on('Project', {
	refresh: function (frm) {
		// Nothing on refresh for now
	},

	// Button field handler (Custom Field: select_timesheet_approvers)
	select_timesheet_approvers: function (frm) {
		if (!frm.doc.name) {
			frappe.msgprint(__('Please save the Project before selecting approvers.'));
			return;
		}

		new frappe.ui.form.MultiSelectDialog({
			doctype: 'User',
			target: frm,
			setters: {},
			// Filter out disabled users
			get_query: function () {
				return {
					filters: {
						enabled: 1
					}
				};
			},
			primary_action_label: __('Add Approvers'),
			action: function (selections) {
				// selections: array of user names (emails)
				if (!Array.isArray(selections) || selections.length === 0) return;

				const existing = new Set((frm.doc.timesheet_approvers || []).map(r => r.user));
				selections.forEach(user => {
					if (!existing.has(user)) {
						frm.add_child('timesheet_approvers', { user });
					}
				});
				frm.refresh_field('timesheet_approvers');
				this.dialog.hide();
			}
		});
	}
});


