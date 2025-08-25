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
import requests
import csv # NEW: Imported the csv library for file logging

# =================================================================================
# --- CALIBRATION AND THRESHOLDS CONFIGURATION ---
# =================================================================================
# Instructions: Update the values in this section to match your specific sensors,
# crop (Kangkung), and environment for accurate readings and status reports.
# ---------------------------------------------------------------------------------

# --- Local Data Logging Configuration ---
CSV_LOG_FILE = "sensor_log.csv" # The name of the CSV file to store all sensor readings

# --- ThingSpeak Configuration ---
THINGSPEAK_API_KEY = "0X0LJDCLGITJ0BHK"

# --- 1. Temperature & Humidity Calibration ---
# Compare DHT22 to the more precise DS18B20 and adjust the offset.
# TEMP_OFFSET = (DS18B20 Reading - DHT22 Reading)
TEMP_OFFSET = -0.45  # Based on your previous readings (28.75 - 29.20)
DS18B20_OFFSET = 0.0 # Calibrate DS18B20 against a reference thermometer if needed.

# --- 2. Air Pressure Calibration & Thresholds ---
# Compare BMP180 to a local weather station report (QNH).
# AIR_PRESSURE_OFFSET = (Official Pressure - Sensor Pressure)
AIR_PRESSURE_OFFSET = 245.2 # UPDATED: Based on 1010 hPa (official) - 764.80 hPa (sensor)
# NEW: Thresholds for interpreting weather patterns in Kalutara, Sri Lanka.
AIR_PRESSURE_THRESHOLDS = {
    "low": 1005,  # Pressure below this may indicate unsettled weather or rain.
    "high": 1015 # Pressure above this indicates stable, fair weather.
}

# --- 3. Soil Moisture Thresholds (Raw ADC Values) ---
# Find these values by testing the sensor in dry soil and in a cup of water.
# Note: Lower ADC value means WETTER soil.
SOIL_MOISTURE_DRY = 25570       # UPDATED: Your value in bone-dry soil/air.
SOIL_MOISTURE_WET = 11922       # UPDATED: Your value when submerged in water.
SOIL_THRESHOLDS = {"low": 23000, "optimal": 16000} # UPDATED: Dry if > low, Optimal if < low and > optimal, Wet if < optimal.

# --- 4. Light Level Thresholds (Raw ADC Values) ---
# Find these values by testing the LDR in darkness and bright light.
# Note: Lower ADC value means BRIGHTER light.
LDR_VERY_DARK = 22000      # UPDATED: Based on your dark reading of 25830
LDR_LOW_LIGHT = 17000      # UPDATED: Represents partial shade
LDR_MEDIUM_LIGHT = 8000    # UPDATED: Represents bright, indirect light
# Any value below LDR_MEDIUM_LIGHT is considered "Bright Light" (direct sun)

# --- 5. Rain Sensor Thresholds (Raw ADC Values) ---
# Find these values by testing the sensor when dry and with different amounts of water.
# Note: Lower ADC value means MORE rain.
RAIN_DRY = 25000           # UPDATED: Based on your dry reading of 26040.
RAIN_LIGHT = 18000         # UPDATED: A value indicating the start of rain.
RAIN_MODERATE = 14000      # UPDATED: A value indicating steady rain.
# Any value below RAIN_MODERATE will be considered "Heavy Rain".

# --- 6. Gas Sensor (MQ135) Calibration ---
# IMPORTANT: Find this value by running the sensor in fresh, clean outdoor air for 20-30 mins
# and recording the stable "Rs" value from the console.
# Your clean air ADC reading was 395. This calculates to an R0 of ~664.75 kOhms.
# NOTE: This value is unusually high. Please double-check that the sensor was fully warmed up (20-30 mins)
# in clean outdoor air before taking the reading. If results seem incorrect, re-calibrate.
MQ135_R0 = 664.75  # UPDATED: Resistance in clean air (kOhms), calculated from your ADC value.

# --- 7. NPK Sensor Calibration & Thresholds for Amaranthus ---
# Calibrate against a lab test if possible: OFFSET = (Lab Value - Sensor Value)
NPK_CALIBRATION_OFFSETS = {"N": 0, "P": 0, "K": 0}
# UPDATED: Nutrient thresholds specifically for Amaranthus, based on the
# Sri Lankan Department of Agriculture (DOA) recommendations in the provided guide.
# These values are in mg/kg.
NPK_THRESHOLDS = {
    # Amaranthus has a high nitrogen demand for leafy growth. The DOA recommends
    # a total of 170 kg/ha of Urea (a nitrogen fertilizer).
    "N": {"low": 60, "optimal": 120},

    # Phosphorus is essential for root development. The DOA recommends 130 kg/ha of TSP.
    "P": {"low": 25, "optimal": 50},

    # Potassium supports overall plant health and resilience. The DOA recommends 100 kg/ha of MOP.
    "K": {"low": 50, "optimal": 100}
}

# =================================================================================
# --- SENSOR HARDWARE AND COMMUNICATION SETUP ---
# =================================================================================

#<editor-fold desc="Sensor Reading and Helper Functions">
# --- BMP180 Barometric Pressure Sensor Functions ---
BMP180_I2C_ADDRESS = 0x77
BMP180_REG_CONTROL = 0xF4
BMP180_REG_RESULT = 0xF6
BMP180_COMMAND_TEMP = 0x2E
BMP180_COMMAND_PRESSURE = 0x34

def read_signed_16bit(bus, register):
    msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, register, 2)
    value = (msb << 8) + lsb
    return value - 65536 if value > 32767 else value

def read_unsigned_16bit(bus, register):
    msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, register, 2)
    return (msb << 8) + lsb

def read_calibration_data(bus):
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
    bus.write_byte_data(BMP180_I2C_ADDRESS, BMP180_REG_CONTROL, BMP180_COMMAND_TEMP)
    time.sleep(0.005)
    msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, BMP180_REG_RESULT, 2)
    return (msb << 8) + lsb

def read_raw_pressure(bus):
    bus.write_byte_data(BMP180_I2C_ADDRESS, BMP180_REG_CONTROL, BMP180_COMMAND_PRESSURE)
    time.sleep(0.005)
    msb, lsb, xlsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, BMP180_REG_RESULT, 3)
    return ((msb << 16) + (lsb << 8) + xlsb) >> 8

def calculate_true_values(calib, raw_temp, raw_pressure):
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

# --- DS18B20 Temperature Sensor Functions (Linux 1-Wire) ---
BASE_DIR = "/sys/bus/w1/devices/"

def find_working_ds18b20_sensor():
    try:
        devices = os.listdir(BASE_DIR)
        for d in devices:
            if d.startswith("28-"):
                temp_path = os.path.join(BASE_DIR, d, "temperature")
                if os.path.exists(temp_path): return temp_path
                w1_slave_path = os.path.join(BASE_DIR, d, "w1_slave")
                if os.path.exists(w1_slave_path): return w1_slave_path
    except Exception:
        pass
    return None

def read_ds18b20_temperature(sensor_path):
    try:
        with open(sensor_path, "r") as f:
            content = f.read().strip()
        if not content: return None
        if sensor_path.endswith("temperature"):
            temp_c = float(content) / 1000.0
        else:
            lines = content.split('\n')
            if len(lines) < 2 or lines[0].strip()[-3:] != "YES" or "t=" not in lines[1]:
                return None
            temp_str = lines[1].split("t=")[-1]
            temp_c = float(temp_str) / 1000.0
        return temp_c if -55 <= temp_c <= 125 else None
    except Exception:
        return None

# --- Hardware Initialization ---
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS.ADS1115(i2c, address=0x48)
dht_sensor = adafruit_dht.DHT22(board.D17)

ds18_sensor_path = find_working_ds18b20_sensor()
if ds18_sensor_path: print(f"DS18B20 sensor found at: {ds18_sensor_path}")
else: print("No DS18B20 sensor found")

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
VCC = 5.0; RL = 10.0
GAS_CALIBRATION = {
    'CO2': {'a': 116.6020682, 'b': -2.769034857},
    'NH3': {'a': 102.2, 'b': -2.473},
    'VOC': {'a': 110.47, 'b': -2.854}
}
#</editor-fold>

# =================================================================================
# --- DATA STORAGE AND THINGSPeAK MAPPING ---
# =================================================================================

data = {
    'timestamp': None, 'air_temp_c': 'N/A', 'humidity_percent': 'N/A',
    'water_soil_temp_c': 'N/A', 'air_pressure_hpa': 'N/A', 'air_pressure_status': 'N/A',
    'soil_moisture_raw': 'N/A', 'soil_moisture_status': 'N/A',
    'light_level_raw': 'N/A', 'light_level_status': 'N/A',
    'rain_level_raw': 'N/A', 'rain_level_status': 'N/A',
    'co2_ppm': 'N/A', 'nh3_ppm': 'N/A', 'voc_ppm': 'N/A',
    'nitrogen_mg_kg': 'N/A', 'nitrogen_status': 'N/A',
    'phosphorus_mg_kg': 'N/A', 'phosphorus_status': 'N/A',
    'potassium_mg_kg': 'N/A', 'potassium_status': 'N/A'
}
i2c_lock = threading.Lock()
serial_lock = threading.Lock()

thingspeak_field_mapping = {
    'air_temp_c': 'field1', 'humidity_percent': 'field2',
    'water_soil_temp_c': 'field3', 'soil_moisture_raw': 'field4',
    'light_level_raw': 'field5', 'nitrogen_mg_kg': 'field6',
    'phosphorus_mg_kg': 'field7', 'potassium_mg_kg': 'field8',
}

# =================================================================================
# --- SENSOR READING AND INTERPRETATION THREADS ---
# =================================================================================

#<editor-fold desc="Sensor Reading Threads">
def read_bmp180():
    while True:
        with i2c_lock:
            try:
                raw_temp = read_raw_temp(bus)
                raw_pressure = read_raw_pressure(bus)
                _, pressure_raw = calculate_true_values(calib, raw_temp, raw_pressure)
                pressure_calibrated = pressure_raw + AIR_PRESSURE_OFFSET
                data['air_pressure_hpa'] = f"{pressure_calibrated:.2f}"
                
                # NEW: Interpret pressure status
                if pressure_calibrated < AIR_PRESSURE_THRESHOLDS["low"]:
                    status = "Low (Unsettled)"
                elif pressure_calibrated > AIR_PRESSURE_THRESHOLDS["high"]:
                    status = "High (Stable)"
                else:
                    status = "Normal"
                data['air_pressure_status'] = status

            except Exception as e:
                data['air_pressure_hpa'] = 'N/A'
                data['air_pressure_status'] = 'N/A'
        time.sleep(5)

def read_dht22():
    while True:
        try:
            temperature_raw = dht_sensor.temperature
            humidity = dht_sensor.humidity
            if temperature_raw is not None and humidity is not None:
                data['air_temp_c'] = f"{(temperature_raw + TEMP_OFFSET):.2f}"
                data['humidity_percent'] = f"{humidity:.2f}"
            else:
                data['air_temp_c'], data['humidity_percent'] = 'N/A', 'N/A'
        except Exception as e:
            data['air_temp_c'], data['humidity_percent'] = 'N/A', 'N/A'
        time.sleep(5)

def read_ds18b20():
    while True:
        if ds18_sensor_path:
            try:
                temp_raw = read_ds18b20_temperature(ds18_sensor_path)
                if temp_raw is not None:
                    data['water_soil_temp_c'] = f"{(temp_raw + DS18B20_OFFSET):.2f}"
                else:
                    data['water_soil_temp_c'] = 'N/A'
            except Exception as e:
                data['water_soil_temp_c'] = 'N/A'
        else:
            data['water_soil_temp_c'] = 'N/A'
        time.sleep(5)

def read_soil_moisture():
    while True:
        with i2c_lock:
            try:
                raw_value = moisture_channel.value
                data['soil_moisture_raw'] = str(raw_value)
                if raw_value > SOIL_THRESHOLDS["low"]: status = "Dry"
                elif raw_value > SOIL_THRESHOLDS["optimal"]: status = "Optimal"
                else: status = "Wet"
                data['soil_moisture_status'] = status
            except Exception as e:
                data['soil_moisture_raw'], data['soil_moisture_status'] = 'N/A', 'N/A'
        time.sleep(5)

def read_ldr():
    while True:
        with i2c_lock:
            try:
                raw_value = ldr_channel.value
                data['light_level_raw'] = str(raw_value)
                if raw_value > LDR_VERY_DARK: status = "Very Dark"
                elif raw_value > LDR_LOW_LIGHT: status = "Low Light"
                elif raw_value > LDR_MEDIUM_LIGHT: status = "Medium Light"
                else: status = "Bright Light"
                data['light_level_status'] = status
            except Exception as e:
                data['light_level_raw'], data['light_level_status'] = 'N/A', 'N/A'
        time.sleep(5)

def read_mq135():
    while True:
        with i2c_lock:
            try:
                voltage = mq135_channel.voltage
                rs = (VCC - voltage) / voltage * RL if voltage > 0 else float('inf')
                ratio = rs / MQ135_R0 if MQ135_R0 > 0 else float('inf')
                data['co2_ppm'] = f"{GAS_CALIBRATION['CO2']['a'] * (abs(ratio) ** GAS_CALIBRATION['CO2']['b']):.2f}"
                data['nh3_ppm'] = f"{GAS_CALIBRATION['NH3']['a'] * (abs(ratio) ** GAS_CALIBRATION['NH3']['b']):.2f}"
                data['voc_ppm'] = f"{GAS_CALIBRATION['VOC']['a'] * (abs(ratio) ** GAS_CALIBRATION['VOC']['b']):.2f}"
            except Exception as e:
                data['co2_ppm'], data['nh3_ppm'], data['voc_ppm'] = 'N/A', 'N/A', 'N/A'
        time.sleep(5)

def calculate_crc(data_bytes):
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
    queries = {"N": b"\x01\x03\x00\x1E\x00\x01", "P": b"\x01\x03\x00\x1F\x00\x01", "K": b"\x01\x03\x00\x20\x00\x01"}
    data_keys = {'N': ('nitrogen_mg_kg', 'nitrogen_status'), 'P': ('phosphorus_mg_kg', 'phosphorus_status'), 'K': ('potassium_mg_kg', 'potassium_status')}
    while True:
        with serial_lock:
            if ser:
                try:
                    for nutrient, (value_key, status_key) in data_keys.items():
                        full_query = queries[nutrient] + calculate_crc(queries[nutrient])
                        ser.write(full_query)
                        time.sleep(0.2)
                        response = ser.read(7)
                        if len(response) >= 7:
                            raw_value = int.from_bytes(response[3:5], byteorder='big')
                            calibrated_value = raw_value + NPK_CALIBRATION_OFFSETS[nutrient]
                            data[value_key] = str(calibrated_value)
                            if calibrated_value < NPK_THRESHOLDS[nutrient]["low"]: status = "Low"
                            elif calibrated_value <= NPK_THRESHOLDS[nutrient]["optimal"]: status = "Optimal"
                            else: status = "High"
                            data[status_key] = status
                        else:
                            data[value_key], data[status_key] = 'N/A', 'N/A'
                        time.sleep(1)
                except Exception as e:
                    for _, (value_key, status_key) in data_keys.items(): data[value_key], data[status_key] = 'N/A', 'N/A'
            else:
                for _, (value_key, status_key) in data_keys.items(): data[value_key], data[status_key] = 'N/A', 'N/A'
        time.sleep(5)

def read_rain():
    while True:
        with i2c_lock:
            try:
                raw_value = rain_channel.value
                data['rain_level_raw'] = str(raw_value)
                if raw_value > RAIN_DRY: status = "Dry"
                elif raw_value > RAIN_LIGHT: status = "Light Rain"
                elif raw_value > RAIN_MODERATE: status = "Moderate Rain"
                else: status = "Heavy Rain"
                data['rain_level_status'] = status
            except Exception as e:
                data['rain_level_raw'], data['rain_level_status'] = 'N/A', 'N/A'
        time.sleep(5)
#</editor-fold>

# =================================================================================
# --- MAIN APPLICATION LOGIC ---
# =================================================================================

def start_sensor_threads():
    threads = [
        threading.Thread(target=read_bmp180, daemon=True), threading.Thread(target=read_dht22, daemon=True),
        threading.Thread(target=read_ds18b20, daemon=True), threading.Thread(target=read_soil_moisture, daemon=True),
        threading.Thread(target=read_ldr, daemon=True), threading.Thread(target=read_mq135, daemon=True),
        threading.Thread(target=read_npk, daemon=True), threading.Thread(target=read_rain, daemon=True)
    ]
    for t in threads:
        t.start()
    print("All sensor threads started.")

def send_to_thingspeak(api_key, sensor_data):
    base_url = "https://api.thingspeak.com/update"
    payload = {'api_key': api_key}
    for key, field in thingspeak_field_mapping.items():
        if key in sensor_data and sensor_data[key] != 'N/A':
            try:
                payload[field] = float(sensor_data[key])
            except (ValueError, TypeError):
                print(f"Warning: Could not convert '{sensor_data[key]}' for {key}. Skipping.")
    if len(payload) <= 1:
        print("No valid numeric data to send to ThingSpeak.")
        return
    try:
        response = requests.get(base_url, params=payload, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        response_text = response.text
        if response_text != "0":
            print(f"Data sent to ThingSpeak. Entry ID: {response_text}")
        else:
            print(f"Failed to send to ThingSpeak. Response: {response_text} (Code: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"Error sending data to ThingSpeak: {e}")

# NEW: Function to log data to a local CSV file
def log_to_csv(file_path, data_dict):
    """Appends a row of sensor data to the specified CSV file."""
    # Define the order of columns for the CSV file
    csv_columns = [
        'timestamp', 'air_temp_c', 'humidity_percent', 'water_soil_temp_c', 
        'air_pressure_hpa', 'air_pressure_status', # Added status column
        'soil_moisture_raw', 'soil_moisture_status', 'light_level_raw', 'light_level_status',
        'rain_level_raw', 'rain_level_status', 'co2_ppm', 'nh3_ppm', 'voc_ppm', 'nitrogen_mg_kg',
        'nitrogen_status', 'phosphorus_mg_kg', 'phosphorus_status', 'potassium_mg_kg', 'potassium_status'
    ]
    
    try:
        # Check if the file exists to determine if we need to write the header
        file_exists = os.path.isfile(file_path)
        
        with open(file_path, mode='a', newline='') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=csv_columns)
            
            # If the file is new, write the header row first
            if not file_exists:
                writer.writeheader()
            
            # Write the sensor data row
            writer.writerow({k: data_dict.get(k, 'N/A') for k in csv_columns})
        
        print(f"Data successfully logged to {file_path}")

    except IOError as e:
        print(f"Error logging data to CSV file: {e}")


def main():
    print("Starting sensor data collection...")
    start_sensor_threads()
    
    # Allow sensors some time to initialize (2 seconds)
    print("Allowing sensors to initialize...")
    time.sleep(2)
    
    try:
        # Collect and send data immediately on startup
        print("Collecting initial sensor readings...")
        data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        data_copy = data.copy()
        
        print("\n" + "=" * 50)
        print(f"INITIAL Readings at {data_copy['timestamp']}")
        print("=" * 50)
        # Print all current readings and their status to the console
        print(f"Air Temperature: {data_copy.get('air_temp_c', 'N/A')} C")
        print(f"Air Humidity: {data_copy.get('humidity_percent', 'N/A')} %")
        print(f"Water/Soil Temperature: {data_copy.get('water_soil_temp_c', 'N/A')} C")
        print(f"Air Pressure: {data_copy.get('air_pressure_hpa', 'N/A')} hPa (Status: {data_copy.get('air_pressure_status', 'N/A')})") # Updated Print
        print(f"Soil Moisture: {data_copy.get('soil_moisture_raw', 'N/A')} (Status: {data_copy.get('soil_moisture_status', 'N/A')})")
        print(f"Light Level: {data_copy.get('light_level_raw', 'N/A')} (Status: {data_copy.get('light_level_status', 'N/A')})")
        print(f"Rain Level: {data_copy.get('rain_level_raw', 'N/A')} (Status: {data_copy.get('rain_level_status', 'N/A')})")
        print(f"Nitrogen (N): {data_copy.get('nitrogen_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('nitrogen_status', 'N/A')})")
        print(f"Phosphorus (P): {data_copy.get('phosphorus_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('phosphorus_status', 'N/A')})")
        print(f"Potassium (K): {data_copy.get('potassium_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('potassium_status', 'N/A')})")
        print(f"CO2: {data_copy.get('co2_ppm', 'N/A')} ppm | NH3: {data_copy.get('nh3_ppm', 'N/A')} ppm | VOC: {data_copy.get('voc_ppm', 'N/A')} ppm")
        print("-" * 50)
        
        # --- Send initial data to both destinations ---
        send_to_thingspeak(THINGSPEAK_API_KEY, data_copy)
        log_to_csv(CSV_LOG_FILE, data_copy)
        
        print("Initial data collection complete. Starting 5-minute interval loop...")
        
        # Continue with regular 5-minute intervals
        while True:
            time.sleep(300) # Wait 5 minutes (300 seconds) before next collection
            data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            data_copy = data.copy()
            
            print("\n" + "=" * 50)
            print(f"Readings at {data_copy['timestamp']}")
            print("=" * 50)
            # Print all current readings and their status to the console
            print(f"Air Temperature: {data_copy.get('air_temp_c', 'N/A')} C")
            print(f"Air Humidity: {data_copy.get('humidity_percent', 'N/A')} %")
            print(f"Water/Soil Temperature: {data_copy.get('water_soil_temp_c', 'N/A')} C")
            print(f"Air Pressure: {data_copy.get('air_pressure_hpa', 'N/A')} hPa (Status: {data_copy.get('air_pressure_status', 'N/A')})") # Updated Print
            print(f"Soil Moisture: {data_copy.get('soil_moisture_raw', 'N/A')} (Status: {data_copy.get('soil_moisture_status', 'N/A')})")
            print(f"Light Level: {data_copy.get('light_level_raw', 'N/A')} (Status: {data_copy.get('light_level_status', 'N/A')})")
            print(f"Rain Level: {data_copy.get('rain_level_raw', 'N/A')} (Status: {data_copy.get('rain_level_status', 'N/A')})")
            print(f"Nitrogen (N): {data_copy.get('nitrogen_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('nitrogen_status', 'N/A')})")
            print(f"Phosphorus (P): {data_copy.get('phosphorus_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('phosphorus_status', 'N/A')})")
            print(f"Potassium (K): {data_copy.get('potassium_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('potassium_status', 'N/A')})")
            print(f"CO2: {data_copy.get('co2_ppm', 'N/A')} ppm | NH3: {data_copy.get('nh3_ppm', 'N/A')} ppm | VOC: {data_copy.get('voc_ppm', 'N/A')} ppm")
            print("-" * 50)
            
            # --- Send data to both destinations ---
            send_to_thingspeak(THINGSPEAK_API_KEY, data_copy)
            log_to_csv(CSV_LOG_FILE, data_copy)

    except KeyboardInterrupt:
        print("\nProgram stopped by user.")
    finally:
        if ser and ser.is_open:
            ser.close()
            print("Serial port closed.")
        print("Exiting application.")

if __name__ == "__main__":
    main()
