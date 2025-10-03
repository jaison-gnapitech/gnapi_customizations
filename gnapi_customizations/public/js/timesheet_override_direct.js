(function () {
	"use strict";

	console.log("[gnapi] timesheet_override_direct.js loaded");

	function isSetupWizard() {
		const path = window.location.pathname || "";
		const inWizard = path.includes("setup-wizard") || path.includes("install");
		console.log("[gnapi] isSetupWizard:", inWizard, "path:", path);
		return inWizard;
	}

	function waitForFrappe() {
		// Never run any overrides during setup wizard
		if (isSetupWizard()) return;
		if (typeof frappe !== "undefined" && frappe.set_route) {
			console.log("[gnapi] frappe available; applying overrides");
			overrideSetRoute();
			redirectToCustomTimesheet();
		} else {
			console.log("[gnapi] frappe not ready; retrying...");
			setTimeout(waitForFrappe, 100);
		}
	}

	function redirectToCustomTimesheet() {
		// Only redirect if we're specifically on the timesheet list page, not during setup
		if (window.location.pathname === "/app/timesheet" && 
			!window.location.pathname.includes("setup-wizard") &&
			!window.location.pathname.includes("install")) {
			console.log("[gnapi] redirecting to Custom Timesheet list");
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
					console.log("[gnapi] bypass override on setup/install; route:", route, name, filters);
					return originalSetRoute.apply(this, arguments);
				}
				
				if (Array.isArray(route)) {
					if (route[1] && route[1].toLowerCase() === "timesheet") {
						console.log("[gnapi] overriding array route target from Timesheet -> Custom Timesheet", route);
						route[1] = "Custom Timesheet";
					}
					// When route is an array, call with a single argument to avoid appending 'undefined'
					console.log("[gnapi] calling originalSetRoute with array:", route);
					return originalSetRoute.call(this, route);
				} else if (typeof route === "string" && route.toLowerCase() === "timesheet") {
					console.log("[gnapi] overriding string route 'Timesheet' -> Custom Timesheet");
					route = ["List", "Custom Timesheet"];
					console.log("[gnapi] calling originalSetRoute with array:", route);
					return originalSetRoute.call(this, route);
				}
				// For non-array routes, pass only defined args to avoid '/undefined' in URL
				const args = [];
				if (typeof route !== "undefined") args.push(route);
				if (typeof name !== "undefined") args.push(name);
				if (typeof filters !== "undefined") args.push(filters);
				console.log("[gnapi] forwarding route call:", args);
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
		if (isSetupWizard()) {
			console.log("[gnapi] skip observers during setup wizard");
			return;
		}
		const observer = new MutationObserver(() => {
			if (isSetupWizard()) return;
			hideTimesheetElements();
			renameCustomTimesheetLabels();
			addMyApprovalsButton();
		});
		console.log("[gnapi] observers attached");
		observer.observe(document.body, { childList: true, subtree: true });
	}

	if (!isSetupWizard()) {
		waitForFrappe();
		setTimeout(() => {
			hideTimesheetElements();
			renameCustomTimesheetLabels();
			addMyApprovalsButton();
		}, 1000);
		initObservers();

		if (typeof $ !== "undefined" && $.fn && $(document)) {
			$(document).on("page-change route-change", () => {
				console.log("[gnapi] route/page change detected");
				setTimeout(() => {
					if (isSetupWizard()) return;
					hideTimesheetElements();
					renameCustomTimesheetLabels();
					addMyApprovalsButton();
				}, 300);
			});
		}
	}
})();
