// Custom Timesheet Navigation Override
// This script overrides the default Timesheet navigation to show Custom Timesheet

frappe.ready(function() {
    console.log('Custom Timesheet Navigation Override loaded');
    
    // Function to override Timesheet links
    function overrideTimesheetLinks() {
        console.log('Overriding Timesheet links...');
        
        // Override the Timesheet menu item click - more specific selectors
        $(document).off('click', 'a[href*="/app/timesheet"]').on('click', 'a[href*="/app/timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet link clicked, redirecting to Custom Timesheet');
            // Redirect to Custom Timesheet instead
            frappe.set_route('List', 'Custom Timesheet');
            return false;
        });
        
        // Override any other Timesheet links
        $(document).off('click', 'a[href*="Timesheet"]').on('click', 'a[href*="Timesheet"]', function(e) {
            if ($(this).text().trim() === 'Timesheet' || $(this).attr('href').includes('timesheet')) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Timesheet link clicked, redirecting to Custom Timesheet');
                // Redirect to Custom Timesheet instead
                frappe.set_route('List', 'Custom Timesheet');
                return false;
            }
        });
        
        // Override the navigation menu items
        setTimeout(function() {
            // Find and replace Timesheet menu items
            $('.sidebar-menu a[href*="timesheet"]').each(function() {
                if ($(this).text().trim() === 'Timesheet') {
                    $(this).attr('href', '/app/custom-timesheet');
                    $(this).attr('data-link', '/app/custom-timesheet');
                    console.log('Updated Timesheet menu link to Custom Timesheet');
                }
            });
            
            // Find and replace any other Timesheet references
            $('.sidebar-menu a').each(function() {
                if ($(this).text().trim() === 'Timesheet' && $(this).attr('href') !== '/app/custom-timesheet') {
                    $(this).attr('href', '/app/custom-timesheet');
                    $(this).attr('data-link', '/app/custom-timesheet');
                    console.log('Updated Timesheet menu link to Custom Timesheet');
                }
            });
            
            // Also check for any links with data-link attribute
            $('a[data-link*="timesheet"]').each(function() {
                if ($(this).text().trim() === 'Timesheet') {
                    $(this).attr('data-link', '/app/custom-timesheet');
                    $(this).attr('href', '/app/custom-timesheet');
                    console.log('Updated Timesheet data-link to Custom Timesheet');
                }
            });
        }, 1000);
        
        // Override the breadcrumb navigation
        $(document).off('click', '.breadcrumb a[href*="timesheet"]').on('click', '.breadcrumb a[href*="timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet breadcrumb clicked, redirecting to Custom Timesheet');
            // Redirect to Custom Timesheet instead
            frappe.set_route('List', 'Custom Timesheet');
            return false;
        });
        
        // Override any navigation that might use frappe.set_route
        const originalSetRoute = frappe.set_route;
        frappe.set_route = function(doctype, name) {
            if (doctype === 'Timesheet' || doctype === 'timesheet') {
                console.log('Intercepted frappe.set_route for Timesheet, redirecting to Custom Timesheet');
                return originalSetRoute.call(this, 'Custom Timesheet', name);
            }
            return originalSetRoute.apply(this, arguments);
        };
    }
    
    // Initialize the override
    overrideTimesheetLinks();
    
    // Re-run the override when the page changes (for SPA navigation)
    $(document).on('page-change', function() {
        setTimeout(overrideTimesheetLinks, 500);
    });
    
    // Also run on route change
    $(document).on('route-change', function() {
        setTimeout(overrideTimesheetLinks, 500);
    });
});