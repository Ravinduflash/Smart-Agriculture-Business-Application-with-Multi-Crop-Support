import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# Initialize I2C and ADS1115
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS.ADS1115(i2c, address=0x48)
chan = AnalogIn(ads, ADS.P0)

# Function to interpret light levels
def interpret_light_level(value):
    if value > 20000:  # Example threshold for "dark"
        return "Very Dark"
    elif value > 15000:  # Example threshold for "low light"
        return "Low Light"
    elif value > 10000:  # Example threshold for "medium light"
        return "Medium Light"
    else:  # Below 10000
        return "Bright Light"

# Main loop
while True:
    ldr_value = chan.value
    voltage = chan.voltage
    light_level = interpret_light_level(ldr_value)
    
    print(f"LDR Value: {ldr_value}, Voltage: {voltage:.4f}V, Light Level: {light_level}")
    time.sleep(0.5)

