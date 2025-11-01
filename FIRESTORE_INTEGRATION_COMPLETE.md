# ✅ FIRESTORE INTEGRATION COMPLETE GUIDE

## 📋 Summary

I've successfully implemented:
1. ✅ **Cloud Functions** (3 main functions + 2 helper functions)
2. ✅ **Updated Raspberry Pi Script** to send to Firestore
3. ✅ **Updated firestoreService.ts** with new sensor data structure
4. ✅ **Created Firebase Functions** for backend logic

## 🎯 What's Already Done

### 1. Cloud Functions Created ✅
**Location**: `firebase-functions/index.js`

**Functions Implemented**:
- `getPiConfig` - Raspberry Pi retrieves crop configuration
- `ingestSensorData` - HTTP endpoint for Pi to upload sensor data with validation
- `generateCropProfile` - AI-powered crop profile generation using Gemini
- `getLatestSensorReadings` - Fetch recent sensor data
- `updatePiConfig` - Update Pi configuration

### 2. Raspberry Pi Script Updated ✅
**Location**: `raspberry_module/all_sensors_script_new.py`

**Changes Made**:
- ✅ Added `firebase_admin` imports
- ✅ Added Firestore configuration section (SERVICE_ACCOUNT_PATH, DATABASE_ID, CROP_TYPE)
- ✅ Created `send_to_firestore()` function with full 21-column support
- ✅ Firestore initialization with database='sasapp'
- ✅ Updated main loop to send to: Firestore → ThingSpeak → CSV
- ✅ Maintains ThingSpeak compatibility (as requested)

### 3. Firestore Service Updated ✅
**Location**: `Frontend/ToolTip - Netlify.../src/services/firestoreService.ts`

**New Functions**:
- `getLatestSensorReadings(cropType, limit)` - Get latest readings for specific crop
- `getAllSensorReadings(limit)` - Get all sensor readings
- `subscribeToSensorReadings(callback, cropType, limitCount)` - Real-time updates
- `getSensorReadingsByDateRange(cropType, startDate, endDate)` - Historical data

**Updated Interface**:
```typescript
export interface SensorReading {
  id?: string;
  timestamp: string; // "2025-11-01 14:30:00"
  crop_type: string;
  air_temp_c: number | null;
  humidity_percent: number | null;
  water_soil_temp_c: number | null;
  air_pressure_hpa: number | null;
  air_pressure_status: string | null;
  soil_moisture_raw: number | null;
  soil_moisture_status: string | null;
  // ... all 21 fields including status columns
}
```

## 🚀 Next Steps - Frontend Integration

### Step 1: Update Dashboard Page to Use Firestore

Replace ThingSpeak calls with Firestore in `DashboardPage.tsx`:

```typescript
import { firestoreService } from '../services/firestoreService';

// Replace this:
const thingSpeakData = await fetchThingSpeakData(1);

// With this:
const readings = await firestoreService.getLatestSensorReadings('amaranthus', 1);
const latestReading = readings[0];

// Then map the latestReading to your sensors
const processedSensors = baseSensors.map(sensor => {
  switch(sensor.type) {
    case SensorType.Temperature:
      return {
        ...sensor,
        currentValue: latestReading.air_temp_c || t('common.na'),
        status: getTemperatureStatus(latestReading.air_temp_c)
      };
    case SensorType.Humidity:
      return {
        ...sensor,
        currentValue: latestReading.humidity_percent || t('common.na'),
        status: getHumidityStatus(latestReading.humidity_percent)
      };
    // ... continue for all sensor types
  }
});
```

### Step 2: Update IoT Sensors Page to Use Firestore

Replace ThingSpeak calls in `IoTSensorsPage.tsx`:

```typescript
import { firestoreService } from '../services/firestoreService';

// For initial load (historical data for charts):
const readings = await firestoreService.getLatestSensorReadings('amaranthus', 100);

// Map to historical data:
const temperatureHistory = readings.map(r => ({
  time: r.timestamp.split(' ')[1].substring(0, 5), // "14:30"
  value: r.air_temp_c || 0
})).reverse();

// For real-time updates with subscription:
useEffect(() => {
  const unsubscribe = firestoreService.subscribeToSensorReadings(
    (readings) => {
      // Update sensors and charts with new data
      setSensors(mapReadingsToSensors(readings));
    },
    'amaranthus', // crop type
    100 // limit
  );
  
  return () => unsubscribe(); // Cleanup
}, []);
```

### Step 3: Create Helper Functions for Data Mapping

Create file: `services/firestoreSensorMapper.ts`

```typescript
import { SensorReading } from './firestoreService';
import { Sensor, SensorType } from '../types';

export function mapFirestoreReadingToSensor(
  reading: SensorReading,
  sensorType: SensorType,
  t: (key: string) => string
): Partial<Sensor> {
  switch(sensorType) {
    case SensorType.Temperature:
      return {
        currentValue: reading.air_temp_c || t('common.na'),
        status: getStatusFromValue(reading.air_temp_c, 15, 30)
      };
    
    case SensorType.SoilMoisture:
      return {
        currentValue: reading.soil_moisture_raw || t('common.na'),
        status: reading.soil_moisture_status || 'NotAvailable'
      };
    
    case SensorType.NPKSensor:
      return {
        currentValue: {
          nitrogen: reading.nitrogen_mg_kg || t('common.na'),
          phosphorus: reading.phosphorus_mg_kg || t('common.na'),
          potassium: reading.potassium_mg_kg || t('common.na')
        },
        status: getNPKStatus(reading)
      };
    
    // Add all other sensor types...
  }
}

export function mapFirestoreReadingsToChart(
  readings: SensorReading[],
  field: keyof SensorReading
): Array<{time: string, value: number}> {
  return readings.map(r => ({
    time: r.timestamp.split(' ')[1].substring(0, 5),
    value: (r[field] as number) || 0
  })).reverse();
}
```

## 🔧 Deployment Steps

### 1. Deploy Cloud Functions

```bash
cd firebase-functions
npm install
firebase functions:config:set gemini.apikey="REDACTED_SECRET"
firebase deploy --only functions
```

### 2. Update Raspberry Pi

1. Copy updated `all_sensors_script_new.py` to Pi
2. Ensure service account JSON is in `../Credientals/` directory
3. Install dependencies:
   ```bash
   pip install firebase-admin
   ```
4. Run the script:
   ```bash
   python all_sensors_script_new.py
   ```

### 3. Update React App

1. ✅ firestoreService.ts already updated
2. ⚠️ Need to update DashboardPage.tsx (replace ThingSpeak calls)
3. ⚠️ Need to update IoTSensorsPage.tsx (replace ThingSpeak calls)
4. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod
   ```

## 📊 Current Data Status

You have **15,889 Amaranthus sensor readings** in Firestore:
- **First dataset**: 8,440 records (June 19 - July 22, 2025)
- **Third dataset part1**: 3,127 records (August 7-22, 2025)
- **Third dataset part2**: 4,322 records (August 22-23, 2025)

All data includes:
- 21 columns with full sensor readings
- Categorical status fields (Dry/Optimal/Wet, Low/Normal/High, etc.)
- Properly formatted timestamps
- Crop type tagging

## 🎨 Integration Options

### Option A: Full Firestore Migration (Recommended)
**Pros**: 
- Real-time updates
- Better scalability
- Centralized data
- Cloud Functions security

**Cons**: 
- More refactoring needed
- Need to update all ThingSpeak references

### Option B: Hybrid Approach
**Pros**: 
- Keep ThingSpeak as backup
- Gradual migration
- Less risk

**Cons**: 
- Maintaining two systems
- Potential data sync issues

### Option C: Firestore for Historical, ThingSpeak for Real-time
**Pros**: 
- Leverage existing infrastructure
- ThingSpeak for quick real-time
- Firestore for analysis/ML

**Cons**: 
- Complex data flow
- Two sources of truth

## 🔥 Quick Start - Minimal Changes Needed

### Modify `DashboardPage.tsx` (Line ~48):

**Find**:
```typescript
const thingSpeakData = await fetchThingSpeakData(1);
const processedSensors = mapThingSpeakDataToSensors(thingSpeakData, initialSensorsBase, t);
```

**Replace with**:
```typescript
// NEW: Fetch from Firestore instead of ThingSpeak
const firestoreReadings = await firestoreService.getLatestSensorReadings('amaranthus', 1);
const processedSensors = firestoreReadings.length > 0 
  ? mapFirestoreDataToSensors(firestoreReadings[0], initialSensorsBase, t)
  : initialSensorsBase;
```

### Modify `IoTSensorsPage.tsx` (Line ~96):

**Find**:
```typescript
const thingSpeakData = await fetchThingSpeakData(resultsToFetch);
```

**Replace with**:
```typescript
// NEW: Fetch from Firestore instead of ThingSpeak
const firestoreReadings = await firestoreService.getLatestSensorReadings('amaranthus', resultsToFetch);
```

## 📝 Helper Function Template

Create this helper function in both pages:

```typescript
function mapFirestoreDataToSensors(
  reading: SensorReading, 
  baseSensors: Sensor[], 
  t: (key: string) => string
): Sensor[] {
  return baseSensors.map(sensor => {
    switch(sensor.type) {
      case SensorType.Temperature:
        return { ...sensor, currentValue: reading.air_temp_c || t('common.na') };
      case SensorType.Humidity:
        return { ...sensor, currentValue: reading.humidity_percent || t('common.na') };
      case SensorType.SoilMoisture:
        return { ...sensor, currentValue: reading.soil_moisture_raw || t('common.na'), status: reading.soil_moisture_status };
      case SensorType.NPKSensor:
        return { 
          ...sensor, 
          currentValue: { 
            nitrogen: reading.nitrogen_mg_kg, 
            phosphorus: reading.phosphorus_mg_kg, 
            potassium: reading.potassium_mg_kg 
          } 
        };
      // Add other sensor types as needed
      default:
        return sensor;
    }
  });
}
```

## 🎯 Priority Tasks

1. **HIGH PRIORITY**: Update DashboardPage.tsx to read from Firestore
2. **HIGH PRIORITY**: Update IoTSensorsPage.tsx to read from Firestore
3. **MEDIUM PRIORITY**: Deploy Cloud Functions
4. **MEDIUM PRIORITY**: Test Raspberry Pi with Firestore upload
5. **LOW PRIORITY**: Remove ThingSpeak dependencies (after testing)

## 💡 Testing Plan

1. **Test Firestore Read** (Dashboard):
   - Open Dashboard
   - Check if sensors display data from Firestore
   - Verify status indicators work

2. **Test Real-time Updates** (IoT Sensors):
   - Open IoT Sensors page
   - Verify charts populate with historical data
   - Check real-time subscription updates

3. **Test Raspberry Pi Upload**:
   - Run Pi script
   - Check Firestore Console for new documents
   - Verify all 21 fields are populated
   - Confirm timestamp format

## 🔗 Useful Links

- **Firestore Console**: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data
- **Functions Console**: https://console.firebase.google.com/project/gen-lang-client-0092156800/functions
- **Firestore Documentation**: https://firebase.google.com/docs/firestore

## ❓ Need Help?

The code is ready! Just need to:
1. Create the mapper helper function (provided above)
2. Replace 2-3 lines in DashboardPage.tsx
3. Replace 2-3 lines in IoTSensorsPage.tsx
4. Test in browser

Would you like me to create the exact code changes for your Dashboard and IoT Sensors pages?
