(function () {
	"use strict";

	// Function to hide the Timesheet widget (with data-doctype and aria-label)
	function hideTimesheetButton() {
		const timesheetWidget = document.querySelector('[data-doctype="Timesheet"][aria-label="Timesheet"]');

		if (timesheetWidget) {
			console.log("Timesheet widget detected, hiding it.");
			timesheetWidget.style.display = 'none';
		} else {
			console.log("Timesheet widget not found. Retrying...");
		}
	}

	// Delay the execution to ensure the page has fully loaded
	setTimeout(function () {
		hideTimesheetButton();
	}, 2000);  // Delay of 2 seconds (adjust as needed)

})();
