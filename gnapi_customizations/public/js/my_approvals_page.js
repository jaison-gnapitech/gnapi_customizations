// My Approvals Page - Timesheet Approval List View
frappe.listview_settings["Timesheet Approval"] = {
	add_fields: [
		"timesheet",
		"employee",
		"project",
		"approval_status",
		"approver",
		"approval_date",
	],

	get_indicator: function (doc) {
		if (doc.approval_status === "Approved") {
			return [__("Approved"), "green", "approval_status,=,Approved"];
		} else if (doc.approval_status === "Rejected") {
			return [__("Rejected"), "red", "approval_status,=,Rejected"];
		} else {
			return [__("Pending"), "orange", "approval_status,=,Pending"];
		}
	},

	onload: function (listview) {
		if (!listview) return;

		console.log("My Approvals page loaded");

		// Filter to show only current user's approvals
		if (frappe.session.user !== "Administrator") {
			listview.filter_area.clear(); // Clear existing filters
			listview.filter_area.add([
				["Timesheet Approval", "approver", "=", frappe.session.user],
			]);
		}

		// Add quick action buttons
		listview.page.add_menu_item(__("Approve Selected"), function () {
			bulkApprove(listview);
		});

		listview.page.add_menu_item(__("Reject Selected"), function () {
			bulkReject(listview);
		});
	},
};

// ===================== BULK ACTIONS =====================

function bulkApprove(listview) {
	const selected = (listview.get_checked_items() || []).filter((i) => i.name);
	if (!selected.length) {
		frappe.msgprint(__("Please select items to approve"));
		return;
	}

	frappe.confirm(__("Approve {0} timesheet(s)?", [selected.length]), function () {
		frappe.call({
			method: "gnapi_customizations.customizations.timesheet_approval_events.bulk_approve",
			args: { approvals: selected.map((item) => item.name) },
			callback: function (r) {
				frappe.show_alert({
					message: __("Approved {0} timesheet(s)", [selected.length]),
					indicator: "green",
				});
				listview.refresh();
			},
		});
	});
}

function bulkReject(listview) {
	const selected = (listview.get_checked_items() || []).filter((i) => i.name);
	if (!selected.length) {
		frappe.msgprint(__("Please select items to reject"));
		return;
	}

	frappe.prompt(
		[
			{
				fieldtype: "Small Text",
				fieldname: "comments",
				label: __("Rejection Comments"),
				reqd: 1,
			},
		],
		function (values) {
			frappe.call({
				method: "gnapi_customizations.customizations.timesheet_approval_events.bulk_reject",
				args: {
					approvals: selected.map((item) => item.name),
					comments: values.comments,
				},
				callback: function (r) {
					frappe.show_alert({
						message: __("Rejected {0} timesheet(s)", [selected.length]),
						indicator: "red",
					});
					listview.refresh();
				},
			});
		},
		__("Reject Timesheets")
	);
}
