import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# Initialize I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Set up ADS1115 ADC
ads = ADS.ADS1115(i2c)

# Select MQ135 Analog Output (A0)
mq135_channel = AnalogIn(ads, ADS.P0)

def interpret_gas_level(value):
    # Example thresholds, adjust based on your calibration/environment
    if value > 25000:
        return "Very High Pollution"
    elif value > 20000:
        return "High Pollution"
    elif value > 15000:
        return "Moderate Pollution"
    elif value > 10000:
        return "Low Pollution"
    else:
        return "Clean Air"

while True:
    try:
        gas_level = mq135_channel.value  # Raw ADC reading
        voltage = mq135_channel.voltage  # Converted voltage
        interpretation = interpret_gas_level(gas_level)
    except Exception as e:
        print(f"Error reading sensor: {e}")
    else:
        print(f"Gas Level: {gas_level}, Voltage: {voltage:.2f}V, Air Quality: {interpretation}")
    time.sleep(1)
