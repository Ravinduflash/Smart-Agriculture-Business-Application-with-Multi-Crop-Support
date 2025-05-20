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
import adafruit_ds18x20
from adafruit_onewire.bus import OneWireBus
import binascii
import urllib.request
import urllib.parse
from raspberry_module.config import THINGSPEAK_API_KEY

# BMP180 Functions
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
    X2 = (calib['MC'] << 11) // (X1 + calib['MD'])
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
    pressure = (B7 * 2) // B4 if B7 < 0x80000000 else (B7 // B4) * 2
    X1 = (pressure >> 8) * (pressure >> 8)
    X1 = (X1 * 3038) >> 16
    X2 = (-7357 * pressure) >> 16
    pressure = pressure + ((X1 + X2 + 3791) >> 4)
    pressure = pressure / 100.0
    return temperature, pressure

def calculate_altitude(pressure, sea_level_pressure=1012.0):
    return 44330.0 * (1.0 - (pressure / sea_level_pressure) ** (1 / 5.255))

# Initialize Hardware
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS.ADS1115(i2c)
dht_sensor = adafruit_dht.DHT22(board.D4)
ow_bus = OneWireBus(board.D4)
devices = ow_bus.scan()
ds18 = adafruit_ds18x20.DS18X20(ow_bus, devices[0]) if devices else None
bus = SMBus(1)
calib = read_calibration_data(bus)
try:
    ser = serial.Serial('/dev/ttyUSB1', 4800, timeout=5)
except Exception:
    ser = None
moisture_channel = AnalogIn(ads, ADS.P0)
ldr_channel = AnalogIn(ads, ADS.P1)
mq135_channel = AnalogIn(ads, ADS.P2)
rain_channel = AnalogIn(ads, ADS.P3)

# MQ135 Calibration Constants
VCC = 5.0
RL = 10.0
R0 = 76.63
GAS_CALIBRATION = {
    'CO2': {'a': 116.6020682, 'b': -2.769034857},
    'NH3': {'a': 102.2, 'b': -2.473},
    'VOC': {'a': 110.47, 'b': -2.854}
}

# Shared Data Dictionary
data = {
    'timestamp': None,
    'bmp180_temp': 'N/A',
    'dht22_temp': 'N/A',
    'humidity': 'N/A',
    'ds18b20_temp': 'N/A',
    'pressure': 'N/A',
    'altitude': 'N/A',
    'soil_moisture_raw': 'N/A',
    'light_raw': 'N/A',
    'co2': 'N/A',
    'nh3': 'N/A',
    'voc': 'N/A',
    'n': 'N/A',
    'p': 'N/A',
    'k': 'N/A',
    'rain_raw': 'N/A'
}

# ThingSpeak Field Mapping
thingspeak_field_mapping = {
    'bmp180_temp': 'field1',
    'dht22_temp': 'field2',
    'humidity': 'field3',
    'pressure': 'field4',
    'soil_moisture_raw': 'field5',
    'light_raw': 'field6',
    'co2': 'field7',
    'n': 'field8'
}

# Locks
i2c_lock = threading.Lock()
serial_lock = threading.Lock()

# Sensor Reading Functions
def read_bmp180():
    while True:
        with i2c_lock:
            try:
                raw_temp = read_raw_temp(bus)
                raw_pressure = read_raw_pressure(bus)
                temperature, pressure = calculate_true_values(calib, raw_temp, raw_pressure)
                altitude = calculate_altitude(pressure)
                data['bmp180_temp'] = f"{temperature:.2f}"
                data['pressure'] = f"{pressure:.2f}"
                data['altitude'] = f"{altitude:.2f}"
            except Exception:
                data['bmp180_temp'] = 'N/A'
                data['pressure'] = 'N/A'
                data['altitude'] = 'N/A'
        time.sleep(2)

def read_dht22():
    while True:
        try:
            temperature = dht_sensor.temperature
            humidity = dht_sensor.humidity
            if temperature is not None and humidity is not None:
                data['dht22_temp'] = f"{temperature:.2f}"
                data['humidity'] = f"{humidity:.2f}"
            else:
                data['dht22_temp'] = 'N/A'
                data['humidity'] = 'N/A'
        except Exception:
            data['dht22_temp'] = 'N/A'
            data['humidity'] = 'N/A'
        time.sleep(2)

def read_ds18b20():
    while True:
        if ds18:
            try:
                temp_c = ds18.temperature
                data['ds18b20_temp'] = f"{temp_c:.2f}"
            except Exception:
                data['ds18b20_temp'] = 'N/A'
        else:
            data['ds18b20_temp'] = 'N/A'
        time.sleep(2)

def read_soil_moisture():
    while True:
        with i2c_lock:
            try:
                raw_value = moisture_channel.value
                data['soil_moisture_raw'] = str(raw_value)
            except Exception:
                data['soil_moisture_raw'] = 'N/A'
        time.sleep(2)

def read_ldr():
    while True:
        with i2c_lock:
            try:
                raw_value = ldr_channel.value
                data['light_raw'] = str(raw_value)
            except Exception:
                data['light_raw'] = 'N/A'
        time.sleep(2)

def read_mq135():
    while True:
        with i2c_lock:
            try:
                voltage = mq135_channel.voltage
                rs = (VCC - voltage) / voltage * RL if voltage > 0 else float('inf')
                ratio = rs / R0 if R0 > 0 else float('inf')
                data['co2'] = f"{GAS_CALIBRATION['CO2']['a'] * (ratio ** GAS_CALIBRATION['CO2']['b']):.2f}"
                data['nh3'] = f"{GAS_CALIBRATION['NH3']['a'] * (ratio ** GAS_CALIBRATION['NH3']['b']):.2f}"
                data['voc'] = f"{GAS_CALIBRATION['VOC']['a'] * (ratio ** GAS_CALIBRATION['VOC']['b']):.2f}"
            except Exception:
                data['co2'] = 'N/A'
                data['nh3'] = 'N/A'
                data['voc'] = 'N/A'
        time.sleep(2)

def calculate_crc(data):
    crc = 0xFFFF
    for pos in data:
        crc ^= pos
        for _ in range(8):
            if (crc & 0x0001) != 0:
                crc >>= 1
                crc ^= 0xA001
            else:
                crc >>= 1
    return crc.to_bytes(2, byteorder='little')

def read_npk():
    queries = {
        "N": b"\x01\x03\x00\x1E\x00\x01",
        "P": b"\x01\x03\x00\x1F\x00\x01",
        "K": b"\x01\x03\x00\x20\x00\x01"
    }
    while True:
        with serial_lock:
            if ser:
                try:
                    for nutrient, query in queries.items():
                        crc = calculate_crc(query)
                        full_query = query + crc
                        ser.write(full_query)
                        time.sleep(0.1)
                        response = ser.read(7)
                        if len(response) >= 7:
                            value = int.from_bytes(response[3:5], byteorder='big')
                            data[nutrient.lower()] = str(value)
                        else:
                            data[nutrient.lower()] = 'N/A'
                except Exception:
                    data['n'] = 'N/A'
                    data['p'] = 'N/A'
                    data['k'] = 'N/A'
            else:
                data['n'] = 'N/A'
                data['p'] = 'N/A'
                data['k'] = 'N/A'
        time.sleep(2)

def read_rain():
    while True:
        with i2c_lock:
            try:
                raw_value = rain_channel.value
                data['rain_raw'] = str(raw_value)
            except Exception:
                data['rain_raw'] = 'N/A'
        time.sleep(2)

# Start Threads
threads = [
    threading.Thread(target=read_bmp180),
    threading.Thread(target=read_dht22),
    threading.Thread(target=read_ds18b20),
    threading.Thread(target=read_soil_moisture),
    threading.Thread(target=read_ldr),
    threading.Thread(target=read_mq135),
    threading.Thread(target=read_npk),
    threading.Thread(target=read_rain)
]

for thread in threads:
    thread.daemon = True
    thread.start()

# Function to send data to ThingSpeak
def send_to_thingspeak(api_key, sensor_data):
    base_url = "https://api.thingspeak.com/update"
    payload = {'api_key': api_key}
    data_to_send_thingspeak = {}

    for key, field in thingspeak_field_mapping.items():
        if key in sensor_data and sensor_data[key] != 'N/A':
            try:
                # Attempt to convert to float if possible, otherwise send as is
                payload[field] = float(sensor_data[key])
            except ValueError:
                # If conversion fails (e.g. for 'N/A' or other strings), skip or handle
                # For now, we skip sending fields that can't be converted to float
                # to avoid ThingSpeak errors for non-numeric data in numeric fields.
                # ThingSpeak expects numbers for most fields.
                # If a field is specifically for status strings, this logic might need adjustment.
                print(f"Warning: Could not convert value '{sensor_data[key]}' for {key} to float. Skipping for ThingSpeak.")
                continue # Skip this field
        # else:
            # print(f"Debug: Key {key} not in sensor_data or is 'N/A'")


    if not any(key.startswith("field") for key in payload):
        print("No valid data to send to ThingSpeak.")
        return

    try:
        params = urllib.parse.urlencode(payload)
        full_url = f"{base_url}?{params}"
        # print(f"Sending data to ThingSpeak: {full_url}") # For debugging
        with urllib.request.urlopen(full_url, timeout=10) as response:
            response_text = response.read().decode('utf-8')
            if response.status == 200 and response_text != "0":
                print(f"Data sent to ThingSpeak successfully. Entry ID: {response_text}")
            else:
                print(f"Failed to send data to ThingSpeak. Response: {response_text} (Status: {response.status})")
    except urllib.error.URLError as e:
        print(f"Error sending data to ThingSpeak: {e.reason}")
    except Exception as e:
        print(f"An unexpected error occurred while sending to ThingSpeak: {e}")


# Main Loop
print("Starting sensor data collection and ThingSpeak updates...")
try:
    while True:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        data['timestamp'] = timestamp

        # Prepare data for ThingSpeak (only the selected 8 fields)
        data_to_send_to_thingspeak = {}
        for key in thingspeak_field_mapping.keys():
            data_to_send_to_thingspeak[key] = data.get(key, 'N/A') # Use .get for safety

        # Also include timestamp in the console output if needed
        current_readings_for_console = f"{data['timestamp']:<20}"
        for key, value in data.items():
            if key != 'timestamp': # Avoid duplicating timestamp
                 current_readings_for_console += f" {key}: {value}"
        print(f"Current readings: {current_readings_for_console}")


        send_to_thingspeak(THINGSPEAK_API_KEY, data_to_send_to_thingspeak)
        
        # Wait for the next cycle. ThingSpeak free plan allows updates every 15 seconds.
        # Sensor reading threads update every 2 seconds.
        # Sending every 15 seconds to respect ThingSpeak limits.
        time.sleep(15)
except KeyboardInterrupt:
    print("Program stopped by user.")
    if ser:
        ser.close()
    print("Exiting application.")