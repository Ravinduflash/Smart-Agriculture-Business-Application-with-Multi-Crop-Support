import os
import time
from datetime import datetime

# Path to the 1-Wire device directory
BASE_DIR = "/sys/bus/w1/devices/"

# Auto-detect working DS18B20 sensors
def find_working_sensor():
    """Find the first working DS18B20 sensor"""
    print(f"Scanning {BASE_DIR} for DS18B20 sensors...")
    
    try:
        devices = os.listdir(BASE_DIR)
        print(f"Found devices: {devices}")
    except Exception as e:
        print(f"Error listing devices: {e}")
        return None, None
    
    for d in devices:
        if d.startswith("28-"):
            sensor_path = os.path.join(BASE_DIR, d, "w1_slave")
            temp_path = os.path.join(BASE_DIR, d, "temperature")
            
            print(f"Checking sensor {d}...")
            print(f"  w1_slave path exists: {os.path.exists(sensor_path)}")
            print(f"  temperature path exists: {os.path.exists(temp_path)}")
            
            # Check if w1_slave file exists and is readable
            if os.path.exists(sensor_path):
                try:
                    with open(sensor_path, "r") as f:
                        content = f.read()
                    lines = content.strip().split('\n')
                    print(f"  w1_slave content: {lines}")
                    if len(lines) >= 2 and "t=" in lines[1] and "YES" in lines[0]:
                        print(f"Found working sensor: {d}")
                        return d, sensor_path
                except Exception as e:
                    print(f"  Error reading w1_slave: {e}")
            
            # Alternative: try temperature file (accept even 0 reading)
            if os.path.exists(temp_path):
                try:
                    with open(temp_path, "r") as f:
                        temp_str = f.read().strip()
                    print(f"  temperature file content: '{temp_str}'")
                    if temp_str and temp_str != "":
                        print(f"Found sensor with temperature file: {d}")
                        return d, temp_path
                except Exception as e:
                    print(f"  Error reading temperature file: {e}")
            
            # If w1_slave exists but doesn't have proper format, still try to use it
            if os.path.exists(sensor_path):
                print(f"Using w1_slave file for sensor: {d}")
                return d, sensor_path
                    
    return None, None

SENSOR_ID, SENSOR_PATH = find_working_sensor()
if SENSOR_ID is None:
    raise RuntimeError("No working DS18B20 sensor found in /sys/bus/w1/devices/")

# Calibration offset (adjust based on field calibration)
CALIBRATION_OFFSET = 0.0  # Example: set to 0.7 if sensor reads 0.7°C low

# Configurable sleep time (seconds)
SLEEP_TIME = 5  # Read every minute for practical monitoring

def read_temperature():
    """Read temperature from DS18B20 using the Linux 1-Wire interface."""
    try:
        # Re-scan for sensors if current sensor path doesn't exist
        global SENSOR_PATH, SENSOR_ID
        if not os.path.exists(SENSOR_PATH):
            print("Current sensor path not found, re-scanning...")
            SENSOR_ID, SENSOR_PATH = find_working_sensor()
            if SENSOR_ID is None:
                raise RuntimeError("No working DS18B20 sensor found")
        
        with open(SENSOR_PATH, "r") as f:
            content = f.read().strip()
        
        # Handle empty files
        if not content:
            raise RuntimeError("Sensor file is empty - sensor may not be connected or powered")
        
        # Check if using temperature file format (single number)
        if SENSOR_PATH.endswith("temperature"):
            temp_c = float(content) / 1000.0 + CALIBRATION_OFFSET
            # Check for unrealistic readings
            if temp_c < -55 or temp_c > 125:
                raise RuntimeError(f"Unrealistic temperature reading: {temp_c}°C")
            return temp_c
        
        # Handle w1_slave file format
        lines = content.split('\n')
        if len(lines) < 2:
            raise RuntimeError(f"Sensor file {SENSOR_PATH} is empty or malformed: {lines}")
        if lines[0].strip()[-3:] != "YES":
            raise RuntimeError("Sensor CRC check failed")
        if "t=" not in lines[1]:
            raise RuntimeError(f"Temperature data not found in: {lines[1]}")
        temp_str = lines[1].split("t=")[-1]
        temp_c = float(temp_str) / 1000.0 + CALIBRATION_OFFSET
        
        # Check for unrealistic readings
        if temp_c < -55 or temp_c > 125:
            raise RuntimeError(f"Unrealistic temperature reading: {temp_c}°C")
        
        return temp_c
        
    except FileNotFoundError:
        raise RuntimeError(f"Sensor not found at {SENSOR_PATH}. Ensure the sensor ID is correct and 1-Wire is enabled.")
    except Exception as e:
        raise RuntimeError(f"Failed to read temperature: {e}")

def interpret_temperature(temp_c):
    """Interpret temperature based on thresholds."""
    COOL_THRESHOLD = 20.0  # Below this, growth may slow
    OPTIMAL_MIN = 20.0     # Lower bound for optimal growth
    OPTIMAL_MAX = 30.0     # Upper bound for optimal growth
    HEAT_STRESS_THRESHOLD = 30.0  # Above this, heat stress possible

    if temp_c < COOL_THRESHOLD:
        return "Cool - Growth may slow, consider protective measures"
    elif OPTIMAL_MIN <= temp_c <= OPTIMAL_MAX:
        return "Optimal - Ideal for tropical leafy vegetables"
    else:
        return "Heat Stress - Consider shading or increased irrigation"

# Print startup message
print("Starting temperature monitoring...")

try:
    while True:
        try:
            temp_c = read_temperature()
            status = interpret_temperature(temp_c)
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"{timestamp} - Temperature: {temp_c:.2f}°C, Status: {status}")
        except Exception as e:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"{timestamp} - Error: {e}")
        time.sleep(SLEEP_TIME)
except KeyboardInterrupt:
    print("Exiting...")