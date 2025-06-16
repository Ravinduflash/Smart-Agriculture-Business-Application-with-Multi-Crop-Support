import serial
import time
import binascii

import serial
import time
import binascii

# Configure RS485 communication
try:
    ser = serial.Serial('/dev/ttyUSB0', 4800, timeout=5)  # Changed baud rate to 4800
    print("Serial port opened successfully.")
except Exception as e:
    print(f"Error opening serial port: {e}")
    exit(1)

# Function to calculate CRC16 for Modbus
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

# Continuously read NPK values in real-time
while True:
    try:
        # Queries for N, P, and K
        queries = {
            "N": b"\x01\x03\x00\x1E\x00\x01",
            "P": b"\x01\x03\x00\x1F\x00\x01",
            "K": b"\x01\x03\x00\x20\x00\x01"
        }

        results = {}

        for nutrient, query in queries.items():
            crc = calculate_crc(query)
            full_query = query + crc
            print(f"Sending query for {nutrient}: {binascii.hexlify(full_query)}")
            ser.write(full_query)
            time.sleep(0.1)  # Small delay to allow sensor to respond

            # Read response
            response = ser.read(7)  # Adjust expected response length if needed
            if response:
                print(f"Raw Sensor Data for {nutrient}: {binascii.hexlify(response)}")
                # Updated nitrogen calculation based on the user guide example
                if len(response) >= 7:
                    data = response[3:5]  # Extract data bytes
                    value = int.from_bytes(data, byteorder='big')
                    if nutrient == "N":
                        results[nutrient] = value  # Nitrogen content in mg/kg
                    elif nutrient == "P":
                        results[nutrient] = value  # Phosphorus content in mg/kg
                    elif nutrient == "K":
                        results[nutrient] = value  # Potassium content in mg/kg
                else:
                    print(f"Incomplete response for {nutrient}.")
            else:
                print(f"No response received for {nutrient}. Check connections and query.")

        # Print results
        print(f"N: {results.get('N', 'N/A')} mg/kg, P: {results.get('P', 'N/A')} mg/kg, K: {results.get('K', 'N/A')} mg/kg")
        time.sleep(2)  # Wait 2 seconds before the next set of queries

    except Exception as e:
        print(f"Error during communication: {e}")
    time.sleep(2)
