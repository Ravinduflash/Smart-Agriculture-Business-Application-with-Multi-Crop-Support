"""
Smart Agriculture Sensor Simulator
==================================
This script simulates sensor data for testing when the Raspberry Pi is unavailable.
It generates realistic random sensor readings and uploads them to Firestore.

Usage:
    python sensor_simulator.py

The script will send data every 5 minutes (300 seconds) by default.
Press Ctrl+C to stop the simulation.
"""

import random
import time
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# =================================================================================
# --- CONFIGURATION ---
# =================================================================================

# --- Firebase/Firestore Configuration ---
SERVICE_ACCOUNT_PATH = "c:/Users/User/Desktop/SAS/Smart-Agriculture-Business-Application-with-Multi-Crop-Support/Credientals/gen-lang-client-0092156800-3f84a3882b65.json"
FIRESTORE_DATABASE_ID = "sasapp"  # Using default database for compatibility

# --- Simulation Configuration ---
CROP_ID = "crop_1762085977354"  # Use your newly created sample crop profile ID
DATA_INTERVAL_SECONDS = 30  # Send data every 30 seconds for testing (was 300 for 5 minutes)

# --- Realistic Sensor Value Ranges ---
# These ranges are based on typical values from your real sensor script
SENSOR_RANGES = {
    # Temperature ranges (Celsius) - typical tropical climate
    'air_temp_c': {'min': 24.0, 'max': 35.0, 'optimal': 28.5},
    
    # Humidity ranges (%) - tropical humidity levels
    'humidity_percent': {'min': 60.0, 'max': 95.0, 'optimal': 75.0},
    
    # Water/Soil temperature (Celsius) - usually cooler than air
    'water_soil_temp_c': {'min': 22.0, 'max': 30.0, 'optimal': 26.0},
    
    # Air pressure (hPa) - calibrated values for Sri Lanka
    'air_pressure_hpa': {'min': 1005.0, 'max': 1020.0, 'optimal': 1010.0},
    
    # Soil moisture (raw ADC values) - lower is wetter
    'soil_moisture_raw': {'min': 11922, 'max': 25570, 'optimal': 16000},
    
    # Light level (raw ADC values) - lower is brighter
    'light_level_raw': {'min': 3000, 'max': 25000, 'optimal': 8000},
    
    # Rain level (raw ADC values) - lower is more rain
    'rain_level_raw': {'min': 10000, 'max': 26040, 'optimal': 25000},
    
    # Gas sensor readings (ppm)
    'co2_ppm': {'min': 350.0, 'max': 800.0, 'optimal': 450.0},
    'nh3_ppm': {'min': 0.5, 'max': 5.0, 'optimal': 1.5},
    'voc_ppm': {'min': 0.1, 'max': 2.0, 'optimal': 0.5},
    
    # NPK sensor readings (mg/kg) - based on Amaranthus thresholds
    'nitrogen_mg_kg': {'min': 40, 'max': 150, 'optimal': 90},
    'phosphorus_mg_kg': {'min': 15, 'max': 70, 'optimal': 35},
    'potassium_mg_kg': {'min': 30, 'max': 120, 'optimal': 75}
}

# Thresholds for status interpretation (from original script)
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
# --- HELPER FUNCTIONS ---
# =================================================================================

def generate_realistic_value(key, previous_value=None, change_rate=0.1):
    """
    Generate a realistic sensor value with smooth transitions.
    
    Args:
        key: Sensor type key from SENSOR_RANGES
        previous_value: Previous sensor reading (for smooth transitions)
        change_rate: Maximum percentage change from previous value (0.1 = 10%)
    
    Returns:
        A realistic sensor value
    """
    ranges = SENSOR_RANGES[key]
    
    if previous_value is None:
        # First reading - use optimal value with some randomness
        base_value = ranges['optimal']
        variation = (ranges['max'] - ranges['min']) * 0.15
        return round(random.uniform(base_value - variation, base_value + variation), 2)
    
    # Subsequent readings - smooth transition from previous value
    max_change = abs(previous_value * change_rate)
    new_value = previous_value + random.uniform(-max_change, max_change)
    
    # Ensure value stays within realistic bounds
    new_value = max(ranges['min'], min(ranges['max'], new_value))
    
    # Round based on sensor type
    if key in ['nitrogen_mg_kg', 'phosphorus_mg_kg', 'potassium_mg_kg', 
               'soil_moisture_raw', 'light_level_raw', 'rain_level_raw']:
        return int(round(new_value))
    else:
        return round(new_value, 2)


def get_air_pressure_status(pressure):
    """Interpret air pressure reading"""
    if pressure < AIR_PRESSURE_THRESHOLDS["low"]:
        return "Low (Unsettled)"
    elif pressure > AIR_PRESSURE_THRESHOLDS["high"]:
        return "High (Stable)"
    else:
        return "Normal"


def get_soil_moisture_status(raw_value):
    """Interpret soil moisture reading"""
    if raw_value > SOIL_THRESHOLDS["low"]:
        return "Dry"
    elif raw_value > SOIL_THRESHOLDS["optimal"]:
        return "Optimal"
    else:
        return "Wet"


def get_light_level_status(raw_value):
    """Interpret light level reading"""
    if raw_value > LDR_VERY_DARK:
        return "Very Dark"
    elif raw_value > LDR_LOW_LIGHT:
        return "Low Light"
    elif raw_value > LDR_MEDIUM_LIGHT:
        return "Medium Light"
    else:
        return "Bright Light"


def get_rain_level_status(raw_value):
    """Interpret rain sensor reading"""
    if raw_value > RAIN_DRY:
        return "Dry"
    elif raw_value > RAIN_LIGHT:
        return "Light Rain"
    elif raw_value > RAIN_MODERATE:
        return "Moderate Rain"
    else:
        return "Heavy Rain"


def get_npk_status(nutrient, value):
    """Interpret NPK sensor reading"""
    if value < NPK_THRESHOLDS[nutrient]["low"]:
        return "Low"
    elif value <= NPK_THRESHOLDS[nutrient]["optimal"]:
        return "Optimal"
    else:
        return "High"


# =================================================================================
# --- FIRESTORE INTEGRATION ---
# =================================================================================

def initialize_firestore():
    """Initialize Firebase Admin SDK and Firestore client"""
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        
        if not firebase_admin._apps:
            # Initialize Firebase Admin SDK with project ID
            firebase_admin.initialize_app(cred, {
                'projectId': 'gen-lang-client-0092156800'
            })
        
        # Connect to the named database 'sasapp' using the correct parameter name
        # Note: Use 'database_id' parameter (not 'database') for Firebase Admin SDK
        db = firestore.client(database_id=FIRESTORE_DATABASE_ID)
        print(f"✓ Successfully connected to Firestore database: {FIRESTORE_DATABASE_ID}")
        
        return db
    except Exception as e:
        print(f"✗ Error initializing Firestore: {e}")
        print(f"   Attempting connection to database: {FIRESTORE_DATABASE_ID}")
        import traceback
        traceback.print_exc()
        return None


def send_to_firestore(db, sensor_data):
    """Upload sensor data to Firestore"""
    if db is None:
        print("✗ Firestore not initialized. Cannot upload data.")
        return False
    
    try:
        # Generate document ID based on timestamp
        timestamp_obj = datetime.strptime(sensor_data['timestamp'], '%Y-%m-%d %H:%M:%S')
        doc_id = f"{CROP_ID}_{timestamp_obj.strftime('%Y%m%d_%H%M%S')}"
        
        # Upload to Firestore
        db.collection('sensorReadings').document(doc_id).set(sensor_data)
        print(f"✓ Data sent to Firestore. Document ID: {doc_id}")
        return True
        
    except Exception as e:
        print(f"✗ Error sending data to Firestore: {e}")
        return False


# =================================================================================
# --- SENSOR SIMULATION ---
# =================================================================================

class SensorSimulator:
    """Simulates all sensor readings with realistic values"""
    
    def __init__(self):
        # Store previous values for smooth transitions
        self.previous_values = {}
    
    def generate_sensor_data(self):
        """Generate a complete set of simulated sensor readings"""
        
        # Generate raw sensor values with smooth transitions
        air_temp = generate_realistic_value('air_temp_c', 
                                            self.previous_values.get('air_temp_c'))
        humidity = generate_realistic_value('humidity_percent', 
                                           self.previous_values.get('humidity_percent'))
        water_soil_temp = generate_realistic_value('water_soil_temp_c', 
                                                   self.previous_values.get('water_soil_temp_c'))
        air_pressure = generate_realistic_value('air_pressure_hpa', 
                                               self.previous_values.get('air_pressure_hpa'))
        soil_moisture = generate_realistic_value('soil_moisture_raw', 
                                                self.previous_values.get('soil_moisture_raw'))
        light_level = generate_realistic_value('light_level_raw', 
                                              self.previous_values.get('light_level_raw'))
        rain_level = generate_realistic_value('rain_level_raw', 
                                             self.previous_values.get('rain_level_raw'))
        co2 = generate_realistic_value('co2_ppm', 
                                       self.previous_values.get('co2_ppm'))
        nh3 = generate_realistic_value('nh3_ppm', 
                                       self.previous_values.get('nh3_ppm'))
        voc = generate_realistic_value('voc_ppm', 
                                       self.previous_values.get('voc_ppm'))
        nitrogen = generate_realistic_value('nitrogen_mg_kg', 
                                          self.previous_values.get('nitrogen_mg_kg'))
        phosphorus = generate_realistic_value('phosphorus_mg_kg', 
                                             self.previous_values.get('phosphorus_mg_kg'))
        potassium = generate_realistic_value('potassium_mg_kg', 
                                            self.previous_values.get('potassium_mg_kg'))
        
        # Update previous values for next iteration
        self.previous_values.update({
            'air_temp_c': air_temp,
            'humidity_percent': humidity,
            'water_soil_temp_c': water_soil_temp,
            'air_pressure_hpa': air_pressure,
            'soil_moisture_raw': soil_moisture,
            'light_level_raw': light_level,
            'rain_level_raw': rain_level,
            'co2_ppm': co2,
            'nh3_ppm': nh3,
            'voc_ppm': voc,
            'nitrogen_mg_kg': nitrogen,
            'phosphorus_mg_kg': phosphorus,
            'potassium_mg_kg': potassium
        })
        
        # Build complete sensor data dictionary with status interpretations
        sensor_data = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'crop_id': CROP_ID,
            'air_temp_c': air_temp,
            'humidity_percent': humidity,
            'water_soil_temp_c': water_soil_temp,
            'air_pressure_hpa': air_pressure,
            'air_pressure_status': get_air_pressure_status(air_pressure),
            'soil_moisture_raw': soil_moisture,
            'soil_moisture_status': get_soil_moisture_status(soil_moisture),
            'light_level_raw': light_level,
            'light_level_status': get_light_level_status(light_level),
            'rain_level_raw': rain_level,
            'rain_level_status': get_rain_level_status(rain_level),
            'co2_ppm': co2,
            'nh3_ppm': nh3,
            'voc_ppm': voc,
            'nitrogen_mg_kg': nitrogen,
            'nitrogen_status': get_npk_status('N', nitrogen),
            'phosphorus_mg_kg': phosphorus,
            'phosphorus_status': get_npk_status('P', phosphorus),
            'potassium_mg_kg': potassium,
            'potassium_status': get_npk_status('K', potassium)
        }
        
        return sensor_data
    
    def print_sensor_data(self, data):
        """Print sensor data to console in a readable format"""
        print("\n" + "=" * 60)
        print(f"SIMULATED Sensor Readings at {data['timestamp']}")
        print("=" * 60)
        print(f"Crop ID: {data['crop_id']}")
        print(f"Air Temperature: {data['air_temp_c']} °C")
        print(f"Air Humidity: {data['humidity_percent']} %")
        print(f"Water/Soil Temperature: {data['water_soil_temp_c']} °C")
        print(f"Air Pressure: {data['air_pressure_hpa']} hPa (Status: {data['air_pressure_status']})")
        print(f"Soil Moisture: {data['soil_moisture_raw']} (Status: {data['soil_moisture_status']})")
        print(f"Light Level: {data['light_level_raw']} (Status: {data['light_level_status']})")
        print(f"Rain Level: {data['rain_level_raw']} (Status: {data['rain_level_status']})")
        print(f"Nitrogen (N): {data['nitrogen_mg_kg']} mg/kg (Status: {data['nitrogen_status']})")
        print(f"Phosphorus (P): {data['phosphorus_mg_kg']} mg/kg (Status: {data['phosphorus_status']})")
        print(f"Potassium (K): {data['potassium_mg_kg']} mg/kg (Status: {data['potassium_status']})")
        print(f"CO2: {data['co2_ppm']} ppm | NH3: {data['nh3_ppm']} ppm | VOC: {data['voc_ppm']} ppm")
        print("-" * 60)


# =================================================================================
# --- MAIN APPLICATION ---
# =================================================================================

def main():
    """Main simulation loop"""
    print("=" * 60)
    print("Smart Agriculture Sensor Simulator")
    print("=" * 60)
    print(f"Crop ID: {CROP_ID}")
    print(f"Data Interval: {DATA_INTERVAL_SECONDS} seconds ({DATA_INTERVAL_SECONDS/60:.1f} minutes)")
    print(f"Firestore Database: {FIRESTORE_DATABASE_ID}")
    print("=" * 60)
    
    # Initialize Firestore
    db = initialize_firestore()
    if db is None:
        print("\n✗ Failed to initialize Firestore. Exiting...")
        return
    
    # Initialize simulator
    simulator = SensorSimulator()
    
    print("\n🚀 Starting sensor simulation...")
    print("📊 Data will be sent to Firestore and displayed in your React web app")
    print("⏱️  Press Ctrl+C to stop the simulation\n")
    
    try:
        # Send initial data immediately
        print("📡 Collecting initial sensor readings...")
        sensor_data = simulator.generate_sensor_data()
        simulator.print_sensor_data(sensor_data)
        send_to_firestore(db, sensor_data)
        
        print(f"\n✓ Initial data sent. Next reading in {DATA_INTERVAL_SECONDS/60:.1f} minutes...")
        
        # Continue with regular intervals
        while True:
            time.sleep(DATA_INTERVAL_SECONDS)
            
            print(f"\n📡 Collecting sensor readings...")
            sensor_data = simulator.generate_sensor_data()
            simulator.print_sensor_data(sensor_data)
            send_to_firestore(db, sensor_data)
            
            print(f"\n✓ Data sent. Next reading in {DATA_INTERVAL_SECONDS/60:.1f} minutes...")
    
    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print("🛑 Simulation stopped by user")
        print("=" * 60)
        print("Thank you for using the Smart Agriculture Sensor Simulator!")
    
    except Exception as e:
        print(f"\n\n✗ Unexpected error: {e}")
        print("Simulation terminated.")


if __name__ == "__main__":
    main()
