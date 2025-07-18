#!/usr/bin/env python3
"""
Setup script for Smart Agriculture Business Application
This script helps verify and install all necessary dependencies.
"""

import sys
import subprocess
import importlib
import os

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required.")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def install_package(package):
    """Install a package using pip."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def check_package(package_name, import_name=None):
    """Check if a package is installed."""
    if import_name is None:
        import_name = package_name.replace('-', '_').replace('_', '.')
    
    try:
        importlib.import_module(import_name)
        print(f"✅ {package_name} is installed")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        return False

def main():
    print("🌱 Smart Agriculture Application Setup Checker")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
      # Essential packages to check
    essential_packages = [
        ("adafruit-blinka", "board"),  # Import board instead of adafruit_blinka
        ("adafruit-circuitpython-dht", "adafruit_dht"),
        ("adafruit-circuitpython-ads1x15", "adafruit_ads1x15.ads1115"),
        ("smbus2", "smbus2"),
        ("pyserial", "serial"),
        ("adafruit-circuitpython-ds18x20", "adafruit_ds18x20"),
        ("adafruit-circuitpython-onewire", "adafruit_onewire.bus"),
        ("minimalmodbus", "minimalmodbus"),
        ("requests", "requests")
    ]
    
    print("\n📦 Checking essential packages...")
    missing_packages = []
    
    for package_name, import_name in essential_packages:
        if not check_package(package_name, import_name):
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages detected: {', '.join(missing_packages)}")
        response = input("Would you like to install missing packages? (y/n): ")
        
        if response.lower() in ['y', 'yes']:
            print("\n📥 Installing missing packages...")
            failed_installs = []
            
            for package in missing_packages:
                print(f"Installing {package}...")
                if not install_package(package):
                    failed_installs.append(package)
            
            if failed_installs:
                print(f"❌ Failed to install: {', '.join(failed_installs)}")
                print("Try installing manually with: pip install -r requirements.txt")
            else:
                print("✅ All packages installed successfully!")
    else:
        print("\n✅ All essential packages are installed!")
    
    # Check configuration
    print("\n⚙️  Checking configuration...")
    config_path = os.path.join("raspberry_module", "config.py")
    
    if os.path.exists(config_path):
        print("✅ Configuration file found")
        try:
            sys.path.insert(0, os.path.dirname(config_path))
            import config
            if hasattr(config, 'THINGSPEAK_API_KEY'):
                if config.THINGSPEAK_API_KEY == "YOUR_ACTUAL_API_KEY_HERE":
                    print("⚠️  Please update your ThingSpeak API key in raspberry_module/config.py")
                else:
                    print("✅ ThingSpeak API key configured")
            sys.path.pop(0)
        except ImportError as e:
            print(f"❌ Error importing config: {e}")
    else:
        print("❌ Configuration file not found")
    
    print("\n🎉 Setup check complete!")
    print("\nNext steps:")
    print("1. Update ThingSpeak API key in raspberry_module/config.py")
    print("2. Connect your sensors to Raspberry Pi")
    print("3. Run: python raspberry_module/all_sensors_script_new.py")

if __name__ == "__main__":
    main()
