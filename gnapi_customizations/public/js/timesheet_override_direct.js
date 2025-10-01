(function () {
	"use strict";

	// ===== Global Debug Harness =====
	if (!window.__GNAPI_DEBUG_INSTALLED__) {
		window.__GNAPI_DEBUG_INSTALLED__ = true;
		try {
			window.addEventListener('error', function (e) {
				console.error('[GNAPI DEBUG] window.error:', e.message, 'at', e.filename + ':' + e.lineno + ':' + e.colno, e.error || '');
			});
			window.addEventListener('unhandledrejection', function (e) {
				console.error('[GNAPI DEBUG] unhandledrejection:', e.reason);
			});
			// Wrap frappe.call to log failures
			if (window.frappe && frappe.call && !frappe.__call_wrapped__) {
				const origCall = frappe.call.bind(frappe);
				frappe.call = function (opts) {
					const label = `[GNAPI DEBUG] frappe.call ${opts && (opts.method || opts.url) || ''}`;
					console.log(label, 'args:', opts && opts.args);
					const wrapped = Object.assign({}, opts, {
						callback: function (r) {
							console.log(label, 'success:', r);
							opts && opts.callback && opts.callback(r);
						},
						error: function (r) {
							console.error(label, 'error:', r);
							opts && opts.error && opts.error(r);
						}
					});
					return origCall(wrapped);
				};
				frappe.__call_wrapped__ = true;
			}
			// Fetch/XHR logging
			if (!window.__fetch_wrapped__ && window.fetch) {
				const origFetch = window.fetch.bind(window);
				window.fetch = function () {
					const url = arguments[0];
					console.log('[GNAPI DEBUG] fetch:', url);
					return origFetch.apply(window, arguments).then(res => {
						if (!res.ok) console.error('[GNAPI DEBUG] fetch failed:', url, res.status, res.statusText);
						return res;
					}).catch(err => {
						console.error('[GNAPI DEBUG] fetch exception:', url, err);
						throw err;
					});
				};
				window.__fetch_wrapped__ = true;
			}
		} catch (e) {
			console.error('[GNAPI DEBUG] setup error', e);
		}
	}

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
				console.error(err);
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
		renameCustomTimesheetLabels();

		// Re-run on DOM changes (for SPA navigation)
		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
					setTimeout(() => {
						hideTimesheetElements();
						renameCustomTimesheetLabels();
					}, 100);
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// Rename visible labels: 'Custom Timesheet' → 'Timesheet'
	
	// Add My Approvals button to Custom Timesheet list
	addMyApprovalsButton();
	
	function addMyApprovalsButton() {
		// Wait for page to load and check if we're on Custom Timesheet list
		setTimeout(() => {
			if (window.location.pathname === '/app/custom-timesheet' || 
				window.location.hash === '#List/Custom Timesheet' ||
				document.querySelector('[data-doctype="Custom Timesheet"]')) {
				
				console.log('Adding My Approvals button to Custom Timesheet list');
				
				// Try multiple selectors to find the right place to add button
				const toolbar = document.querySelector('.list-toolbar') || 
							   document.querySelector('.page-head .container') ||
							   document.querySelector('.page-actions');
				
				if (toolbar && !document.getElementById('my-approvals-btn')) {
					const myApprovalsBtn = document.createElement('button');
					myApprovalsBtn.id = 'my-approvals-btn';
					myApprovalsBtn.className = 'btn btn-default btn-sm';
					myApprovalsBtn.innerHTML = '<i class="fa fa-filter"></i> My Approvals';
					myApprovalsBtn.style.marginLeft = '10px';
					
					myApprovalsBtn.onclick = function() {
						showMyApprovals();
					};
					
					toolbar.appendChild(myApprovalsBtn);
					console.log('My Approvals button added successfully');
				}
			}
		}, 1000);
		
		// Also try when DOM changes (for SPA navigation)
		const observer = new MutationObserver(() => {
			if (window.location.pathname === '/app/custom-timesheet' && 
				!document.getElementById('my-approvals-btn')) {
				addMyApprovalsButton();
			}
		});
		
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}
	
	function showMyApprovals() {
		console.log('My Approvals clicked!');
		
		// Show alert to confirm button works
		frappe.show_alert({
			message: 'My Approvals button clicked! Checking your projects...',
			indicator: 'blue'
		});
		
		// Check current user's approver status
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Project',
				fields: ['name', 'approver'],
				filters: {
					approver: ['like', `%${frappe.session.user}%`]
				}
			},
			callback: function(r) {
				console.log('Projects where user is approver:', r.message);
				if (r.message && r.message.length > 0) {
					frappe.show_alert({
						message: `You are approver for ${r.message.length} project(s). Filtering timesheets...`,
						indicator: 'green'
					});
					
					// Apply filter to show submitted timesheets
					if (cur_list && cur_list.doctype === 'Custom Timesheet') {
						cur_list.filter_area.clear();
						cur_list.filter_area.add([['Custom Timesheet', 'status', '=', 'Submitted']]);
					}
				} else {
					frappe.show_alert({
						message: 'You are not set as approver for any projects. Please ask admin to add you as approver.',
						indicator: 'orange'
					});
				}
			}
		});
	}

	function renameCustomTimesheetLabels() {
		// Page title on List view
		const titleEl = document.querySelector('.page-title .ellipsis, .page-title');
		if (titleEl && /custom\s+timesheet/i.test(titleEl.textContent || '')) {
			titleEl.textContent = (titleEl.textContent || '').replace(/custom\s+timesheet/ig, 'Timesheet');
			if (document.title) {
				document.title = document.title.replace(/custom\s+timesheet/ig, 'Timesheet');
			}
		}

		// Buttons and links (handle "New Custom Timesheet", "Add Custom Timesheet", etc.)
		document.querySelectorAll('button, a').forEach(function(el){
			const txt = (el.textContent || '').trim();
			if (!txt) return;
			if (/^(new|add)\s+custom\s+timesheet$/i.test(txt)) {
				el.textContent = txt.replace(/custom\s+timesheet/ig, 'Timesheet');
			} else if (/custom\s+timesheet/i.test(txt)) {
				el.textContent = txt.replace(/custom\s+timesheet/ig, 'Timesheet');
			}
		});

		// Sidebar/menu items
		document.querySelectorAll('.sidebar-menu a, .dropdown-menu a, a[data-link], a[href]').forEach(function(link){
			const txt = (link.textContent || '').trim();
			if (txt && /custom\s+timesheet/i.test(txt)) {
				link.textContent = txt.replace(/custom\s+timesheet/ig, 'Timesheet');
			}
		});

		// Form title and breadcrumbs
		document.querySelectorAll('.breadcrumb a, .breadcrumb span, h1, h2, h3').forEach(function(el){
			const txt = (el.textContent || '').trim();
			if (txt && /custom\s+timesheet/i.test(txt)) {
				el.textContent = txt.replace(/custom\s+timesheet/ig, 'Timesheet');
			}
		});
	}

	// Initialize override when Frappe is ready and perform the redirect check
	waitForFrappe();

	// Start hiding Timesheet elements and renaming labels
	setTimeout(handleTimesheetElements, 1000);

	// Observe route changes manually
	$(document).on('page-change route-change', function() {
		setTimeout(() => {
			renameCustomTimesheetLabels();
			hideTimesheetElements();
		}, 300);
	});
})();
