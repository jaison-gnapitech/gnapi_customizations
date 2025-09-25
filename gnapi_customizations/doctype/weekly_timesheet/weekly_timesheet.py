import frappe
from frappe.model.document import Document
from frappe.utils import getdate, date_diff, add_days
from frappe import _
import datetime


class WeeklyTimesheet(Document):
	def autoname(self):
		"""Generate name based on employee and period"""
		if self.employee and self.from_date and self.to_date:
			self.name = f"{self.employee}-{self.from_date} to {self.to_date}"

	def validate(self):
		self.validate_dates()
		self.validate_employee()
		self.set_employee_name()
		self.calculate_total_hours()

	def validate_dates(self):
		"""Validate date range and ensure it's exactly 7 days"""
		if self.from_date and self.to_date:
			if getdate(self.from_date) >= getdate(self.to_date):
				frappe.throw(_("From Date must be before To Date"))

			# Check if it's exactly 7 days
			days_diff = date_diff(self.to_date, self.from_date)
			if days_diff != 6:  # 6 days difference = 7 days total
				frappe.throw(_("Date range must be exactly 7 days"))

			# Check if it's Monday to Sunday
			from_date = getdate(self.from_date)
			if from_date.weekday() != 0:  # Monday = 0
				frappe.throw(_("From Date must be a Monday"))

	def validate_employee(self):
		"""Validate employee exists and is active"""
		if self.employee:
			employee = frappe.get_doc("Employee", self.employee)
			if employee.status != "Active":
				frappe.throw(_("Employee must be active"))

	def set_employee_name(self):
		"""Set employee name from employee record"""
		if self.employee:
			employee = frappe.get_doc("Employee", self.employee)
			self.employee_name = employee.employee_name

	def calculate_total_hours(self):
		"""Calculate total hours from all timesheet details"""
		total = 0.0
		for detail in self.get("timesheet_details"):
			total += detail.get("total", 0)
		self.total_hours = total

	def on_submit(self):
		"""Create approval requests if project has approvers"""
		for detail in self.get("timesheet_details"):
			if detail.project:
				project = frappe.get_doc("Project", detail.project)
				if project.get("custom_timesheet_approvers"):
					for approver in project.get("custom_timesheet_approvers"):
						if approver.active:
							self.create_approval_request(detail, approver)

	def create_approval_request(self, detail, approver):
		"""Create approval request for timesheet entry"""
		approval = frappe.new_doc("Timesheet Task Approval")
		approval.approver = approver.approver
		approval.project = detail.project
		approval.task = detail.activity
		approval.hours = detail.total
		approval.employee = self.employee
		approval.status = "Pending"
		approval.timesheet = self.name
		approval.insert()

		# Create notification
		frappe.get_doc({
			"doctype": "ToDo",
			"assigned_by": frappe.session.user,
			"owner": approver.approver,
			"reference_type": "Timesheet Task Approval",
			"reference_name": approval.name,
			"description": f"New timesheet approval required for {self.employee_name}"
		}).insert()

	def before_save(self):
		"""Calculate totals before saving"""
		self.calculate_total_hours()


@frappe.whitelist()
def get_weekly_timesheet(employee, from_date=None):
	"""Get existing weekly timesheet for employee and date range"""
	if not from_date:
		from_date = datetime.datetime.now().strftime("%Y-%m-%d")

	from_date = getdate(from_date)
	to_date = add_days(from_date, 6)

	# Check if timesheet already exists
	existing = frappe.db.exists("Weekly Timesheet", {
		"employee": employee,
		"from_date": from_date,
		"to_date": to_date
	})

	if existing:
		return frappe.get_doc("Weekly Timesheet", existing)
	else:
		return None


@frappe.whitelist()
def get_projects_for_employee(employee):
	"""Get projects assigned to employee"""
	projects = frappe.db.sql("""
		SELECT p.name, p.project_name
		FROM `tabProject` p
		WHERE p.status = 'Open'
		AND (p.custom_approvals IS NOT NULL OR p.custom_timesheet_approvers IS NOT NULL)
		ORDER BY p.project_name
	""", as_dict=True)

	return projects


@frappe.whitelist()
def get_activities_for_project(project):
	"""Get activities for a project"""
	activities = frappe.db.sql("""
		SELECT name, activity_type
		FROM `tabActivity Type`
		WHERE disabled = 0
		ORDER BY activity_type
	""", as_dict=True)

	return activities
