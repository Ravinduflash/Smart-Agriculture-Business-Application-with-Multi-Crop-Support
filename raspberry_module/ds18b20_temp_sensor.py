import time
import board
import busio
import adafruit_ds18x20
from adafruit_onewire.bus import OneWireBus
from datetime import datetime

# Initialize the OneWire bus on GPIO4 (physical pin 7)
ow_bus = OneWireBus(board.D4)

# Discover DS18B20 sensors on the bus
devices = ow_bus.scan()
if not devices:
    raise RuntimeError("No DS18B20 sensor found on the OneWire bus")

# Use the first detected DS18B20 sensor
ds18 = adafruit_ds18x20.DS18X20(ow_bus, devices[0])

# Calibration offset (adjust based on field calibration)
CALIBRATION_OFFSET = 0.0  # Example: set to 0.7 if sensor reads 0.7°C low

# Temperature thresholds for tropical leafy vegetables in Kalutara
COOL_THRESHOLD = 20.0  # Below this, growth may slow
OPTIMAL_MIN = 20.0     # Lower bound for optimal growth
OPTIMAL_MAX = 30.0     # Upper bound for optimal growth
HEAT_STRESS_THRESHOLD = 30.0  # Above this, heat stress possible

# Configurable sleep time (seconds)
SLEEP_TIME = 60  # Read every minute for practical monitoring

def read_temperature():
    """Read temperature from DS18B20 and apply calibration offset."""
    try:
        temp_c = ds18.temperature + CALIBRATION_OFFSET
        return temp_c
    except Exception as e:
        raise RuntimeError(f"Failed to read temperature: {e}")

def interpret_temperature(temp_c):
    """Interpret temperature based on thresholds for leafy vegetables."""
    if temp_c < COOL_THRESHOLD:
        return "Cool - Growth may slow, consider protective measures"
    elif OPTIMAL_MIN <= temp_c <= OPTIMAL_MAX:
        return "Optimal - Ideal for tropical leafy vegetables"
    else:
        return "Heat Stress - Consider shading or increased irrigation"

# Print startup message and thresholds
print("Starting temperature monitoring for leafy vegetables...")
print(f"Thresholds: Cool < {COOL_THRESHOLD}°C, Optimal {OPTIMAL_MIN}–{OPTIMAL_MAX}°C, Heat Stress > {HEAT_STRESS_THRESHOLD}°C")

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