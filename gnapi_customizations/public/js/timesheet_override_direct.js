// Direct Timesheet Override - Fully Scoped & Safe
// Only redirect /app/timesheet → /app/custom-timesheet
// Prevents undefined/invalid routes for all other pages

(function () {
	"use strict";

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

	function overrideSetRoute() {
		if (frappe._safeRouteOverridden) return;
		frappe._safeRouteOverridden = true;

		const originalSetRoute = frappe.set_route;

		frappe.set_route = function (doctype, name, filters) {
			try {
				// --- Only modify Timesheet ---
				if (Array.isArray(doctype) && typeof doctype[1] === "string") {
					if (doctype[1].toLowerCase() === "timesheet") {
						doctype[1] = "Custom Timesheet";
					}
				} else if (typeof doctype === "string" && doctype.toLowerCase() === "timesheet") {
					doctype = "Custom Timesheet";
				}

				if (typeof name === "string" && name.toLowerCase() === "timesheet") {
					name = "Custom Timesheet";
				}

				// --- Global safety checks ---
				if (doctype === undefined || doctype === null) return;
				if (Array.isArray(doctype) && typeof doctype[0] !== "string") return;
				if (typeof doctype !== "string" && !Array.isArray(doctype)) return;
			} catch (err) {
				console.error("Safe frappe.set_route error:", err);
				return;
			}

			return originalSetRoute.apply(this, [doctype, name, filters]);
		};
	}

	waitForFrappe();
})();
