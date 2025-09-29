(function () {
	"use strict";

	// Wait for Frappe to be available before overriding
	function waitForFrappe() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", waitForFrappe);
			return;
		}

		if (typeof frappe !== "undefined" && frappe.set_route) {
			overrideSetRoute();
		} else {
			setTimeout(waitForFrappe, 100);
		}
	}

	// Override frappe.set_route to safely handle routes
	function overrideSetRoute() {
		if (frappe._safeRouteOverridden) return;
		frappe._safeRouteOverridden = true;

		const originalSetRoute = frappe.set_route;

		frappe.set_route = function (doctype, name, filters) {
			console.warn("route parameters detected:", doctype, name, filters);

			try {
				// Set empty strings for undefined parameters
				doctype = doctype || "";
				name = name || "";
				filters = filters || "";

				// Prevent incorrect routing: Ensure doctype and name are valid strings or arrays
				if (Array.isArray(doctype)) {
					// Add additional logic if needed for array-style routes
				} else if (typeof doctype !== "string") {
					console.warn("Invalid doctype detected, skipping route change:", doctype);
					return; // Prevent setting route if doctype is invalid
				}

				// --- Only override "timesheet" routes ---
				if (
					(Array.isArray(doctype) &&
						doctype[1] &&
						doctype[1].toLowerCase() === "timesheet") ||
					(typeof doctype === "string" && doctype.toLowerCase() === "timesheet")
				) {
					console.log("Overriding 'timesheet' route to 'Custom Timesheet'");
					doctype = "Custom Timesheet";
				}

				// Change "name" to "Custom Timesheet" if it matches "timesheet"
				if (name.toLowerCase() === "timesheet") {
					name = "Custom Timesheet";
				}

				// Concatenate doctype, name, and filters ensuring empty strings come last
				const route = [doctype, name, filters].filter(Boolean).concat(["", ""]).join("/");

				// --- Call the original set_route with validated and cleaned parameters ---
				return originalSetRoute.apply(this, [route]);
			} catch (err) {
				console.error("Error in route override:", err);
			}
		};
	}

	// Initialize override when Frappe is ready
	waitForFrappe();
})();
