import minimalmodbus

# Configure the instrument
instrument = minimalmodbus.Instrument('/dev/ttyUSB1', 1)  # Port name, slave address
instrument.serial.baudrate = 4800
instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
instrument.serial.stopbits = 1
instrument.serial.bytesize = 8
instrument.serial.timeout = 1  # Timeout in seconds

try:
    # Read data from the sensor (e.g., holding register 0x001E)
    response = instrument.read_register(0x001E, 0, 3)  # Register address, number of decimals, function code
    print(f"Sensor Response: {response}")
except Exception as e:
    print(f"Error: {e}")

# Modbus request: 01 03 00 1E 00 01 E4 0C