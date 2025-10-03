// Custom Timesheet Form Enhancements
frappe.ui.form.on("Custom Timesheet", {
	refresh: function (frm) {
		enhanceAttachmentField(frm);
		addCustomAttachmentArea(frm);
		restrictStatusForEmployee(frm);
		addApprovalButtons(frm);
	},

	onload: function (frm) {
		restrictStatusForEmployee(frm);
	},

	status: function (frm) {
		validateStatusChange(frm);
	},
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
