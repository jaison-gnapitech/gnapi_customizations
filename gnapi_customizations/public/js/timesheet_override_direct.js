(function () {
    "use strict";

    // Wait for Frappe to be available before overriding
    function waitForFrappe() {
        console.log('Checking Frappe availability...');
        
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", waitForFrappe);
            return;
        }

        if (typeof frappe !== "undefined" && frappe.set_route) {
            console.log('Frappe detected, proceeding with overriding...');
            overrideSetRoute();
            redirectToCustomTimesheet(); // Perform the redirect check when Frappe is ready
        } else {
            console.log('Frappe not detected yet, retrying...');
            setTimeout(waitForFrappe, 100);
        }
    }

    // Redirect function to handle navigation to /app/timesheet
    function redirectToCustomTimesheet() {
        const currentRoute = window.location.pathname;
        console.log('Current route:', currentRoute);

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
                    console.log('Redirecting to custom-timesheet because of route override');
                    window.location.href = '/app/custom-timesheet'; // Directly change the URL
                } else {
                    // Call the original set_route with validated and cleaned parameters
                    console.log('Setting route:', finalRoute);
                    return originalSetRoute.apply(this, [finalRoute]);
                }
            } catch (err) {
                console.error("Error in route override:", err);
            }
        };
    }

    // Function to hide Timesheet widgets and buttons
    function hideTimesheetElements() {
        console.log("Hiding Timesheet elements...");

        // Hide Timesheet widget with data-doctype and aria-label
        const timesheetWidget = document.querySelector('[aria-label="Timesheet"][data-widget-name="n8u94b92s8"]');
        if (timesheetWidget) {
            console.log("Timesheet widget detected, hiding it.");
            timesheetWidget.style.display = 'none';
        }

        // Hide any other Timesheet buttons or links
        const timesheetButtons = document.querySelectorAll('a[href*="/app/timesheet"], a[data-link*="/app/timesheet"]');
        timesheetButtons.forEach(button => {
            console.log('Hiding Timesheet button:', button);
            button.style.display = 'none';
        });

        // Hide sidebar menu items with Timesheet text
        const sidebarItems = document.querySelectorAll('.sidebar-menu a');
        sidebarItems.forEach(item => {
            if (item.textContent.trim().toLowerCase() === 'timesheet') {
                console.log('Hiding Timesheet sidebar item:', item);
                item.style.display = 'none';
            }
        });

        // Hide the specific element with data-id="RsafDhm1MS"
        const timesheetElement = document.querySelector('[data-id="RsafDhm1MS"]');
        if (timesheetElement) {
            console.log('Hiding specific Timesheet element with data-id="RsafDhm1MS"');
            timesheetElement.style.display = 'none';
        }
    }

    // Function to replace Timesheet button with Custom Timesheet button
    function replaceTimesheetButton() {
        console.log("Replacing Timesheet button...");

        // Create a custom button
        const customButton = document.createElement("a");
        customButton.href = "/app/custom-timesheet"; // Link to the custom timesheet page
        customButton.textContent = "Custom Timesheet"; // Text for the button
        customButton.classList.add("btn", "btn-primary"); // Add button classes to style it

        // Find the location where you want to place the custom button
        const parentElement = document.querySelector(".your-actual-parent-selector"); // Update this to actual container

        if (parentElement) {
            console.log("Inserting Custom Timesheet button...");
            parentElement.appendChild(customButton);
        } else {
            console.log("Could not find parent container for button.");
        }
    }

    // Function to handle DOM changes and re-hide timesheet elements
    function handleTimesheetElements() {
        console.log('Handling dynamic DOM changes...');
        hideTimesheetElements();
        replaceTimesheetButton();

        // Re-run on DOM changes (for SPA navigation)
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    console.log('Detected DOM change, hiding Timesheet elements again...');
                    setTimeout(() => {
                        hideTimesheetElements();
                        replaceTimesheetButton();
                    }, 100);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize override when Frappe is ready and perform the redirect check
    waitForFrappe();

    // Start hiding Timesheet elements and replace the button after a short delay to ensure all elements are loaded
    setTimeout(handleTimesheetElements, 1000);

})();
