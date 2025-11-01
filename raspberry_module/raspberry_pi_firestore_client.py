"""
Raspberry Pi Firestore Client for Smart Agriculture System
Sends sensor data to Cloud Firestore every 5 minutes

Installation:
    pip install firebase-admin google-cloud-firestore

Usage:
    python raspberry_pi_firestore_client.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import time
import json
from datetime import datetime
import logging
import sys
import os

# Add parent directory to path to import sensor modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SmartAgriculturePiClient:
    """
    Raspberry Pi client for Smart Agriculture System
    Integrates with Cloud Firestore
    """
    
    def __init__(self, service_account_path, pi_id='pi_unit_001'):
        """
        Initialize the Pi client
        
        Args:
            service_account_path: Path to service account JSON key
            pi_id: Unique identifier for this Raspberry Pi
        """
        self.pi_id = pi_id
        self.current_crop_id = None
        self.config_watch = None
        
        try:
            # Initialize Firebase Admin SDK
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            
            self.db = firestore.client(database_id='sasapp')
            logger.info(f"✓ Firebase Admin SDK initialized for Pi: {pi_id}")
            
            # Fetch initial crop configuration
            self.fetch_crop_config()
            
        except Exception as e:
            logger.error(f"✗ Firebase initialization failed: {e}")
            raise
    
    def fetch_crop_config(self):
        """
        Fetch the current crop profile ID from Firestore
        """
        try:
            doc_ref = self.db.collection('piConfigs').document(self.pi_id)
            doc = doc_ref.get()
            
            if doc.exists:
                config = doc.to_dict()
                self.current_crop_id = config.get('activeCropProfileId')
                logger.info(f"✓ Fetched config: Monitoring crop '{self.current_crop_id}'")
                
                # Update status to online
                doc_ref.update({
                    'status': 'online',
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                })
            else:
                logger.warning(f"✗ No configuration found for Pi: {self.pi_id}")
                logger.info(f"Creating default configuration...")
                # Create default config
                doc_ref.set({
                    'piId': self.pi_id,
                    'activeCropProfileId': 'amaranthus',  # Default crop
                    'status': 'online',
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                })
                self.current_crop_id = 'amaranthus'
                logger.info(f"✓ Created default configuration with crop 'amaranthus'")
                
        except Exception as e:
            logger.error(f"✗ Error fetching crop config: {e}")
            self.current_crop_id = None
    
    def listen_for_config_changes(self, callback=None):
        """
        Listen for real-time configuration changes from Firestore
        
        Args:
            callback: Optional callback function when config changes
        """
        doc_ref = self.db.collection('piConfigs').document(self.pi_id)
        
        def on_snapshot(doc_snapshot, changes, read_time):
            for doc in doc_snapshot:
                if doc.exists:
                    config = doc.to_dict()
                    new_crop_id = config.get('activeCropProfileId')
                    
                    if new_crop_id != self.current_crop_id:
                        logger.info(f"✓ Crop profile changed: {self.current_crop_id} → {new_crop_id}")
                        self.current_crop_id = new_crop_id
                        
                        if callback:
                            callback(new_crop_id)
        
        # Watch the document
        self.config_watch = doc_ref.on_snapshot(on_snapshot)
        logger.info(f"✓ Listening for configuration changes...")
        
        return self.config_watch
    
    def read_sensors(self):
        """
        Read sensor data from Raspberry Pi sensors
        Integrates with your existing sensor modules
        
        Returns:
            dict: Sensor readings
        """
        try:
            # Import your sensor modules
            from dht22sensors import read_dht22
            from bmp180sensor import read_bmp180
            from ds18b20_temp_sensor import read_ds18b20
            from hw080_soilmoisture_sensor import read_soil_moisture
            from ldrsensor import read_ldr
            from rainsensor import read_rain_sensor
            from mq135gas_sensor import read_mq135
            from npksensor import read_npk
            
            # Read all sensors
            dht_data = read_dht22()
            bmp_data = read_bmp180()
            ds18b20_temp = read_ds18b20()
            soil_moisture = read_soil_moisture()
            light_level = read_ldr()
            rain_level = read_rain_sensor()
            gas_data = read_mq135()
            npk_data = read_npk()
            
            # Combine all readings
            readings = {
                'air_temp_c': dht_data.get('temperature') if dht_data else None,
                'humidity_percent': dht_data.get('humidity') if dht_data else None,
                'water_soil_temp_c': ds18b20_temp,
                'air_pressure_hpa': bmp_data.get('pressure') if bmp_data else None,
                'soil_moisture_raw': soil_moisture,
                'light_level_raw': light_level,
                'rain_level_raw': rain_level,
                'co2_ppm': gas_data.get('co2') if gas_data else None,
                'nh3_ppm': gas_data.get('nh3') if gas_data else None,
                'voc_ppm': gas_data.get('voc') if gas_data else None,
                'nitrogen_mg_kg': npk_data.get('nitrogen') if npk_data else None,
                'phosphorus_mg_kg': npk_data.get('phosphorus') if npk_data else None,
                'potassium_mg_kg': npk_data.get('potassium') if npk_data else None
            }
            
            return readings
            
        except ImportError as e:
            logger.warning(f"Sensor module not available: {e}. Using mock data.")
            return self._generate_mock_readings()
        except Exception as e:
            logger.error(f"Error reading sensors: {e}. Using mock data.")
            return self._generate_mock_readings()
    
    def _generate_mock_readings(self):
        """
        Generate mock sensor readings for testing
        """
        import random
        
        return {
            'air_temp_c': round(random.uniform(20, 35), 2),
            'humidity_percent': round(random.uniform(60, 95), 2),
            'water_soil_temp_c': round(random.uniform(20, 30), 2),
            'air_pressure_hpa': round(random.uniform(1000, 1020), 2),
            'soil_moisture_raw': random.randint(300, 800),
            'light_level_raw': random.randint(100, 1000),
            'rain_level_raw': random.randint(0, 1023),
            'co2_ppm': round(random.uniform(400, 600), 2),
            'nh3_ppm': round(random.uniform(0, 10), 2),
            'voc_ppm': round(random.uniform(0, 5), 2),
            'nitrogen_mg_kg': round(random.uniform(0, 200), 2),
            'phosphorus_mg_kg': round(random.uniform(0, 100), 2),
            'potassium_mg_kg': round(random.uniform(0, 300), 2)
        }
    
    def calculate_statuses(self, readings):
        """
        Calculate status strings from raw sensor readings
        
        Args:
            readings: dict of sensor readings
            
        Returns:
            dict: Status strings
        """
        statuses = {}
        
        # Soil moisture status
        moisture = readings.get('soil_moisture_raw')
        if moisture is not None:
            if moisture < 300:
                statuses['soil_moisture_status'] = 'Very Dry'
            elif moisture < 500:
                statuses['soil_moisture_status'] = 'Dry'
            elif moisture < 700:
                statuses['soil_moisture_status'] = 'Optimal'
            else:
                statuses['soil_moisture_status'] = 'Wet'
        else:
            statuses['soil_moisture_status'] = 'Unknown'
        
        # Light level status
        light = readings.get('light_level_raw')
        if light is not None:
            if light < 200:
                statuses['light_level_status'] = 'Very Dark'
            elif light < 500:
                statuses['light_level_status'] = 'Dark'
            elif light < 800:
                statuses['light_level_status'] = 'Optimal'
            else:
                statuses['light_level_status'] = 'Bright'
        else:
            statuses['light_level_status'] = 'Unknown'
        
        # Rain status
        rain = readings.get('rain_level_raw')
        if rain is not None:
            if rain > 1000:
                statuses['rain_level_status'] = 'No Rain'
            elif rain > 500:
                statuses['rain_level_status'] = 'Light Rain'
            else:
                statuses['rain_level_status'] = 'Heavy Rain'
        else:
            statuses['rain_level_status'] = 'Unknown'
        
        # NPK statuses
        nitrogen = readings.get('nitrogen_mg_kg')
        if nitrogen is not None:
            statuses['nitrogen_status'] = 'Optimal' if 100 <= nitrogen <= 200 else 'Low' if nitrogen < 100 else 'High'
        else:
            statuses['nitrogen_status'] = 'Unknown'
        
        phosphorus = readings.get('phosphorus_mg_kg')
        if phosphorus is not None:
            statuses['phosphorus_status'] = 'Optimal' if 30 <= phosphorus <= 70 else 'Low' if phosphorus < 30 else 'High'
        else:
            statuses['phosphorus_status'] = 'Unknown'
        
        potassium = readings.get('potassium_mg_kg')
        if potassium is not None:
            statuses['potassium_status'] = 'Optimal' if 150 <= potassium <= 250 else 'Low' if potassium < 150 else 'High'
        else:
            statuses['potassium_status'] = 'Unknown'
        
        return statuses
    
    def send_sensor_data(self, readings, statuses):
        """
        Send sensor data to Cloud Firestore
        
        Args:
            readings: dict of sensor readings
            statuses: dict of status strings
            
        Returns:
            bool: Success status
        """
        if not self.current_crop_id:
            logger.warning("✗ No crop profile configured. Skipping data upload.")
            return False
        
        try:
            # Prepare the document data
            doc_data = {
                'piId': self.pi_id,
                'cropProfileId': self.current_crop_id,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'readings': readings,
                'statuses': statuses
            }
            
            # Add document to sensorReadings collection
            doc_ref = self.db.collection('sensorReadings').document()
            doc_ref.set(doc_data)
            
            logger.info(f"✓ Sensor data uploaded for crop: {self.current_crop_id}")
            logger.info(f"   Temperature: {readings.get('air_temp_c')}°C, Humidity: {readings.get('humidity_percent')}%")
            logger.info(f"   Soil Moisture: {readings.get('soil_moisture_raw')} ({statuses.get('soil_moisture_status')})")
            return True
            
        except Exception as e:
            logger.error(f"✗ Error uploading sensor data: {e}")
            # Update Pi status to error
            try:
                self.db.collection('piConfigs').document(self.pi_id).update({
                    'status': 'error',
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                })
            except:
                pass
            return False
    
    def run_data_collection(self, interval_seconds=300):
        """
        Run continuous data collection loop
        
        Args:
            interval_seconds: Time between readings (default: 300 = 5 minutes)
        """
        logger.info(f"✓ Starting data collection (interval: {interval_seconds}s)")
        
        # Start listening for configuration changes
        self.listen_for_config_changes(
            callback=lambda new_crop: logger.info(f"✓ Configuration updated to: {new_crop}")
        )
        
        try:
            while True:
                try:
                    logger.info(f"--- Reading sensors at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
                    
                    # Read sensors
                    readings = self.read_sensors()
                    statuses = self.calculate_statuses(readings)
                    
                    # Send to Firestore
                    success = self.send_sensor_data(readings, statuses)
                    
                    if success:
                        logger.info(f"✓ Data upload successful")
                    else:
                        logger.warning(f"✗ Data upload failed")
                    
                    # Wait for next interval
                    logger.info(f"Waiting {interval_seconds}s until next reading...")
                    time.sleep(interval_seconds)
                    
                except KeyboardInterrupt:
                    logger.info("\n✓ Shutting down gracefully...")
                    break
                except Exception as e:
                    logger.error(f"✗ Error in data collection loop: {e}")
                    logger.info("Waiting 30s before retrying...")
                    time.sleep(30)  # Wait 30s before retrying
                    
        finally:
            # Cleanup
            if self.config_watch:
                self.config_watch.unsubscribe()
            
            # Update Pi status to offline
            try:
                self.db.collection('piConfigs').document(self.pi_id).update({
                    'status': 'offline',
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                })
            except:
                pass
                
            logger.info("✓ Data collection stopped")

# Main execution
if __name__ == "__main__":
    # Configuration
    SERVICE_ACCOUNT_PATH = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\Credientals\gen-lang-client-0092156800-3f84a3882b65.json'
    PI_ID = 'pi_unit_001'
    INTERVAL = 300  # 5 minutes
    
    print("=" * 70)
    print("Smart Agriculture Pi Client - Firestore Integration")
    print("=" * 70)
    print(f"Pi ID: {PI_ID}")
    print(f"Service Account: {SERVICE_ACCOUNT_PATH}")
    print(f"Data Collection Interval: {INTERVAL} seconds (5 minutes)")
    print("=" * 70)
    print()
    
    try:
        # Initialize Pi client
        pi_client = SmartAgriculturePiClient(SERVICE_ACCOUNT_PATH, PI_ID)
        
        # Run data collection (sends data every 5 minutes)
        pi_client.run_data_collection(interval_seconds=INTERVAL)
        
    except KeyboardInterrupt:
        print("\n✓ Program terminated by user")
    except Exception as e:
        logger.error(f"✗ Pi client failed: {e}")
        print("\nPlease check:")
        print("1. Service account key path is correct")
        print("2. Firestore database is properly configured")
        print("3. Internet connection is active")
        print("4. Required Python packages are installed:")
        print("   pip install firebase-admin google-cloud-firestore")
