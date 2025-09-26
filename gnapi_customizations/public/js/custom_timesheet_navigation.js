// Custom Timesheet Navigation Override
// This script overrides the default Timesheet navigation to show Custom Timesheet

frappe.ready(function() {
    console.log('Custom Timesheet Navigation Override loaded');
    
    // Function to override Timesheet links
    function overrideTimesheetLinks() {
        // Override the Timesheet menu item click
        $(document).on('click', 'a[href*="/app/timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet link clicked, redirecting to Custom Timesheet');
            // Redirect to Custom Timesheet instead
            window.location.href = '/app/custom-timesheet';
            return false;
        });
        
        // Override any other Timesheet links
        $(document).on('click', 'a[href*="Timesheet"]', function(e) {
            if ($(this).text().trim() === 'Timesheet' || $(this).attr('href').includes('timesheet')) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Timesheet link clicked, redirecting to Custom Timesheet');
                // Redirect to Custom Timesheet instead
                window.location.href = '/app/custom-timesheet';
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
        }, 1000);
        
        // Override the breadcrumb navigation
        $(document).on('click', '.breadcrumb a[href*="timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet breadcrumb clicked, redirecting to Custom Timesheet');
            // Redirect to Custom Timesheet instead
            window.location.href = '/app/custom-timesheet';
            return false;
        });
    }
    
    // Initialize the override
    overrideTimesheetLinks();
    
    // Re-run the override when the page changes (for SPA navigation)
    $(document).on('page-change', function() {
        setTimeout(overrideTimesheetLinks, 500);
    });
});