// Weekly Timesheet Dashboard JavaScript
// Handles dashboard interactions and data loading

frappe.ready(function() {
    console.log('Weekly Timesheet Dashboard loaded');

    // Initialize dashboard
    initializeDashboard();

    // Set up event handlers
    setupEventHandlers();
});

function initializeDashboard() {
    // Load dashboard statistics
    loadDashboardStats();

    // Load recent timesheets
    loadRecentTimesheets();

    // Update page title
    if (window.title) {
        document.title = 'Weekly Timesheet Dashboard - ' + window.title;
    }
}

function setupEventHandlers() {
    // Handle quick action buttons
    $('.action-btn').on('click', function(e) {
        e.preventDefault();

        const href = $(this).attr('href');
        if (href) {
            // Handle internal navigation
            if (href.startsWith('/app/')) {
                // Navigate to Frappe app
                window.location.href = href;
            } else if (href.startsWith('#')) {
                // Handle anchor links
                const target = href.substring(1);
                if (target === 'export') {
                    exportData();
                }
            }
        }
    });

    // Handle export button
    $(document).on('click', '[onclick="exportData()"]', function() {
        exportData();
    });
}

function loadDashboardStats() {
    frappe.call({
        method: 'gnapi_customizations.weekly_timesheet.timesheet_dashboard.get_dashboard_stats',
        callback: function(r) {
            if (r.message) {
                const stats = r.message;

                // Update statistics cards
                $('#total-timesheets').text(stats.total_timesheets || 0);
                $('#total-hours').text((stats.total_hours || 0).toFixed(1));
                $('#avg-hours').text((stats.avg_hours || 0).toFixed(1));
                $('#pending-approvals').text(stats.pending_approvals || 0);

                // Add some visual feedback
                animateStats();
            }
        }
    });
}

function loadRecentTimesheets() {
    frappe.call({
        method: 'gnapi_customizations.weekly_timesheet.timesheet_dashboard.get_recent_timesheets',
        args: {
            limit: 10
        },
        callback: function(r) {
            if (r.message) {
                displayRecentTimesheets(r.message);
            }
        }
    });
}

function displayRecentTimesheets(timesheets) {
    const container = $('#recent-timesheets-container');

    if (!timesheets || timesheets.length === 0) {
        container.html(`
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h4>No Timesheets Found</h4>
                <p>Start by creating your first weekly timesheet</p>
                <a href="/app/weekly-timesheet/new" class="action-btn btn-primary">
                    Create First Timesheet
                </a>
            </div>
        `);
        return;
    }

    let html = `
        <table class="timesheet-table">
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    timesheets.forEach(ts => {
        const statusClass = ts.status === 'Submitted' ? 'status-submitted' : 'status-draft';
        const statusText = ts.status;

        html += `
            <tr class="timesheet-row">
                <td>
                    <strong>${ts.employee_name || 'N/A'}</strong><br>
                    <small style="color: #8d99a6;">${ts.name}</small>
                </td>
                <td>
                    ${formatDate(ts.from_date)}<br>
                    <small style="color: #8d99a6;">to ${formatDate(ts.to_date)}</small>
                </td>
                <td>
                    <span style="font-weight: 600; color: #1a73e8;">${ts.total_hours || 0}h</span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <a href="/app/weekly-timesheet/${ts.name}" class="action-btn" style="padding: 4px 12px; font-size: 12px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px;">
                        View
                    </a>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.html(html);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

function animateStats() {
    // Simple animation for statistics
    $('.stat-number').each(function(index) {
        const $this = $(this);
        const finalValue = $this.text();

        // Only animate numbers
        if (/^\d+\.?\d*$/.test(finalValue)) {
            let currentValue = 0;
            const increment = parseFloat(finalValue) / 20;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= parseFloat(finalValue)) {
                    $this.text(finalValue);
                    clearInterval(timer);
                } else {
                    $this.text(currentValue.toFixed(1));
                }
            }, 50);
        }
    });
}

function exportData() {
    frappe.call({
        method: 'gnapi_customizations.api.utils.export_timesheet_data',
        args: {
            employee: frappe.session.user,
            from_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            to_date: new Date().toISOString().split('T')[0],
            format: 'csv'
        },
        callback: function(r) {
            if (r.message) {
                // Create download link
                const blob = new Blob([r.message.data], {type: 'text/plain'});
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = r.message.filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                frappe.show_alert({
                    message: __('Export completed successfully!'),
                    indicator: 'green'
                });
            }
        }
    });
}

// Utility function to refresh dashboard
function refreshDashboard() {
    loadDashboardStats();
    loadRecentTimesheets();
}
