import time
import board
import adafruit_dht

# Set up the DHT22 sensor
DHT_PIN = board.D17  # GPIO17 (Pin 11)
dht_sensor = adafruit_dht.DHT22(DHT_PIN)

def read_sensor():
    try:
        # Try to read data from the sensor
        temperature = dht_sensor.temperature
        humidity = dht_sensor.humidity
        
        if humidity is not None and temperature is not None:
            print(f"Temperature: {temperature:.2f}C, Humidity: {humidity:.2f}%")
        else:
            print("Failed to retrieve data from the sensor")
    except RuntimeError as e:
        # Handle errors (e.g., sensor not ready)
        print(f"Error reading sensor: {e}")

if __name__ == "__main__":
    try:
        while True:
            read_sensor()
            time.sleep(2)  # Wait 2 seconds before the next reading
    except KeyboardInterrupt:
        print("Program stopped")
    finally:
        # Clean up the sensor
        dht_sensor.exit()