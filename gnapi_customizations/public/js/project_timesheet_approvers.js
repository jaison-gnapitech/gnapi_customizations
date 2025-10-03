frappe.ui.form.on("Project", {
	refresh: function (frm) {
		setup_approver_multiselect(frm, "approver", "User");
	},
});

function setup_approver_multiselect(frm, fieldname, doctype) {
	const field = frm.get_field(fieldname);
	if (!field || !field.$input || !field.$input.length) return;

	if (field.$input.siblings(".approver-select-btn").length > 0) return;

	field.$input.hide();

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
				if (r.message) {
					show_multiselect_dialog(frm, fieldname, r.message);
				}
			},
		});
	});

	update_display(frm, fieldname);
}

function show_multiselect_dialog(frm, fieldname, users) {
	const current_value = frm.doc[fieldname] || "";
	const selected_users = current_value
		.split(",")
		.map((u) => u.trim())
		.filter((u) => u);

	const d = new frappe.ui.Dialog({
		title: "Select Approvers",
		fields: [
			{
				fieldtype: "HTML",
				fieldname: "user_list",
				options: users
					.map(
						(u) => `
                <div class="checkbox">
                    <label>
                        <input type="checkbox" value="${u.name}" ${
							selected_users.includes(u.name) ? "checked" : ""
						}>
                        ${u.full_name || u.name} (${u.name})
                    </label>
                </div>
            `
					)
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
			update_display(frm, fieldname);
			d.hide();
		},
	});

	d.show();
}

function update_display(frm, fieldname) {
	const field = frm.get_field(fieldname);
	if (!field || !field.$input) return;

	const value = frm.doc[fieldname] || "";
	$(`#${fieldname}_display`).remove();

	if (value.trim()) {
		const users = value
			.split(",")
			.map((u) => u.trim())
			.filter((u) => u);
		if (users.length > 0) {
			const display = `<div class="text-muted small" id="${fieldname}_display" style="margin-top: 5px;">
                <strong>Selected:</strong> ${users.length} user(s)<br>
                <span style="font-size: 11px;">${users.join(", ")}</span>
            </div>`;
			field.$input.siblings(".approver-select-btn").after(display);
		}
	} else {
		const display = `<div class="text-muted small" id="${fieldname}_display" style="margin-top: 5px;">
            <em>No approvers selected</em>
        </div>`;
		field.$input.siblings(".approver-select-btn").after(display);
	}
}
