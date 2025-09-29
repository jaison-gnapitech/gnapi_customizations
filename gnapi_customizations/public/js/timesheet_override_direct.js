// Direct Timesheet Override - Updated & Optimized
// Redirect all Timesheet navigation to Custom Timesheet

(function() {
    'use strict';

    console.log('Direct Timesheet Override: Script executing...');

    // --- Wait for Frappe to load ---
    function waitForFrappe() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForFrappe);
            return;
        }

        if (typeof frappe !== 'undefined' && frappe.set_route) {
            console.log('Direct Timesheet Override: Frappe available, initializing...');
            initializeOverride();
        } else {
            setTimeout(waitForFrappe, 100);
        }
    }

    function initializeOverride() {
        // Prevent multiple overrides
        if (frappe._timesheetRouteOverridden) return;
        frappe._timesheetRouteOverridden = true;

        // --- Override frappe.set_route safely ---
        const originalSetRoute = frappe.set_route;
        frappe.set_route = function(doctype, name, filters) {
            try {
                // Handle array call: ['List', 'Timesheet']
                if (Array.isArray(doctype)) {
                    if (doctype[1] && typeof doctype[1] === 'string' && doctype[1].toLowerCase() === 'timesheet') {
                        console.log('Redirecting Timesheet → Custom Timesheet (array call)');
                        doctype[1] = 'Custom Timesheet';
                    }
                } 
                // Handle string call: 'Timesheet'
                else if (typeof doctype === 'string' && doctype.toLowerCase() === 'timesheet') {
                    console.log('Redirecting Timesheet → Custom Timesheet (string call)');
                    doctype = 'Custom Timesheet';
                }
            } catch (err) {
                console.error('Timesheet override error:', err);
            }

            return originalSetRoute.apply(this, arguments);
        };

        // --- Universal click interceptor ---
        $(document).on('click.timesheet', 'a', function(e) {
            const $this = $(this);
            const href = ($this.attr('href') || '').toLowerCase();
            const dataLink = ($this.attr('data-link') || '').toLowerCase();
            const text = ($this.text() || '').trim().toLowerCase();

            if (text === 'timesheet' || href.includes('/app/timesheet') || dataLink.includes('timesheet')) {
                e.preventDefault();
                e.stopPropagation();

                console.log('Intercepted Timesheet click → Custom Timesheet');
                frappe.set_route('List', 'Custom Timesheet');
                return false;
            }
        });

        // --- Rewrite existing DOM links ---
        function rewriteLinks() {
            $('a[href*="/app/timesheet"], a[data-link*="timesheet"]').each(function() {
                const $link = $(this);
                $link.attr('href', '/app/custom-timesheet');
                $link.attr('data-link', '/app/custom-timesheet');
            });

            // Sidebar menu handling
            $('.sidebar-menu a').each(function() {
                const $link = $(this);
                if (($link.text() || '').trim().toLowerCase() === 'timesheet') {
                    $link.attr('href', '/app/custom-timesheet');
                    $link.attr('data-link', '/app/custom-timesheet');
                }
            });
        }

        // Initial rewrite
        if (typeof $ !== 'undefined') {
            rewriteLinks();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof $ !== 'undefined') rewriteLinks();
            });
        }

        // Re-run on SPA navigation
        $(document).on('page-change route-change', function() {
            setTimeout(rewriteLinks, 300);
        });
    }

    // Start the process
    waitForFrappe();

    console.log('Direct Timesheet Override: Script loaded');
})();
