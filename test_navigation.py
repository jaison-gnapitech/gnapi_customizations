#!/usr/bin/env python3
"""
Navigation Test Script for WeeklyTimesheet
This script validates that the WeeklyTimesheet module is properly configured and accessible
"""

import json
import sys
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and provide feedback"""
    path = Path(file_path)
    if path.exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} - NOT FOUND")
        return False

def check_json_validity(file_path, description):
    """Check if a JSON file is valid"""
    try:
        with open(file_path, 'r') as f:
            json.load(f)
        print(f"✅ {description}: {file_path} - Valid JSON")
        return True
    except Exception as e:
        print(f"❌ {description}: {file_path} - Invalid JSON: {e}")
        return False

def check_module_structure():
    """Check if the module structure is properly set up"""
    print("\n🔍 Checking WeeklyTimesheet Module Structure:")
    print("=" * 50)

    all_valid = True

    # Check main module files
    all_valid &= check_file_exists(
        "gnapi_customizations/weeklytimesheet/__init__.py",
        "Module __init__.py"
    )

    all_valid &= check_file_exists(
        "gnapi_customizations/weeklytimesheet/config.json",
        "Module config.json"
    )

    all_valid &= check_file_exists(
        "gnapi_customizations/weeklytimesheet/module.json",
        "Module module.json"
    )

    all_valid &= check_file_exists(
        "gnapi_customizations/weeklytimesheet/navigation.py",
        "Module navigation.py"
    )

    # Check JSON validity
    all_valid &= check_json_validity(
        "gnapi_customizations/weeklytimesheet/config.json",
        "Config JSON validity"
    )

    all_valid &= check_json_validity(
        "gnapi_customizations/weeklytimesheet/module.json",
        "Module JSON validity"
    )

    return all_valid

def check_hooks_configuration():
    """Check if hooks.py is properly configured"""
    print("\n🔍 Checking Hooks Configuration:")
    print("=" * 50)

    all_valid = True

    try:
        with open("gnapi_customizations/hooks.py", 'r') as f:
            hooks_content = f.read()

        # Check for WeeklyTimesheet references
        if "WeeklyTimesheet" in hooks_content:
            print("✅ WeeklyTimesheet found in hooks.py")
        else:
            print("❌ WeeklyTimesheet not found in hooks.py")
            all_valid = False

        if "weeklytimesheet" in hooks_content:
            print("✅ weeklytimesheet module referenced in hooks.py")
        else:
            print("❌ weeklytimesheet module not referenced in hooks.py")
            all_valid = False

        if "get_navigation" in hooks_content:
            print("✅ Navigation configuration found in hooks.py")
        else:
            print("❌ Navigation configuration missing in hooks.py")
            all_valid = False

    except Exception as e:
        print(f"❌ Error reading hooks.py: {e}")
        all_valid = False

    return all_valid

def check_modules_txt():
    """Check if modules.txt is properly configured"""
    print("\n🔍 Checking Module Registration:")
    print("=" * 50)

    try:
        with open("gnapi_customizations/modules.txt", 'r') as f:
            modules_content = f.read()

        if "WeeklyTimesheet:weeklytimesheet" in modules_content:
            print("✅ WeeklyTimesheet module properly registered in modules.txt")
            return True
        else:
            print("❌ WeeklyTimesheet module not properly registered in modules.txt")
            print(f"Current content: {modules_content}")
            return False

    except Exception as e:
        print(f"❌ Error reading modules.txt: {e}")
        return False

def check_navigation_config():
    """Check if navigation.py is properly configured"""
    print("\n🔍 Checking Navigation Configuration:")
    print("=" * 50)

    all_valid = True

    try:
        with open("gnapi_customizations/weeklytimesheet/navigation.py", 'r') as f:
            nav_content = f.read()

        # Check for required elements
        if "WeeklyTimesheet" in nav_content:
            print("✅ WeeklyTimesheet DocType referenced in navigation")
        else:
            print("❌ WeeklyTimesheet DocType not referenced in navigation")
            all_valid = False

        if "/app/weeklytimesheet" in nav_content:
            print("✅ Correct route found in navigation")
        else:
            print("❌ Correct route not found in navigation")
            all_valid = False

        if "/timesheet_dashboard" in nav_content:
            print("✅ Dashboard route found in navigation")
        else:
            print("❌ Dashboard route not found in navigation")
            all_valid = False

    except Exception as e:
        print(f"❌ Error reading navigation.py: {e}")
        all_valid = False

    return all_valid

def check_doctype_references():
    """Check if DocType references are consistent"""
    print("\n🔍 Checking DocType References:")
    print("=" * 50)

    all_valid = True

    try:
        with open("gnapi_customizations/fixtures/doctype.json", 'r') as f:
            fixtures = json.load(f)

        weekly_timesheets = [d for d in fixtures if d.get('name') == 'WeeklyTimesheet']
        if weekly_timesheets:
            print("✅ WeeklyTimesheet found in fixtures")
        else:
            print("❌ WeeklyTimesheet not found in fixtures")
            all_valid = False

        # Check route configuration
        wt = weekly_timesheets[0]
        if wt.get('route') == 'weeklytimesheet':
            print("✅ WeeklyTimesheet has correct route: weeklytimesheet")
        else:
            print(f"❌ WeeklyTimesheet has incorrect route: {wt.get('route')}")
            all_valid = False

    except Exception as e:
        print(f"❌ Error checking DocType references: {e}")
        all_valid = False

    return all_valid

def main():
    """Main validation function"""
    print("🔍 Validating WeeklyTimesheet Navigation Setup")
    print("=" * 60)

    all_valid = True

    # Check all components
    all_valid &= check_module_structure()
    all_valid &= check_hooks_configuration()
    all_valid &= check_modules_txt()
    all_valid &= check_navigation_config()
    all_valid &= check_doctype_references()

    print("\n" + "=" * 60)

    if all_valid:
        print("✅ All navigation components are properly configured!")
        print("\n📋 Navigation Setup Summary:")
        print("• Module structure: ✅ Complete")
        print("• Hooks configuration: ✅ Proper")
        print("• Module registration: ✅ Correct")
        print("• Navigation config: ✅ Valid")
        print("• DocType references: ✅ Consistent")
        print("\n🚀 Next Steps:")
        print("1. Restart Frappe: bench restart")
        print("2. Clear cache: bench clear-cache")
        print("3. Test navigation: Check if WeeklyTimesheet appears in navigation")
        return 0
    else:
        print("❌ Some navigation components have issues.")
        print("\n🔧 Please review the errors above and fix them.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
