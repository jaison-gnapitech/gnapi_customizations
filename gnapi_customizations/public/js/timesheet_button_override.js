(function () {
	"use strict";

	// Function to override the Timesheet button behavior
	function overrideTimesheetButton() {
		// Wait for the Timesheet button to be available
		const timesheetButton = document.querySelector('[data-label="Timesheet"]'); // Adjust this selector

		if (timesheetButton) {
			console.log("Timesheet button detected, overriding behavior.");

			// Override the default click behavior of the Timesheet button
			timesheetButton.addEventListener("click", function (event) {
				// Prevent default behavior (i.e., navigating to /app/timesheet)
				event.preventDefault();

				// Redirect to /app/custom-timesheet directly
				window.location.href = "/app/custom-timesheet";
			});
		} else {
			console.log("Timesheet button not found. Retrying...");
		}
	}

	// Initialize the override once Frappe is ready
	function waitForFrappe() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", waitForFrappe);
			return;
		}

		if (typeof frappe !== "undefined") {
			// Check for the button after Frappe is ready
			setInterval(overrideTimesheetButton, 1000); // Check every second until the button is available
		} else {
			setTimeout(waitForFrappe, 100);
		}
	}

	// Initialize override when Frappe is ready
	waitForFrappe();
})();
