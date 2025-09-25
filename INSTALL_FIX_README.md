# 🔧 WeeklyTimesheet Installation Fix

## 🚨 **Issue: 404 Error for frappe.desk.desk_page.getpage**

The 404 error you're seeing indicates that **Frappe's internal page loading system can't find the WeeklyTimesheet DocType metadata**. This is a common issue when DocTypes aren't properly installed.

## 🛠️ **Solution: Force Reinstall and Migration**

### **Step 1: Stop Services**
```bash
# In your container terminal
bench stop
```

### **Step 2: Remove Existing Installation**
```bash
# Remove the app completely to force fresh installation
bench remove-app gnapi_customizations
```

### **Step 3: Reinstall App**
```bash
# Reinstall the app with fresh fixtures
bench get-app https://github.com/your-repo/gnapi_customizations.git
bench install-app gnapi_customizations
```

### **Step 4: Run Migrations**
```bash
# This installs all DocTypes from fixtures
bench migrate
```

### **Step 5: Clear All Caches**
```bash
# Clear all caches to ensure fresh loading
bench clear-cache
bench clear-website-cache
bench clear-doc-cache
```

### **Step 6: Rebuild Assets**
```bash
# Rebuild JavaScript and CSS assets
bench build
```

### **Step 7: Restart Services**
```bash
# Restart all services
bench start
```

## 🔍 **Alternative: If Above Doesn't Work**

### **Option A: Manual DocType Installation**
```bash
# Access Frappe console
bench console

# In the console:
import json
with open('apps/gnapi_customizations/gnapi_customizations/fixtures/doctype.json', 'r') as f:
    fixtures = json.load(f)

# Find WeeklyTimesheet fixture
weekly_timesheet = None
for fixture in fixtures:
    if fixture.get('name') == 'WeeklyTimesheet':
        weekly_timesheet = fixture
        break

if weekly_timesheet:
    print("Found WeeklyTimesheet fixture")
    # The DocType should be installed automatically with bench migrate
else:
    print("WeeklyTimesheet fixture not found")
```

### **Option B: Check DocType Registration**
```bash
# In Frappe console
bench console

# Check if DocType exists
from frappe.core.doctype.doctype.doctype import DocType
doctypes = frappe.get_all("DocType", filters={"name": "WeeklyTimesheet"})
print(f"Found {len(doctypes)} WeeklyTimesheet DocTypes")

# Check if DocType is properly configured
if doctypes:
    doctype = frappe.get_doc("DocType", "WeeklyTimesheet")
    print(f"DocType route: {doctype.route}")
    print(f"DocType module: {doctype.module}")
    print(f"DocType istable: {doctype.istable}")
```

## 📋 **Verification Steps**

### **1. Check DocType Installation**
```bash
# In Frappe console
bench console

# Verify DocType exists
doctypes = frappe.get_all("DocType", filters={"name": "WeeklyTimesheet"})
print(f"WeeklyTimesheet DocTypes: {len(doctypes)}")

if doctypes:
    doctype = frappe.get_doc("DocType", "WeeklyTimesheet")
    print(f"Route: {doctype.route}")
    print(f"Module: {doctype.module}")
    print(f"Is Table: {doctype.istable}")
```

### **2. Test Navigation Access**
```bash
# Test if navigation works
curl -X GET "http://localhost:8000/api/method/frappe.desk.desk_page.getpage?doctype=WeeklyTimesheet&name=WeeklyTimesheet" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"
```

### **3. Check Module Registration**
```bash
# Verify module is registered
modules = frappe.get_all("Module Def", filters={"module_name": "WeeklyTimesheet"})
print(f"WeeklyTimesheet modules: {len(modules)}")
```

## 🎯 **Expected Results After Fix**

### **✅ Working URLs:**
- `http://localhost:8000/app/weeklytimesheet` → DocType list loads
- `http://localhost:8000/app/weeklytimesheet/new` → Create form loads
- `http://localhost:8000/timesheet_dashboard` → Dashboard loads

### **✅ Navigation:**
- "WeeklyTimesheet" appears in sidebar navigation
- Search for "WeeklyTimesheet" works
- DocType appears in DocType List

### **✅ No More Errors:**
- ❌ No 404 errors for `frappe.desk.desk_page.getpage`
- ✅ All page loads work properly
- ✅ Internal Frappe APIs can find DocType metadata

## 🚀 **Quick Test Commands**

```bash
# Test 1: Check DocType exists
bench console
> frappe.get_all("DocType", filters={"name": "WeeklyTimesheet"})

# Test 2: Check navigation works
curl -s "http://localhost:8000/api/method/frappe.desk.desk_page.getpage?doctype=WeeklyTimesheet&name=WeeklyTimesheet" | head -20

# Test 3: Check if module is registered
bench console
> frappe.get_all("Module Def", filters={"module_name": "WeeklyTimesheet"})
```

## 🔧 **If Still Not Working**

### **Option 1: Complete Rebuild**
```bash
# Drop and recreate site completely
bench drop-site your-site-name
bench new-site your-site-name
bench install-app erpnext
bench install-app hrms
bench install-app gnapi_customizations
bench migrate
```

### **Option 2: Manual DocType Creation**
```bash
# In Frappe console
from frappe.core.doctype.doctype.doctype import new_doctype

# Create DocType manually
doctype = new_doctype({
    "name": "WeeklyTimesheet",
    "module": "Gnapi Customizations",
    "custom": 1,
    "fields": [
        # Add your fields here
    ],
    "permissions": [
        # Add permissions
    ]
})

doctype.insert()
print("WeeklyTimesheet DocType created manually")
```

## 📞 **Support Commands**

```bash
# Check Frappe logs for errors
tail -f /path/to/frappe/logs/*.log

# Check if DocType table exists in database
mysql -u frappe -p your_site_name -e "SHOW TABLES LIKE '%weekly%';"

# Check DocType metadata
bench console
> frappe.get_meta("WeeklyTimesheet")
```

---

**🎯 Follow the installation steps above and your WeeklyTimesheet should work perfectly!**
