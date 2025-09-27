// Timesheet Navigation Override v2 - Direct Implementation
// This script will override Timesheet navigation to redirect to Custom Timesheet

console.log('Timesheet Navigation Override Script Loading...');

// Wait for DOM and Frappe to be available
function waitForInitialization() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForInitialization);
        return;
    }
    
    // Wait for Frappe to be available
    if (typeof frappe !== 'undefined' && typeof frappe.set_route === 'function') {
        console.log('Timesheet Navigation Override: Frappe ready, initializing...');
        initializeNavigationOverride();
    } else {
        // Wait a bit and try again
        setTimeout(waitForInitialization, 100);
    }
}

function initializeNavigationOverride() {
    
    // Function to override Timesheet navigation
    function overrideTimesheetNavigation() {
        console.log('Timesheet Navigation Override: Starting override...');
        
        // Method 1: Override frappe.set_route for Timesheet
        const originalSetRoute = frappe.set_route;
        frappe.set_route = function(doctype, name, filters) {
            if (doctype === 'Timesheet' || doctype === 'timesheet') {
                console.log('Timesheet Navigation Override: Intercepted frappe.set_route for Timesheet, redirecting to Custom Timesheet');
                return originalSetRoute.call(this, 'Custom Timesheet', name, filters);
            }
            return originalSetRoute.apply(this, arguments);
        };
        
        // Method 2: Override any direct navigation to Timesheet
        $(document).on('click', 'a[href*="/app/timesheet"], a[href*="/app/Timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Timesheet Navigation Override: Timesheet link clicked, redirecting to Custom Timesheet');
            frappe.set_route('List', 'Custom Timesheet');
            return false;
        });
        
        // Method 3: Override any menu items with Timesheet text
        $(document).on('click', 'a', function(e) {
            const $this = $(this);
            const text = $this.text().trim();
            const href = $this.attr('href') || '';
            const dataLink = $this.attr('data-link') || '';
            
            if (text === 'Timesheet' && (href.includes('timesheet') || href.includes('Timesheet') || dataLink.includes('timesheet') || dataLink.includes('Timesheet'))) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Timesheet Navigation Override: Timesheet menu item clicked, redirecting to Custom Timesheet');
                frappe.set_route('List', 'Custom Timesheet');
                return false;
            }
        });
        
        // Method 4: Update all Timesheet links in the DOM
        setTimeout(function() {
            console.log('Timesheet Navigation Override: Updating DOM links...');
            
            $('a[href*="/app/timesheet"], a[href*="/app/Timesheet"]').each(function() {
                const $this = $(this);
                $this.attr('href', '/app/custom-timesheet');
                $this.attr('data-link', '/app/custom-timesheet');
                console.log('Timesheet Navigation Override: Updated Timesheet link to Custom Timesheet');
            });
            
            $('a[data-link*="timesheet"], a[data-link*="Timesheet"]').each(function() {
                const $this = $(this);
                $this.attr('data-link', '/app/custom-timesheet');
                $this.attr('href', '/app/custom-timesheet');
                console.log('Timesheet Navigation Override: Updated Timesheet data-link to Custom Timesheet');
            });
            
            // Also update any sidebar menu items
            $('.sidebar-menu a').each(function() {
                const $this = $(this);
                const text = $this.text().trim();
                if (text === 'Timesheet') {
                    $this.attr('href', '/app/custom-timesheet');
                    $this.attr('data-link', '/app/custom-timesheet');
                    console.log('Timesheet Navigation Override: Updated sidebar Timesheet link');
                }
            });
        }, 1000);
        
        // Method 5: Override any navigation that might bypass our interceptors
        $(document).on('click', 'a', function(e) {
            const $this = $(this);
            const text = $this.text().trim();
            const href = $this.attr('href') || '';
            const dataLink = $this.attr('data-link') || '';
            
            if (text === 'Timesheet' && (href.includes('timesheet') || href.includes('Timesheet') || dataLink.includes('timesheet') || dataLink.includes('Timesheet'))) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Timesheet Navigation Override: Timesheet link intercepted, redirecting to Custom Timesheet');
                frappe.set_route('List', 'Custom Timesheet');
                return false;
            }
        });
        
        console.log('Timesheet Navigation Override: Override setup complete');
    }
    
    // Initialize the override
    overrideTimesheetNavigation();
    
    // Re-run the override when the page changes (for SPA navigation)
    $(document).on('page-change', function() {
        console.log('Timesheet Navigation Override: Page changed, re-running override...');
        setTimeout(overrideTimesheetNavigation, 500);
    });
    
    // Also run on route change
    $(document).on('route-change', function() {
        console.log('Timesheet Navigation Override: Route changed, re-running override...');
        setTimeout(overrideTimesheetNavigation, 500);
    });
    
    console.log('Timesheet Navigation Override: Initialization complete');
}

// Start waiting for initialization
waitForInitialization();

console.log('Timesheet Navigation Override Script Loaded');
