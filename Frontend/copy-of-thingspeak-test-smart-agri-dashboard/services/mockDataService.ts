
import React from 'react'; // Added to ensure JSX is correctly parsed
import { Sensor, SensorType, Crop, ChartData, PieChartData, NotificationMessage, AnalyticsMetric, MonthlyReportData } from '../types';
import { IconLeaf, IconSun, IconWaterDrop, IconWarning, IconInfo, IconSuccess, IconError } from '../constants';

export const getMockSensors = (): Sensor[] => [
  // Existing Sensors for Dashboard Cards (first 3)
  { id: '1', type: SensorType.SoilMoisture, currentValue: 68, unit: '%', status: 'Optimal', historicalData: [{timestamp: 'Jan', value: 60}, {timestamp: 'Feb', value: 62}, {timestamp: 'Mar', value: 65}, {timestamp: 'Apr', value: 68}, {timestamp: 'May', value: 70}, {timestamp: 'Jun', value: 67}] },
  { id: '2', type: SensorType.Temperature, currentValue: 23, unit: '°C', status: 'Stable', historicalData: [{timestamp: 'Jan', value: 20}, {timestamp: 'Feb', value: 21}, {timestamp: 'Mar', value: 22}, {timestamp: 'Apr', value: 23}, {timestamp: 'May', value: 24}, {timestamp: 'Jun', value: 22}] },
  { id: '3', type: SensorType.Humidity, currentValue: 55, unit: '%', status: 'Optimal', historicalData: [{timestamp: 'Jan', value: 50}, {timestamp: 'Feb', value: 52}, {timestamp: 'Mar', value: 55}, {timestamp: 'Apr', value: 56}, {timestamp: 'May', value: 58}, {timestamp: 'Jun', value: 54}] },
  
  // Existing general sensors (might or might not be directly on dashboard cards, but available for table/details)
  { id: '4', type: SensorType.Nutrients, currentValue: 1.2, unit: 'dS/m', status: 'Optimal' }, // General Nutrients
  
  // New Sensors for additional Dashboard Cards (next 6)
  { id: '5', type: SensorType.LightIntensity, currentValue: 800, unit: 'lux', status: 'Optimal', historicalData: [{timestamp: 'Jan', value: 700}, {timestamp: 'Feb', value: 750}, {timestamp: 'Mar', value: 800}, {timestamp: 'Apr', value: 820}, {timestamp: 'May', value: 850}, {timestamp: 'Jun', value: 830}] }, // Already existed, now explicitly a card.
  { id: '6', type: SensorType.SoilTemperature, currentValue: 20, unit: '°C', status: 'Optimal', historicalData: [{timestamp: 'Jan', value: 18}, {timestamp: 'Feb', value: 19}, {timestamp: 'Mar', value: 20}, {timestamp: 'Apr', value: 21}, {timestamp: 'May', value: 22}, {timestamp: 'Jun', value: 20}] },
  { id: '7', type: SensorType.RainLevel, currentValue: 2, unit: 'mm/hr', status: 'Stable', historicalData: [{timestamp: 'Jan', value: 0}, {timestamp: 'Feb', value: 1}, {timestamp: 'Mar', value: 5}, {timestamp: 'Apr', value: 2}, {timestamp: 'May', value: 0}, {timestamp: 'Jun', value: 3}] },
  { id: '8', type: SensorType.AirPressure, currentValue: 1012, unit: 'hPa', status: 'Stable', historicalData: [{timestamp: 'Jan', value: 1010}, {timestamp: 'Feb', value: 1011}, {timestamp: 'Mar', value: 1012}, {timestamp: 'Apr', value: 1013}, {timestamp: 'May', value: 1012}, {timestamp: 'Jun', value: 1011}] },
  { 
    id: '9', 
    type: SensorType.GasLevels, 
    currentValue: { co2: 450, nh3: 2.1, voc: 1.2 }, 
    unit: { co2: 'ppm', nh3: 'ppm', voc: 'ppm' },
    status: 'Optimal',
    historicalData: [
        {timestamp: 'Jan', co2: 420, nh3: 1.8, voc: 0.8}, 
        {timestamp: 'Feb', co2: 430, nh3: 1.9, voc: 0.9}, 
        {timestamp: 'Mar', co2: 450, nh3: 2.1, voc: 1.2}, 
        {timestamp: 'Apr', co2: 460, nh3: 2.2, voc: 1.3}, 
        {timestamp: 'May', co2: 455, nh3: 2.0, voc: 1.1}, 
        {timestamp: 'Jun', co2: 450, nh3: 2.1, voc: 1.2}
    ]
  },
  { 
    id: '10', 
    type: SensorType.NPKSensor, 
    currentValue: { nitrogen: 120, phosphorus: 55, potassium: 85 }, 
    unit: { nitrogen: 'mg/kg', phosphorus: 'mg/kg', potassium: 'mg/kg' },
    status: 'Optimal',
    historicalData: [
        {timestamp: 'Jan', nitrogen: 110, phosphorus: 45, potassium: 75}, 
        {timestamp: 'Feb', nitrogen: 115, phosphorus: 50, potassium: 80}, 
        {timestamp: 'Mar', nitrogen: 120, phosphorus: 55, potassium: 85}, 
        {timestamp: 'Apr', nitrogen: 125, phosphorus: 60, potassium: 90}, 
        {timestamp: 'May', nitrogen: 122, phosphorus: 58, potassium: 88}, 
        {timestamp: 'Jun', nitrogen: 120, phosphorus: 55, potassium: 85}
    ]
  },
];

export const getMockCrops = (): Crop[] => [
  { id: '1', name: 'Tomatoes', imageUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/320px-Bright_red_tomato_and_cross_section02.jpg`, waterNeeds: 'High', optimalPh: '6.0-6.8', sunlight: 'Full Sun', lastUpdated: '2 hours ago' },
  { id: '2', name: 'Lettuce', imageUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Lettuce_Mini_Cos_A.jpg/320px-Lettuce_Mini_Cos_A.jpg`, waterNeeds: 'Moderate', optimalPh: '6.0-7.0', sunlight: 'Partial Shade', lastUpdated: '1 day ago' },
  { id: '3', name: 'Carrots', imageUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/320px-Vegetable-Carrot-Bundle-wStalks.jpg`, waterNeeds: 'Moderate', optimalPh: '5.8-6.5', sunlight: 'Full Sun', lastUpdated: '3 hours ago' },
  { id: '4', name: 'Bell Peppers', imageUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sized_bell_peppers.jpg/320px-Sized_bell_peppers.jpg`, waterNeeds: 'High', optimalPh: '5.5-6.5', sunlight: 'Full Sun', lastUpdated: '5 hours ago' },
];

export const getMockYieldPrediction = (): ChartData[] => [
  { name: 'Jan', value: 10 }, { name: 'Feb', value: 12 }, { name: 'Mar', value: 15 },
  { name: 'Apr', value: 14 }, { name: 'May', value: 18 }, { name: 'Jun', value: 20 },
];

export const getMockDiseaseDetection = (): PieChartData[] => [
  { name: 'Healthy', value: 95, color: '#10B981' }, // emerald-500
  { name: 'Diseased', value: 5, color: '#EF4444' }, // red-500
];

export const getMockSoilQuality = (): PieChartData[] => [
  { name: 'Optimal', value: 70, color: '#10B981' },
  { name: 'Fair', value: 20, color: '#F59E0B' }, // amber-500
  { name: 'Poor', value: 10, color: '#EF4444' },
];

export const getMockNotifications = (): NotificationMessage[] => [
  { id: '1', messageKey: 'notifications.messageKeys.pestControlSuccess', timestamp: '10 minutes ago', type: 'success', icon: React.createElement(IconSuccess, { className: "w-5 h-5 text-green-500" }) },
  { id: '2', messageKey: 'notifications.messageKeys.cropGuidelines', timestamp: '1 hour ago', type: 'info', icon: React.createElement(IconInfo, { className: "w-5 h-5 text-blue-500" }) },
  { id: '3', messageKey: 'notifications.messageKeys.pestWarning', timestamp: '3 hours ago', type: 'warning', icon: React.createElement(IconWarning, { className: "w-5 h-5 text-yellow-500" }) },
  { id: '4', messageKey: 'notifications.messageKeys.systemUpdate', timestamp: '6 hours ago', type: 'info' },
  { id: '5', messageKey: 'notifications.messageKeys.irrigationError', timestamp: '1 day ago', type: 'error', icon: React.createElement(IconError, { className: "w-5 h-5 text-red-500" }) },
];

export const getMockAnalyticsMetrics = (): AnalyticsMetric[] => [
  { key: 'analytics.metric.totalYieldYTD', label: 'Total Yield (YTD)', value: '1500', unit: 'tons', status: 'On Target', icon: React.createElement(IconLeaf, { className: "w-6 h-6" }) },
  { key: 'analytics.metric.avgSoilMoisture', label: 'Avg. Soil Moisture', value: '75', unit: '%', status: 'Optimal', icon: React.createElement(IconWaterDrop, { className: "w-6 h-6" }) },
  { key: 'analytics.metric.pestIncidenceRate', label: 'Pest Incidence Rate', value: '5', unit: '%', status: 'Monitor Closely', icon: React.createElement(IconWarning, { className: "w-6 h-6" }) },
  { key: 'analytics.metric.avgSunlightHours', label: 'Avg. Sunlight Hours', value: '7.5', unit: 'hrs/day', status: 'Good', icon: React.createElement(IconSun, { className: "w-6 h-6" }) },
];

export const getMockMonthlyYieldReport = (): MonthlyReportData[] => [
  { name: 'Jan', value: 200 }, { name: 'Feb', value: 220 }, { name: 'Mar', value: 250 },
  { name: 'Apr', value: 230 }, { name: 'May', value: 280 }, { name: 'Jun', value: 300 },
  { name: 'Jul', value: 290 }, { name: 'Aug', value: 310 }, { name: 'Sep', value: 270 },
  { name: 'Oct', value: 260 }, { name: 'Nov', value: 240 }, { name: 'Dec', value: 210 },
];

export const getMockSoilMoistureTrends = (): MonthlyReportData[] => [
  { name: 'Jan', value: 65 }, { name: 'Feb', value: 68 }, { name: 'Mar', value: 70 },
  { name: 'Apr', value: 72 }, { name: 'May', value: 69 }, { name: 'Jun', value: 65 },
  { name: 'Jul', value: 62 }, { name: 'Aug', value: 60 }, { name: 'Sep', value: 63 },
  { name: 'Oct', value: 66 }, { name: 'Nov', value: 68 }, { name: 'Dec', value: 67 },
];

export const getMockPestIncidenceReport = (): MonthlyReportData[] => [
  { name: 'Jan', value: 2 }, { name: 'Feb', value: 3 }, { name: 'Mar', value: 2 },
  { name: 'Apr', value: 4 }, { name: 'May', value: 5 }, { name: 'Jun', value: 6 },
  { name: 'Jul', value: 5 }, { name: 'Aug', value: 4 }, { name: 'Sep', value: 7 },
  { name: 'Oct', value: 6 }, { name: 'Nov', value: 5 }, { name: 'Dec', value: 4 },
];
