// Direct Timesheet Override - Fully Scoped & Safe
// Only redirect /app/timesheet → /app/custom-timesheet
// Prevents undefined/invalid routes for all other pages

(function() {
    'use strict';

    function waitForFrappe() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForFrappe);
            return;
        }

        if (typeof frappe !== 'undefined' && frappe.set_route) {
            initializeOverride();
        } else {
            setTimeout(waitForFrappe, 100);
        }
    }

    function initializeOverride() {
        if (frappe._timesheetRouteOverridden) return;
        frappe._timesheetRouteOverridden = true;

        const originalSetRoute = frappe.set_route;

        frappe.set_route = function(doctype, name, filters) {
            try {
                // --- Only modify Timesheet routes ---
                if (Array.isArray(doctype)) {
                    if (typeof doctype[1] === 'string' && doctype[1].toLowerCase() === 'timesheet') {
                        doctype[1] = 'Custom Timesheet';
                    }
                } else if (typeof doctype === 'string' && doctype.toLowerCase() === 'timesheet') {
                    doctype = 'Custom Timesheet';
                }
                if (typeof name === 'string' && name.toLowerCase() === 'timesheet') {
                    name = 'Custom Timesheet';
                }

                // --- Validate arguments to prevent undefined/URL errors ---
                if (doctype === undefined || doctype === null) return;
                if (Array.isArray(doctype) && doctype[0] === undefined) return;

            } catch (err) {
                console.error('Timesheet override error:', err);
                return;
            }

            return originalSetRoute.apply(this, [doctype, name, filters]);
        };

        // --- Intercept Timesheet clicks ---
        $(document).on('click.timesheet', 'a', function(e) {
            const $this = $(this);
            const href = ($this.attr('href') || '').toLowerCase();
            const dataLink = ($this.attr('data-link') || '').toLowerCase();
            const text = ($this.text() || '').trim().toLowerCase();

            if (text === 'timesheet' || href === '/app/timesheet' || dataLink === '/app/timesheet') {
                e.preventDefault();
                frappe.set_route('List', 'Custom Timesheet');
                return false;
            }
        });

        // --- Rewrite Timesheet links in DOM ---
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

        if (typeof $ !== 'undefined') rewriteLinks();

        $(document).on('page-change route-change', function() {
            setTimeout(rewriteLinks, 300);
        });
    }

    waitForFrappe();
})();
