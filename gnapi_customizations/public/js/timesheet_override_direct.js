// Direct Timesheet Override - Fully Scoped
// Only redirect /app/timesheet → /app/custom-timesheet

(function() {
    'use strict';

    console.log('Direct Timesheet Override: Script executing...');

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
                // Handle array-style route: ['List', 'Timesheet']
                if (Array.isArray(doctype) && doctype.length > 1 && typeof doctype[1] === 'string') {
                    if (doctype[1].toLowerCase() === 'timesheet') {
                        console.log('Redirecting Timesheet → Custom Timesheet (array call)');
                        doctype[1] = 'Custom Timesheet';
                    }
                }
                // Handle Form route: ('Form', 'Timesheet', ...)
                else if (typeof name === 'string' && name.toLowerCase() === 'timesheet') {
                    console.log('Redirecting Timesheet → Custom Timesheet (name argument)');
                    name = 'Custom Timesheet';
                }
                // Handle string-style doctype: 'Timesheet'
                else if (typeof doctype === 'string' && doctype.toLowerCase() === 'timesheet') {
                    console.log('Redirecting Timesheet → Custom Timesheet (string doctype)');
                    doctype = 'Custom Timesheet';
                }
            } catch (err) {
                console.error('Timesheet override error:', err);
            }

            return originalSetRoute.apply(this, [doctype, name, filters]);
        };

        // --- Intercept Timesheet clicks only ---
        $(document).on('click.timesheet', 'a', function(e) {
            const $this = $(this);
            const href = ($this.attr('href') || '').toLowerCase();
            const dataLink = ($this.attr('data-link') || '').toLowerCase();
            const text = ($this.text() || '').trim().toLowerCase();

            if (text === 'timesheet' || href === '/app/timesheet' || dataLink === '/app/timesheet') {
                e.preventDefault();
                e.stopPropagation();

                console.log('Intercepted Timesheet click → Custom Timesheet');
                frappe.set_route('List', 'Custom Timesheet');
                return false;
            }
        });

        // --- Rewrite only exact Timesheet links in DOM ---
        function rewriteLinks() {
            $('a[href="/app/timesheet"], a[data-link="/app/timesheet"]').each(function() {
                const $link = $(this);
                $link.attr('href', '/app/custom-timesheet');
                $link.attr('data-link', '/app/custom-timesheet');
            });

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

    waitForFrappe();
    console.log('Direct Timesheet Override: Script loaded');
})();
