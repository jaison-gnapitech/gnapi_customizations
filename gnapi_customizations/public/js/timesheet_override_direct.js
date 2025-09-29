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
				doctype = doctype || "";
				name = name || "";
				filters = filters || "";

				// Prevent incorrect routing: Ensure doctype and name are valid strings or array
				if (Array.isArray(doctype)) {
				} else if (typeof doctype !== "string") {
					console.warn("Invalid doctype detected, skipping route change:", doctype);
				}

				// --- Only override "timesheet" routes ---
				if (
					Array.isArray(doctype) &&
					doctype[1] &&
					doctype[1].toLowerCase() === "timesheet"
				) {
					doctype[1] = "Custom Timesheet";
				} else if (typeof doctype === "string" && doctype.toLowerCase() === "timesheet") {
					doctype = "Custom Timesheet";
				}

				if (name.toLowerCase() === "timesheet") {
					name = "Custom Timesheet";
				}

				// --- Call original set_route with validated values ---
				return originalSetRoute.apply(this, [doctype, name, filters]);
			} catch (err) {
				console.error("Error in route override:", err);
			}
		};
	}

	// Initialize override when Frappe is ready
	waitForFrappe();
})();
