#!/usr/bin/env python3
"""
Test script to check if all imports work correctly
This helps identify which library is causing the segmentation fault
"""

print("Testing imports...")

try:
    print("1. Testing threading and time...")
    import threading
    import time
    from datetime import datetime
    print("   ✓ Basic Python modules OK")
except Exception as e:
    print(f"   ✗ Basic Python modules failed: {e}")
    exit(1)

try:
    print("2. Testing board and busio...")
    import board
    import busio
    print("   ✓ board and busio OK")
except Exception as e:
    print(f"   ✗ board and busio failed: {e}")
    print("   This might be expected if not running on actual Raspberry Pi hardware")

try:
    print("3. Testing Adafruit DHT...")
    import adafruit_dht
    print("   ✓ adafruit_dht OK")
except Exception as e:
    print(f"   ✗ adafruit_dht failed: {e}")

try:
    print("4. Testing Adafruit ADS...")
    import adafruit_ads1x15.ads1115 as ADS
    from adafruit_ads1x15.analog_in import AnalogIn
    print("   ✓ adafruit_ads1x15 OK")
except Exception as e:
    print(f"   ✗ adafruit_ads1x15 failed: {e}")

try:
    print("5. Testing SMBus...")
    from smbus2 import SMBus
    print("   ✓ smbus2 OK")
except Exception as e:
    print(f"   ✗ smbus2 failed: {e}")

try:
    print("6. Testing serial...")
    import serial
    print("   ✓ pyserial OK")
except Exception as e:
    print(f"   ✗ pyserial failed: {e}")

try:
    print("7. Testing standard libraries...")
    import os
    import binascii
    import urllib.request
    import urllib.parse
    import csv
    print("   ✓ Standard libraries OK")
except Exception as e:
    print(f"   ✗ Standard libraries failed: {e}")

print("\nImport test completed!")
print("If all imports passed, the issue might be with hardware initialization.")
