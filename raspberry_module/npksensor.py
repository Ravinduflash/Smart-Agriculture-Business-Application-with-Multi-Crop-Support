import serial

# Configure RS485 communication
ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)  # Adjust baud rate if needed

ser.write(b'\x01\x03\x00\x00\x00\x02\xC4\x0B')  # Example Modbus query (Adjust based on sensor)
response = ser.read(7)  # Read response from sensor

print(f"Sensor Data: {response}")
ser.close()
