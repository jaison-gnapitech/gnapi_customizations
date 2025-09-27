// Direct Timesheet Override - Immediate Execution
// This script runs immediately to override Timesheet navigation

(function() {
    'use strict';
    
    console.log('Direct Timesheet Override: Script executing...');
    
    // Wait for DOM and Frappe to be available
    function waitForInitialization() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForInitialization);
            return;
        }
        
        if (typeof frappe !== 'undefined' && frappe.set_route) {
            console.log('Direct Timesheet Override: Frappe available, initializing...');
            initializeDirectOverride();
        } else {
            // Wait a bit and try again
            setTimeout(waitForInitialization, 100);
        }
    }
    
    function initializeDirectOverride() {
        // Override frappe.set_route immediately
        if (typeof frappe !== 'undefined' && frappe.set_route) {
        const originalSetRoute = frappe.set_route;
        frappe.set_route = function(doctype, name, filters) {
            if (doctype === 'Timesheet' || doctype === 'timesheet') {
                console.log('Direct Timesheet Override: Intercepted frappe.set_route for Timesheet, redirecting to Custom Timesheet');
                return originalSetRoute.call(this, 'Custom Timesheet', name, filters);
            }
            return originalSetRoute.apply(this, arguments);
        };
        console.log('Direct Timesheet Override: frappe.set_route overridden');
    }
    
    // Override any Timesheet links immediately
    function overrideTimesheetLinks() {
        console.log('Direct Timesheet Override: Overriding Timesheet links...');
        
        // Override any direct navigation to Timesheet
        $(document).on('click', 'a[href*="/app/timesheet"], a[href*="/app/Timesheet"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Direct Timesheet Override: Timesheet link clicked, redirecting to Custom Timesheet');
            if (typeof frappe !== 'undefined' && frappe.set_route) {
                frappe.set_route('List', 'Custom Timesheet');
            } else {
                window.location.href = '/app/custom-timesheet';
            }
            return false;
        });
        
        // Override any menu items with Timesheet text
        $(document).on('click', 'a', function(e) {
            const $this = $(this);
            const text = $this.text().trim();
            const href = $this.attr('href') || '';
            const dataLink = $this.attr('data-link') || '';
            
            if (text === 'Timesheet' && (href.includes('timesheet') || href.includes('Timesheet') || dataLink.includes('timesheet') || dataLink.includes('Timesheet'))) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Direct Timesheet Override: Timesheet menu item clicked, redirecting to Custom Timesheet');
                if (typeof frappe !== 'undefined' && frappe.set_route) {
                    frappe.set_route('List', 'Custom Timesheet');
                } else {
                    window.location.href = '/app/custom-timesheet';
                }
                return false;
            }
        });
        
        // Update all Timesheet links in the DOM
        $('a[href*="/app/timesheet"], a[href*="/app/Timesheet"]').each(function() {
            const $this = $(this);
            $this.attr('href', '/app/custom-timesheet');
            $this.attr('data-link', '/app/custom-timesheet');
            console.log('Direct Timesheet Override: Updated Timesheet link to Custom Timesheet');
        });
        
        $('a[data-link*="timesheet"], a[data-link*="Timesheet"]').each(function() {
            const $this = $(this);
            $this.attr('data-link', '/app/custom-timesheet');
            $this.attr('href', '/app/custom-timesheet');
            console.log('Direct Timesheet Override: Updated Timesheet data-link to Custom Timesheet');
        });
        
        // Also update any sidebar menu items
        $('.sidebar-menu a').each(function() {
            const $this = $(this);
            const text = $this.text().trim();
            if (text === 'Timesheet') {
                $this.attr('href', '/app/custom-timesheet');
                $this.attr('data-link', '/app/custom-timesheet');
                console.log('Direct Timesheet Override: Updated sidebar Timesheet link');
            }
        });
    }
    
    // Run immediately if jQuery is available
    if (typeof $ !== 'undefined') {
        overrideTimesheetLinks();
    } else {
        // Wait for jQuery to be available
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof $ !== 'undefined') {
                overrideTimesheetLinks();
            }
        });
    }
    
    // Also run when the page changes
    $(document).on('page-change', function() {
        setTimeout(overrideTimesheetLinks, 500);
    });
    
    // Start waiting for initialization
    waitForInitialization();
    
    console.log('Direct Timesheet Override: Script execution complete');
})();
