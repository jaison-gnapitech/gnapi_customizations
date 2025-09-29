// Direct Timesheet Override v3 - Immediate Execution
// Redirect all Timesheet navigation to Custom Timesheet

(function() {
    'use strict';

    console.log('Direct Timesheet Override: Script executing...');

    // --- Wait for Frappe ---
    function waitForInitialization() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForInitialization);
            return;
        }

        if (typeof frappe !== 'undefined' && frappe.set_route) {
            console.log('Direct Timesheet Override: Frappe available, initializing...');
            initializeOverride();
        } else {
            setTimeout(waitForInitialization, 100);
        }
    }

    function initializeOverride() {
        // Prevent multiple overrides
        if (frappe._timesheetRouteOverridden) return;
        frappe._timesheetRouteOverridden = true;

        // --- Override frappe.set_route ---
        const originalSetRoute = frappe.set_route;
        frappe.set_route = function(doctype, name, filters) {
            if (doctype && doctype.toLowerCase() === 'timesheet') {
                console.log('Direct Timesheet Override: Redirecting Timesheet → Custom Timesheet');
                return originalSetRoute.call(this, 'Custom Timesheet', name, filters);
            }
            return originalSetRoute.apply(this, arguments);
        };
        console.log('Direct Timesheet Override: frappe.set_route overridden');

        // --- Intercept all Timesheet clicks ---
        $(document).on('click', 'a', function(e) {
            const $this = $(this);
            const text = ($this.text() || '').trim().toLowerCase();
            const href = ($this.attr('href') || '').toLowerCase();
            const dataLink = ($this.attr('data-link') || '').toLowerCase();

            if (
                text === 'timesheet' ||
                href.includes('/app/timesheet') ||
                dataLink.includes('timesheet')
            ) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Direct Timesheet Override: Intercepted Timesheet click → Custom Timesheet');

                if (typeof frappe !== 'undefined' && frappe.set_route) {
                    frappe.set_route('List', 'Custom Timesheet');
                } else {
                    window.location.href = '/app/custom-timesheet';
                }
                return false;
            }
        });
    }

    // --- Rewrite DOM links ---
    function rewriteTimesheetLinks() {
        const $links = $('a[href*="/app/timesheet"], a[data-link*="timesheet"]');
        if ($links.length === 0) return;

        console.log('Direct Timesheet Override: Rewriting Timesheet links → Custom Timesheet');

        $links.each(function() {
            const $this = $(this);
            $this.attr('href', '/app/custom-timesheet');
            $this.attr('data-link', '/app/custom-timesheet');
        });

        // Sidebar menu handling
        $('.sidebar-menu a').each(function() {
            const $this = $(this);
            if (($this.text() || '').trim().toLowerCase() === 'timesheet') {
                $this.attr('href', '/app/custom-timesheet');
                $this.attr('data-link', '/app/custom-timesheet');
            }
        });
    }

    // Run immediately if jQuery is available
    if (typeof $ !== 'undefined') {
        rewriteTimesheetLinks();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof $ !== 'undefined') {
                rewriteTimesheetLinks();
            }
        });
    }

    // Re-run after SPA navigations
    $(document).on('page-change route-change', function() {
        setTimeout(rewriteTimesheetLinks, 500);
    });

    // Start init
    waitForInitialization();

    console.log('Direct Timesheet Override: Script execution complete');
})();
