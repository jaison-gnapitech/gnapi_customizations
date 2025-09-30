$(document).ready(function () {

	// Add custom filters for better timesheet management
	function addCustomFilters() {
		if (frappe.route && frappe.route[0] === "List" && frappe.route[1] === "Custom Timesheet") {

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

	// Initialize enhancements
	addCustomFilters();
});
