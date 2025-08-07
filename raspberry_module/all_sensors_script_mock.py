# Import necessary libraries
import threading
import time
from datetime import datetime
import random
import os
import urllib.request
import urllib.parse
import csv

# =================================================================================
# --- MOCK SCRIPT CONFIGURATION ---
# =================================================================================
# This script simulates the behavior of all_sensors_script_new.py for testing
# purposes on a machine without the actual Raspberry Pi hardware.

# --- Local Data Logging Configuration ---
CSV_LOG_FILE = "sensor_log_mock.csv" # Use a different log file for mock data

# --- ThingSpeak Configuration ---
THINGSPEAK_API_KEY = "YOUR_THINGSPEAK_API_KEY" # Replace with your key if testing ThingSpeak

# --- Thresholds (copied from original script for consistent status logic) ---
AIR_PRESSURE_THRESHOLDS = {"low": 1005, "high": 1015}
SOIL_THRESHOLDS = {"low": 23000, "optimal": 16000}
LDR_VERY_DARK = 22000
LDR_LOW_LIGHT = 17000
LDR_MEDIUM_LIGHT = 8000
RAIN_DRY = 25000
RAIN_LIGHT = 18000
RAIN_MODERATE = 14000
NPK_THRESHOLDS = {
    "N": {"low": 60, "optimal": 120},
    "P": {"low": 25, "optimal": 50},
    "K": {"low": 50, "optimal": 100}
}

# =================================================================================
# --- MOCK SENSOR DATA GENERATION ---
# =================================================================================

def get_mock_air_temp():
    return round(random.uniform(28.0, 32.0), 2)

def get_mock_humidity():
    return round(random.uniform(60.0, 80.0), 2)

def get_mock_soil_temp():
    return round(random.uniform(25.0, 29.0), 2)

def get_mock_air_pressure():
    return round(random.uniform(1000.0, 1020.0), 2)

def get_mock_soil_moisture():
    return random.randint(12000, 26000)

def get_mock_ldr():
    return random.randint(5000, 26000)

def get_mock_rain():
    return random.randint(13000, 26000)

def get_mock_gas_ppm(gas_type='CO2'):
    if gas_type == 'CO2':
        return round(random.uniform(400, 800), 2)
    elif gas_type == 'NH3':
        return round(random.uniform(1, 10), 2)
    elif gas_type == 'VOC':
        return round(random.uniform(0.1, 1.0), 2)

def get_mock_npk(nutrient):
    if nutrient == 'N':
        return random.randint(50, 130)
    elif nutrient == 'P':
        return random.randint(20, 60)
    elif nutrient == 'K':
        return random.randint(40, 110)

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

thingspeak_field_mapping = {
    'air_temp_c': 'field1', 'humidity_percent': 'field2',
    'water_soil_temp_c': 'field3', 'soil_moisture_raw': 'field4',
    'light_level_raw': 'field5', 'nitrogen_mg_kg': 'field6',
    'phosphorus_mg_kg': 'field7', 'potassium_mg_kg': 'field8',
}

# =================================================================================
# --- MOCK SENSOR READING THREADS ---
# =================================================================================

def read_bmp180():
    while True:
        pressure_calibrated = get_mock_air_pressure()
        data['air_pressure_hpa'] = f"{pressure_calibrated:.2f}"
        if pressure_calibrated < AIR_PRESSURE_THRESHOLDS["low"]:
            status = "Low (Unsettled)"
        elif pressure_calibrated > AIR_PRESSURE_THRESHOLDS["high"]:
            status = "High (Stable)"
        else:
            status = "Normal"
        data['air_pressure_status'] = status
        time.sleep(5)

def read_dht22():
    while True:
        data['air_temp_c'] = f"{get_mock_air_temp():.2f}"
        data['humidity_percent'] = f"{get_mock_humidity():.2f}"
        time.sleep(5)

def read_ds18b20():
    while True:
        data['water_soil_temp_c'] = f"{get_mock_soil_temp():.2f}"
        time.sleep(5)

def read_soil_moisture():
    while True:
        raw_value = get_mock_soil_moisture()
        data['soil_moisture_raw'] = str(raw_value)
        if raw_value > SOIL_THRESHOLDS["low"]: status = "Dry"
        elif raw_value > SOIL_THRESHOLDS["optimal"]: status = "Optimal"
        else: status = "Wet"
        data['soil_moisture_status'] = status
        time.sleep(5)

def read_ldr():
    while True:
        raw_value = get_mock_ldr()
        data['light_level_raw'] = str(raw_value)
        if raw_value > LDR_VERY_DARK: status = "Very Dark"
        elif raw_value > LDR_LOW_LIGHT: status = "Low Light"
        elif raw_value > LDR_MEDIUM_LIGHT: status = "Medium Light"
        else: status = "Bright Light"
        data['light_level_status'] = status
        time.sleep(5)

def read_mq135():
    while True:
        data['co2_ppm'] = f"{get_mock_gas_ppm('CO2'):.2f}"
        data['nh3_ppm'] = f"{get_mock_gas_ppm('NH3'):.2f}"
        data['voc_ppm'] = f"{get_mock_gas_ppm('VOC'):.2f}"
        time.sleep(5)

def read_npk():
    while True:
        for nutrient, (value_key, status_key) in [
            ('N', ('nitrogen_mg_kg', 'nitrogen_status')),
            ('P', ('phosphorus_mg_kg', 'phosphorus_status')),
            ('K', ('potassium_mg_kg', 'potassium_status'))
        ]:
            calibrated_value = get_mock_npk(nutrient)
            data[value_key] = str(calibrated_value)
            if calibrated_value < NPK_THRESHOLDS[nutrient]["low"]: status = "Low"
            elif calibrated_value <= NPK_THRESHOLDS[nutrient]["optimal"]: status = "Optimal"
            else: status = "High"
            data[status_key] = status
        time.sleep(5)

def read_rain():
    while True:
        raw_value = get_mock_rain()
        data['rain_level_raw'] = str(raw_value)
        if raw_value > RAIN_DRY: status = "Dry"
        elif raw_value > RAIN_LIGHT: status = "Light Rain"
        elif raw_value > RAIN_MODERATE: status = "Moderate Rain"
        else: status = "Heavy Rain"
        data['rain_level_status'] = status
        time.sleep(5)

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
    print("All MOCK sensor threads started.")

def send_to_thingspeak(api_key, sensor_data):
    # This function is kept for testing the payload construction and URL encoding
    # but does not actually send data in this mock script.
    # To enable sending, uncomment the 'urllib.request.urlopen' line.
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
    
    params = urllib.parse.urlencode(payload)
    full_url = f"{base_url}?{params}"
    print(f"MOCK ThingSpeak URL: {full_url}")
    # try:
    #     with urllib.request.urlopen(full_url, timeout=10) as response:
    #         response_text = response.read().decode('utf-8')
    #         if response.status == 200 and response_text != "0":
    #             print(f"Data sent to ThingSpeak. Entry ID: {response_text}")
    #         else:
    #             print(f"Failed to send to ThingSpeak. Response: {response_text} (Code: {response.status})")
    # except Exception as e:
    #     print(f"Error sending data to ThingSpeak: {e}")

def log_to_csv(file_path, data_dict):
    csv_columns = [
        'timestamp', 'air_temp_c', 'humidity_percent', 'water_soil_temp_c', 
        'air_pressure_hpa', 'air_pressure_status',
        'soil_moisture_raw', 'soil_moisture_status', 'light_level_raw', 'light_level_status',
        'rain_level_raw', 'rain_level_status', 'co2_ppm', 'nh3_ppm', 'voc_ppm', 'nitrogen_mg_kg',
        'nitrogen_status', 'phosphorus_mg_kg', 'phosphorus_status', 'potassium_mg_kg', 'potassium_status'
    ]
    try:
        file_exists = os.path.isfile(file_path)
        with open(file_path, mode='a', newline='') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=csv_columns)
            if not file_exists:
                writer.writeheader()
            writer.writerow({k: data_dict.get(k, 'N/A') for k in csv_columns})
        print(f"Data successfully logged to {file_path}")
    except IOError as e:
        print(f"Error logging data to CSV file: {e}")

def main():
    print("Starting MOCK sensor data collection...")
    start_sensor_threads()
    
    print("Allowing MOCK sensors to initialize...")
    time.sleep(2)
    
    try:
        while True:
            data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            data_copy = data.copy()
            
            print("\n" + "=" * 50)
            print(f"MOCK Readings at {data_copy['timestamp']}")
            print("=" * 50)
            print(f"Air Temperature: {data_copy.get('air_temp_c', 'N/A')} C")
            print(f"Air Humidity: {data_copy.get('humidity_percent', 'N/A')} %")
            print(f"Water/Soil Temperature: {data_copy.get('water_soil_temp_c', 'N/A')} C")
            print(f"Air Pressure: {data_copy.get('air_pressure_hpa', 'N/A')} hPa (Status: {data_copy.get('air_pressure_status', 'N/A')})")
            print(f"Soil Moisture: {data_copy.get('soil_moisture_raw', 'N/A')} (Status: {data_copy.get('soil_moisture_status', 'N/A')})")
            print(f"Light Level: {data_copy.get('light_level_raw', 'N/A')} (Status: {data_copy.get('light_level_status', 'N/A')})")
            print(f"Rain Level: {data_copy.get('rain_level_raw', 'N/A')} (Status: {data_copy.get('rain_level_status', 'N/A')})")
            print(f"Nitrogen (N): {data_copy.get('nitrogen_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('nitrogen_status', 'N/A')})")
            print(f"Phosphorus (P): {data_copy.get('phosphorus_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('phosphorus_status', 'N/A')})")
            print(f"Potassium (K): {data_copy.get('potassium_mg_kg', 'N/A')} mg/kg (Status: {data_copy.get('potassium_status', 'N/A')})")
            print(f"CO2: {data_copy.get('co2_ppm', 'N/A')} ppm | NH3: {data_copy.get('nh3_ppm', 'N/A')} ppm | VOC: {data_copy.get('voc_ppm', 'N/A')} ppm")
            print("-" * 50)
            
            send_to_thingspeak(THINGSPEAK_API_KEY, data_copy)
            log_to_csv(CSV_LOG_FILE, data_copy)
            
            print("Next reading in 15 seconds (shortened for testing)...")
            time.sleep(15)

    except KeyboardInterrupt:
        print("\nProgram stopped by user.")
    finally:
        print("Exiting MOCK application.")

if __name__ == "__main__":
    main()
