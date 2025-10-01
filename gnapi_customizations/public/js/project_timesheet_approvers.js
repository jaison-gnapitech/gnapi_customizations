frappe.ui.form.on('Project', {
    refresh: function(frm) {
        // Create custom multi-select for approvers
        setup_approver_multiselect(frm, 'approver', 'User');
    }
});

function setup_approver_multiselect(frm, fieldname, doctype) {
    const field = frm.get_field(fieldname);
    if (!field) return;
    
    // Hide the default input
    field.$input.hide();
    
    // Create custom multi-select button
    const $btn = $(`<button class="btn btn-default btn-sm" style="margin-top: 5px;">
        <i class="fa fa-users"></i> Select Approvers
    </button>`);
    
    field.$input.after($btn);
    
    $btn.on('click', function() {
        // Get all users
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: doctype,
                fields: ['name', 'full_name'],
                filters: {
                    enabled: 1
                },
                limit_page_length: 0
            },
            callback: function(r) {
                if (r.message) {
                    show_multiselect_dialog(frm, fieldname, r.message);
                }
            }
        });
    });
    
    // Display selected users
    update_display(frm, fieldname);
}

function show_multiselect_dialog(frm, fieldname, users) {
    const current_value = frm.doc[fieldname] || '';
    const selected_users = current_value ? current_value.split(',').map(u => u.trim()) : [];
    
    const d = new frappe.ui.Dialog({
        title: 'Select Approvers',
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'user_list',
                options: users.map(user => `
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" value="${user.name}" 
                                   ${selected_users.includes(user.name) ? 'checked' : ''}>
                            ${user.full_name || user.name} (${user.name})
                        </label>
                    </div>
                `).join('')
            }
        ],
        primary_action_label: 'Update',
        primary_action: function() {
            const selected = [];
            d.$wrapper.find('input[type="checkbox"]:checked').each(function() {
                selected.push($(this).val());
            });
            
            frm.set_value(fieldname, selected.join(', '));
            update_display(frm, fieldname);
            d.hide();
        }
    });
    
    d.show();
}

function update_display(frm, fieldname) {
    const field = frm.get_field(fieldname);
    const value = frm.doc[fieldname] || '';
    
    if (value) {
        const users = value.split(',').map(u => u.trim());
        const display = `Selected: ${users.length} user(s) - ${users.join(', ')}`;
        field.$input.after(`<div class="text-muted small" id="${fieldname}_display">${display}</div>`);
        $(`#${fieldname}_display`).prev(`#${fieldname}_display`).remove(); // Remove previous display
    }
}
