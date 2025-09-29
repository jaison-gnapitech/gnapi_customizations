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
            // Only intercept and modify Timesheet-related routes
            let modifiedDoctype = doctype;
            let modifiedName = name;
            let modifiedFilters = filters;
            
            try {
                // Check if this is a Timesheet route that needs to be redirected
                const isTimesheetRoute = (() => {
                    if (Array.isArray(doctype)) {
                        return doctype.length > 0 && typeof doctype[0] === 'string' && 
                               doctype[0].toLowerCase() === 'timesheet';
                    }
                    return typeof doctype === 'string' && doctype.toLowerCase() === 'timesheet';
                })();
                
                const isTimesheetName = typeof name === 'string' && name.toLowerCase() === 'timesheet';
                
                // Only modify if it's actually a Timesheet route
                if (isTimesheetRoute || isTimesheetName) {
                    console.log('Timesheet route detected, redirecting to Custom Timesheet:', {
                        doctype: doctype,
                        name: name,
                        filters: filters
                    });
                    
                    if (Array.isArray(doctype)) {
                        modifiedDoctype = ['Custom Timesheet'];
                    } else {
                        modifiedDoctype = 'Custom Timesheet';
                    }
                    
                    if (isTimesheetName) {
                        modifiedName = 'Custom Timesheet';
                    }
                }
                
            } catch (err) {
                console.error('Timesheet override error:', err);
            }
        
            // Pass through all routes unchanged, only modify Timesheet routes
            return originalSetRoute.apply(this, [modifiedDoctype, modifiedName, modifiedFilters]);
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
                console.log('Timesheet link clicked, redirecting to Custom Timesheet');
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
