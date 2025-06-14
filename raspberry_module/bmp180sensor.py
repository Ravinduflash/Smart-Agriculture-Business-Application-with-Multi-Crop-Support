import time
import sys
from smbus2 import SMBus

# BMP180 default address and registers
BMP180_I2C_ADDRESS = 0x77
BMP180_REG_CONTROL = 0xF4
BMP180_REG_RESULT = 0xF6
BMP180_COMMAND_TEMP = 0x2E
BMP180_COMMAND_PRESSURE = 0x34

# Initialize I2C bus
bus = SMBus(1)

# Read calibration data from the sensor
def read_calibration_data():
    calib = {}
    calib['AC1'] = read_signed_16bit(0xAA)
    calib['AC2'] = read_signed_16bit(0xAC)
    calib['AC3'] = read_signed_16bit(0xAE)
    calib['AC4'] = read_unsigned_16bit(0xB0)
    calib['AC5'] = read_unsigned_16bit(0xB2)
    calib['AC6'] = read_unsigned_16bit(0xB4)
    calib['B1'] = read_signed_16bit(0xB6)
    calib['B2'] = read_signed_16bit(0xB8)
    calib['MB'] = read_signed_16bit(0xBA)
    calib['MC'] = read_signed_16bit(0xBC)
    calib['MD'] = read_signed_16bit(0xBE)
    return calib

def read_signed_16bit(register):
    for attempt in range(3):
        try:
            msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, register, 2)
            value = (msb << 8) + lsb
            return value - 65536 if value > 32767 else value
        except Exception as e:
            print(f"[I2C ERROR] Failed to read signed 16bit from 0x{register:02X} (attempt {attempt+1}/3): {e}", file=sys.stderr)
            time.sleep(0.1)
    raise IOError(f"Failed to read signed 16bit from 0x{register:02X} after 3 attempts.")

def read_unsigned_16bit(register):
    for attempt in range(3):
        try:
            msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, register, 2)
            return (msb << 8) + lsb
        except Exception as e:
            print(f"[I2C ERROR] Failed to read unsigned 16bit from 0x{register:02X} (attempt {attempt+1}/3): {e}", file=sys.stderr)
            time.sleep(0.1)
    raise IOError(f"Failed to read unsigned 16bit from 0x{register:02X} after 3 attempts.")

# Read raw temperature
def read_raw_temp():
    bus.write_byte_data(BMP180_I2C_ADDRESS, BMP180_REG_CONTROL, BMP180_COMMAND_TEMP)
    time.sleep(0.005)  # Wait for measurement
    msb, lsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, BMP180_REG_RESULT, 2)
    return (msb << 8) + lsb

# Read raw pressure
def read_raw_pressure():
    bus.write_byte_data(BMP180_I2C_ADDRESS, BMP180_REG_CONTROL, BMP180_COMMAND_PRESSURE)
    time.sleep(0.005)  # Wait for measurement
    msb, lsb, xlsb = bus.read_i2c_block_data(BMP180_I2C_ADDRESS, BMP180_REG_RESULT, 3)
    return ((msb << 16) + (lsb << 8) + xlsb) >> 8

# Calculate true temperature and pressure
def calculate_true_values(calib, raw_temp, raw_pressure):
    # Calculate true temperature
    X1 = ((raw_temp - calib['AC6']) * calib['AC5']) >> 15
    X2 = (calib['MC'] << 11) // (X1 + calib['MD'])
    B5 = X1 + X2
    temperature = (B5 + 8) >> 4
    temperature = temperature / 10.0

    # Calculate true pressure
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
    pressure = pressure / 100.0  # Convert to hPa

    return temperature, pressure

def calculate_altitude(pressure, sea_level_pressure=1013.25):
    """
    Calculate altitude based on the pressure reading.
    :param pressure: Measured pressure in hPa
    :param sea_level_pressure: Sea-level pressure in hPa (default: 1013.25 hPa)
    :return: Altitude in meters
    """
    altitude = 44330.0 * (1.0 - (pressure / sea_level_pressure) ** (1 / 5.255))
    return altitude

def read_sensor(calib):
    try:
        raw_temp = read_raw_temp()
        raw_pressure = read_raw_pressure()
        temperature, pressure = calculate_true_values(calib, raw_temp, raw_pressure)
        altitude = calculate_altitude(pressure, sea_level_pressure=1012.0)  # Use Colombo's sea-level pressure
        print(f"Temperature: {temperature:.2f}C")
        print(f"Pressure: {pressure:.2f} hPa")
        print(f"Altitude: {altitude:.2f} m")
    except Exception as e:
        print(f"Error reading sensor: {e}")

if __name__ == "__main__":
    try:
        calib = read_calibration_data()
        while True:
            read_sensor(calib)
            time.sleep(2)  # Wait 2 seconds before the next reading
    except KeyboardInterrupt:
        print("Program stopped")
