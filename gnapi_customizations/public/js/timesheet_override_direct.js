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
            window.location.href = '/app/custom-timesheet';
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

                // --- Only override "timesheet" routes ---
                if (
                    (Array.isArray(doctype) && doctype[1] && doctype[1].toLowerCase() === "timesheet") ||
                    (typeof doctype === "string" && doctype.toLowerCase() === "timesheet")
                ) {
                    console.log("Overriding 'timesheet' route to 'Custom Timesheet'");
                    doctype = "Custom Timesheet";
                }

                // Change "name" to "Custom Timesheet" if it matches "timesheet"
                if (name.toLowerCase() === "timesheet") {
                    name = "Custom Timesheet";
                }

                // Concatenate doctype, name, and filters ensuring empty strings come last and no trailing slash
                const route = [doctype, name, filters]
                    .filter(Boolean) // Remove any falsy values (like empty strings)
                    .join("/"); // Join parts with "/"

                // Ensure there is no trailing slash
                const finalRoute = route.replace(/\/$/, "");

                // --- Call the original set_route with validated and cleaned parameters ---
                return originalSetRoute.apply(this, [finalRoute]);
            } catch (err) {
                console.error("Error in route override:", err);
            }
        };
    }

    // Initialize override when Frappe is ready and perform the redirect check
    waitForFrappe();
})();
