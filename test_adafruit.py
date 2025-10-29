#!/usr/bin/env python3
"""
Test script for Adafruit CircuitPython packages
"""

def test_adafruit_packages():
    print("Testing Adafruit CircuitPython packages...")
    print("=" * 50)
    
    # Test adafruit-blinka
    try:
        import adafruit_blinka.board.raspberrypi.raspi_40pin as board
        print("✓ adafruit-blinka imported successfully")
    except Exception as e:
        print(f"⚠ adafruit-blinka import warning: {e}")

    # Test adafruit-circuitpython-dht
    try:
        import adafruit_dht
        print("✓ adafruit-circuitpython-dht imported successfully")
    except Exception as e:
        print(f"⚠ adafruit-dht import warning: {e}")

    # Test adafruit-circuitpython-ads1x15
    try:
        import adafruit_ads1x15.ads1115 as ADS
        from adafruit_ads1x15.analog_in import AnalogIn
        print("✓ adafruit-circuitpython-ads1x15 imported successfully")
    except Exception as e:
        print(f"⚠ adafruit-ads1x15 import warning: {e}")

    # Test adafruit DS18x20 and OneWire
    try:
        import adafruit_ds18x20
        import adafruit_onewire.bus
        print("✓ adafruit DS18x20 and OneWire packages imported successfully")
    except Exception as e:
        print(f"⚠ adafruit DS18x20/OneWire import warning: {e}")

    print("\nNote: Some warnings are expected on non-Raspberry Pi hardware.")
    print("These packages are designed to work with actual GPIO pins.")

if __name__ == "__main__":
    test_adafruit_packages()
