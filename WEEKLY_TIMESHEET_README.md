# Weekly Timesheet - Access Guide

## 🚀 How to Access Your Weekly Timesheet

After installing and setting up your Weekly Timesheet system, you can access it through multiple ways:

### 🌐 Web Interface Access

#### Option 1: Dashboard (Recommended)
**URL:** `http://localhost:8000/timesheet_dashboard`
- **Features:** Complete dashboard with statistics, quick actions, and recent timesheets
- **Best for:** Overview and management

#### Option 2: Direct DocType List
**URL:** `http://localhost:8000/app/weeklytimesheet`
- **Features:** Standard Frappe list view with filters and bulk operations
- **Best for:** Detailed list management

#### Option 3: Create New Timesheet
**URL:** `http://localhost:8000/app/weeklytimesheet/new`
- **Features:** Form to create new weekly timesheets
- **Best for:** Creating new entries

### 📱 In-Frappe Navigation

#### Method 1: Module Navigation (Recommended)
1. Look for **"Weekly Timesheet"** in the main navigation menu (sidebar)
2. Click on it to access the Weekly Timesheet module
3. You'll see options for Dashboard, List View, and Reports

#### Method 2: Search
1. Click the **search icon** (🔍) in the top navigation
2. Type "Weekly Timesheet"
3. Select from the results

#### Method 3: DocType Menu
1. Go to **Setup** → **DocType List**
2. Search for "WeeklyTimesheet"
3. Click the DocType → **Menu** → **List**

#### Method 4: Direct Module Access
1. The WeeklyTimesheet module should appear in the sidebar
2. Click on "Weekly Timesheet" to expand
3. Access Dashboard, Timesheets, and Approvals

### 🔧 Developer Console Access

If you need to access it programmatically or troubleshoot:

#### Frappe Console:
```python
# Access via Frappe console
bench console
> frappe.get_doc("Weekly Timesheet", "TIMESHEET-NAME")
> frappe.get_list("Weekly Timesheet", limit=10)
```

#### API Access:
```bash
# Via REST API
curl -X GET "http://localhost:8000/api/method/gnapi_customizations.api.weekly_timesheet.get_weekly_timesheet" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"
```

### 📊 Features Available

#### Dashboard Features:
- 📈 **Statistics Cards**: Total timesheets, hours, averages
- ⚡ **Quick Actions**: Create, view, export buttons
- 📋 **Recent Timesheets**: Latest 10 timesheets with status
- 🎯 **Export Functionality**: CSV/JSON export options

#### List View Features:
- 🔍 **Advanced Filters**: This week, last week, this month
- 📊 **Custom Indicators**: Color-coded status badges
- ➕ **Bulk Operations**: Create multiple, export selected
- 🔄 **Real-time Updates**: Live data refresh

#### Form Features:
- 📅 **Smart Date Validation**: Monday-Sunday week validation
- 🧮 **Auto-calculations**: Real-time total calculations
- ✅ **Validation Rules**: Required fields and business logic
- 🔗 **Project Integration**: Links to projects and activities

### 🛠️ Troubleshooting

#### "Page Not Found" Errors:
1. **Check Installation**: Ensure you've run `bench migrate`
2. **Clear Cache**: Run `bench clear-cache`
3. **Restart Services**: Run `bench restart`
4. **Check Permissions**: Ensure your user has appropriate roles

#### "DocType Not Found" Errors:
1. **Verify Migration**: Run `bench migrate` again
2. **Check DocType**: Go to DocType List and search for "Weekly Timesheet"
3. **App Status**: Ensure "Gnapi Customizations" app is installed

#### Dashboard Not Loading:
1. **Check JavaScript**: Ensure browser console has no errors
2. **API Access**: Verify API endpoints are accessible
3. **Permissions**: Check if user has access to Employee records

### 📝 Common URLs Summary

| Purpose | URL | Access Method |
|---------|-----|---------------|
| Dashboard | `/timesheet_dashboard` | Direct URL |
| List View | `/app/weeklytimesheet` | Navigation/DocType |
| New Form | `/app/weeklytimesheet/new` | Navigation |
| Edit Form | `/app/weeklytimesheet/TIMESHEET-NAME` | From list |

### 🎯 Quick Start Guide

1. **First Time Setup:**
   ```bash
   # Install and migrate
   bench migrate
   bench clear-cache
   bench restart
   ```

2. **Access Dashboard:**
   - Open: `http://localhost:8000/timesheet_dashboard`
   - Or search for "Weekly Timesheet" in Frappe

3. **Create Your First Timesheet:**
   - Go to `/app/weeklytimesheet/new`
   - Fill in employee, date range, and add details
   - Save and submit

4. **View Statistics:**
   - Dashboard shows your weekly summaries
   - Use filters for specific periods

### 📞 Support

If you encounter issues:

1. **Check Console**: Open browser developer tools (F12) and check console errors
2. **Verify Setup**: Ensure all steps in installation guide were followed
3. **Check Logs**: Review Frappe logs for error messages
4. **Test API**: Try accessing API endpoints directly

---

**🎉 Enjoy your new Weekly Timesheet system!**
