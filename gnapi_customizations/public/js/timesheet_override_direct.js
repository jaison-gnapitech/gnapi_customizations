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

				// Prevent incorrect routing: Ensure doctype and name are valid strings or array
				if (Array.isArray(doctype)) {
					// Add additional logic if needed for array-style routes
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

				// Change "name" to Custom Timesheet if it matches "timesheet"
				if (name.toLowerCase() === "timesheet") {
					name = "Custom Timesheet";
				}

				// --- Remove trailing slashes from URL if doctype or name is empty ---
				if (doctype === "") {
					doctype = undefined; // Removing empty doctype
				}
				if (name === "") {
					name = undefined; // Removing empty name
				}

				// Construct the URL with the new doctype and name
				let route = [doctype, name].filter(Boolean).join("/"); // Join only valid parts

				// --- Call original set_route with validated and cleaned parameters ---
				return originalSetRoute.apply(this, [doctype, name, filters]);
			} catch (err) {
				console.error("Error in route override:", err);
			}
		};
	}

	// Initialize override when Frappe is ready
	waitForFrappe();
})();
