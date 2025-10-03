import frappe
from frappe import _
from frappe.utils import now, get_datetime
from frappe.model.document import Document

class TimesheetApproval(Document):
    def validate(self):
        # Auto-populate fields from linked timesheet
        if self.timesheet and not self.employee:
            timesheet_doc = frappe.get_doc("Custom Timesheet", self.timesheet)
            self.employee = timesheet_doc.employee
            self.total_hours = timesheet_doc.total_hours
            self.timesheet_date = timesheet_doc.creation.date()
            
            # Get project from timesheet details
            if timesheet_doc.time_logs:
                for log in timesheet_doc.time_logs:
                    if log.project:
                        self.project = log.project
                        break

    def before_save(self):
        # Set approver to current user if not set
        if not self.approver:
            self.approver = frappe.session.user

@frappe.whitelist()
def bulk_approve(approvals):
    """Bulk approve multiple timesheet approvals"""
    approved_count = 0
    
    for approval_name in approvals:
        try:
            approval_doc = frappe.get_doc("Timesheet Approval", approval_name)
            
            # Check if user has permission to approve
            if not can_user_approve(approval_doc):
                frappe.throw(_("You don't have permission to approve this timesheet"))
            
            # Update approval
            approval_doc.approval_status = "Approved"
            approval_doc.approval_date = now()
            approval_doc.save()
            
            # Update the original timesheet
            timesheet_doc = frappe.get_doc("Custom Timesheet", approval_doc.timesheet)
            timesheet_doc.status = "Approved"
            timesheet_doc.approval_status = "Approved"
            timesheet_doc.approved_by = frappe.session.user
            timesheet_doc.approval_date = now()
            timesheet_doc.save()
            
            approved_count += 1
            
        except Exception as e:
            frappe.log_error(f"Error approving {approval_name}: {str(e)}")
    
    return {"approved": approved_count}

@frappe.whitelist()
def bulk_reject(approvals, comments):
    """Bulk reject multiple timesheet approvals"""
    rejected_count = 0
    
    for approval_name in approvals:
        try:
            approval_doc = frappe.get_doc("Timesheet Approval", approval_name)
            
            # Check if user has permission to approve
            if not can_user_approve(approval_doc):
                frappe.throw(_("You don't have permission to reject this timesheet"))
            
            # Update approval
            approval_doc.approval_status = "Rejected"
            approval_doc.approval_date = now()
            approval_doc.approval_comments = comments
            approval_doc.save()
            
            # Update the original timesheet
            timesheet_doc = frappe.get_doc("Custom Timesheet", approval_doc.timesheet)
            timesheet_doc.status = "Rejected"
            timesheet_doc.approval_status = "Rejected"
            timesheet_doc.approved_by = frappe.session.user
            timesheet_doc.approval_date = now()
            timesheet_doc.approval_comments = comments
            timesheet_doc.save()
            
            rejected_count += 1
            
        except Exception as e:
            frappe.log_error(f"Error rejecting {approval_name}: {str(e)}")
    
    return {"rejected": rejected_count}

def can_user_approve(approval_doc):
    """Check if current user can approve this timesheet"""
    current_user = frappe.session.user
    
    # System Manager can approve anything
    if "System Manager" in frappe.get_roles():
        return True
    
    # Check if user is the assigned approver
    if approval_doc.approver == current_user:
        return True
    
    # Check if user is approver for the project
    if approval_doc.project:
        project_doc = frappe.get_doc("Project", approval_doc.project)
        if project_doc.approver and current_user in project_doc.approver.split(','):
            return True
    
    return False

@frappe.whitelist()
def create_approval_for_timesheet(timesheet_name):
    """Create approval record when timesheet is submitted"""
    try:
        timesheet_doc = frappe.get_doc("Custom Timesheet", timesheet_name)
        
        # Get project from timesheet
        project_name = timesheet_doc.project
        
        if project_name:
            project_doc = frappe.get_doc("Project", project_name)
            
            if project_doc.approver:
                approvers = [a.strip() for a in project_doc.approver.split(',') if a.strip()]
                
                for approver in approvers:
                    # Check if approval already exists
                    existing = frappe.db.exists("Timesheet Approval", {
                        "timesheet": timesheet_name,
                        "approver": approver
                    })
                    
                    if not existing:
                        approval_doc = frappe.get_doc({
                            "doctype": "Timesheet Approval",
                            "timesheet": timesheet_name,
                            "employee": timesheet_doc.employee,
                            "project": project_name,
                            "approver": approver,
                            "approval_status": "Pending",
                            "total_hours": timesheet_doc.total_hours,
                            "timesheet_date": timesheet_doc.creation.date()
                        })
                        approval_doc.insert()
        
        return {"status": "success"}
        
    except Exception as e:
        frappe.log_error(f"Error creating approval for {timesheet_name}: {str(e)}")
        return {"status": "error", "message": str(e)}
