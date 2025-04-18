import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from datetime import datetime

# Initialize the I2C bus and ADC
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS.ADS1115(i2c)
moisture_channel = AnalogIn(ads, ADS.P0)

# --- CALIBRATION INSTRUCTIONS ---
# 1. Place the sensor in completely dry soil and note the raw ADC value.
# 2. Set DRY_THRESHOLD slightly below that value.
# 3. Place the sensor in saturated soil (after heavy rain) and note the raw ADC value.
# 4. Set WATERLOGGED_THRESHOLD slightly above that value.
# 5. Define OPTIMAL_MOISTURE_LOW and OPTIMAL_MOISTURE_HIGH based on crop needs.
#    - For vegetables in loamy soil, optimal moisture is typically between 12.5% and 25% VWC.
#    - Use OpenWeatherMap Soil API or local data to correlate ADC readings with VWC.
# 6. Adjust the thresholds below accordingly. Lower ADC values indicate wetter soil.

# Example Calibration Thresholds (adjust based on your measurements)
DRY_THRESHOLD = 28000          # Raw ADC value for dry soil
OPTIMAL_MOISTURE_LOW = 20000   # Lower bound for optimal moisture (wetter)
OPTIMAL_MOISTURE_HIGH = 28000  # Upper bound for optimal moisture (drier)
WATERLOGGED_THRESHOLD = 15000  # Raw ADC value for waterlogged soil

# Configurable sleep time (seconds)
SLEEP_TIME = 2

def interpret_soil_moisture(value):
    """
    Interpret soil moisture based on calibrated raw ADC values.
    - Dry: value > DRY_THRESHOLD
    - Optimal Moisture: OPTIMAL_MOISTURE_LOW <= value <= OPTIMAL_MOISTURE_HIGH
    - Wet: WATERLOGGED_THRESHOLD < value < OPTIMAL_MOISTURE_LOW
    - Waterlogged: value <= WATERLOGGED_THRESHOLD
    """
    if value > DRY_THRESHOLD:
        return "Dry - Needs irrigation"
    elif OPTIMAL_MOISTURE_LOW <= value <= OPTIMAL_MOISTURE_HIGH:
        return "Optimal Moisture"
    elif WATERLOGGED_THRESHOLD < value < OPTIMAL_MOISTURE_LOW:
        return "Wet - Consider reducing irrigation"
    else:
        return "Waterlogged - Too much water"

# Print startup message and thresholds
print("Starting soil moisture monitoring...")
print(f"Thresholds: Dry > {DRY_THRESHOLD}, Optimal {OPTIMAL_MOISTURE_LOW}-{OPTIMAL_MOISTURE_HIGH}, Waterlogged < {WATERLOGGED_THRESHOLD}")

try:
    while True:
        try:
            raw_value = moisture_channel.value       # Raw ADC value
            voltage = moisture_channel.voltage       # Converted voltage
            status = interpret_soil_moisture(raw_value)
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"{timestamp} - Raw Value: {raw_value}, Voltage: {voltage:.2f}V, Status: {status}")
        except Exception as e:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"{timestamp} - Error reading sensor: {e}")
        time.sleep(SLEEP_TIME)
except KeyboardInterrupt:
    print("Exiting...")