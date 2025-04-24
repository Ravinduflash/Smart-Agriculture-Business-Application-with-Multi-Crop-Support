import os
import time
from datetime import datetime

# Path to the 1-Wire device directory
BASE_DIR = "/sys/bus/w1/devices/"
SENSOR_ID = "28-00000033b5c2"  # Replace with your actual sensor ID
SENSOR_PATH = os.path.join(BASE_DIR, SENSOR_ID, "w1_slave")

# Calibration offset (adjust based on field calibration)
CALIBRATION_OFFSET = 0.0  # Example: set to 0.7 if sensor reads 0.7°C low

# Configurable sleep time (seconds)
SLEEP_TIME = 5  # Read every minute for practical monitoring

def read_temperature():
    """Read temperature from DS18B20 using the Linux 1-Wire interface."""
    try:
        with open(SENSOR_PATH, "r") as f:
            lines = f.readlines()
        if lines[0].strip()[-3:] != "YES":
            raise RuntimeError("Sensor CRC check failed")
        temp_str = lines[1].split("t=")[-1]
        return float(temp_str) / 1000.0 + CALIBRATION_OFFSET
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