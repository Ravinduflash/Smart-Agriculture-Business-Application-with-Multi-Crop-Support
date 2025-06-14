import os
import time
import random
from datetime import datetime

# Mock DS18B20 Temperature Sensor for Testing
print("DS18B20 Mock Sensor - Generating simulated temperature data")

# Calibration offset (adjust based on field calibration)
CALIBRATION_OFFSET = 0.0

# Configurable sleep time (seconds)
SLEEP_TIME = 5

def read_temperature():
    """Simulate DS18B20 temperature reading for testing purposes."""
    # Generate realistic temperature data (20-35°C range)
    base_temp = 27.5  # Average temperature
    variation = random.uniform(-5, 5)  # Random variation
    temperature = base_temp + variation + CALIBRATION_OFFSET
    return temperature

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
print("Starting mock temperature monitoring...")

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
