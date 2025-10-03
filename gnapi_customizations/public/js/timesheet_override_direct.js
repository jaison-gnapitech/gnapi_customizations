(function () {
	"use strict";

	function waitForFrappe() {
		if (typeof frappe !== "undefined" && frappe.set_route) {
			overrideSetRoute();
			redirectToCustomTimesheet();
		} else {
			setTimeout(waitForFrappe, 100);
		}
	}

	function redirectToCustomTimesheet() {
		// Only redirect if we're specifically on the timesheet list page, not during setup
		if (window.location.pathname === "/app/timesheet" && 
			!window.location.pathname.includes("setup-wizard") &&
			!window.location.pathname.includes("install")) {
			frappe.set_route(["List", "Custom Timesheet"]);
		}
	}

	function overrideSetRoute() {
		if (frappe._safeRouteOverridden) return;
		frappe._safeRouteOverridden = true;

		const originalSetRoute = frappe.set_route;
		frappe.set_route = function (route, name, filters) {
			try {
				// Don't interfere with setup wizard or installation routes
				if (window.location.pathname.includes("setup-wizard") || 
					window.location.pathname.includes("install")) {
					return originalSetRoute.apply(this, arguments);
				}
				
				if (Array.isArray(route)) {
					if (route[1] && route[1].toLowerCase() === "timesheet") {
						route[1] = "Custom Timesheet";
					}
					// When route is an array, call with a single argument to avoid appending 'undefined'
					return originalSetRoute.call(this, route);
				} else if (typeof route === "string" && route.toLowerCase() === "timesheet") {
					route = ["List", "Custom Timesheet"];
					return originalSetRoute.call(this, route);
				}
				// For non-array routes, pass only defined args to avoid '/undefined' in URL
				const args = [];
				if (typeof route !== "undefined") args.push(route);
				if (typeof name !== "undefined") args.push(name);
				if (typeof filters !== "undefined") args.push(filters);
				return originalSetRoute.apply(this, args);
			} catch (err) {
				console.error(err);
			}
		};
	}

	function hideTimesheetElements() {
		document
			.querySelectorAll('a[href*="/app/timesheet"], a[data-link*="/app/timesheet"]')
			.forEach((el) => (el.style.display = "none"));
		document.querySelectorAll(".sidebar-menu a").forEach((el) => {
			if ((el.textContent || "").trim().toLowerCase() === "timesheet")
				el.style.display = "none";
		});
		document
			.querySelectorAll('[aria-label="Timesheet"]')
			.forEach((el) => (el.style.display = "none"));
	}

	function renameCustomTimesheetLabels() {
		document
			.querySelectorAll(
				"button, a, h1, h2, h3, .breadcrumb span, .breadcrumb a, .page-title"
			)
			.forEach((el) => {
				if (!el.textContent) return;
				el.textContent = el.textContent.replace(/custom\s+timesheet/gi, "Timesheet");
			});
		if (document.title) {
			document.title = document.title.replace(/custom\s+timesheet/gi, "Timesheet");
		}
	}

	function addMyApprovalsButton() {
		setTimeout(() => {
			if (
				!document.getElementById("my-approvals-btn") &&
				(window.location.pathname === "/app/custom-timesheet" ||
					document.querySelector('[data-doctype="Custom Timesheet"]'))
			) {
				const toolbar = document.querySelector(
					".list-toolbar, .page-actions, .page-head .container"
				);
				if (toolbar) {
					const btn = document.createElement("button");
					btn.id = "my-approvals-btn";
					btn.className = "btn btn-primary btn-sm";
					btn.innerHTML = '<i class="fa fa-check-circle"></i> My Approvals';
					btn.style.marginLeft = "10px";
					btn.onclick = () => frappe.set_route(["List", "Timesheet Approval"]);
					toolbar.appendChild(btn);
				}
			}
		}, 500);
	}

	function initObservers() {
		const observer = new MutationObserver(() => {
			hideTimesheetElements();
			renameCustomTimesheetLabels();
			addMyApprovalsButton();
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	waitForFrappe();
	setTimeout(() => {
		hideTimesheetElements();
		renameCustomTimesheetLabels();
		addMyApprovalsButton();
	}, 1000);
	initObservers();

	$(document).on("page-change route-change", () => {
		setTimeout(() => {
			hideTimesheetElements();
			renameCustomTimesheetLabels();
			addMyApprovalsButton();
		}, 300);
	});
})();
