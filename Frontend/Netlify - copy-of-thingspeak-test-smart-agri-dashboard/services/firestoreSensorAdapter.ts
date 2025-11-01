/**
 * Firestore Sensor Data Adapter
 * Adapts Firestore sensor readings to the existing app's Sensor interface
 * This allows seamless integration with existing Dashboard and IoT Sensors pages
 */

import { firestoreService, SensorReading } from './firestoreService';
import { Sensor, SensorType, SensorDataPoint, SoilMoistureStatusType, TemperatureStatusType, HumidityStatusType, SoilTemperatureStatusType, LightIntensityStatusType, RainLevelStatusType, AirPressureStatusType, GasLevelsStatusType, NPKStatusType } from '../types';

/**
 * Convert Firestore sensor reading to app's Sensor format for Dashboard cards
 */
export function mapFirestoreToSensor(reading: SensorReading | null, baseSensor: Sensor, t: (key: string) => string): Sensor {
  if (!reading) {
    return {
      ...baseSensor,
      currentValue: t('common.na'),
      status: getDefaultStatus(baseSensor.type)
    };
  }

  switch (baseSensor.type) {
    case SensorType.Temperature:
      return {
        ...baseSensor,
        currentValue: reading.air_temp_c !== null ? reading.air_temp_c : t('common.na'),
        status: getTemperatureStatus(reading.air_temp_c)
      };

    case SensorType.Humidity:
      return {
        ...baseSensor,
        currentValue: reading.humidity_percent !== null ? reading.humidity_percent : t('common.na'),
        status: getHumidityStatus(reading.humidity_percent)
      };

    case SensorType.SoilMoisture:
      return {
        ...baseSensor,
        currentValue: reading.soil_moisture_raw !== null ? reading.soil_moisture_raw : t('common.na'),
        status: mapStatusToType(reading.soil_moisture_status, SoilMoistureStatusType)
      };

    case SensorType.SoilTemperature:
      return {
        ...baseSensor,
        currentValue: reading.water_soil_temp_c !== null ? reading.water_soil_temp_c : t('common.na'),
        status: getSoilTemperatureStatus(reading.water_soil_temp_c)
      };

    case SensorType.LightIntensity:
      return {
        ...baseSensor,
        currentValue: reading.light_level_raw !== null ? reading.light_level_raw : t('common.na'),
        status: mapStatusToType(reading.light_level_status, LightIntensityStatusType)
      };

    case SensorType.RainLevel:
      return {
        ...baseSensor,
        currentValue: reading.rain_level_raw !== null ? reading.rain_level_raw : t('common.na'),
        status: mapStatusToType(reading.rain_level_status, RainLevelStatusType)
      };

    case SensorType.AirPressure:
      return {
        ...baseSensor,
        currentValue: reading.air_pressure_hpa !== null ? reading.air_pressure_hpa : t('common.na'),
        status: mapStatusToType(reading.air_pressure_status, AirPressureStatusType)
      };

    case SensorType.GasLevels:
      return {
        ...baseSensor,
        currentValue: {
          co2: reading.co2_ppm !== null ? reading.co2_ppm : t('common.na'),
          nh3: reading.nh3_ppm !== null ? reading.nh3_ppm : t('common.na'),
          voc: reading.voc_ppm !== null ? reading.voc_ppm : t('common.na')
        },
        status: GasLevelsStatusType.Normal // Could be enhanced with status logic
      };

    case SensorType.NPKSensor:
      return {
        ...baseSensor,
        currentValue: {
          nitrogen: reading.nitrogen_mg_kg !== null ? reading.nitrogen_mg_kg : t('common.na'),
          phosphorus: reading.phosphorus_mg_kg !== null ? reading.phosphorus_mg_kg : t('common.na'),
          potassium: reading.potassium_mg_kg !== null ? reading.potassium_mg_kg : t('common.na')
        },
        status: getNPKStatus(reading)
      };

    default:
      return baseSensor;
  }
}

/**
 * Convert multiple Firestore readings to historical data points for charts
 */
export function mapFirestoreToHistoricalData(
  readings: SensorReading[],
  sensorType: SensorType
): SensorDataPoint[] {
  return readings.map(reading => {
    const timestamp = parseTimestamp(reading.timestamp);
    
    switch (sensorType) {
      case SensorType.Temperature:
        return { time: timestamp, value: reading.air_temp_c || 0 };
      
      case SensorType.Humidity:
        return { time: timestamp, value: reading.humidity_percent || 0 };
      
      case SensorType.SoilMoisture:
        return { time: timestamp, value: reading.soil_moisture_raw || 0 };
      
      case SensorType.SoilTemperature:
        return { time: timestamp, value: reading.water_soil_temp_c || 0 };
      
      case SensorType.LightIntensity:
        return { time: timestamp, value: reading.light_level_raw || 0 };
      
      case SensorType.RainLevel:
        return { time: timestamp, value: reading.rain_level_raw || 0 };
      
      case SensorType.AirPressure:
        return { time: timestamp, value: reading.air_pressure_hpa || 0 };
      
      default:
        return { time: timestamp, value: 0 };
    }
  }).reverse(); // Reverse to show chronological order (oldest to newest)
}

/**
 * Convert Firestore readings to multi-value historical data (for Gas and NPK sensors)
 */
export function mapFirestoreToCompositeHistoricalData(
  readings: SensorReading[],
  sensorType: SensorType
): any[] {
  return readings.map(reading => {
    const timestamp = parseTimestamp(reading.timestamp);
    
    if (sensorType === SensorType.GasLevels) {
      return {
        time: timestamp,
        co2: reading.co2_ppm || 0,
        nh3: reading.nh3_ppm || 0,
        voc: reading.voc_ppm || 0
      };
    }
    
    if (sensorType === SensorType.NPKSensor) {
      return {
        time: timestamp,
        nitrogen: reading.nitrogen_mg_kg || 0,
        phosphorus: reading.phosphorus_mg_kg || 0,
        potassium: reading.potassium_mg_kg || 0
      };
    }
    
    return { time: timestamp };
  }).reverse();
}

/**
 * Fetch latest sensor data from Firestore and map to Sensor array
 */
export async function fetchFirestoreSensorData(
  baseSensors: Sensor[],
  t: (key: string) => string,
  cropType: string = 'amaranthus',
  limit: number = 1
): Promise<Sensor[]> {
  try {
    const readings = await firestoreService.getLatestSensorReadings(cropType, limit);
    const latestReading = readings.length > 0 ? readings[0] : null;
    
    return baseSensors.map(sensor => mapFirestoreToSensor(latestReading, sensor, t));
  } catch (error) {
    console.error('Error fetching Firestore sensor data:', error);
    return baseSensors;
  }
}

/**
 * Fetch historical sensor data from Firestore for charts
 */
export async function fetchFirestoreHistoricalData(
  sensorType: SensorType,
  cropType: string = 'amaranthus',
  limit: number = 100
): Promise<SensorDataPoint[] | any[]> {
  try {
    const readings = await firestoreService.getLatestSensorReadings(cropType, limit);
    
    if (sensorType === SensorType.GasLevels || sensorType === SensorType.NPKSensor) {
      return mapFirestoreToCompositeHistoricalData(readings, sensorType);
    }
    
    return mapFirestoreToHistoricalData(readings, sensorType);
  } catch (error) {
    console.error('Error fetching Firestore historical data:', error);
    return [];
  }
}

// ==================== HELPER FUNCTIONS ====================

function parseTimestamp(timestamp: string): string {
  // Convert "2025-11-01 14:30:00" to "14:30" for chart display
  try {
    const parts = timestamp.split(' ');
    if (parts.length === 2) {
      const timeParts = parts[1].split(':');
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    return timestamp;
  } catch {
    return timestamp;
  }
}

function getDefaultStatus(sensorType: SensorType): any {
  switch (sensorType) {
    case SensorType.SoilMoisture:
      return SoilMoistureStatusType.NotAvailable;
    case SensorType.Temperature:
      return TemperatureStatusType.NotAvailable;
    case SensorType.Humidity:
      return HumidityStatusType.NotAvailable;
    case SensorType.SoilTemperature:
      return SoilTemperatureStatusType.NotAvailable;
    case SensorType.LightIntensity:
      return LightIntensityStatusType.NotAvailable;
    case SensorType.RainLevel:
      return RainLevelStatusType.NotAvailable;
    case SensorType.AirPressure:
      return AirPressureStatusType.NotAvailable;
    case SensorType.GasLevels:
      return GasLevelsStatusType.NotAvailable;
    case SensorType.NPKSensor:
      return NPKStatusType.NotAvailable;
    default:
      return 'Stable';
  }
}

function mapStatusToType(status: string | null, statusEnum: any): any {
  if (!status) return statusEnum.NotAvailable;
  
  // Map Firestore status strings to app status enums
  const statusMap: Record<string, any> = {
    // Soil Moisture
    'Dry': SoilMoistureStatusType.Dry,
    'Optimal': SoilMoistureStatusType.Optimal,
    'Wet': SoilMoistureStatusType.Wet,
    
    // Light
    'Very Dark': LightIntensityStatusType.VeryDark,
    'Low Light': LightIntensityStatusType.LowLight,
    'Medium Light': LightIntensityStatusType.MediumLight,
    'Bright Light': LightIntensityStatusType.BrightLight,
    
    // Rain
    'Light Rain': RainLevelStatusType.LightRain,
    'Moderate Rain': RainLevelStatusType.ModerateRain,
    'Heavy Rain': RainLevelStatusType.HeavyRain,
    
    // Air Pressure
    'Low (Unsettled)': AirPressureStatusType.Low,
    'Normal': AirPressureStatusType.Normal,
    'High (Stable)': AirPressureStatusType.High,
    
    // NPK
    'Low': NPKStatusType.Low,
    'High': NPKStatusType.High
  };
  
  return statusMap[status] || statusEnum.Normal || 'Stable';
}

function getTemperatureStatus(temp: number | null): TemperatureStatusType {
  if (temp === null) return TemperatureStatusType.NotAvailable;
  if (temp < 15) return TemperatureStatusType.Low;
  if (temp >= 15 && temp <= 30) return TemperatureStatusType.Optimal;
  return TemperatureStatusType.High;
}

function getHumidityStatus(humidity: number | null): HumidityStatusType {
  if (humidity === null) return HumidityStatusType.NotAvailable;
  if (humidity < 40) return HumidityStatusType.Low;
  if (humidity >= 40 && humidity <= 70) return HumidityStatusType.Optimal;
  return HumidityStatusType.High;
}

function getSoilTemperatureStatus(temp: number | null): SoilTemperatureStatusType {
  if (temp === null) return SoilTemperatureStatusType.NotAvailable;
  if (temp < 15) return SoilTemperatureStatusType.Low;
  if (temp >= 15 && temp <= 30) return SoilTemperatureStatusType.Optimal;
  return SoilTemperatureStatusType.High;
}

function getNPKStatus(reading: SensorReading): NPKStatusType {
  const n = reading.nitrogen_status;
  const p = reading.phosphorus_status;
  const k = reading.potassium_status;
  
  if (!n || !p || !k) return NPKStatusType.NotAvailable;
  
  // If any nutrient is low, overall status is low
  if (n === 'Low' || p === 'Low' || k === 'Low') return NPKStatusType.Low;
  
  // If all are optimal, status is optimal
  if (n === 'Optimal' && p === 'Optimal' && k === 'Optimal') return NPKStatusType.Optimal;
  
  // If any is high
  if (n === 'High' || p === 'High' || k === 'High') return NPKStatusType.High;
  
  return NPKStatusType.Normal;
}
