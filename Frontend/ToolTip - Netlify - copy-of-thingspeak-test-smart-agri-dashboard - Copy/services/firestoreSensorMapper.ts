/**
 * Firestore Sensor Data Mapper
 * Maps Firestore sensor readings to the app's existing Sensor interface
 */

import { SensorReading } from './firestoreService';
import { Sensor, SensorType, SoilMoistureStatusType, TemperatureStatusType, HumidityStatusType, SoilTemperatureStatusType, LightIntensityStatusType, RainLevelStatusType, AirPressureStatusType, GasLevelsStatusType, NPKStatusType } from '../types';

/**
 * Map Firestore sensor reading to app's Sensor array format for Dashboard cards
 */
export function mapFirestoreReadingToSensors(
  reading: SensorReading | null,
  baseSensors: Sensor[],
  t: (key: string) => string
): Sensor[] {
  if (!reading) {
    return baseSensors.map(s => ({
      ...s,
      currentValue: t('common.na'),
      status: getDefaultStatus(s.type)
    }));
  }

  return baseSensors.map(sensor => {
    switch (sensor.type) {
      case SensorType.Temperature:
        return {
          ...sensor,
          currentValue: reading.air_temp_c !== null ? reading.air_temp_c : t('common.na'),
          status: getTemperatureStatus(reading.air_temp_c)
        };

      case SensorType.Humidity:
        return {
          ...sensor,
          currentValue: reading.humidity_percent !== null ? reading.humidity_percent : t('common.na'),
          status: getHumidityStatus(reading.humidity_percent)
        };

      case SensorType.SoilMoisture:
        return {
          ...sensor,
          currentValue: reading.soil_moisture_raw !== null ? reading.soil_moisture_raw : t('common.na'),
          status: mapFirestoreStatus(reading.soil_moisture_status, SoilMoistureStatusType)
        };

      case SensorType.SoilTemperature:
        return {
          ...sensor,
          currentValue: reading.water_soil_temp_c !== null ? reading.water_soil_temp_c : t('common.na'),
          status: getSoilTemperatureStatus(reading.water_soil_temp_c)
        };

      case SensorType.LightIntensity:
        return {
          ...sensor,
          currentValue: reading.light_level_raw !== null ? reading.light_level_raw : t('common.na'),
          status: mapFirestoreStatus(reading.light_level_status, LightIntensityStatusType)
        };

      case SensorType.RainLevel:
        return {
          ...sensor,
          currentValue: reading.rain_level_raw !== null ? reading.rain_level_raw : t('common.na'),
          status: mapFirestoreStatus(reading.rain_level_status, RainLevelStatusType)
        };

      case SensorType.AirPressure:
        return {
          ...sensor,
          currentValue: reading.air_pressure_hpa !== null ? reading.air_pressure_hpa : t('common.na'),
          status: mapFirestoreStatus(reading.air_pressure_status, AirPressureStatusType)
        };

      case SensorType.GasLevels:
        return {
          ...sensor,
          currentValue: {
            co2: reading.co2_ppm !== null ? reading.co2_ppm : t('common.na'),
            nh3: reading.nh3_ppm !== null ? reading.nh3_ppm : t('common.na'),
            voc: reading.voc_ppm !== null ? reading.voc_ppm : t('common.na')
          },
          status: GasLevelsStatusType.NotAvailable
        };

      case SensorType.NPKSensor:
        return {
          ...sensor,
          currentValue: {
            nitrogen: reading.nitrogen_mg_kg !== null ? reading.nitrogen_mg_kg : t('common.na'),
            phosphorus: reading.phosphorus_mg_kg !== null ? reading.phosphorus_mg_kg : t('common.na'),
            potassium: reading.potassium_mg_kg !== null ? reading.potassium_mg_kg : t('common.na')
          },
          status: getNPKStatus(reading)
        };

      default:
        return sensor;
    }
  });
}

/**
 * Map Firestore readings to historical data for charts
 */
export function mapFirestoreReadingsToHistoricalData(
  readings: SensorReading[],
  sensorType: SensorType
): any[] {
  if (!readings || readings.length === 0) return [];
  
  return readings.map(reading => {
    const timestamp = reading.timestamp; // Keep full timestamp for chart
    const timeDisplay = parseTimestamp(reading.timestamp); // For X-axis display
    
    switch (sensorType) {
      case SensorType.Temperature:
        return { 
          time: timeDisplay, 
          timestamp: timestamp, 
          value: reading.air_temp_c !== null ? reading.air_temp_c : 0 
        };
      
      case SensorType.Humidity:
        return { 
          time: timeDisplay, 
          timestamp: timestamp, 
          value: reading.humidity_percent !== null ? reading.humidity_percent : 0 
        };
      
      case SensorType.SoilMoisture:
        return { 
          time: timeDisplay, 
          timestamp: timestamp, 
          value: reading.soil_moisture_raw !== null ? reading.soil_moisture_raw : 0 
        };
      
      case SensorType.SoilTemperature:
        return { 
          time: timeDisplay, 
          timestamp: timestamp, 
          value: reading.water_soil_temp_c !== null ? reading.water_soil_temp_c : 0 
        };
      
      case SensorType.LightIntensity:
        return { 
          time: timeDisplay, 
          timestamp: timestamp, 
          value: reading.light_level_raw !== null ? reading.light_level_raw : 0 
        };
      
      case SensorType.RainLevel:
        return { 
          time: timeDisplay, 
          timestamp: timestamp, 
          value: reading.rain_level_raw !== null ? reading.rain_level_raw : 0 
        };
      
      case SensorType.AirPressure:
        return { 
          time: timeDisplay, 
          timestamp: timestamp, 
          value: reading.air_pressure_hpa !== null ? reading.air_pressure_hpa : 0 
        };
      
      case SensorType.GasLevels:
        return {
          time: timeDisplay,
          timestamp: timestamp,
          co2: reading.co2_ppm !== null ? reading.co2_ppm : 0,
          nh3: reading.nh3_ppm !== null ? reading.nh3_ppm : 0,
          voc: reading.voc_ppm !== null ? reading.voc_ppm : 0
        };
      
      case SensorType.NPKSensor:
        return {
          time: timeDisplay,
          timestamp: timestamp,
          nitrogen: reading.nitrogen_mg_kg !== null ? reading.nitrogen_mg_kg : 0,
          phosphorus: reading.phosphorus_mg_kg !== null ? reading.phosphorus_mg_kg : 0,
          potassium: reading.potassium_mg_kg !== null ? reading.potassium_mg_kg : 0
        };
      
      default:
        return { time: timeDisplay, timestamp: timestamp, value: 0 };
    }
  }).reverse(); // Reverse to show chronological order (oldest to newest)
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

function mapFirestoreStatus(status: string | null, statusEnum: any): any {
  if (!status) return statusEnum.NotAvailable;
  
  // Map Firestore status strings to app status enums
  // Note: For Soil/Rain "Dry" conflict, we check the enum type passed in
  const isRainSensor = statusEnum === RainLevelStatusType;
  
  const statusMap: Record<string, any> = {
    // Soil Moisture - matching sensor_simulator.py output
    'Dry': isRainSensor ? RainLevelStatusType.Dry : SoilMoistureStatusType.DryNeedsIrrigation,
    'Optimal': SoilMoistureStatusType.OptimalMoisture,
    'Wet': SoilMoistureStatusType.WetReduceIrrigation,
    'Waterlogged': SoilMoistureStatusType.Waterlogged,
    
    // Light - matching sensor_simulator.py output
    'Very Dark': LightIntensityStatusType.VeryDark,
    'Low Light': LightIntensityStatusType.LowLight,
    'Medium Light': LightIntensityStatusType.MediumLight,
    'Bright Light': LightIntensityStatusType.BrightLight,
    
    // Rain - matching sensor_simulator.py output
    'Light Rain': RainLevelStatusType.LightRain,
    'Moderate Rain': RainLevelStatusType.ModerateRain,
    'Heavy Rain': RainLevelStatusType.HeavyRain,
    
    // Air Pressure - matching sensor_simulator.py output
    'Low (Unsettled)': AirPressureStatusType.LowPressure,
    'Normal': AirPressureStatusType.NormalPressure,
    'High (Stable)': AirPressureStatusType.HighPressure
  };
  
  return statusMap[status] || statusEnum.NotAvailable;
}

function getTemperatureStatus(temp: number | null): TemperatureStatusType {
  if (temp === null) return TemperatureStatusType.NotAvailable;
  if (temp < 15) return TemperatureStatusType.TooCold;
  if (temp >= 15 && temp <= 30) return TemperatureStatusType.OptimalTemperature;
  return TemperatureStatusType.TooHot;
}

function getHumidityStatus(humidity: number | null): HumidityStatusType {
  if (humidity === null) return HumidityStatusType.NotAvailable;
  if (humidity < 40) return HumidityStatusType.TooDry;
  if (humidity >= 40 && humidity <= 70) return HumidityStatusType.OptimalHumidity;
  return HumidityStatusType.TooHumid;
}

function getSoilTemperatureStatus(temp: number | null): SoilTemperatureStatusType {
  if (temp === null) return SoilTemperatureStatusType.NotAvailable;
  if (temp < 15) return SoilTemperatureStatusType.Cool;
  if (temp >= 15 && temp <= 30) return SoilTemperatureStatusType.Optimal;
  return SoilTemperatureStatusType.HeatStress;
}

function getNPKStatus(reading: SensorReading): NPKStatusType {
  const n = reading.nitrogen_status;
  const p = reading.phosphorus_status;
  const k = reading.potassium_status;
  
  if (!n || !p || !k) return NPKStatusType.NotAvailable;
  
  // If any nutrient is low, overall status is low (deficiency)
  if (n === 'Low' || p === 'Low' || k === 'Low') return NPKStatusType.Deficiency;
  
  // If all are optimal, status is optimal
  if (n === 'Optimal' && p === 'Optimal' && k === 'Optimal') return NPKStatusType.Optimal;
  
  // If any is high (and no deficiencies), status is excess
  if (n === 'High' || p === 'High' || k === 'High') return NPKStatusType.Excess;
  
  return NPKStatusType.NotAvailable;
}
