// Custom Timesheet Form Enhancements
frappe.ui.form.on("Custom Timesheet", {
	refresh: function (frm) {
		enhanceAttachmentField(frm);
		addCustomAttachmentArea(frm);
		restrictStatusForEmployee(frm);
		addApprovalButtons(frm);
		enhanceTimesheetDetailsTable(frm);
		updateSaveButtonState(frm);
		addDebugButton(frm);
	},

	onload: function (frm) {
		restrictStatusForEmployee(frm);
		enhanceTimesheetDetailsTable(frm);
	},

	status: function (frm) {
		validateStatusChange(frm);
	},

	before_save: function (frm) {
		validateCustomTimesheetDetails(frm);
	},

	time_logs: {
		refresh: function (frm, cdt, cdn) {
			updateSaveButtonState(frm);
		},
		project: function (frm, cdt, cdn) {
			updateSaveButtonState(frm);
		},
		task: function (frm, cdt, cdn) {
			updateSaveButtonState(frm);
		},
		start_date_time: function (frm, cdt, cdn) {
			updateSaveButtonState(frm);
		},
		end_date_time: function (frm, cdt, cdn) {
			updateSaveButtonState(frm);
		}
	}
});

// ----------------------- EMPLOYEE STATUS RESTRICTIONS -----------------------
function restrictStatusForEmployee(frm) {
	if (frappe.user.has_role("Employee") && !frappe.user.has_role("System Manager")) {
		frm.set_df_property("status", "options", "Draft\nSubmitted");

		if (frm.doc.status && !["Draft", "Submitted"].includes(frm.doc.status)) {
			frappe.msgprint(__("Employees can only set status to Draft or Submitted"));
			frm.set_value("status", "Draft");
		}

		if (frm.doc.status === "Submitted") {
			frm.set_df_property("status", "read_only", 1);
		}
	}
}

function validateStatusChange(frm) {
	if (frappe.user.has_role("Employee") && !frappe.user.has_role("System Manager")) {
		const allowed = ["Draft", "Submitted"];
		if (frm.doc.status && !allowed.includes(frm.doc.status)) {
			frappe.msgprint({
				title: __("Invalid Status"),
				indicator: "red",
				message: __("Employees can only set status to Draft or Submitted"),
			});
			frm.set_value("status", "Draft");
		}
	}
}

// ----------------------- CUSTOM TIMESHEET DETAILS VALIDATION -----------------------
function validateCustomTimesheetDetails(frm) {
	// Check if time_logs table exists and has at least one row
	if (!frm.doc.time_logs || frm.doc.time_logs.length === 0) {
		frappe.msgprint({
			title: __("Validation Error"),
			indicator: "red",
			message: __("At least one row is required in Custom Timesheet Details table"),
		});
		frappe.validated = false;
		return;
	}

	// Validate each row in the time_logs table
	for (let i = 0; i < frm.doc.time_logs.length; i++) {
		const row = frm.doc.time_logs[i];
		const missingFields = [];

		// Check required fields
		if (!row.project) {
			missingFields.push("Project");
		}
		if (!row.task) {
			missingFields.push("Task");
		}
		if (!row.start_date_time) {
			missingFields.push("Start Date and Time");
		}
		if (!row.end_date_time) {
			missingFields.push("End Date and Time");
		}

		// Show error if any required fields are missing
		if (missingFields.length > 0) {
			frappe.msgprint({
				title: __("Validation Error"),
				indicator: "red",
				message: __("Mandatory fields required in Custom Timesheet Details, Row {0}: {1}", [i + 1, missingFields.join(", ")]),
			});
			frappe.validated = false;
			return;
		}

		// Validate that end time is after start time
		if (row.start_date_time && row.end_date_time) {
			const startDate = new Date(row.start_date_time);
			const endDate = new Date(row.end_date_time);
			
			if (endDate <= startDate) {
				frappe.msgprint({
					title: __("Validation Error"),
					indicator: "red",
					message: __("End Date and Time must be after Start Date and Time in Custom Timesheet Details row {0}", [i + 1]),
				});
				frappe.validated = false;
				return;
			}
		}
	}
	
	// Show success message if validation passes
	frappe.show_alert({
		message: __("✓ All timesheet entries are valid. Saving..."),
		indicator: "green",
	});
}

// ----------------------- TIMESHEET DETAILS TABLE ENHANCEMENTS -----------------------
function enhanceTimesheetDetailsTable(frm) {
	// Add custom CSS for better table styling
	if (!document.getElementById("custom-timesheet-table-styles")) {
		const style = document.createElement("style");
		style.id = "custom-timesheet-table-styles";
		style.textContent = `
			.custom-timesheet-table-header {
				background: #f8f9fa;
				padding: 15px;
				border: 1px solid #dee2e6;
				border-radius: 8px 8px 0 0;
				margin-bottom: 0;
			}
			.custom-timesheet-table-header h6 {
				margin: 0;
				color: #495057;
				font-weight: 600;
			}
			.custom-timesheet-table-actions {
				background: #f8f9fa;
				padding: 10px 15px;
				border: 1px solid #dee2e6;
				border-top: none;
				border-radius: 0 0 8px 8px;
				text-align: right;
			}
			.custom-timesheet-table-actions .btn {
				margin-left: 8px;
			}
			.custom-timesheet-validation-message {
				background: #fff3cd;
				border: 1px solid #ffeaa7;
				border-radius: 4px;
				padding: 10px;
				margin: 10px 0;
				color: #856404;
				font-size: 14px;
			}
			.custom-timesheet-validation-message.error {
				background: #f8d7da;
				border-color: #f5c6cb;
				color: #721c24;
			}
			.custom-timesheet-validation-message.success {
				background: #d4edda;
				border-color: #c3e6cb;
				color: #155724;
			}
			.table-responsive {
				border: 1px solid #dee2e6;
				border-radius: 8px;
				overflow: hidden;
			}
			.table th {
				background: #f8f9fa;
				font-weight: 600;
				border-bottom: 2px solid #dee2e6;
			}
			.table td {
				vertical-align: middle;
			}
			.required-field {
				color: #dc3545;
			}
			.field-error {
				border-color: #dc3545 !important;
				box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
			}
		`;
		document.head.appendChild(style);
	}

	// Enhance the time_logs table
	const timeLogsField = frm.fields_dict.time_logs;
	if (timeLogsField && timeLogsField.$wrapper) {
		enhanceTableWrapper(frm);
		addTableHeader(frm);
		addTableActions(frm);
		updateValidationMessage(frm);
	}
}

function enhanceTableWrapper(frm) {
	const wrapper = frm.fields_dict.time_logs.$wrapper;
	
	// Add custom classes
	wrapper.addClass("custom-timesheet-table-wrapper");
	
	// Wrap the table in a responsive container
	const tableContainer = wrapper.find('.table-responsive');
	if (tableContainer.length === 0) {
		const table = wrapper.find('table');
		if (table.length > 0) {
			table.wrap('<div class="table-responsive"></div>');
		}
	}
}

function addTableHeader(frm) {
	const wrapper = frm.fields_dict.time_logs.$wrapper;
	
	// Check if header already exists
	if (wrapper.find('.custom-timesheet-table-header').length > 0) return;
	
	const header = $(`
		<div class="custom-timesheet-table-header">
			<h6><i class="fa fa-clock-o"></i> Custom Timesheet Details</h6>
			<small class="text-muted">Add your work entries below. All fields are required.</small>
		</div>
	`);
	
	wrapper.prepend(header);
}

function addTableActions(frm) {
	const wrapper = frm.fields_dict.time_logs.$wrapper;
	
	// Check if actions already exist
	if (wrapper.find('.custom-timesheet-table-actions').length > 0) return;
	
	const actions = $(`
		<div class="custom-timesheet-table-actions">
			<button type="button" class="btn btn-sm btn-primary" id="add-timesheet-row">
				<i class="fa fa-plus"></i> Add Entry
			</button>
			<button type="button" class="btn btn-sm btn-secondary" id="clear-all-rows" style="display: none;">
				<i class="fa fa-trash"></i> Clear All
			</button>
		</div>
	`);
	
	wrapper.append(actions);
	
	// Add event handlers
	actions.find('#add-timesheet-row').on('click', function() {
		addTimesheetRow(frm);
	});
	
	actions.find('#clear-all-rows').on('click', function() {
		clearAllRows(frm);
	});
}

function addTimesheetRow(frm) {
	// Add a new row to the time_logs table
	frm.add_child('time_logs');
	frm.refresh_field('time_logs');
	
	// Update UI state
	updateSaveButtonState(frm);
	updateValidationMessage(frm);
	updateTableActions(frm);
	
	// Show success message
	showValidationMessage(frm, "New timesheet entry added. Please fill in all required fields.", "info");
}

// Debug function to inspect row data
function debugRowData(frm) {
	if (!frm.doc.time_logs || frm.doc.time_logs.length === 0) {
		console.log("No time_logs data found");
		return;
	}
	
	console.log("=== DEBUG: Time Logs Data ===");
	frm.doc.time_logs.forEach((row, index) => {
		console.log(`Row ${index + 1}:`, {
			project: row.project,
			task: row.task,
			start_date_time: row.start_date_time,
			end_date_time: row.end_date_time,
			raw_row: row
		});
	});
	console.log("=== END DEBUG ===");
}

function clearAllRows(frm) {
	frappe.confirm(
		__("Are you sure you want to clear all timesheet entries?"),
		function() {
			frm.clear_table('time_logs');
			frm.refresh_field('time_logs');
			
			// Update UI state
			updateSaveButtonState(frm);
			updateValidationMessage(frm);
			updateTableActions(frm);
			
			showValidationMessage(frm, "All timesheet entries cleared.", "info");
		}
	);
}

function updateTableActions(frm) {
	const wrapper = frm.fields_dict.time_logs.$wrapper;
	const clearButton = wrapper.find('#clear-all-rows');
	
	if (frm.doc.time_logs && frm.doc.time_logs.length > 0) {
		clearButton.show();
	} else {
		clearButton.hide();
	}
}

function updateSaveButtonState(frm) {
	const isValid = validateTimesheetDetails(frm);
	const saveButton = frm.page.find('.btn-primary[data-label="Save"]');
	
	if (saveButton.length > 0) {
		if (isValid) {
			saveButton.prop('disabled', false).removeClass('btn-secondary').addClass('btn-primary');
		} else {
			saveButton.prop('disabled', true).removeClass('btn-primary').addClass('btn-secondary');
		}
	}
	
	updateTableActions(frm);
}

function validateTimesheetDetails(frm) {
	// Check if time_logs table exists and has at least one row
	if (!frm.doc.time_logs || frm.doc.time_logs.length === 0) {
		return false;
	}

	// Validate each row in the time_logs table
	for (let i = 0; i < frm.doc.time_logs.length; i++) {
		const row = frm.doc.time_logs[i];
		
		// Debug: Log the row data to see what's actually there
		console.log(`Row ${i + 1} data:`, row);
		
		// Check required fields (including empty strings and whitespace)
		if (!row.project || !String(row.project).trim() || 
			!row.task || !String(row.task).trim() || 
			!row.start_date_time || !row.end_date_time) {
			console.log(`Row ${i + 1} missing fields:`, {
				project: row.project,
				task: row.task,
				start_date_time: row.start_date_time,
				end_date_time: row.end_date_time
			});
			return false;
		}

		// Validate that end time is after start time
		if (row.start_date_time && row.end_date_time) {
			const startDate = new Date(row.start_date_time);
			const endDate = new Date(row.end_date_time);
			
			if (endDate <= startDate) {
				console.log(`Row ${i + 1} time validation failed:`, {
					start: row.start_date_time,
					end: row.end_date_time
				});
				return false;
			}
		}
	}
	
	return true;
}

function updateValidationMessage(frm) {
	const wrapper = frm.fields_dict.time_logs.$wrapper;
	
	// Remove existing validation message
	wrapper.find('.custom-timesheet-validation-message').remove();
	
	if (!frm.doc.time_logs || frm.doc.time_logs.length === 0) {
		showValidationMessage(frm, "Please add at least one timesheet entry before saving.", "error");
	} else {
		const validationResult = getDetailedValidation(frm);
		if (validationResult.isValid) {
			showValidationMessage(frm, `✓ All ${frm.doc.time_logs.length} timesheet entries are valid and ready to save.`, "success");
		} else {
			showValidationMessage(frm, validationResult.message, "error");
		}
	}
}

function getDetailedValidation(frm) {
	// Check if time_logs table exists and has at least one row
	if (!frm.doc.time_logs || frm.doc.time_logs.length === 0) {
		return {
			isValid: false,
			message: "Please add at least one timesheet entry before saving."
		};
	}

	// Validate each row in the time_logs table
	for (let i = 0; i < frm.doc.time_logs.length; i++) {
		const row = frm.doc.time_logs[i];
		const missingFields = [];
		
		// Check required fields (including empty strings and whitespace)
		if (!row.project || !String(row.project).trim()) {
			missingFields.push("Project");
		}
		if (!row.task || !String(row.task).trim()) {
			missingFields.push("Task");
		}
		if (!row.start_date_time) {
			missingFields.push("Start Date and Time");
		}
		if (!row.end_date_time) {
			missingFields.push("End Date and Time");
		}
		
		if (missingFields.length > 0) {
			return {
				isValid: false,
				message: `Row ${i + 1} is missing: ${missingFields.join(", ")}`
			};
		}

		// Validate that end time is after start time
		if (row.start_date_time && row.end_date_time) {
			const startDate = new Date(row.start_date_time);
			const endDate = new Date(row.end_date_time);
			
			if (endDate <= startDate) {
				return {
					isValid: false,
					message: `Row ${i + 1}: End Date and Time must be after Start Date and Time`
				};
			}
		}
	}
	
	return {
		isValid: true,
		message: `✓ All ${frm.doc.time_logs.length} timesheet entries are valid and ready to save.`
	};
}

function showValidationMessage(frm, message, type = "info") {
	const wrapper = frm.fields_dict.time_logs.$wrapper;
	
	// Remove existing validation message
	wrapper.find('.custom-timesheet-validation-message').remove();
	
	const validationDiv = $(`
		<div class="custom-timesheet-validation-message ${type}">
			<i class="fa fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
			${message}
		</div>
	`);
	
	// Insert after the header
	const header = wrapper.find('.custom-timesheet-table-header');
	if (header.length > 0) {
		header.after(validationDiv);
	} else {
		wrapper.prepend(validationDiv);
	}
}

// ----------------------- DEBUG FUNCTIONS -----------------------
function addDebugButton(frm) {
	// Only add debug button in development
	if (frappe.boot.developer_mode) {
		frm.add_custom_button(__("Debug Row Data"), function() {
			debugRowData(frm);
		}, __("Debug"));
	}
}

// ----------------------- ATTACHMENT ENHANCEMENTS -----------------------
function enhanceAttachmentField(frm) {
	if (!frm.fields_dict.attachments) return;

	const attachmentField = frm.fields_dict.attachments.$wrapper;
	attachmentField.addClass("custom-attachment-field");

	if (!document.getElementById("custom-timesheet-attachment-styles")) {
		const style = document.createElement("style");
		style.id = "custom-timesheet-attachment-styles";
		style.textContent = `/* styles omitted for brevity, keep your previous styles */`;
		document.head.appendChild(style);
	}
}

function addCustomAttachmentArea(frm) {
	if (frm.custom_attachment_area_added) return;
	frm.custom_attachment_area_added = true;

	const wrapper = frm.fields_dict.attachments?.$wrapper;
	if (!wrapper) return;

	const customArea = $(`
        <div class="custom-attachment-area" id="custom-attachment-drop-zone">
            <div class="attachment-icon">📎</div>
            <div class="attachment-text">Drag and drop files here or click to browse</div>
            <div class="attachment-subtext">Supports all file types</div>
        </div>
        <div class="attachment-list" id="attachment-list-container"></div>
    `);

	wrapper.after(customArea);

	// Click to browse
	$("#custom-attachment-drop-zone").on("click", function () {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = true;
		input.onchange = (e) => handleFiles(e.target.files, frm);
		input.click();
	});

	// Drag & drop
	const dropZone = document.getElementById("custom-attachment-drop-zone");
	["dragover", "dragleave", "drop"].forEach((eventName) => {
		dropZone.addEventListener(eventName, function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (eventName === "dragover") this.classList.add("dragging");
			if (eventName === "dragleave" || eventName === "drop")
				this.classList.remove("dragging");

			if (eventName === "drop") handleFiles(e.dataTransfer.files, frm);
		});
	});

	displayAttachments(frm);
}

function handleFiles(files, frm) {
	Array.from(files).forEach((file) => {
		frappe.upload_file({
			file: file,
			args: {
				doctype: frm.doctype,
				docname: frm.docname,
				is_private: 0,
			},
			callback: function (r) {
				if (r.message) {
					frappe.show_alert({
						message: __("File {0} uploaded", [file.name]),
						indicator: "green",
					});
					displayAttachments(frm);
				}
			},
			error: function () {
				frappe.show_alert({
					message: __("Failed to upload {0}", [file.name]),
					indicator: "red",
				});
			},
		});
	});
}

function displayAttachments(frm) {
	const container = $("#attachment-list-container");
	container.empty();
	if (!frm.docname) return;

	frappe.call({
		method: "frappe.client.get_list",
		args: {
			doctype: "File",
			filters: { attached_to_doctype: frm.doctype, attached_to_name: frm.docname },
			fields: ["name", "file_name", "file_url", "file_size"],
		},
		callback: function (r) {
			if (!r.message) return;
			r.message.forEach((file) => {
				const fileSize = formatFileSize(file.file_size || 0);
				const fileExt = getFileExtension(file.file_name);
				const fileIcon = getFileIcon(fileExt);

				const item = $(`
                    <div class="attachment-item">
                        <div class="attachment-item-icon">${fileIcon}</div>
                        <div class="attachment-item-info">
                            <div class="attachment-item-name">${file.file_name}</div>
                            <div class="attachment-item-size">${fileSize}</div>
                        </div>
                        <div class="attachment-item-actions">
                            <button class="attachment-action-btn download" data-url="${file.file_url}"><i class="fa fa-download"></i> Download</button>
                            <button class="attachment-action-btn remove" data-name="${file.name}"><i class="fa fa-trash"></i> Remove</button>
                        </div>
                    </div>
                `);

				item.find(".download").on("click", function () {
					window.open($(this).data("url"), "_blank");
				});
				item.find(".remove").on("click", function () {
					frappe.confirm(
						__("Are you sure you want to remove this attachment?"),
						function () {
							frappe.call({
								method: "frappe.client.delete",
								args: { doctype: "File", name: $(this).data("name") },
								callback: () => displayAttachments(frm),
							});
						}
					);
				});

				container.append(item);
			});
		},
	});
}

function formatFileSize(bytes) {
	const k = 1024,
		sizes = ["Bytes", "KB", "MB", "GB"],
		i = Math.floor(Math.log(bytes) / Math.log(k));
	return bytes ? Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i] : "0 Bytes";
}
function getFileExtension(filename) {
	return filename.split(".").pop().toLowerCase();
}
function getFileIcon(ext) {
	const icons = {
		pdf: "📄",
		doc: "📝",
		docx: "📝",
		xls: "📊",
		xlsx: "📊",
		ppt: "📊",
		pptx: "📊",
		jpg: "🖼️",
		jpeg: "🖼️",
		png: "🖼️",
		gif: "🖼️",
		zip: "📦",
		rar: "📦",
		txt: "📃",
		csv: "📋",
	};
	return icons[ext] || "📎";
}

// ----------------------- APPROVAL WORKFLOW -----------------------
function addApprovalButtons(frm) {
	if (frm.doc.docstatus !== 1 || frm.doc.approval_status !== "Pending") return;

	checkIfUserIsApprover(frm).then((isApprover) => {
		if (!isApprover) return;

		frm.add_custom_button(__("Approve"), () => approveTimesheet(frm), __("Actions")).addClass(
			"btn-success"
		);
		frm.add_custom_button(__("Reject"), () => rejectTimesheet(frm), __("Actions")).addClass(
			"btn-danger"
		);
	});
}

function checkIfUserIsApprover(frm) {
	return new Promise((resolve) => {
		if (!frm.doc.time_logs || frm.doc.time_logs.length === 0) return resolve(false);

		const projects = [
			...new Set(frm.doc.time_logs.filter((r) => r.project).map((r) => r.project)),
		];
		if (projects.length === 0) return resolve(false);

		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Project",
				fields: ["name", "approver"],
				filters: { name: ["in", projects] },
			},
			callback: function (r) {
				if (!r.message) return resolve(false);
				const user = frappe.session.user;
				const isApprover = r.message.some((p) =>
					p.approver
						?.split(",")
						.map((a) => a.trim())
						.includes(user)
				);
				resolve(isApprover);
			},
		});
	});
}

function approveTimesheet(frm) {
	openApprovalDialog(frm, "Approve");
}
function rejectTimesheet(frm) {
	openApprovalDialog(frm, "Reject");
}

function openApprovalDialog(frm, action) {
	const d = new frappe.ui.Dialog({
		title: `${action} Timesheet`,
		fields: [
			{
				fieldtype: "Small Text",
				fieldname: "comments",
				label: `${action} Comments`,
				reqd: action === "Reject",
			},
		],
		primary_action_label: action,
		primary_action: function () {
			const comments = d.get_value("comments");
			frappe.call({
				method: `gnapi_customizations.customizations.custom_timesheet_events.${action.toLowerCase()}_timesheet`,
				args: { timesheet_name: frm.doc.name, comments },
				callback: function (r) {
					if (r.message) {
						frappe.msgprint(`${action}d successfully`);
						frm.reload_doc();
					}
				},
			});
			d.hide();
		},
	});
	d.show();
}
