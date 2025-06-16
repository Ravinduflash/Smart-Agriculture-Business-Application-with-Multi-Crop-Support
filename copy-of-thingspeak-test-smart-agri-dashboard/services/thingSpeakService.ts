
import { Sensor, SensorDataPoint, SensorType, SoilMoistureStatusType, TemperatureStatusType, HumidityStatusType, SoilTemperatureStatusType, LightIntensityStatusType, RainLevelStatusType, AirPressureStatusType, GasLevelsStatusType, NPKStatusType } from '../types';

const THINGSPEAK_API_BASE_URL = "https://api.thingspeak.com";

// Default values, will be overridden by environment variables if set
const DEFAULT_CHANNEL_ID = "2989974";
const DEFAULT_READ_API_KEY = "ZTTP6I2AXO85ZEQ7";

// Soil Moisture ADC Thresholds
const DRY_THRESHOLD = 28000;
const OPTIMAL_MOISTURE_LOW = 20000;
const OPTIMAL_MOISTURE_HIGH = 28000;
const WATERLOGGED_THRESHOLD = 15000;

// Optimal Environmental Settings (Air Temperature & Humidity)
const OPTIMAL_TEMP_LOW = 25.0;    // Lower bound for optimal temperature in Celsius
const OPTIMAL_TEMP_HIGH = 32.0;   // Upper bound for optimal temperature in Celsius
const OPTIMAL_HUMIDITY_LOW = 60.0; // Lower bound for optimal humidity in percentage
const OPTIMAL_HUMIDITY_HIGH = 80.0; // Upper bound for optimal humidity in percentage

// Soil Temperature Thresholds
const SOIL_TEMP_COOL_THRESHOLD = 20.0;
const SOIL_TEMP_OPTIMAL_MIN = 20.0;
const SOIL_TEMP_OPTIMAL_MAX = 30.0;
// Heat stress is implicitly > SOIL_TEMP_OPTIMAL_MAX

// Light Intensity Thresholds (as per user's Python logic)
const LIGHT_VERY_DARK_THRESHOLD = 20000;  // value > 20000 is Very Dark
const LIGHT_LOW_LIGHT_THRESHOLD = 15000;  // value > 15000 (and <= 20000) is Low Light
const LIGHT_MEDIUM_LIGHT_THRESHOLD = 10000; // value > 10000 (and <= 15000) is Medium Light
                                          // value <= 10000 is Bright Light

// Rain Level ADC Thresholds
const RAIN_DRY_THRESHOLD = 28000;
const RAIN_LIGHT_RAIN_THRESHOLD = 25000;
const RAIN_MODERATE_RAIN_THRESHOLD = 20000;
// Heavy Rain is <= RAIN_MODERATE_RAIN_THRESHOLD (20000)

// Air Pressure Thresholds
const NORMAL_PRESSURE_LOW = 1000.0;  // Lower bound for normal pressure in hPa
const NORMAL_PRESSURE_HIGH = 1025.0; // Upper bound for normal pressure in hPa

// Gas Level Normal Ranges (PPM)
const GAS_NORMAL_RANGES = {
    co2: { min: 350, max: 1000 },
    nh3: { min: 0, max: 5 },
    voc: { min: 0, max: 2 }
};

// NPK Thresholds (mg/kg or ppm) - Illustrative General Values
const N_DEFICIENT_THRESHOLD = 50;
const N_OPTIMAL_LOW = 100;
const N_OPTIMAL_HIGH = 150;

const P_DEFICIENT_THRESHOLD = 20;
const P_OPTIMAL_LOW = 30;
const P_OPTIMAL_HIGH = 50;

const K_DEFICIENT_THRESHOLD = 80;
const K_OPTIMAL_LOW = 120;
const K_OPTIMAL_HIGH = 180;

type IndividualNutrientStatus = 'Deficient' | 'Optimal' | 'Excessive' | 'NotAvailable';


export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string | null; // Air Temperature
  field2: string | null; // Air Humidity
  field3: string | null; // Water/Soil Temperature
  field4: string | null; // Soil Moisture
  field5: string | null; // Light Level
  field6: string | null; // Nitrogen (N)
  field7: string | null; // Phosphorus (P)
  field8: string | null; // Potassium (K)
}

export interface ThingSpeakChannelInfo {
  id: number;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  field1: string; // Name of field1, e.g., "Air Temperature from DHT22"
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  created_at: string;
  updated_at: string;
  last_entry_id: number;
}

export interface ThingSpeakChannelFeedResponse {
  channel: ThingSpeakChannelInfo;
  feeds: ThingSpeakFeed[];
}

export async function fetchThingSpeakData(
  results: number = 20 // Number of entries to fetch
): Promise<ThingSpeakChannelFeedResponse | null> {
  const channelId = process.env.THINGSPEAK_CHANNEL_ID || DEFAULT_CHANNEL_ID;
  const apiKey = process.env.THINGSPEAK_READ_API_KEY || DEFAULT_READ_API_KEY;

  if (!channelId || !apiKey) {
    console.warn("ThingSpeak Channel ID or Read API Key is not configured. Live sensor data will not be available. Please set THINGSPEAK_CHANNEL_ID and THINGSPEAK_READ_API_KEY environment variables.");
    return null;
  }

  try {
    const response = await fetch(
      `${THINGSPEAK_API_BASE_URL}/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`
    );
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error fetching ThingSpeak data: ${response.status} ${response.statusText}. Response: ${errorBody}`);
      return null;
    }
    const data = await response.json();
    if (data === -1 || (typeof data === 'object' && data !== null && 'error' in data)) {
        console.error("ThingSpeak API returned an error:", data);
        return null;
    }
    return data as ThingSpeakChannelFeedResponse;
  } catch (error) {
    console.error("Failed to fetch or parse data from ThingSpeak:", error);
    return null;
  }
}

export const parseFloatSafe = (val: string | null | undefined): number | null => {
  if (val === null || val === undefined || val.trim() === "" || val.trim().toLowerCase() === "n/a") return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

// Helper to create N/A structure for composite sensors, respecting original values if provided (e.g. from mock)
const mapCompositeSensorToNA = (
  type: SensorType,
  t: (key: string) => string,
  originalValue?: Sensor['currentValue']
): Record<string, string | number> => {
    const na = t('common.na');
    let baseObject: Record<string, string | number> = {};

    if (typeof originalValue === 'object' && originalValue !== null) {
      baseObject = { ...originalValue }; // Start with original values
    }

    if (type === SensorType.NPKSensor) {
        return {
            nitrogen: baseObject.nitrogen ?? na,
            phosphorus: baseObject.phosphorus ?? na,
            potassium: baseObject.potassium ?? na
        };
    }
    if (type === SensorType.GasLevels) {
        return {
            co2: baseObject.co2 ?? na,
            nh3: baseObject.nh3 ?? na,
            voc: baseObject.voc ?? na
        };
    }
    return baseObject;
};

// Function to interpret raw soil moisture ADC value
export const interpretSoilMoistureRawValue = (rawValue: number | null): SoilMoistureStatusType => {
  if (rawValue === null) {
    return SoilMoistureStatusType.NotAvailable;
  }
  if (rawValue > DRY_THRESHOLD) {
    return SoilMoistureStatusType.DryNeedsIrrigation;
  } else if (rawValue >= OPTIMAL_MOISTURE_LOW && rawValue <= OPTIMAL_MOISTURE_HIGH) {
    return SoilMoistureStatusType.OptimalMoisture;
  } else if (rawValue > WATERLOGGED_THRESHOLD && rawValue < OPTIMAL_MOISTURE_LOW) {
    return SoilMoistureStatusType.WetReduceIrrigation;
  } else { // rawValue <= WATERLOGGED_THRESHOLD
    return SoilMoistureStatusType.Waterlogged;
  }
};

export const interpretTemperature = (tempC: number | null): TemperatureStatusType => {
  if (tempC === null) {
    return TemperatureStatusType.NotAvailable;
  }
  if (tempC < OPTIMAL_TEMP_LOW) {
    return TemperatureStatusType.TooCold;
  } else if (tempC >= OPTIMAL_TEMP_LOW && tempC <= OPTIMAL_TEMP_HIGH) {
    return TemperatureStatusType.OptimalTemperature;
  } else {
    return TemperatureStatusType.TooHot;
  }
};

export const interpretHumidity = (humidityVal: number | null): HumidityStatusType => {
  if (humidityVal === null) {
    return HumidityStatusType.NotAvailable;
  }
  if (humidityVal < OPTIMAL_HUMIDITY_LOW) {
    return HumidityStatusType.TooDry;
  } else if (humidityVal >= OPTIMAL_HUMIDITY_LOW && humidityVal <= OPTIMAL_HUMIDITY_HIGH) {
    return HumidityStatusType.OptimalHumidity;
  } else {
    return HumidityStatusType.TooHumid;
  }
};

export const interpretSoilTemperature = (tempC: number | null): SoilTemperatureStatusType => {
  if (tempC === null) {
    return SoilTemperatureStatusType.NotAvailable;
  }
  if (tempC < SOIL_TEMP_COOL_THRESHOLD) {
    return SoilTemperatureStatusType.Cool;
  } else if (tempC >= SOIL_TEMP_OPTIMAL_MIN && tempC <= SOIL_TEMP_OPTIMAL_MAX) {
    return SoilTemperatureStatusType.Optimal;
  } else { // tempC > SOIL_TEMP_OPTIMAL_MAX
    return SoilTemperatureStatusType.HeatStress;
  }
};

export const interpretLightIntensity = (luxValue: number | null): LightIntensityStatusType => {
  if (luxValue === null) {
    return LightIntensityStatusType.NotAvailable;
  }
  if (luxValue > LIGHT_VERY_DARK_THRESHOLD) {
    return LightIntensityStatusType.VeryDark;
  } else if (luxValue > LIGHT_LOW_LIGHT_THRESHOLD) {
    return LightIntensityStatusType.LowLight;
  } else if (luxValue > LIGHT_MEDIUM_LIGHT_THRESHOLD) {
    return LightIntensityStatusType.MediumLight;
  } else { // luxValue <= LIGHT_MEDIUM_LIGHT_THRESHOLD
    return LightIntensityStatusType.BrightLight;
  }
};

export const interpretRainLevel = (adcValue: number | null): RainLevelStatusType => {
  if (adcValue === null) {
    return RainLevelStatusType.NotAvailable;
  }
  if (adcValue > RAIN_DRY_THRESHOLD) {
    return RainLevelStatusType.Dry;
  } else if (adcValue > RAIN_LIGHT_RAIN_THRESHOLD) { // 25000 < value <= 28000
    return RainLevelStatusType.LightRain;
  } else if (adcValue > RAIN_MODERATE_RAIN_THRESHOLD) { // 20000 < value <= 25000
    return RainLevelStatusType.ModerateRain;
  } else { // value <= 20000
    return RainLevelStatusType.HeavyRain;
  }
};

export const interpretAirPressure = (pressureHpa: number | null): AirPressureStatusType => {
  if (pressureHpa === null) {
    return AirPressureStatusType.NotAvailable;
  }
  if (pressureHpa < NORMAL_PRESSURE_LOW) {
    return AirPressureStatusType.LowPressure;
  } else if (pressureHpa >= NORMAL_PRESSURE_LOW && pressureHpa <= NORMAL_PRESSURE_HIGH) {
    return AirPressureStatusType.NormalPressure;
  } else { // pressureHpa > NORMAL_PRESSURE_HIGH
    return AirPressureStatusType.HighPressure;
  }
};

export const interpretOverallGasLevels = (
  gasValues: { co2: number | string | null, nh3: number | string | null, voc: number | string | null }
): GasLevelsStatusType => {
  const co2Val = typeof gasValues.co2 === 'string' ? parseFloatSafe(gasValues.co2) : gasValues.co2;
  const nh3Val = typeof gasValues.nh3 === 'string' ? parseFloatSafe(gasValues.nh3) : gasValues.nh3;
  const vocVal = typeof gasValues.voc === 'string' ? parseFloatSafe(gasValues.voc) : gasValues.voc;

  if (co2Val === null && nh3Val === null && vocVal === null) {
    return GasLevelsStatusType.NotAvailable;
  }

  let isAttentionNeeded = false;

  if (co2Val !== null) {
    if (co2Val < GAS_NORMAL_RANGES.co2.min || co2Val > GAS_NORMAL_RANGES.co2.max) {
      isAttentionNeeded = true;
    }
  }
  if (nh3Val !== null) {
    if (nh3Val < GAS_NORMAL_RANGES.nh3.min || nh3Val > GAS_NORMAL_RANGES.nh3.max) {
      isAttentionNeeded = true;
    }
  }
  if (vocVal !== null) {
    if (vocVal < GAS_NORMAL_RANGES.voc.min || vocVal > GAS_NORMAL_RANGES.voc.max) {
      isAttentionNeeded = true;
    }
  }

  return isAttentionNeeded ? GasLevelsStatusType.Attention : GasLevelsStatusType.Optimal;
};

const getIndividualNutrientStatus = (
    value: number | null,
    deficientThreshold: number,
    optimalLow: number,
    optimalHigh: number
): IndividualNutrientStatus => {
    if (value === null) {
        return 'NotAvailable';
    }
    if (value < deficientThreshold) {
        return 'Deficient';
    } else if (value >= optimalLow && value <= optimalHigh) {
        return 'Optimal';
    } else {
        return 'Excessive'; // Covers cases where value >= deficientThreshold AND (value < optimalLow OR value > optimalHigh)
    }
};

export const interpretOverallNPKStatus = (
    npkValues: { nitrogen: number | string | null, phosphorus: number | string | null, potassium: number | string | null }
): NPKStatusType => {
    const nVal = typeof npkValues.nitrogen === 'string' ? parseFloatSafe(npkValues.nitrogen) : npkValues.nitrogen;
    const pVal = typeof npkValues.phosphorus === 'string' ? parseFloatSafe(npkValues.phosphorus) : npkValues.phosphorus;
    const kVal = typeof npkValues.potassium === 'string' ? parseFloatSafe(npkValues.potassium) : npkValues.potassium;

    if (nVal === null && pVal === null && kVal === null) {
        return NPKStatusType.NotAvailable;
    }

    const nStatus = getIndividualNutrientStatus(nVal, N_DEFICIENT_THRESHOLD, N_OPTIMAL_LOW, N_OPTIMAL_HIGH);
    const pStatus = getIndividualNutrientStatus(pVal, P_DEFICIENT_THRESHOLD, P_OPTIMAL_LOW, P_OPTIMAL_HIGH);
    const kStatus = getIndividualNutrientStatus(kVal, K_DEFICIENT_THRESHOLD, K_OPTIMAL_LOW, K_OPTIMAL_HIGH);

    const statuses: IndividualNutrientStatus[] = [nStatus, pStatus, kStatus];

    if (statuses.some(s => s === 'Deficient')) {
        return NPKStatusType.Deficiency;
    }
    if (statuses.some(s => s === 'Excessive')) {
        return NPKStatusType.Excess;
    }
    
    // Check if all non-'NotAvailable' statuses are 'Optimal' and at least one is 'Optimal'
    const validStatuses = statuses.filter(s => s !== 'NotAvailable');
    if (validStatuses.length > 0 && validStatuses.every(s => s === 'Optimal')) {
        return NPKStatusType.Optimal;
    }

    return NPKStatusType.NotAvailable; // If all were 'NotAvailable' or a mix not caught by above
};


export const mapThingSpeakDataToSensors = (
  thingSpeakData: ThingSpeakChannelFeedResponse | null,
  initialSensors: Sensor[],
  t: (key: string, replacements?: Record<string, string | number>) => string
): Sensor[] => {
  const naText = t('common.na');
  if (!thingSpeakData || !thingSpeakData.feeds || thingSpeakData.feeds.length === 0) {
    return initialSensors.map(sensor => ({
      ...sensor,
      currentValue: sensor.type === SensorType.NPKSensor ? mapCompositeSensorToNA(sensor.type, t, {}) :
                    sensor.type === SensorType.GasLevels ? { co2: naText, nh3: naText, voc: naText } : 
                    naText,
      status: sensor.type === SensorType.SoilMoisture ? SoilMoistureStatusType.NotAvailable :
              sensor.type === SensorType.Temperature ? TemperatureStatusType.NotAvailable :
              sensor.type === SensorType.Humidity ? HumidityStatusType.NotAvailable :
              sensor.type === SensorType.SoilTemperature ? SoilTemperatureStatusType.NotAvailable :
              sensor.type === SensorType.LightIntensity ? LightIntensityStatusType.NotAvailable :
              sensor.type === SensorType.RainLevel ? RainLevelStatusType.NotAvailable :
              sensor.type === SensorType.AirPressure ? AirPressureStatusType.NotAvailable :
              sensor.type === SensorType.GasLevels ? GasLevelsStatusType.NotAvailable :
              sensor.type === SensorType.NPKSensor ? NPKStatusType.NotAvailable :
              'Critical',
      historicalData: []
    }));
  }

  const latestFeed = thingSpeakData.feeds[thingSpeakData.feeds.length - 1];
  const historicalFeeds = thingSpeakData.feeds;

  return initialSensors.map(sensor => {
    const updatedSensor: Sensor = { ...sensor, historicalData: [] as SensorDataPoint[] } as Sensor;
    let liveValueFound = false; // Flag to check if any relevant field has a non-null value

    switch (sensor.type) {
      case SensorType.Temperature:
        const tempVal = parseFloatSafe(latestFeed.field1);
        updatedSensor.currentValue = tempVal ?? naText;
        updatedSensor.status = interpretTemperature(tempVal);
        if(tempVal !== null) liveValueFound = true;
        break;
      case SensorType.Humidity:
        const humVal = parseFloatSafe(latestFeed.field2);
        updatedSensor.currentValue = humVal ?? naText;
        updatedSensor.status = interpretHumidity(humVal);
        if(humVal !== null) liveValueFound = true;
        break;
      case SensorType.SoilTemperature:
        const soilTempVal = parseFloatSafe(latestFeed.field3);
        updatedSensor.currentValue = soilTempVal ?? naText;
        updatedSensor.status = interpretSoilTemperature(soilTempVal);
        if(soilTempVal !== null) liveValueFound = true;
        break;
      case SensorType.SoilMoisture:
        const soilMoistRawValue = parseFloatSafe(latestFeed.field4);
        updatedSensor.currentValue = soilMoistRawValue ?? naText; // Keep raw ADC value or N/A string
        updatedSensor.status = interpretSoilMoistureRawValue(soilMoistRawValue);
        if(soilMoistRawValue !== null) liveValueFound = true;
        break;
      case SensorType.LightIntensity:
        const lightVal = parseFloatSafe(latestFeed.field5);
        updatedSensor.currentValue = lightVal ?? naText;
        updatedSensor.status = interpretLightIntensity(lightVal);
        if(lightVal !== null) liveValueFound = true;
        break;
      case SensorType.NPKSensor:
        const n = parseFloatSafe(latestFeed.field6);
        const p = parseFloatSafe(latestFeed.field7);
        const k = parseFloatSafe(latestFeed.field8);
        const npkCurrentValues = {
          nitrogen: n ?? naText,
          phosphorus: p ?? naText,
          potassium: k ?? naText,
        };
        updatedSensor.currentValue = npkCurrentValues;
        updatedSensor.status = interpretOverallNPKStatus({nitrogen: n, phosphorus: p, potassium: k});
        if(n !== null || p !== null || k !== null) liveValueFound = true;
        break;
      case SensorType.GasLevels:
        // Force GasLevel values to N/A for display, status will be derived correctly.
        const gasNAValues = {
          co2: naText,
          nh3: naText,
          voc: naText,
        };
        updatedSensor.currentValue = gasNAValues;
        updatedSensor.status = interpretOverallGasLevels(gasNAValues);
        liveValueFound = false; 
        break;
      default:
        liveValueFound = false; 
        if (sensor.type === SensorType.Nutrients) { 
          updatedSensor.currentValue = naText;
          updatedSensor.status = 'Critical'; 
        } else if (sensor.type === SensorType.RainLevel) {
          updatedSensor.currentValue = naText; 
          updatedSensor.status = interpretRainLevel(null); 
        } else if (sensor.type === SensorType.AirPressure) {
          updatedSensor.currentValue = naText; 
          updatedSensor.status = interpretAirPressure(null);
        } else {
          updatedSensor.currentValue = naText;
          updatedSensor.status = 'Critical';
        }
        break;
    }

    updatedSensor.historicalData = [];
    if (liveValueFound &&
        [SensorType.Temperature, SensorType.Humidity, SensorType.SoilTemperature, SensorType.SoilMoisture, SensorType.LightIntensity, SensorType.NPKSensor].includes(sensor.type)) { 
        updatedSensor.historicalData = historicalFeeds.map(feed => {
          const dp: SensorDataPoint = {
            timestamp: new Date(feed.created_at).toISOString()
          };
          let hasDataPoint = false;
          switch (sensor.type) {
            case SensorType.Temperature: dp.value = parseFloatSafe(feed.field1); if(dp.value !== null) hasDataPoint = true; break;
            case SensorType.Humidity: dp.value = parseFloatSafe(feed.field2); if(dp.value !== null) hasDataPoint = true; break;
            case SensorType.SoilTemperature: dp.value = parseFloatSafe(feed.field3); if(dp.value !== null) hasDataPoint = true; break;
            case SensorType.SoilMoisture: dp.value = parseFloatSafe(feed.field4); if(dp.value !== null) hasDataPoint = true; break; 
            case SensorType.LightIntensity: dp.value = parseFloatSafe(feed.field5); if(dp.value !== null) hasDataPoint = true; break;
            case SensorType.NPKSensor:
              dp.nitrogen = parseFloatSafe(feed.field6);
              dp.phosphorus = parseFloatSafe(feed.field7);
              dp.potassium = parseFloatSafe(feed.field8);
              if(dp.nitrogen !== null || dp.phosphorus !== null || dp.potassium !== null) hasDataPoint = true;
              break;
          }
          return hasDataPoint ? dp : null;
        }).filter(dp => dp !== null) as SensorDataPoint[];
    }
    
    const isSensorTypePresentInFeedFields =
        (sensor.type === SensorType.Temperature && latestFeed.field1 !== undefined) ||
        (sensor.type === SensorType.Humidity && latestFeed.field2 !== undefined) ||
        (sensor.type === SensorType.SoilTemperature && latestFeed.field3 !== undefined) ||
        (sensor.type === SensorType.SoilMoisture && latestFeed.field4 !== undefined) ||
        (sensor.type === SensorType.LightIntensity && latestFeed.field5 !== undefined) ||
        (sensor.type === SensorType.NPKSensor && (latestFeed.field6 !== undefined || latestFeed.field7 !== undefined || latestFeed.field8 !== undefined));

    if (!isSensorTypePresentInFeedFields && 
        [SensorType.Temperature, SensorType.Humidity, SensorType.SoilTemperature, SensorType.SoilMoisture, SensorType.LightIntensity, SensorType.NPKSensor].includes(sensor.type)) {
         updatedSensor.status = sensor.type === SensorType.SoilMoisture ? SoilMoistureStatusType.NotAvailable :
                                sensor.type === SensorType.Temperature ? TemperatureStatusType.NotAvailable :
                                sensor.type === SensorType.Humidity ? HumidityStatusType.NotAvailable :
                                sensor.type === SensorType.SoilTemperature ? SoilTemperatureStatusType.NotAvailable :
                                sensor.type === SensorType.LightIntensity ? LightIntensityStatusType.NotAvailable :
                                sensor.type === SensorType.NPKSensor ? NPKStatusType.NotAvailable :
                                'Critical'; 
         updatedSensor.currentValue = (sensor.type === SensorType.NPKSensor) ? mapCompositeSensorToNA(sensor.type, t, {}) : naText;
         updatedSensor.historicalData = [];
    }

    return updatedSensor;
  });
};