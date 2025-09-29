(function () {
	"use strict";

	// Function to override the Timesheet button behavior
	function overrideTimesheetButton() {
		// Wait for Frappe to be ready
		if (typeof frappe !== "undefined") {
			// Identify the Timesheet button (Assuming it's a link or button)
			const timesheetButton = document.querySelector('[data-label="Timesheet"]');

			if (timesheetButton) {
				console.log("Timesheet button detected, overriding behavior.");

				// Override the default click behavior of the Timesheet button
				timesheetButton.addEventListener("click", function (event) {
					// Prevent default behavior (i.e., navigating to /app/timesheet)
					event.preventDefault();

					// Redirect to /app/custom-timesheet directly
					window.location.href = "/app/custom-timesheet";
				});
			}
		}
	}

	// Initialize the override once Frappe is ready
	function waitForFrappe() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", waitForFrappe);
			return;
		}

		if (typeof frappe !== "undefined") {
			overrideTimesheetButton(); // Run the function to override the Timesheet button click
		} else {
			setTimeout(waitForFrappe, 100);
		}
	}

	// Initialize override when Frappe is ready
	waitForFrappe();
})();
