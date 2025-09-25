import frappe
from frappe.model.document import Document
from frappe import _


class WeeklyTimesheetDetail(Document):
	def validate(self):
		self.validate_hours()
		self.calculate_total()

	def validate_hours(self):
		"""Validate individual day hours"""
		days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
		total_hours = 0

		for day in days:
			hours = self.get(day) or 0
			if hours < 0:
				frappe.throw(_("Hours cannot be negative for {0}").format(day.title()))
			if hours > 24:
				frappe.throw(_("Hours cannot exceed 24 for {0}").format(day.title()))
			total_hours += hours

		# Store total
		self.total = total_hours

	def calculate_total(self):
		"""Calculate total hours for the week"""
		days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
		total = sum(self.get(day) or 0 for day in days)
		self.total = total

	def before_save(self):
		"""Calculate totals before saving"""
		self.calculate_total()


@frappe.whitelist()
def get_project_activities(project):
	"""Get activities available for a project"""
	if not project:
		return []

	# Get activities from project if configured
	project_doc = frappe.get_doc("Project", project)

	# Return all active activities if no specific configuration
	activities = frappe.db.sql("""
		SELECT name as value, activity_type as label
		FROM `tabActivity Type`
		WHERE disabled = 0
		ORDER BY activity_type
	""", as_dict=True)

	return activities
