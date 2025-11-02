# Sensor Simulator Guide

## Overview
The `sensor_simulator.py` script simulates realistic sensor data when your Raspberry Pi is unavailable. It generates data that mimics real sensor readings and uploads it to Firestore, which then displays in your React web app.

## Features

✅ **Realistic Data Generation**
- Smooth transitions between readings (no sudden jumps)
- Values stay within realistic ranges for tropical climate
- All sensor types from the original script are simulated

✅ **Status Interpretation**
- Air pressure status (Low/Normal/High)
- Soil moisture status (Dry/Optimal/Wet)
- Light level status (Very Dark/Low Light/Medium Light/Bright Light)
- Rain level status (Dry/Light Rain/Moderate Rain/Heavy Rain)
- NPK nutrient status (Low/Optimal/High)

✅ **Firestore Integration**
- Automatically uploads to your `sensorReadings` collection
- Uses same document ID format as real sensor script
- Data appears immediately in your React dashboard

## Quick Start

### 1. Configure Crop ID
Open `sensor_simulator.py` and update the crop ID to your newly created sample crop:

```python
CROP_ID = "sample"  # Change this to match your crop profile ID
```

### 2. Run the Simulator

```powershell
cd raspberry_module
python sensor_simulator.py
```

### 3. View Data in React App
1. Open your React dashboard: http://localhost:5173
2. Navigate to **IoT Sensors** page
3. Select **"sample"** from the crop dropdown
4. You'll see simulated data updating every 5 minutes

## Configuration Options

### Change Data Interval
By default, data is sent every 5 minutes (same as real sensors). To change this:

```python
DATA_INTERVAL_SECONDS = 60  # Send data every 1 minute
DATA_INTERVAL_SECONDS = 300  # Send data every 5 minutes (default)
DATA_INTERVAL_SECONDS = 600  # Send data every 10 minutes
```

### Adjust Sensor Ranges
You can modify realistic ranges for any sensor in the `SENSOR_RANGES` dictionary:

```python
SENSOR_RANGES = {
    'air_temp_c': {'min': 24.0, 'max': 35.0, 'optimal': 28.5},
    'humidity_percent': {'min': 60.0, 'max': 95.0, 'optimal': 75.0},
    # ... customize other sensors
}
```

### Simulate Specific Conditions

#### Simulate Hot Weather
```python
SENSOR_RANGES = {
    'air_temp_c': {'min': 30.0, 'max': 38.0, 'optimal': 34.0},
    'humidity_percent': {'min': 40.0, 'max': 70.0, 'optimal': 55.0},
}
```

#### Simulate Rainy Weather
```python
SENSOR_RANGES = {
    'rain_level_raw': {'min': 10000, 'max': 15000, 'optimal': 12000},  # Lower = more rain
    'humidity_percent': {'min': 80.0, 'max': 98.0, 'optimal': 90.0},
}
```

#### Simulate Dry Soil
```python
SENSOR_RANGES = {
    'soil_moisture_raw': {'min': 20000, 'max': 25570, 'optimal': 23000},  # Higher = drier
}
```

## Understanding Generated Data

### Temperature & Humidity
- **Air Temperature**: 24-35°C (typical tropical range)
- **Humidity**: 60-95% (tropical humidity)
- **Water/Soil Temp**: 22-30°C (cooler than air)

### Soil & Water
- **Soil Moisture**: 11922-25570 (raw ADC value, lower = wetter)
- **Rain Level**: 10000-26040 (raw ADC value, lower = more rain)

### Light & Air Quality
- **Light Level**: 3000-25000 (raw ADC value, lower = brighter)
- **Air Pressure**: 1005-1020 hPa (typical Sri Lankan range)
- **CO2**: 350-800 ppm (normal outdoor levels)
- **NH3**: 0.5-5.0 ppm (ammonia from fertilizer)
- **VOC**: 0.1-2.0 ppm (volatile organic compounds)

### Nutrients (NPK)
- **Nitrogen (N)**: 40-150 mg/kg (high demand for leafy crops)
- **Phosphorus (P)**: 15-70 mg/kg (root development)
- **Potassium (K)**: 30-120 mg/kg (overall health)

## Sample Output

```
============================================================
SIMULATED Sensor Readings at 2025-11-02 14:30:00
============================================================
Crop ID: sample
Air Temperature: 28.75 °C
Air Humidity: 72.30 %
Water/Soil Temperature: 26.15 °C
Air Pressure: 1010.50 hPa (Status: Normal)
Soil Moisture: 16542 (Status: Optimal)
Light Level: 7823 (Status: Medium Light)
Rain Level: 24985 (Status: Dry)
Nitrogen (N): 85 mg/kg (Status: Optimal)
Phosphorus (P): 38 mg/kg (Status: Optimal)
Potassium (K): 72 mg/kg (Status: Optimal)
CO2: 425.30 ppm | NH3: 1.45 ppm | VOC: 0.52 ppm
------------------------------------------------------------
✓ Data sent to Firestore. Document ID: sample_20251102_143000
```

## Troubleshooting

### "Could not initialize Firestore"
- Check that `SERVICE_ACCOUNT_PATH` is correct
- Verify the JSON file exists in `Credientals/` folder
- Ensure Firebase Admin SDK is installed: `pip install firebase-admin`

### "No data showing in React app"
- Verify `CROP_ID` matches your crop profile ID in Firestore
- Check that the crop profile exists in `cropProfiles` collection
- Look at browser console for errors
- Verify Firestore database ID is correct (`sasapp`)

### Data values seem unrealistic
- Check `SENSOR_RANGES` configuration
- Adjust `change_rate` parameter in `generate_realistic_value()` (default 0.1 = 10% change)
- Verify threshold values match your environment

### Want to reset simulation
- Delete old documents from Firestore `sensorReadings` collection
- Stop the script (Ctrl+C) and restart with new settings

## Advanced Usage

### Run in Background (Windows PowerShell)
```powershell
Start-Process python -ArgumentList "sensor_simulator.py" -WindowStyle Hidden
```

### Run Multiple Simulators
To simulate multiple fields/crops, create copies with different crop IDs:

```powershell
# Copy the script
cp sensor_simulator.py sensor_simulator_field1.py
cp sensor_simulator.py sensor_simulator_field2.py

# Edit each file to use different CROP_ID
# Then run multiple instances
```

### Log Simulator Data to CSV
Add this to the main loop:

```python
import csv

def log_to_csv(sensor_data):
    with open('simulator_log.csv', 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=sensor_data.keys())
        if f.tell() == 0:
            writer.writeheader()
        writer.writerow(sensor_data)

# In main loop:
log_to_csv(sensor_data)
```

## Benefits of Using the Simulator

1. **Test Without Hardware**: Develop and test your React dashboard without physical sensors
2. **Consistent Data Flow**: Get regular data updates for testing real-time features
3. **Scenario Testing**: Simulate different environmental conditions
4. **Demo Ready**: Show your application with live data to stakeholders
5. **ML Model Training**: Generate training data for your machine learning models

## When Real Pi is Available

When your Raspberry Pi is repaired:
1. Stop the simulator (Ctrl+C)
2. Run the real sensor script: `python all_sensors_script_new.py`
3. Your React app will automatically start receiving real sensor data

The simulator and real script use the same data format, so no code changes needed!

## Support

If you encounter any issues or need to modify the simulation parameters, check:
- Firebase connection status
- Firestore security rules (allow read/write for testing)
- Console output for error messages
- React app browser console for client-side errors
