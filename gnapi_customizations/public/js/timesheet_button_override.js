(function () {
	"use strict";

	// Function to hide the Timesheet widget (div with aria-label="Timesheet")
	function hideTimesheetButton() {
		// Wait for the Timesheet widget to be available
		const timesheetWidget = document.querySelector('[aria-label="Timesheet"]'); // Target the div with aria-label="Timesheet"

		if (timesheetWidget) {
			console.log("Timesheet widget detected, hiding it.");
			// Hide the Timesheet widget
			timesheetWidget.style.display = 'none';
		} else {
			console.log("Timesheet widget not found. Retrying...");
		}
	}

	// Initialize the hide action once Frappe is ready
	function waitForFrappe() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", waitForFrappe);
			return;
		}

		if (typeof frappe !== "undefined") {
			// Check for the widget after Frappe is ready
			setInterval(hideTimesheetButton, 1000); // Check every second until the widget is available
		} else {
			setTimeout(waitForFrappe, 100);
		}
	}

	// Start the script once Frappe is ready
	waitForFrappe();
})();
