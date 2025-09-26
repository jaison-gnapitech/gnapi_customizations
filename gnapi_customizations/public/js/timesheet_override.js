// Direct Timesheet Navigation Override
// This script directly overrides the Timesheet navigation to show Custom Timesheet

frappe.ready(function() {
    console.log('Direct Timesheet Navigation Override loaded');
    
    // Override the default Timesheet navigation
    function overrideTimesheetNavigation() {
        console.log('Overriding Timesheet navigation...');
        
        // Method 1: Override frappe.set_route for Timesheet
        const originalSetRoute = frappe.set_route;
        frappe.set_route = function(doctype, name, filters) {
            if (doctype === 'Timesheet' || doctype === 'timesheet') {
                console.log('Intercepted frappe.set_route for Timesheet, redirecting to Custom Timesheet');
                return originalSetRoute.call(this, 'Custom Timesheet', name, filters);
            }
            return originalSetRoute.apply(this, arguments);
        };
        
        // Method 2: Override any direct navigation to Timesheet
        $(document).on('click', 'a[href*="/app/timesheet"], a[href*="/app/Timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet link clicked, redirecting to Custom Timesheet');
            frappe.set_route('List', 'Custom Timesheet');
            return false;
        });
        
        // Method 3: Override any menu items with Timesheet text
        $(document).on('click', 'a', function(e) {
            const $this = $(this);
            const text = $this.text().trim();
            const href = $this.attr('href') || '';
            
            if (text === 'Timesheet' && (href.includes('timesheet') || href.includes('Timesheet'))) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Timesheet menu item clicked, redirecting to Custom Timesheet');
                frappe.set_route('List', 'Custom Timesheet');
                return false;
            }
        });
        
        // Method 4: Override any data-link attributes
        $(document).on('click', 'a[data-link*="timesheet"], a[data-link*="Timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet data-link clicked, redirecting to Custom Timesheet');
            frappe.set_route('List', 'Custom Timesheet');
            return false;
        });
        
        // Method 5: Update all Timesheet links in the DOM
        setTimeout(function() {
            $('a[href*="/app/timesheet"], a[href*="/app/Timesheet"]').each(function() {
                const $this = $(this);
                $this.attr('href', '/app/custom-timesheet');
                $this.attr('data-link', '/app/custom-timesheet');
                console.log('Updated Timesheet link to Custom Timesheet');
            });
            
            $('a[data-link*="timesheet"], a[data-link*="Timesheet"]').each(function() {
                const $this = $(this);
                $this.attr('data-link', '/app/custom-timesheet');
                $this.attr('href', '/app/custom-timesheet');
                console.log('Updated Timesheet data-link to Custom Timesheet');
            });
        }, 1000);
    }
    
    // Initialize the override
    overrideTimesheetNavigation();
    
    // Re-run the override when the page changes
    $(document).on('page-change', function() {
        setTimeout(overrideTimesheetNavigation, 500);
    });
    
    // Also run on route change
    $(document).on('route-change', function() {
        setTimeout(overrideTimesheetNavigation, 500);
    });
    
    // Override any navigation that might bypass our interceptors
    $(document).on('click', 'a', function(e) {
        const $this = $(this);
        const text = $this.text().trim();
        const href = $this.attr('href') || '';
        const dataLink = $this.attr('data-link') || '';
        
        if (text === 'Timesheet' && (href.includes('timesheet') || href.includes('Timesheet') || dataLink.includes('timesheet') || dataLink.includes('Timesheet'))) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet link intercepted, redirecting to Custom Timesheet');
            frappe.set_route('List', 'Custom Timesheet');
            return false;
        }
    });
});
