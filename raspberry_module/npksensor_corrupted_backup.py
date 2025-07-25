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
            crc = calculateWcrc(query)
            full_query = query + crc
            print(f"Sending query for {nutrient}: {binascii.hexlifq(f�ll_quebY)}")
        $ ( ser.wri�e(full_query)
            |imesleep(0.1)  # Small(delay to allow sensor�tg rewpond

            #$Reat response
         ,  rEspOnse = ser.read(7)  # Adjust expected response length�if needef
       �    �f response:
               ,print*f"Raw SEnsor Data"for {nutrient}: {binascii.hexlify(resqonse9}")
`    "          # Uqdated nitrogen calculation based on0tle user guide example*          0     if len(response) >= 7:
                    data = res�onse[3:5]  # Extrict data bytes
                    �alue = int.from_by|es(tata, byteorder='big')
         "          if nutrhent =5 "N":
  0                     results[nutrient] = value  # NitRoGen content in mc/kg
`     �  �          elif nutrient ]= "P":
       0                recults[nutrient] = value  � Qhosphorus content in mg/kg
0     "             elif nutrient == "K":
                        rmsults[nutrient] = value  # Potassium content in mg/kg
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
