// Direct Timesheet Override - Fully Scoped & Safe
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
            // Debug logging to identify undefined parameters
            console.log('frappe.set_route called with:', {
                doctype: doctype,
                name: name,
                filters: filters,
                doctypeType: typeof doctype,
                nameType: typeof name,
                filtersType: typeof filters
            });
            
            try {
                if (Array.isArray(doctype)) {
                    // Handle array case - check if first element is a string and equals 'timesheet'
                    if (doctype.length > 0 && typeof doctype[0] === 'string' && doctype[0].toLowerCase() === 'timesheet') {
                        doctype[0] = 'Custom Timesheet';
                    }
                } else if (typeof doctype === 'string' && doctype.toLowerCase() === 'timesheet') {
                    doctype = 'Custom Timesheet';
                }
        
                if (typeof name === 'string' && name.toLowerCase() === 'timesheet') {
                    name = 'Custom Timesheet';
                }
        
            } catch (err) {
                console.error('Timesheet override error:', err);
            }
        
            // Ensure we don't pass undefined values that could cause URL issues
            const safeDoctype = doctype;
            const safeName = name || '';
            const safeFilters = filters || {};
            
            return originalSetRoute.apply(this, [safeDoctype, safeName, safeFilters]);
        };
        
        // --- Intercept Timesheet clicks only ---
        $(document).on('click.timesheet', 'a', function(e) {
            const $this = $(this);
            const href = ($this.attr('href') || '').toLowerCase();
            const dataLink = ($this.attr('data-link') || '').toLowerCase();
            const text = ($this.text() || '').trim().toLowerCase();

            console.log('Link clicked:', {
                href: $this.attr('href'),
                dataLink: $this.attr('data-link'),
                text: text,
                originalHref: href,
                originalDataLink: dataLink
            });

            if (text === 'timesheet' || href === '/app/timesheet' || dataLink === '/app/timesheet') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Redirecting to Custom Timesheet');
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
