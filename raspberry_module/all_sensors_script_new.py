# Import necessary libraries
import threading
import time
from datetime import datetime
import board
import busio
import adafruit_dht
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from smbus2 import SMBus
import serial
import os
import binascii
import urllib.request
import urllib.parse

# --- UPDATED ThingSpeak Configuration ---
# Your specific ThingSpeak Write API Key.
THINGSPEAK_API_KEY = "0X0LJDCLGITJ0BHK"

# --- BMP180 Barometric Pressure Sensor Functions ---
BMP180_I2C_ADDRESS = 0x77
BMP180_REG_CONTROL = 0xF4
BMP180_REG_RESULT = 0xF6
BMP180_COMMAND_TEMP = 0x2E
BMP180_COMMAND_PRESSURE = 0x34

def read_signed_16bit(bus, register):
    """Reads a signed 16-bit value from the I2C bus."""
    msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, register, 2)
    value = (msb << 8) + lsb
    return value - 65536 if value > 32767 else value

def read_unsigned_16bit(bus, register):
    """Reads an unsigned 16-bit value from the I2C bus."""
    msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, register, 2)
    return (msb << 8) + lsb

def read_calibration_data(bus):
    """Reads the calibration data from the BMP180 sensor."""
    calib = {}
    calib['AC1'] = read_signed_16bit(bus, 0xAA)
    calib['AC2'] = read_signed_16bit(bus, 0xAC)
    calib['AC3'] = read_signed_16bit(bus, 0xAE)
    calib['AC4'] = read_unsigned_16bit(bus, 0xB0)
    calib['AC5'] = read_unsigned_16bit(bus, 0xB2)
    calib['AC6'] = read_unsigned_16bit(bus, 0xB4)
    calib['B1'] = read_signed_16bit(bus, 0xB6)
    calib['B2'] = read_signed_16bit(bus, 0xB8)
    calib['MB'] = read_signed_16bit(bus, 0xBA)
    calib['MC'] = read_signed_16bit(bus, 0xBC)
    calib['MD'] = read_signed_16bit(bus, 0xBE)
    return calib

def read_raw_temp(bus):
    """Reads the raw temperature value from the BMP180."""
    bus.write_byte_data(BMP180_I2C_ADDRESS, BMP180_REG_CONTROL, BMP180_COMMAND_TEMP)
    time.sleep(0.005)
    msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, BMP180_REG_RESULT, 2)
    return (msb << 8) + lsb

def read_raw_pressure(bus):
    """Reads the raw pressure value from the BMP180."""
    bus.write_byte_data(BMP180_I2C_ADDRESS, BMP180_REG_CONTROL, BMP180_COMMAND_PRESSURE)
    time.sleep(0.005)
    msb, lsb, xlsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, BMP180_REG_RESULT, 3)
    return ((msb << 16) + (lsb << 8) + xlsb) >> 8

def calculate_true_values(calib, raw_temp, raw_pressure):
    """Calculates the true temperature and pressure from raw values using calibration data."""
    X1 = ((raw_temp - calib['AC6']) * calib['AC5']) >> 15
    X2 = (calib['MC'] << 11) // (X1 + calib['MD']) if (X1 + calib['MD']) != 0 else 0
    B5 = X1 + X2
    temperature = (B5 + 8) >> 4
    temperature = temperature / 10.0
    B6 = B5 - 4000
    X1 = (calib['B2'] * (B6 * B6 >> 12)) >> 11
    X2 = (calib['AC2'] * B6) >> 11
    X3 = X1 + X2
    B3 = (((calib['AC1'] * 4 + X3) << 1) + 2) >> 2
    X1 = (calib['AC3'] * B6) >> 13
    X2 = (calib['B1'] * (B6 * B6 >> 12)) >> 16
    X3 = ((X1 + X2) + 2) >> 2
    B4 = (calib['AC4'] * (X3 + 32768)) >> 15
    B7 = (raw_pressure - B3) * 50000
    pressure = (B7 * 2) // B4 if (B7 < 0x80000000) else (B7 // B4) * 2
    X1 = (pressure >> 8) * (pressure >> 8)
    X1 = (X1 * 3038) >> 16
    X2 = (-7357 * pressure) >> 16
    pressure = pressure + ((X1 + X2 + 3791) >> 4)
    pressure = pressure / 100.0
    return temperature, pressure

# --- Hardware Initialization ---
i2c = busio.I2C(board.SCL, board.SDA)
# --- DS18B20 Temperature Sensor Functions (Linux 1-Wire) ---
BASE_DIR = "/sys/bus/w1/devices/"

def find_working_ds18b20_sensor():
    """Find the first working DS18B20 sensor using Linux 1-Wire interface."""
    try:
        devices = os.listdir(BASE_DIR)
        for d in devices:
            if d.startswith("28-"):
                sensor_path = os.path.join(BASE_DIR, d, "w1_slave")
                temp_path = os.path.join(BASE_DIR, d, "temperature")
                
                # Try temperature file first (more reliable)
                if os.path.exists(temp_path):
                    try:
                        with open(temp_path, "r") as f:
                            temp_str = f.read().strip()
                        if temp_str and temp_str != "":
                            return temp_path
                    except:
                        pass
                
                # Fallback to w1_slave file
                if os.path.exists(sensor_path):
                    try:
                        with open(sensor_path, "r") as f:
                            content = f.read()
                        lines = content.strip().split('\n')
                        if len(lines) >= 2 and "t=" in lines[1] and "YES" in lines[0]:
                            return sensor_path
                    except:
                        pass
    except:
        pass
    return None

def read_ds18b20_temperature(sensor_path):
    """Read temperature from DS18B20 using Linux 1-Wire interface."""
    try:
        with open(sensor_path, "r") as f:
            content = f.read().strip()
        
        if not content:
            return None
        
        # Handle temperature file format (single number)
        if sensor_path.endswith("temperature"):
            temp_c = float(content) / 1000.0
            # Check for realistic readings
            if -55 <= temp_c <= 125:
                return temp_c
            return None
        
        # Handle w1_slave file format
        lines = content.split('\n')
        if len(lines) < 2 or lines[0].strip()[-3:] != "YES" or "t=" not in lines[1]:
            return None
        
        temp_str = lines[1].split("t=")[-1]
        temp_c = float(temp_str) / 1000.0
        
        # Check for realistic readings
        if -55 <= temp_c <= 125:
            return temp_c
        return None
        
    except:
        return None

# --- Hardware Initialization ---
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS.ADS1115(i2c, address=0x48)
dht_sensor = adafruit_dht.DHT22(board.D17)

# Initialize DS18B20 using Linux 1-Wire interface
try:
    ds18_sensor_path = find_working_ds18b20_sensor()
    if ds18_sensor_path:
        print(f"DS18B20 sensor found at: {ds18_sensor_path}")
    else:
        print("No DS18B20 sensor found")
        ds18_sensor_path = None
except Exception as e:
    print(f"Could not initialize DS18B20 sensor: {e}")
    ds18_sensor_path = None

bus = SMBus(1)
calib = read_calibration_data(bus)

try:
    ser = serial.Serial('/dev/ttyUSB0', 4800, timeout=5)
except Exception as e:
    print(f"Could not open serial port /dev/ttyUSB0 for NPK sensor: {e}")
    ser = None

ldr_channel = AnalogIn(ads, ADS.P0)
mq135_channel = AnalogIn(ads, ADS.P1)
rain_channel = AnalogIn(ads, ADS.P2)
moisture_channel = AnalogIn(ads, ADS.P3)

# --- MQ135 Gas Sensor Calibration Constants ---
VCC = 5.0
RL = 10.0
R0 = 76.63
GAS_CALIBRATION = {
    'CO2': {'a': 116.6020682, 'b': -2.769034857},
    'NH3': {'a': 102.2, 'b': -2.473},
    'VOC': {'a': 110.47, 'b': -2.854}
}

# --- Shared Data Dictionary & Locks ---
# Using more descriptive keys for clarity.
data = {
    'timestamp': None, 'air_temp_c': 'N/A', 'humidity_percent': 'N/A',
    'water_soil_temp_c': 'N/A', 'air_pressure_hpa': 'N/A',
    'soil_moisture_raw': 'N/A', 'light_level_raw': 'N/A',
    'rain_level_raw': 'N/A', 'co2_ppm': 'N/A', 'nh3_ppm': 'N/A',
    'voc_ppm': 'N/A', 'nitrogen_mg_kg': 'N/A', 'phosphorus_mg_kg': 'N/A',
    'potassium_mg_kg': 'N/A'
}
i2c_lock = threading.Lock()
serial_lock = threading.Lock()

# --- ThingSpeak Field Mapping ---
# This mapping matches the fields you specified for your "Kangkung" channel.
thingspeak_field_mapping = {
    'air_temp_c': 'field1',         # Air Temperature from DHT22
    'humidity_percent': 'field2',   # Air Humidity from DHT22
    'water_soil_temp_c': 'field3',  # Water/Soil Temperature from DS18B20
    'soil_moisture_raw': 'field4',  # Soil Moisture Level from HW-080
    'light_level_raw': 'field5',    # Light Level from LDR
    'nitrogen_mg_kg': 'field6',     # Nitrogen (N) from NPK Sensor
    'phosphorus_mg_kg': 'field7',   # Phosphorus (P) from NPK Sensor
    'potassium_mg_kg': 'field8',    # Potassium (K) from NPK Sensor
}

# --- Sensor Reading Functions ---

def read_bmp180():
    """Reads BMP180 sensor data periodically for air pressure."""
    while True:
        with i2c_lock:
            try:
                raw_temp = read_raw_temp(bus) # Still need raw temp for pressure calculation
                raw_pressure = read_raw_pressure(bus)
                _, pressure = calculate_true_values(calib, raw_temp, raw_pressure)
                data['air_pressure_hpa'] = f"{pressure:.2f}"
            except Exception as e:
                print(f"Error reading BMP180: {e}")
                data['air_pressure_hpa'] = 'N/A'
        time.sleep(5)

def read_dht22():
    """Reads DHT22 sensor data periodically."""
    while True:
        try:
            temperature = dht_sensor.temperature
            humidity = dht_sensor.humidity
            if temperature is not None and humidity is not None:
                data['air_temp_c'] = f"{temperature:.2f}"
                data['humidity_percent'] = f"{humidity:.2f}"
            else:
                data['air_temp_c'], data['humidity_percent'] = 'N/A', 'N/A'
        except Exception as e:
            print(f"Error reading DHT22: {e}")
            data['air_temp_c'], data['humidity_percent'] = 'N/A', 'N/A'
        time.sleep(5)

def read_ds18b20():
    """Reads DS18B20 water/soil temperature periodically."""
    while True:
        if ds18_sensor_path:
            try:
                temperature = read_ds18b20_temperature(ds18_sensor_path)
                if temperature is not None:
                    data['water_soil_temp_c'] = f"{temperature:.2f}"
                else:
                    data['water_soil_temp_c'] = 'N/A'
            except Exception as e:
                print(f"Error reading DS18B20: {e}")
                data['water_soil_temp_c'] = 'N/A'
        else:
            data['water_soil_temp_c'] = 'N/A'
        time.sleep(5)

def read_soil_moisture():
    """Reads soil moisture sensor data periodically."""
    while True:
        with i2c_lock:
            try:
                data['soil_moisture_raw'] = str(moisture_channel.value)
            except Exception as e:
                print(f"Error reading Soil Moisture: {e}")
                data['soil_moisture_raw'] = 'N/A'
        time.sleep(5)

def read_ldr():
    """Reads LDR light level data periodically."""
    while True:
        with i2c_lock:
            try:
                data['light_level_raw'] = str(ldr_channel.value)
            except Exception as e:
                print(f"Error reading LDR: {e}")
                data['light_level_raw'] = 'N/A'
        time.sleep(5)

def read_mq135():
    """Reads MQ135 gas sensor data periodically."""
    while True:
        with i2c_lock:
            try:
                voltage = mq135_channel.voltage
                rs = (VCC - voltage) / voltage * RL if voltage > 0 else float('inf')
                ratio = rs / R0 if R0 > 0 else float('inf')
                data['co2_ppm'] = f"{GAS_CALIBRATION['CO2']['a'] * (ratio ** GAS_CALIBRATION['CO2']['b']):.2f}"
                data['nh3_ppm'] = f"{GAS_CALIBRATION['NH3']['a'] * (ratio ** GAS_CALIBRATION['NH3']['b']):.2f}"
                data['voc_ppm'] = f"{GAS_CALIBRATION['VOC']['a'] * (ratio ** GAS_CALIBRATION['VOC']['b']):.2f}"
            except Exception as e:
                print(f"Error reading MQ135: {e}")
                data['co2_ppm'], data['nh3_ppm'], data['voc_ppm'] = 'N/A', 'N/A', 'N/A'
        time.sleep(5)

def calculate_crc(data_bytes):
    """Calculates CRC16 for Modbus communication."""
    crc = 0xFFFF
    for pos in data_bytes:
        crc ^= pos
        for _ in range(8):
            if (crc & 0x0001) != 0:
                crc >>= 1
                crc ^= 0xA001
            else:
                crc >>= 1
    return crc.to_bytes(2, byteorder='little')

def read_npk():
    """Reads NPK sensor data periodically via Modbus."""
    queries = {"N": b"\x01\x03\x00\x1E\x00\x01", "P": b"\x01\x03\x00\x1F\x00\x01", "K": b"\x01\x03\x00\x20\x00\x01"}
    data_keys = {'N': 'nitrogen_mg_kg', 'P': 'phosphorus_mg_kg', 'K': 'potassium_mg_kg'}
    while True:
        with serial_lock:
            if ser:
                try:
                    for nutrient, query in queries.items():
                        full_query = query + calculate_crc(query)
                        ser.write(full_query)
                        time.sleep(0.2)
                        response = ser.read(7)
                        if len(response) >= 7:
                            value = int.from_bytes(response[3:5], byteorder='big')
                            data[data_keys[nutrient]] = str(value)
                        else:
                            data[data_keys[nutrient]] = 'N/A'
                        time.sleep(1)
                except Exception as e:
                    print(f"Error reading NPK: {e}")
                    data['nitrogen_mg_kg'], data['phosphorus_mg_kg'], data['potassium_mg_kg'] = 'N/A', 'N/A', 'N/A'
            else:
                 data['nitrogen_mg_kg'], data['phosphorus_mg_kg'], data['potassium_mg_kg'] = 'N/A', 'N/A', 'N/A'
        time.sleep(5)

def read_rain():
    """Reads rain sensor data periodically."""
    while True:
        with i2c_lock:
            try:
                data['rain_level_raw'] = str(rain_channel.value)
            except Exception as e:
                print(f"Error reading Rain Sensor: {e}")
                data['rain_level_raw'] = 'N/A'
        time.sleep(5)

# --- Main Application Logic ---

def start_sensor_threads():
    """Creates and starts all sensor reading threads."""
    threads = [
        threading.Thread(target=read_bmp180, daemon=True),
        threading.Thread(target=read_dht22, daemon=True),
        threading.Thread(target=read_ds18b20, daemon=True),
        threading.Thread(target=read_soil_moisture, daemon=True),
        threading.Thread(target=read_ldr, daemon=True),
        threading.Thread(target=read_mq135, daemon=True),
        threading.Thread(target=read_npk, daemon=True),
        threading.Thread(target=read_rain, daemon=True)
    ]
    for t in threads:
        t.start()
    print("All sensor threads started.")

def send_to_thingspeak(api_key, sensor_data):
    """Formats and sends data to ThingSpeak based on the field mapping."""
    base_url = "https://api.thingspeak.com/update"
    payload = {'api_key': api_key}
    
    for key, field in thingspeak_field_mapping.items():
        if key in sensor_data and sensor_data[key] != 'N/A':
            try:
                payload[field] = float(sensor_data[key])
            except (ValueError, TypeError):
                print(f"Warning: Could not convert '{sensor_data[key]}' for {key} to float. Skipping for ThingSpeak.")
    
    if len(payload) <= 1:
        print("No valid numeric data to send to ThingSpeak.")
        return

    try:
        params = urllib.parse.urlencode(payload)
        full_url = f"{base_url}?{params}"
        with urllib.request.urlopen(full_url, timeout=10) as response:
            response_text = response.read().decode('utf-8')
            if response.status == 200 and response_text != "0":
                print(f"Data sent to ThingSpeak. Entry ID: {response_text}")
            else:
                print(f"Failed to send data to ThingSpeak. Response: {response_text} (Code: {response.status})")
    except Exception as e:
        print(f"Error sending data to ThingSpeak: {e}")

def main():
    """Main function to run the application."""
    print("Starting sensor data collection...")
    start_sensor_threads()
    
    try:
        while True:
            time.sleep(15) # ThingSpeak free plan allows updates approx. every 15 seconds
            
            data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            data_copy = data.copy()
            
            # Print all current readings to the console for local monitoring
            print("-" * 40)
            print(f"Readings at {data_copy['timestamp']}")
            print("-" * 40)
            for key, value in data_copy.items():
                 # Don't print the timestamp twice
                if key != 'timestamp':
                    # Format the key for better readability
                    formatted_key = key.replace('_', ' ').title()
                    print(f"{formatted_key:<22}: {value}")
            
            # Send the selected 8 fields to ThingSpeak
            send_to_thingspeak(THINGSPEAK_API_KEY, data_copy)

    except KeyboardInterrupt:
        print("\nProgram stopped by user.")
    finally:
        if ser and ser.is_open:
            ser.close()
            print("Serial port closed.")
        print("Exiting application.")

if __name__ == "__main__":
    main()
