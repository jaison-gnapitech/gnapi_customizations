// Custom Timesheet List View Enhancements for Approvers
frappe.listview_settings["Custom Timesheet"] = {
	add_fields: ["employee", "approval_status", "project"],

	get_indicator: function (doc) {
		switch (doc.approval_status) {
			case "Approved":
				return [__("Approved"), "green", "approval_status,=,Approved"];
			case "Rejected":
				return [__("Rejected"), "red", "approval_status,=,Rejected"];
			case "Pending":
			case "Submitted":
				return [__("Pending Approval"), "orange", "approval_status,=,Submitted"];
			default:
				return [__("Draft"), "gray", "approval_status,=,Draft"];
		}
	},

	onload: function (listview) {
		// Add filters and buttons
		add_employee_filter(listview);
		add_quick_status_filters(listview);
		add_my_approvals_button(listview);
	},
};

// ------------------------ Helper Functions ------------------------

function add_employee_filter(listview) {
	listview.page.add_menu_item(__("Filter by Employee"), function () {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Employee",
				fields: ["name", "employee_name"],
				limit_page_length: 0,
				order_by: "employee_name",
			},
			callback: function (r) {
				if (!r.message) return;

				const d = new frappe.ui.Dialog({
					title: "Filter Timesheets by Employee",
					fields: [
						{
							fieldtype: "Select",
							fieldname: "employee",
							label: "Select Employee",
							options: ["All Employees"].concat(
								r.message.map((emp) => `${emp.employee_name} (${emp.name})`)
							),
							default: "All Employees",
						},
						{
							fieldtype: "Select",
							fieldname: "approval_status",
							label: "Approval Status",
							options: ["All Status", "Pending", "Approved", "Rejected"],
							default: "Pending",
						},
					],
					primary_action_label: "Apply Filter",
					primary_action: function () {
						const employee_selection = d.get_value("employee");
						const status_selection = d.get_value("approval_status");

						listview.filter_area.clear();

						if (employee_selection && employee_selection !== "All Employees") {
							const match = employee_selection.match(/\((.+)\)$/);
							const employee_id = match ? match[1] : null;
							if (employee_id) {
								listview.filter_area.add([
									[listview.doctype, "employee", "=", employee_id],
								]);
							}
						}

						if (status_selection && status_selection !== "All Status") {
							listview.filter_area.add([
								[listview.doctype, "approval_status", "=", status_selection],
							]);
						}

						d.hide();
					},
				});
				d.show();
			},
		});
	});
}

function add_quick_status_filters(listview) {
	["Submitted", "Approved", "Draft", "Rejected"].forEach((status) => {
		listview.page.add_inner_button(__(status), function () {
			listview.filter_area.clear();
			listview.filter_area.add([[listview.doctype, "approval_status", "=", status]]);
		});
	});
}

function add_my_approvals_button(listview) {
	listview.page.add_menu_item(__("My Approvals"), function () {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Project",
				fields: ["name"],
				filters: { approver: ["like", `%${frappe.session.user}%`] },
			},
			callback: function (r) {
				if (!r.message || r.message.length === 0) {
					frappe.show_alert({
						message: __("You are not set as approver for any projects"),
						indicator: "orange",
					});
					return;
				}

				const project_names = r.message.map((p) => p.name);

				// Server-side method is recommended for complex queries like "parent in Timesheet Detail"
				// For now, filter by project field in Timesheet
				listview.filter_area.clear();
				listview.filter_area.add([[listview.doctype, "project", "in", project_names]]);
				listview.filter_area.add([
					[listview.doctype, "approval_status", "=", "Submitted"],
				]);

				frappe.show_alert({
					message: __("Showing timesheets pending your approval"),
					indicator: "blue",
				});
			},
		});
	});
}
