# -*- coding: utf-8 -*-
import serial
import time
import binascii

# Configure RS485 communication
try:
    ser = serial.Serial('/dev/ttyUSB0', 4800, timeout=5)
    print("Serial port opened successfully.")
except Exception as e:
    print(f"Error opening serial port: {e}")
    ser = None

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

# NPK thresholds for different crops
THRESHOLDS = {
    "N": {"low": 60, "optimal": 120},
    "P": {"low": 25, "optimal": 50}, 
    "K": {"low": 50, "optimal": 100}
}

def get_nutrient_status(value, nutrient):
    """Get nutrient status based on value"""
    if value < THRESHOLDS[nutrient]["low"]:
        return "Low"
    elif value <= THRESHOLDS[nutrient]["optimal"]:
        return "Optimal"
    else:
        return "High"

def main():
    print("NPK Sensor Test")
    print("=" * 30)
    
    if not ser:
        print("Serial port not available. Exiting.")
        return
    
    try:
        while True:
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
                print(f"Querying {nutrient}...")
                
                ser.write(full_query)
                time.sleep(0.2)
                
                response = ser.read(7)
                if len(response) >= 7:
                    value = int.from_bytes(response[3:5], byteorder='big')
                    status = get_nutrient_status(value, nutrient)
                    results[nutrient] = {"value": value, "status": status}
                    print(f"{nutrient}: {value} mg/kg ({status})")
                else:
                    print(f"{nutrient}: No response")
                    results[nutrient] = {"value": "N/A", "status": "N/A"}
                
                time.sleep(1)
            
            print("-" * 30)
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\nProgram stopped")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if ser and ser.is_open:
            ser.close()

if __name__ == "__main__":
    main()
