

export enum SensorType {
  SoilMoisture = 'Soil Moisture',
  Temperature = 'Temperature',
  Humidity = 'Humidity', // Renamed from PH, changed string value
  Nutrients = 'Nutrients', // This was an existing type, might be distinct from NPK
  LightIntensity = 'Light Intensity',
  SoilTemperature = 'Soil Temperature', // New
  RainLevel = 'Rain Level', // New
  AirPressure = 'Air Pressure', // New
  GasLevels = 'Gas Levels', // New Composite
  NPKSensor = 'NPK Sensor', // New Composite
}

export interface SensorDataPoint {
  timestamp: string; // For chart labels e.g. "Jan", "Feb" or full date
  value?: number | string | null; // For simple sensors or a primary value, allow string for "N/A" and null
  co2?: number | string | null;
  nh3?: number | string | null;
  voc?: number | string | null;
  nitrogen?: number | string | null;
  phosphorus?: number | string | null;
  potassium?: number | string | null;
}

// Specific status types for soil moisture based on ADC values
export enum SoilMoistureStatusType {
  DryNeedsIrrigation = 'dryNeedsIrrigation',
  OptimalMoisture = 'optimalMoisture',
  WetReduceIrrigation = 'wetReduceIrrigation',
  Waterlogged = 'waterlogged',
  NotAvailable = 'soilStatusNotAvailable' // For when ADC value is null/invalid
}

// Specific status types for Temperature
export enum TemperatureStatusType {
  TooCold = 'tooCold',
  OptimalTemperature = 'optimalTemperature',
  TooHot = 'tooHot',
  NotAvailable = 'temperatureNotAvailable'
}

// Specific status types for Humidity
export enum HumidityStatusType {
  TooDry = 'tooDry',
  OptimalHumidity = 'optimalHumidity',
  TooHumid = 'tooHumid',
  NotAvailable = 'humidityNotAvailable'
}

// Specific status types for Soil Temperature
export enum SoilTemperatureStatusType {
  Cool = 'soilTempCool',
  Optimal = 'soilTempOptimal',
  HeatStress = 'soilTempHeatStress',
  NotAvailable = 'soilTempNotAvailable'
}

// Specific status types for Light Intensity
export enum LightIntensityStatusType {
  VeryDark = 'lightVeryDark',
  LowLight = 'lightLowLight',
  MediumLight = 'lightMediumLight',
  BrightLight = 'lightBrightLight',
  NotAvailable = 'lightNotAvailable'
}

// Specific status types for Rain Level based on ADC values
export enum RainLevelStatusType {
  Dry = 'rainDry',
  LightRain = 'rainLightRain',
  ModerateRain = 'rainModerateRain',
  HeavyRain = 'rainHeavyRain',
  NotAvailable = 'rainNotAvailable'
}

// Specific status types for Air Pressure
export enum AirPressureStatusType {
  LowPressure = 'airLowPressure',
  NormalPressure = 'airNormalPressure',
  HighPressure = 'airHighPressure',
  NotAvailable = 'airPressureNotAvailable'
}

// Specific status types for Gas Levels
export enum GasLevelsStatusType {
  Optimal = 'gasLevelsOptimal',
  Attention = 'gasLevelsAttention',
  NotAvailable = 'gasLevelsNotAvailable'
}

// Specific status types for NPK Levels
export enum NPKStatusType {
  Optimal = 'npkOptimal',       // All available nutrients are optimal
  Deficiency = 'npkDeficiency', // At least one nutrient is deficient
  Excess = 'npkExcess',         // At least one nutrient is excessive (and no deficiencies)
  NotAvailable = 'npkNotAvailable'// All N, P, K values are N/A
}


// General sensor statuses
export type GeneralSensorStatus = 'Optimal' | 'Stable' | 'Warning' | 'Critical'; // Removed 'Balanced'
export const generalSensorStatusValues: (
    GeneralSensorStatus | 
    SoilMoistureStatusType | 
    TemperatureStatusType | 
    HumidityStatusType | 
    SoilTemperatureStatusType | 
    LightIntensityStatusType | 
    RainLevelStatusType | 
    AirPressureStatusType | 
    GasLevelsStatusType |
    NPKStatusType 
)[] = [
    'Optimal', 'Stable', 'Warning', 'Critical', // 'Balanced' removed
    ...Object.values(SoilMoistureStatusType),
    ...Object.values(TemperatureStatusType),
    ...Object.values(HumidityStatusType),
    ...Object.values(SoilTemperatureStatusType),
    ...Object.values(LightIntensityStatusType),
    ...Object.values(RainLevelStatusType),
    ...Object.values(AirPressureStatusType),
    ...Object.values(GasLevelsStatusType),
    ...Object.values(NPKStatusType),
];


export interface Sensor {
  id: string;
  type: SensorType;
  // currentValue can be a single number/string or an object for composite sensors, or null
  currentValue: number | string | { [key: string]: number | string | null } | null;
  // unit can be a single string or an object for composite sensors with per-value units, or general unit for composite
  unit: string | { [key: string]: string };
  status: SoilMoistureStatusType | GeneralSensorStatus | TemperatureStatusType | HumidityStatusType | SoilTemperatureStatusType | LightIntensityStatusType | RainLevelStatusType | AirPressureStatusType | GasLevelsStatusType | NPKStatusType; // Status can be specific or general
  // Historical data for charts;
  historicalData?: SensorDataPoint[];
}

export interface Crop {
  id:string;
  name: string;
  imageUrl?: string; // Can be a URL or a base64 data URI
  waterNeeds: 'Low' | 'Moderate' | 'High' | string; // string for Gemini suggestions
  optimalPh: string; // e.g., "6.0-6.8"
  sunlight: 'Full Sun' | 'Partial Shade' | 'Shade' | string; // string for Gemini suggestions
  lastUpdated?: string;
  details?: string; // From Gemini
}

export interface ChartData {
  name: string; // Typically month or category
  value: number;
  value2?: number; // For dual line charts or grouped bars
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface NotificationMessage {
  id: string;
  messageKey: string; // Changed from 'message' to 'messageKey'
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  icon?: React.ReactNode;
}

export interface AnalyticsMetric {
  key: string; // Translation key for the label
  label: string; // Original label, can be used as fallback or for non-t() contexts
  value: string;
  status?: string;
  unit?: string;
  icon?: React.ReactNode;
}

export interface MonthlyReportData {
  name: string; 
  value: number; 
}

// For Gemini interactions
export interface CropInfoRequest {
  cropName: string;
}

export interface FarmingAdviceRequest {
  temperature: number;
  moistureStatus: string; // Changed from soilMoisture: number to moistureStatus: string
  cropType: string;
  // ph has been removed
}

export interface DataInsightRequest {
  yieldData: MonthlyReportData[];
  moistureData: MonthlyReportData[];
  pestData?: { month: string; incidenceRate: number }[];
}

export interface OptimalConditions {
  waterNeeds: string;
  optimalPh: string;
  sunlight: string;
  additionalTips?: string;
}

export interface CropRecommendation {
  cropName: string;
  reason: string;
  estimatedGrowingPeriod: string;
}

// Language type
export type LanguageCode = 'en' | 'si' | 'ta';