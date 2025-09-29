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
            redirectToCustomTimesheet(); // Perform the redirect check when Frappe is ready
        } else {
            setTimeout(waitForFrappe, 100);
        }
    }

    // Redirect function to handle navigation to /app/timesheet
    function redirectToCustomTimesheet() {
        const currentRoute = window.location.pathname;

        // If the user navigates to `/app/timesheet`, redirect to `/app/custom-timesheet`
        if (currentRoute === '/app/timesheet') {
            console.log('Redirecting to custom timesheet...');
            window.location.href = '/app/custom-timesheet'; // Directly change the URL
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
                // If the route is 'timesheet', change it to 'Custom Timesheet'
                if (
                    (Array.isArray(doctype) && doctype[1] && doctype[1].toLowerCase() === "timesheet") ||
                    (typeof doctype === "string" && doctype.toLowerCase() === "timesheet")
                ) {
                    console.log("Overriding 'timesheet' route to 'Custom Timesheet'");
                    doctype = "Custom Timesheet"; // Change 'timesheet' to 'Custom Timesheet'
                }

                // Handle name (e.g., if 'timesheet' is used, convert to 'Custom Timesheet')
                if (name && name.toLowerCase() === "timesheet") {
                    name = "Custom Timesheet";
                }

                // Concatenate doctype, name, and filters ensuring empty strings come last and no trailing slash
                const route = [doctype, name, filters]
                    .filter(Boolean) // Remove any falsy values (like empty strings)
                    .join("/"); // Join parts with "/"

                // Ensure there is no trailing slash
                const finalRoute = route.replace(/\/$/, "");

                // If the route is still pointing to 'timesheet', redirect directly
                if (finalRoute === 'timesheet') {
                    window.location.href = '/app/custom-timesheet'; // Directly change the URL
                } else {
                    // --- Call the original set_route with validated and cleaned parameters ---
                    return originalSetRoute.apply(this, [finalRoute]);
                }
            } catch (err) {
                console.error("Error in route override:", err);
            }
        };
    }

    // Initialize override when Frappe is ready and perform the redirect check
    waitForFrappe();
})();
