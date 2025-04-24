import serial
import time
import binascii

# Configure RS485 communication
try:
    ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=5)  # Increased timeout to 5 seconds
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

# Send Modbus query
try:
    query = b'\x01\x03\x00\x00\x00\x02'  # Modbus query without CRC
    crc = calculate_crc(query)
    full_query = query + crc
    print(f"Sending query: {binascii.hexlify(full_query)}")
    ser.write(full_query)
    time.sleep(0.1)  # Small delay to allow sensor to respond

    # Read response
    response = ser.read(9)  # Adjust expected response length if needed
    if response:
        print(f"Raw Sensor Data: {binascii.hexlify(response)}")
        # Parse response (example for Modbus function 0x03)
        if len(response) >= 7:
            address = response[0]
            function = response[1]
            byte_count = response[2]
            data = response[3:3+byte_count]
            crc_received = response[-2:]
            crc_calculated = calculate_crc(response[:-2])

            if crc_received == crc_calculated:
                print(f"Parsed Data: {binascii.hexlify(data)}")
            else:
                print("CRC check failed. Invalid response.")
        else:
            print("Incomplete response received.")
    else:
        print("No response received from sensor. Check connections and query.")
except Exception as e:
    print(f"Error during communication: {e}")
finally:
    ser.close()
    print("Serial port closed.")
