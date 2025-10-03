frappe.ui.form.on("Customer", {
	refresh: function (frm) {
		setupApproverMultiselect(frm, "timesheet_approver", "User");
	},
});

function setupApproverMultiselect(frm, fieldname, doctype) {
	const field = frm.get_field(fieldname);
	if (!field) return;

	if (field.$input.siblings(".approver-select-btn").length > 0) return;

	// Hide default input
	if (field.$input.is(":visible")) field.$input.hide();

	// Add custom button
	const $btn =
		$(`<button class="btn btn-default btn-sm approver-select-btn" style="margin-top: 5px;">
        <i class="fa fa-users"></i> Select Approvers
    </button>`);
	field.$input.after($btn);

	$btn.on("click", function () {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: doctype,
				fields: ["name", "full_name"],
				filters: { enabled: 1 },
				limit_page_length: 0,
			},
			callback: function (r) {
				if (r.message) showMultiselectDialog(frm, fieldname, r.message);
			},
		});
	});

	updateDisplay(frm, fieldname);
}

function showMultiselectDialog(frm, fieldname, users) {
	const current_value = frm.doc[fieldname] || "";
	const selected_users = current_value
		.split(",")
		.map((u) => u.trim())
		.filter((u) => u);

	const d = new frappe.ui.Dialog({
		title: "Select Timesheet Approvers",
		fields: [
			{
				fieldtype: "HTML",
				fieldname: "user_list",
				options: users
					.map((u) => {
						const name = frappe.utils.escape_html(u.name);
						const full_name = frappe.utils.escape_html(u.full_name || u.name);
						const checked = selected_users.includes(u.name) ? "checked" : "";
						return `<div class="checkbox">
                        <label>
                            <input type="checkbox" value="${name}" ${checked}>
                            ${full_name} (${name})
                        </label>
                    </div>`;
					})
					.join(""),
			},
		],
		primary_action_label: "Update",
		primary_action: function () {
			const selected = [];
			d.$wrapper.find('input[type="checkbox"]:checked').each(function () {
				selected.push($(this).val());
			});

			frm.set_value(fieldname, selected.join(", "));
			updateDisplay(frm, fieldname);
			d.hide();
		},
	});

	d.show();
}

function updateDisplay(frm, fieldname) {
	const field = frm.get_field(fieldname);
	if (!field) return;

	$(`#${fieldname}_display`).remove();
	const value = frm.doc[fieldname] || "";
	const $btn = field.$input.siblings(".approver-select-btn");

	if (value.trim()) {
		const users = value
			.split(",")
			.map((u) => u.trim())
			.filter((u) => u);
		if (users.length) {
			const display =
				$(`<div class="text-muted small" id="${fieldname}_display" style="margin-top:5px;">
                <strong>Selected:</strong> ${users.length} user(s)<br>
                <span style="font-size:11px;">${users.join(", ")}</span>
            </div>`);
			$btn.after(display);
			return;
		}
	}

	// No users selected
	const display =
		$(`<div class="text-muted small" id="${fieldname}_display" style="margin-top:5px;">
        <em>No approvers selected</em>
    </div>`);
	$btn.after(display);
}
