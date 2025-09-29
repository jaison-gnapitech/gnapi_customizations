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
            // Clean undefined or invalid parameters before processing
            if (typeof doctype === 'string' && doctype.toLowerCase() === 'timesheet') {
                // Ensure no undefined parameters are passed
                name = name && name !== 'undefined' ? name : '';
                filters = filters && filters !== 'undefined' ? filters : '';

                console.log('Timesheet route detected, redirecting to Custom Timesheet:', doctype, name, filters);

                // Redirect to Custom Timesheet if valid
                return originalSetRoute.apply(this, ['Custom Timesheet', name, filters]);
            }

            // If it's not a timesheet route, just pass through as normal
            return originalSetRoute.apply(this, [doctype, name, filters]);
        };
    }

    // Initialize override when Frappe is ready
    waitForFrappe();
})();
