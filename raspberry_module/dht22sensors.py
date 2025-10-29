import time
import board
import adafruit_dht

# --- CALIBRATION INSTRUCTIONS ---
# 1. Place the DHT22 sensor right next to a trusted, accurate thermometer/hygrometer.
# 2. Let both devices stabilize for at least 15-20 minutes.
# 3. Run this script and record the temperature and humidity readings from the DHT22.
# 4. Compare the DHT22 readings to your reference device.
# 5. Calculate the difference (offset) for both temperature and humidity.
#    - Example: If DHT22 reads 25.5�C and your reference is 24.9�C, the temp_offset is -0.6.
#    - Example: If DHT22 reads 62% and your reference is 65%, the humidity_offset is +3.0.
# 6. Apply these offsets to the sensor readings to get calibrated values.

# --- Configuration ---
# Set up the DHT22 sensor
DHT_PIN = board.D17  # GPIO17 (Pin 11)
dht_sensor = adafruit_dht.DHT22(DHT_PIN)

# --- Calibration Offsets (update these with your calculated values) ---
# Based on your readings: DHT22 (29.20C) - DS18B20 (28.75C) = 0.45
TEMP_OFFSET = -0.45  # Corrected based on your sensor data
HUMIDITY_OFFSET = 0.0 # e.g., 3.0

def read_sensor():
    """Reads sensor data, applies calibration, and prints the results."""
    try:
        # Try to read data from the sensor
        temperature_raw = dht_sensor.temperature
        humidity_raw = dht_sensor.humidity
        
        if humidity_raw is not None and temperature_raw is not None:
            # Apply calibration offsets
            temperature_calibrated = temperature_raw + TEMP_OFFSET
            humidity_calibrated = humidity_raw + HUMIDITY_OFFSET

            print(f"Raw Reading:       Temp={temperature_raw:.2f}C, Humidity={humidity_raw:.2f}%")
            print(f"Calibrated Reading:  Temp={temperature_calibrated:.2f}C, Humidity={humidity_calibrated:.2f}%")
        else:
            print("Failed to retrieve data from the sensor")

    except RuntimeError as e:
        # Handle errors (e.g., sensor not ready)
        print(f"Error reading sensor: {e}")
    except Exception as e:
        # Handle other potential errors
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    try:
        while True:
            read_sensor()
            print("-" * 40) # Separator for readability
            time.sleep(2)  # Wait 2 seconds before the next reading
    except KeyboardInterrupt:
        print("\nProgram stopped")
    finally:
        # Clean up the sensor
        if 'dht_sensor' in locals() and hasattr(dht_sensor, 'exit'):
            dht_sensor.exit()
