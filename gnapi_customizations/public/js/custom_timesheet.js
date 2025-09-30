// Custom Timesheet Form Enhancements - Better Attachment UI
frappe.ui.form.on('Custom Timesheet', {
	refresh: function(frm) {
		// Enhance attachment field with better UI
		enhanceAttachmentField(frm);
		
		// Add custom attachment area with drag-and-drop
		addCustomAttachmentArea(frm);
		
		// Restrict status options for Employee role
		restrictStatusForEmployee(frm);
	},
	
	onload: function(frm) {
		// Restrict status on load as well
		restrictStatusForEmployee(frm);
	},
	
	status: function(frm) {
		// Validate status change for Employee role
		validateStatusChange(frm);
	}
});

// Restrict status field options for Employee role users
function restrictStatusForEmployee(frm) {
	// Check if current user has Employee role
	if (frappe.user.has_role('Employee') && !frappe.user.has_role('System Manager')) {
		// Set status field to only show Draft and Submitted
		frm.set_df_property('status', 'options', 'Draft\nSubmitted');
		
		// If status is not Draft or Submitted, reset to Draft
		if (frm.doc.status && !['Draft', 'Submitted'].includes(frm.doc.status)) {
			frappe.msgprint(__('Employees can only set status to Draft or Submitted'));
			frm.set_value('status', 'Draft');
		}
		
		// Make status read-only if already submitted (employee can't change it back)
		if (frm.doc.status === 'Submitted') {
			frm.set_df_property('status', 'read_only', 1);
		}
	}
}

// Validate status change
function validateStatusChange(frm) {
	if (frappe.user.has_role('Employee') && !frappe.user.has_role('System Manager')) {
		const allowed = ['Draft', 'Submitted'];
		if (frm.doc.status && !allowed.includes(frm.doc.status)) {
			frappe.msgprint({
				title: __('Invalid Status'),
				indicator: 'red',
				message: __('Employees can only set status to Draft or Submitted')
			});
			frm.set_value('status', 'Draft');
		}
	}
}

function enhanceAttachmentField(frm) {
	// Style the existing attachment field
	if (frm.fields_dict.attachments) {
		const attachmentField = frm.fields_dict.attachments.$wrapper;
		attachmentField.addClass('custom-attachment-field');
		
		// Add custom styles
		if (!document.getElementById('custom-timesheet-attachment-styles')) {
			const style = document.createElement('style');
			style.id = 'custom-timesheet-attachment-styles';
			style.textContent = `
				.custom-attachment-field {
					margin: 15px 0;
				}
				
				.custom-attachment-area {
					border: 2px dashed #d1d8dd;
					border-radius: 8px;
					padding: 30px;
					text-align: center;
					background: #f5f7fa;
					margin: 15px 0;
					transition: all 0.3s ease;
					cursor: pointer;
				}
				
				.custom-attachment-area:hover {
					border-color: #5e64ff;
					background: #f0f4ff;
				}
				
				.custom-attachment-area.dragging {
					border-color: #5e64ff;
					background: #e8f0ff;
				}
				
				.attachment-icon {
					font-size: 48px;
					color: #8d99a6;
					margin-bottom: 15px;
				}
				
				.attachment-text {
					font-size: 14px;
					color: #6c7680;
					margin-bottom: 5px;
				}
				
				.attachment-subtext {
					font-size: 12px;
					color: #a8b3c0;
				}
				
				.attachment-list {
					margin-top: 20px;
				}
				
				.attachment-item {
					display: flex;
					align-items: center;
					padding: 12px 15px;
					border: 1px solid #d1d8dd;
					border-radius: 6px;
					margin-bottom: 10px;
					background: white;
					transition: all 0.2s ease;
				}
				
				.attachment-item:hover {
					border-color: #5e64ff;
					box-shadow: 0 2px 8px rgba(94, 100, 255, 0.1);
				}
				
				.attachment-item-icon {
					font-size: 24px;
					margin-right: 15px;
					color: #5e64ff;
				}
				
				.attachment-item-info {
					flex: 1;
				}
				
				.attachment-item-name {
					font-weight: 500;
					color: #36414c;
					margin-bottom: 3px;
				}
				
				.attachment-item-size {
					font-size: 12px;
					color: #8d99a6;
				}
				
				.attachment-item-actions {
					display: flex;
					gap: 10px;
				}
				
				.attachment-action-btn {
					padding: 6px 12px;
					border-radius: 4px;
					font-size: 12px;
					cursor: pointer;
					transition: all 0.2s ease;
					border: none;
					background: transparent;
				}
				
				.attachment-action-btn:hover {
					background: #f5f7fa;
				}
				
				.attachment-action-btn.download {
					color: #5e64ff;
				}
				
				.attachment-action-btn.remove {
					color: #f56565;
				}
			`;
			document.head.appendChild(style);
		}
	}
}

function addCustomAttachmentArea(frm) {
	// Check if custom attachment area already exists
	if (frm.custom_attachment_area_added) return;
	frm.custom_attachment_area_added = true;
	
	// Find the attachments field wrapper
	const attachmentFieldWrapper = frm.fields_dict.attachments?.$wrapper;
	if (!attachmentFieldWrapper) return;
	
	// Create custom attachment area
	const customArea = $(`
		<div class="custom-attachment-area" id="custom-attachment-drop-zone">
			<div class="attachment-icon">📎</div>
			<div class="attachment-text">Drag and drop files here or click to browse</div>
			<div class="attachment-subtext">Supports all file types</div>
		</div>
		<div class="attachment-list" id="attachment-list-container"></div>
	`);
	
	// Insert after the field
	attachmentFieldWrapper.after(customArea);
	
	// Add click handler to open file dialog
	$('#custom-attachment-drop-zone').on('click', function() {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.onchange = function(e) {
			handleFiles(e.target.files, frm);
		};
		input.click();
	});
	
	// Add drag and drop handlers
	const dropZone = document.getElementById('custom-attachment-drop-zone');
	
	dropZone.addEventListener('dragover', function(e) {
		e.preventDefault();
		e.stopPropagation();
		this.classList.add('dragging');
	});
	
	dropZone.addEventListener('dragleave', function(e) {
		e.preventDefault();
		e.stopPropagation();
		this.classList.remove('dragging');
	});
	
	dropZone.addEventListener('drop', function(e) {
		e.preventDefault();
		e.stopPropagation();
		this.classList.remove('dragging');
		
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFiles(files, frm);
		}
	});
	
	// Display existing attachments
	displayAttachments(frm);
}

function handleFiles(files, frm) {
	Array.from(files).forEach(file => {
		// Upload file using Frappe's file uploader
		const formData = new FormData();
		formData.append('file', file);
		formData.append('is_private', 0);
		formData.append('doctype', frm.doctype);
		formData.append('docname', frm.docname);
		
		frappe.call({
			method: 'frappe.handler.upload_file',
			args: {},
			type: 'POST',
			data: formData,
			success: function(r) {
				if (r.message) {
					frappe.show_alert({
						message: __('File {0} uploaded successfully', [file.name]),
						indicator: 'green'
					});
					
					// Refresh attachments display
					displayAttachments(frm);
					frm.reload_doc();
				}
			},
			error: function(r) {
				frappe.show_alert({
					message: __('Failed to upload {0}', [file.name]),
					indicator: 'red'
				});
			}
		});
	});
}

function displayAttachments(frm) {
	const container = $('#attachment-list-container');
	container.empty();
	
	if (!frm.docname) return;
	
	// Get attachments for this document
	frappe.call({
		method: 'frappe.client.get_list',
		args: {
			doctype: 'File',
			filters: {
				attached_to_doctype: frm.doctype,
				attached_to_name: frm.docname
			},
			fields: ['name', 'file_name', 'file_url', 'file_size']
		},
		callback: function(r) {
			if (r.message && r.message.length > 0) {
				r.message.forEach(file => {
					const fileSize = formatFileSize(file.file_size || 0);
					const fileExt = getFileExtension(file.file_name);
					const fileIcon = getFileIcon(fileExt);
					
					const attachmentItem = $(`
						<div class="attachment-item">
							<div class="attachment-item-icon">${fileIcon}</div>
							<div class="attachment-item-info">
								<div class="attachment-item-name">${file.file_name}</div>
								<div class="attachment-item-size">${fileSize}</div>
							</div>
							<div class="attachment-item-actions">
								<button class="attachment-action-btn download" data-url="${file.file_url}">
									<i class="fa fa-download"></i> Download
								</button>
								<button class="attachment-action-btn remove" data-name="${file.name}">
									<i class="fa fa-trash"></i> Remove
								</button>
							</div>
						</div>
					`);
					
					// Add click handlers
					attachmentItem.find('.download').on('click', function() {
						window.open($(this).data('url'), '_blank');
					});
					
					attachmentItem.find('.remove').on('click', function() {
						const fileName = $(this).data('name');
						frappe.confirm(
							__('Are you sure you want to remove this attachment?'),
							function() {
								frappe.call({
									method: 'frappe.client.delete',
									args: {
										doctype: 'File',
										name: fileName
									},
									callback: function() {
										frappe.show_alert({
											message: __('Attachment removed'),
											indicator: 'green'
										});
										displayAttachments(frm);
									}
								});
							}
						);
					});
					
					container.append(attachmentItem);
				});
			}
		}
	});
}

function formatFileSize(bytes) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileExtension(filename) {
	return filename.split('.').pop().toLowerCase();
}

function getFileIcon(ext) {
	const icons = {
		pdf: '📄',
		doc: '📝',
		docx: '📝',
		xls: '📊',
		xlsx: '📊',
		ppt: '📊',
		pptx: '📊',
		jpg: '🖼️',
		jpeg: '🖼️',
		png: '🖼️',
		gif: '🖼️',
		zip: '📦',
		rar: '📦',
		txt: '📃',
		csv: '📋'
	};
	return icons[ext] || '📎';
}
