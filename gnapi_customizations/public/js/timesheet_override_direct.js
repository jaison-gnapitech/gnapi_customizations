(function() {
    'use strict';

    // Wait for Frappe to be available before overriding
    function waitForFrappe() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForFrappe);
            return;
        }

        if (typeof frappe !== 'undefined' && frappe.set_route) {
            overrideSetRoute();
        } else {
            setTimeout(waitForFrappe, 100);
        }
    }

    // Override frappe.set_route to safely handle only timesheet routes
    function overrideSetRoute() {
        if (frappe._safeRouteOverridden) return;
        frappe._safeRouteOverridden = true;

        const originalSetRoute = frappe.set_route;

        frappe.set_route = function(doctype, name, filters) {
            // Only intercept timesheet-related routes (case insensitive)
            if (typeof doctype === 'string' && doctype.toLowerCase() === 'timesheet') {
                console.log('Timesheet route detected, redirecting to Custom Timesheet:', doctype, name, filters);
                // Modify the route to redirect to "Custom Timesheet"
                return originalSetRoute.apply(this, ['Custom Timesheet', name, filters]);
            }

            // If not a timesheet route, just call the original method
            return originalSetRoute.apply(this, [doctype, name, filters]);
        };
    }

    // Initialize override when Frappe is ready
    waitForFrappe();
})();
