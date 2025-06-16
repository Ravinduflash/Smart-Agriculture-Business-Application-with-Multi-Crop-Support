import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# Initialize I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Set up ADS1115 ADC
ads = ADS.ADS1115(i2c)

# Read Rain Sensor Analog Output (AO -> A0)
rain_channel = AnalogIn(ads, ADS.P2)

# --- CALIBRATION INSTRUCTIONS ---
# 1. Record the ADC reading when the sensor is completely DRY.
# 2. Set DRY_THRESHOLD slightly BELOW that value.
# 3. During rainfall, record ADC readings and correlate with actual rainfall rates (mm/h) using:
#    - A local rain gauge, or
#    - OpenWeatherMap's "rain.1h" (precipitation in the last hour, in mm).
# 4. Classify rainfall intensity:
#    - Light rain: <2.5 mm/h
#    - Moderate rain: 2.5–7.6 mm/h
#    - Heavy rain: >7.6 mm/h
# 5. Map ADC readings to these categories. For example:
#    - DRY_THRESHOLD > 28,000 counts
#    - LIGHT_RAIN_THRESHOLD: 25,000–28,000 counts
#    - MODERATE_RAIN_THRESHOLD: 20,000–25,000 counts
#    - HEAVY_RAIN_THRESHOLD: <20,000 counts
# 6. Adjust the thresholds below based on your calibration data.

# Initial threshold estimates (adjust after calibration)
DRY_THRESHOLD = 28000  # Example: slightly below dry reading
LIGHT_RAIN_THRESHOLD = 25000  # Example: light rain range
MODERATE_RAIN_THRESHOLD = 20000  # Example: moderate rain range
HEAVY_RAIN_THRESHOLD = 15000  # Example: heavy rain range

def interpret_rain_level(value):
    """Interpret ADC reading into rainfall intensity categories."""
    if value > DRY_THRESHOLD:
        return "Dry"
    elif value > LIGHT_RAIN_THRESHOLD:
        return "Light Rain"
    elif value > MODERATE_RAIN_THRESHOLD:
        return "Moderate Rain"
    else:
        return "Heavy Rain"

while True:
    try:
        rain_value = rain_channel.value  # Raw ADC reading
        voltage = rain_channel.voltage  # Converted voltage
        rain_status = interpret_rain_level(rain_value)
        print(f"Rain Sensor: ADC={rain_value}, Voltage={voltage:.2f}V, Status={rain_status}")
    except Exception as e:
        print(f"Error reading sensor: {e}")
        # Optional: Add a small delay before retrying after an error
        time.sleep(2)
    time.sleep(1)  # Adjust sample rate if needed