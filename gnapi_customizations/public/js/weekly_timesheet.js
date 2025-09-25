// WeeklyTimesheet Client Script

frappe.ui.form.on('WeeklyTimesheet', {
	refresh: function(frm) {
		// Add custom buttons
		if (!frm.doc.__islocal && frm.doc.docstatus === 0) {
			frm.add_custom_button(__('Add Row'), function() {
				add_new_row(frm);
			});
		}

		// Set up date validation
		setup_date_validation(frm);

		// Calculate totals
		calculate_totals(frm);
	},

	employee: function(frm) {
		if (frm.doc.employee) {
			// Auto-populate employee name
			frappe.call({
				method: 'frappe.client.get',
				args: {
					doctype: 'Employee',
					name: frm.doc.employee
				},
				callback: function(r) {
					if (r.message) {
						frm.set_value('employee_name', r.message.employee_name);
					}
				}
			});

			// Set default date range if not set
			if (!frm.doc.from_date) {
				set_default_week(frm);
			}
		}
	},

	from_date: function(frm) {
		if (frm.doc.from_date && frm.doc.to_date) {
			validate_week_range(frm);
		}
	},

	to_date: function(frm) {
		if (frm.doc.from_date && frm.doc.to_date) {
			validate_week_range(frm);
		}
	},

	validate: function(frm) {
		// Custom validation
		if (frm.doc.timesheet_details && frm.doc.timesheet_details.length === 0) {
			frappe.msgprint(__('Please add at least one timesheet entry'));
			frappe.validated = false;
		}
	}
});

// WeeklyTimesheet Detail events
frappe.ui.form.on('WeeklyTimesheet Detail', {
	project: function(frm, cdt, cdn) {
		let row = locals[cdt][cdn];
		if (row.project) {
			// Auto-populate activities for the project
			load_activities_for_project(frm, row);
		}
	},

	monday: function(frm, cdt, cdn) {
		calculate_row_total(frm, cdt, cdn);
	},

	tuesday: function(frm, cdt, cdn) {
		calculate_row_total(frm, cdt, cdn);
	},

	wednesday: function(frm, cdt, cdn) {
		calculate_row_total(frm, cdt, cdn);
	},

	thursday: function(frm, cdt, cdn) {
		calculate_row_total(frm, cdt, cdn);
	},

	friday: function(frm, cdt, cdn) {
		calculate_row_total(frm, cdt, cdn);
	},

	saturday: function(frm, cdt, cdn) {
		calculate_row_total(frm, cdt, cdn);
	},

	sunday: function(frm, cdt, cdn) {
		calculate_row_total(frm, cdt, cdn);
	}
});

// Helper functions
function add_new_row(frm) {
	let new_row = frm.add_child('timesheet_details');
	new_row.monday = 0;
	new_row.tuesday = 0;
	new_row.wednesday = 0;
	new_row.thursday = 0;
	new_row.friday = 0;
	new_row.saturday = 0;
	new_row.sunday = 0;
	new_row.total = 0;

	frm.refresh_field('timesheet_details');
}

function calculate_row_total(frm, cdt, cdn) {
	let row = locals[cdt][cdn];
	let total = (row.monday || 0) + (row.tuesday || 0) + (row.wednesday || 0) +
				(row.thursday || 0) + (row.friday || 0) + (row.saturday || 0) + (row.sunday || 0);

	frappe.model.set_value(cdt, cdn, 'total', total);
	calculate_totals(frm);
}

function calculate_totals(frm) {
	let total_hours = 0;
	if (frm.doc.timesheet_details) {
		frm.doc.timesheet_details.forEach(function(row) {
			total_hours += row.total || 0;
		});
	}
	frm.set_value('total_hours', total_hours);
	frm.refresh_field('total_hours');
}

function setup_date_validation(frm) {
	// Set date field properties
	if (frm.fields_dict.from_date) {
		frm.fields_dict.from_date.$input.attr('min', new Date().toISOString().split('T')[0]);
	}
}

function set_default_week(frm) {
	// Get current Monday
	let today = new Date();
	let monday = new Date(today);
	monday.setDate(today.getDate() - today.getDay() + 1);

	let sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	frm.set_value('from_date', monday.toISOString().split('T')[0]);
	frm.set_value('to_date', sunday.toISOString().split('T')[0]);
}

function validate_week_range(frm) {
	if (frm.doc.from_date && frm.doc.to_date) {
		let from_date = new Date(frm.doc.from_date);
		let to_date = new Date(frm.doc.to_date);

		// Check if from_date is Monday
		if (from_date.getDay() !== 1) {
			frappe.msgprint(__('From Date should be a Monday'));
			frm.set_value('from_date', '');
			return;
		}

		// Check if difference is exactly 6 days
		let diff_time = to_date.getTime() - from_date.getTime();
		let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));

		if (diff_days !== 6) {
			frappe.msgprint(__('Date range must be exactly 7 days (Monday to Sunday)'));
			frm.set_value('to_date', '');
			return;
		}
	}
}

function load_activities_for_project(frm, row) {
	if (row.project) {
		frappe.call({
			method: 'gnapi_customizations.doctype.weekly_timesheet_detail.weekly_timesheet_detail.get_project_activities',
			args: {
				project: row.project
			},
			callback: function(r) {
				if (r.message) {
					// Set query filter for activity field
					frm.set_query('activity', 'timesheet_details', function(doc, cdt, cdn) {
						let row = locals[cdt][cdn];
						if (row.project) {
							return {
								filters: {
									project: row.project
								}
							};
						}
					});
				}
			}
		});
	}
}

// Form setup
frappe.ui.form.on('WeeklyTimesheet', {
	onload: function(frm) {
		// Set up form behavior
		if (frm.doc.__islocal) {
			// New form - set defaults
			set_default_week(frm);

			// Add initial row if none exist
			if (!frm.doc.timesheet_details || frm.doc.timesheet_details.length === 0) {
				setTimeout(function() {
					add_new_row(frm);
				}, 500);
			}
		}
	}
});
