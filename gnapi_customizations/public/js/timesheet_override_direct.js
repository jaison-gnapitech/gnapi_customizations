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
		if (currentRoute === "/app/timesheet") {
			window.location.href = "/app/custom-timesheet"; // Directly change the URL
		}
	}

	// Override frappe.set_route to safely handle routes
	function overrideSetRoute() {
		if (frappe._safeRouteOverridden) return;
		frappe._safeRouteOverridden = true;

		const originalSetRoute = frappe.set_route;

		frappe.set_route = function (doctype, name, filters) {
			try {
				// If the route is 'timesheet', change it to 'Custom Timesheet'
				if (
					(Array.isArray(doctype) &&
						doctype[1] &&
						doctype[1].toLowerCase() === "timesheet") ||
					(typeof doctype === "string" && doctype.toLowerCase() === "timesheet")
				) {
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
				if (finalRoute === "timesheet") {
					window.location.href = "/app/custom-timesheet"; // Directly change the URL
				} else {
					return originalSetRoute.apply(this, [finalRoute]);
				}
			} catch (err) {
			}
		};
	}

	// Function to hide Timesheet widgets and buttons
	function hideTimesheetElements() {
		// Hide Timesheet widget with data-doctype and aria-label
		const timesheetWidget = document.querySelector(
			'[aria-label="Timesheet"][data-widget-name="n8u94b92s8"]'
		);
		if (timesheetWidget) {
			timesheetWidget.style.display = "none";
		}

		// Hide any other Timesheet buttons or links
		const timesheetButtons = document.querySelectorAll(
			'a[href*="/app/timesheet"], a[data-link*="/app/timesheet"]'
		);
		timesheetButtons.forEach((button) => {
			button.style.display = "none";
		});

		// Hide sidebar menu items with Timesheet text
		const sidebarItems = document.querySelectorAll(".sidebar-menu a");
		sidebarItems.forEach((item) => {
			if (item.textContent.trim().toLowerCase() === "timesheet") {
				item.style.display = "none";
			}
		});

		const timesheetElement = document.querySelector('[data-id="RsafDhm1MS"]');
		if (timesheetElement) {
			timesheetElement.setAttribute("href", "/app/custom-timesheet");
			timesheetElement.style.pointerEvents = "auto"; 
			timesheetElement.addEventListener("click", function (event) {
				event.preventDefault(); 
				window.location.href = "/app/custom-timesheet"; 
			});
		}
	}

	// Function to handle DOM changes and re-hide timesheet elements
	function handleTimesheetElements() {
		hideTimesheetElements();

		// Re-run on DOM changes (for SPA navigation)
		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
					setTimeout(() => {
						hideTimesheetElements();
					}, 100);
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// Initialize override when Frappe is ready and perform the redirect check
	waitForFrappe();

	// Start hiding Timesheet elements and replace the button after a short delay to ensure all elements are loaded
	setTimeout(handleTimesheetElements, 1000);
})();
