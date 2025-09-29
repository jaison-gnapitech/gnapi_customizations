$(document).ready(function () {
	console.log("Custom Timesheet List: Script loaded");

	// Add custom filters for better timesheet management
	function addCustomFilters() {
		if (frappe.route && frappe.route[0] === "List" && frappe.route[1] === "Custom Timesheet") {
			console.log("Custom Timesheet List: Adding custom filters");

			// Add employee filter
			frappe.route_options = frappe.route_options || {};

			// Add status filter options
			const statusOptions = [
				{ label: "All", value: "" },
				{ label: "Draft", value: "Draft" },
				{ label: "Submitted", value: "Submitted" },
				{ label: "Approved", value: "Approved" },
			];
			frappe.route_options.status = frappe.route_options.status || ""; // Default filter

			// Add date range filter
			const today = new Date();
			const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
			const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

			frappe.route_options.from_date =
				frappe.route_options.from_date || startOfMonth.toISOString().split("T")[0];
			frappe.route_options.to_date =
				frappe.route_options.to_date || endOfMonth.toISOString().split("T")[0];
		}
	}

	// Add custom columns to the list view
	function addCustomColumns() {
		// This will be handled by the DocType configuration
		console.log("Custom Timesheet List: Custom columns configured via DocType");
	}

	// Initialize enhancements
	addCustomFilters();
	enhanceListView();
	addCustomColumns();

	// Re-run enhancements on route change
	$(document).on("page-change", function () {
		setTimeout(function () {
			if (
				frappe.route &&
				frappe.route[0] === "List" &&
				frappe.route[1] === "Custom Timesheet"
			) {
				enhanceListView();
			}
		}, 500);
	});
});
