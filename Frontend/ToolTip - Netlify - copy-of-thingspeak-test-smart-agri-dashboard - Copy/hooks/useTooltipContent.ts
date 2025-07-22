import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { SENSOR_TOOLTIPS, STATUS_TOOLTIPS, CHART_TOOLTIPS, ANALYTICS_TOOLTIPS, ML_MODELS_TOOLTIPS } from '../constants/tooltipContent';
import { SensorType } from '../types';

export const useTooltipContent = () => {
  const { currentLanguage } = useContext(LanguageContext);

  const getSensorTooltip = (sensorType: SensorType): string => {
    const lang = currentLanguage || 'en';
    const fallbackLang = 'en';
    
    switch (sensorType) {
      case SensorType.Temperature:
        return SENSOR_TOOLTIPS[lang]?.TEMPERATURE?.content || SENSOR_TOOLTIPS[fallbackLang]?.TEMPERATURE?.content || "Temperature sensor information.";
      case SensorType.Humidity:
        return SENSOR_TOOLTIPS[lang]?.HUMIDITY?.content || SENSOR_TOOLTIPS[fallbackLang]?.HUMIDITY?.content || "Humidity sensor information.";
      case SensorType.SoilMoisture:
        return SENSOR_TOOLTIPS[lang]?.SOIL_MOISTURE?.content || SENSOR_TOOLTIPS[fallbackLang]?.SOIL_MOISTURE?.content || "Soil moisture sensor information.";
      case SensorType.SoilTemperature:
        return SENSOR_TOOLTIPS[lang]?.SOIL_TEMPERATURE?.content || SENSOR_TOOLTIPS[fallbackLang]?.SOIL_TEMPERATURE?.content || "Soil temperature sensor information.";
      case SensorType.LightIntensity:
        return SENSOR_TOOLTIPS[lang]?.LIGHT_INTENSITY?.content || SENSOR_TOOLTIPS[fallbackLang]?.LIGHT_INTENSITY?.content || "Light intensity sensor information.";
      case SensorType.NPKSensor:
        const nitrogen = SENSOR_TOOLTIPS[lang]?.NITROGEN?.content || SENSOR_TOOLTIPS[fallbackLang]?.NITROGEN?.content || "Nitrogen information.";
        const phosphorus = SENSOR_TOOLTIPS[lang]?.PHOSPHORUS?.content || SENSOR_TOOLTIPS[fallbackLang]?.PHOSPHORUS?.content || "Phosphorus information.";
        const potassium = SENSOR_TOOLTIPS[lang]?.POTASSIUM?.content || SENSOR_TOOLTIPS[fallbackLang]?.POTASSIUM?.content || "Potassium information.";
        return `${nitrogen}\n\n${phosphorus}\n\n${potassium}`;
      case SensorType.GasLevels:
        return SENSOR_TOOLTIPS[lang]?.AIR_QUALITY?.content || SENSOR_TOOLTIPS[fallbackLang]?.AIR_QUALITY?.content || "Air quality sensor information.";
      case SensorType.RainLevel:
        return SENSOR_TOOLTIPS[lang]?.RAIN_SENSOR?.content || SENSOR_TOOLTIPS[fallbackLang]?.RAIN_SENSOR?.content || "Rain sensor information.";
      case SensorType.AirPressure:
        return SENSOR_TOOLTIPS[lang]?.AIR_PRESSURE?.content || SENSOR_TOOLTIPS[fallbackLang]?.AIR_PRESSURE?.content || "Air pressure sensor information.";
      default:
        return "This sensor provides important information about your crop growing conditions.";
    }
  };

  const getStatusTooltip = (status: string): string => {
    const lang = currentLanguage || 'en';
    const fallbackLang = 'en';
    
    // Convert status to uppercase and replace spaces with underscores for lookup
    const statusKey = status.toUpperCase().replace(/\s+/g, '_');
    
    // Check if the status exists in STATUS_TOOLTIPS
    const statusTooltip = STATUS_TOOLTIPS[lang]?.[statusKey as keyof typeof STATUS_TOOLTIPS[typeof lang]] || 
                         STATUS_TOOLTIPS[fallbackLang]?.[statusKey as keyof typeof STATUS_TOOLTIPS[typeof fallbackLang]];
    
    if (statusTooltip && typeof statusTooltip === 'object' && 'content' in statusTooltip) {
      return statusTooltip.content;
    }
    
    // Fallback for common status patterns
    if (status.toLowerCase().includes('optimal')) {
      return STATUS_TOOLTIPS[lang]?.OPTIMAL?.content || STATUS_TOOLTIPS[fallbackLang]?.OPTIMAL?.content || "Optimal conditions";
    }
    if (status.toLowerCase().includes('stable')) {
      return STATUS_TOOLTIPS[lang]?.STABLE?.content || STATUS_TOOLTIPS[fallbackLang]?.STABLE?.content || "Stable conditions";
    }
    if (status.toLowerCase().includes('warning')) {
      return STATUS_TOOLTIPS[lang]?.WARNING?.content || STATUS_TOOLTIPS[fallbackLang]?.WARNING?.content || "Warning conditions";
    }
    if (status.toLowerCase().includes('critical')) {
      return STATUS_TOOLTIPS[lang]?.CRITICAL?.content || STATUS_TOOLTIPS[fallbackLang]?.CRITICAL?.content || "Critical conditions";
    }
    
    return `Current status: ${status}`;
  };

  const getChartTooltip = (sensorTypeOrKey?: SensorType | string): string => {
    const lang = currentLanguage || 'en';
    const fallbackLang = 'en';
    
    let baseTooltip = SENSOR_TOOLTIPS[lang]?.HISTORICAL_DATA?.content || SENSOR_TOOLTIPS[fallbackLang]?.HISTORICAL_DATA?.content || "Historical data chart information.";
    
    if (sensorTypeOrKey) {
      // Handle string keys for dashboard charts
      if (typeof sensorTypeOrKey === 'string') {
        switch (sensorTypeOrKey) {
          case 'YIELD_PREDICTION':
            return CHART_TOOLTIPS[lang]?.YIELD_PREDICTION?.content || CHART_TOOLTIPS[fallbackLang]?.YIELD_PREDICTION?.content || "This chart shows predicted crop yields based on current growing conditions.";
          case 'DISEASE_DETECTION':
            return CHART_TOOLTIPS[lang]?.DISEASE_DETECTION?.content || CHART_TOOLTIPS[fallbackLang]?.DISEASE_DETECTION?.content || "This chart shows the health status of your crops.";
          case 'SOIL_QUALITY':
            return CHART_TOOLTIPS[lang]?.SOIL_QUALITY?.content || CHART_TOOLTIPS[fallbackLang]?.SOIL_QUALITY?.content || "This chart shows different aspects of your soil quality.";
          default:
            return baseTooltip;
        }
      }
      
      // Handle SensorType enum values
      switch (sensorTypeOrKey) {
        case SensorType.Temperature:
          baseTooltip = CHART_TOOLTIPS[lang]?.TEMPERATURE_CHART?.content || CHART_TOOLTIPS[fallbackLang]?.TEMPERATURE_CHART?.content || baseTooltip;
          break;
        case SensorType.Humidity:
          baseTooltip = CHART_TOOLTIPS[lang]?.HUMIDITY_CHART?.content || CHART_TOOLTIPS[fallbackLang]?.HUMIDITY_CHART?.content || baseTooltip;
          break;
        case SensorType.SoilMoisture:
          baseTooltip = CHART_TOOLTIPS[lang]?.MOISTURE_CHART?.content || CHART_TOOLTIPS[fallbackLang]?.MOISTURE_CHART?.content || baseTooltip;
          break;
        case SensorType.LightIntensity:
          baseTooltip = CHART_TOOLTIPS[lang]?.LIGHT_CHART?.content || CHART_TOOLTIPS[fallbackLang]?.LIGHT_CHART?.content || baseTooltip;
          break;
        case SensorType.NPKSensor:
          baseTooltip = CHART_TOOLTIPS[lang]?.NPK_CHART?.content || CHART_TOOLTIPS[fallbackLang]?.NPK_CHART?.content || baseTooltip;
          break;
      }
    }
    
    return baseTooltip;
  };

  const getDashboardTooltip = (element: string): string => {
    // For now, return generic dashboard tooltips since DASHBOARD_TOOLTIPS is not defined in the new structure
    switch (element) {
      case 'sensor_grid':
        return "This grid shows all your sensor readings in real-time. Each card displays current values and status for different environmental factors.";
      case 'ai_advisor':
        return "The AI advisor analyzes your farm data and provides personalized recommendations for optimal crop management.";
      case 'quick_actions':
        return "Quick actions provide shortcuts to common farming tasks like irrigation control, alerts management, and system settings.";
      default:
        return '';
    }
  };

  const getMetricTooltip = (metricName: string): string => {
    const lang = currentLanguage || 'en';
    const fallbackLang = 'en';
    
    switch (metricName.toLowerCase()) {
      case 'temperature':
        return SENSOR_TOOLTIPS[lang]?.TEMPERATURE?.content || SENSOR_TOOLTIPS[fallbackLang]?.TEMPERATURE?.content || "Temperature information.";
      case 'humidity':
        return SENSOR_TOOLTIPS[lang]?.HUMIDITY?.content || SENSOR_TOOLTIPS[fallbackLang]?.HUMIDITY?.content || "Humidity information.";
      case 'soil moisture':
        return SENSOR_TOOLTIPS[lang]?.SOIL_MOISTURE?.content || SENSOR_TOOLTIPS[fallbackLang]?.SOIL_MOISTURE?.content || "Soil moisture information.";
      case 'soil temperature':
        return SENSOR_TOOLTIPS[lang]?.SOIL_TEMPERATURE?.content || SENSOR_TOOLTIPS[fallbackLang]?.SOIL_TEMPERATURE?.content || "Soil temperature information.";
      case 'light intensity':
        return SENSOR_TOOLTIPS[lang]?.LIGHT_INTENSITY?.content || SENSOR_TOOLTIPS[fallbackLang]?.LIGHT_INTENSITY?.content || "Light intensity information.";
      case 'nitrogen':
        return SENSOR_TOOLTIPS[lang]?.NITROGEN?.content || SENSOR_TOOLTIPS[fallbackLang]?.NITROGEN?.content || "Nitrogen information.";
      case 'phosphorus':
        return SENSOR_TOOLTIPS[lang]?.PHOSPHORUS?.content || SENSOR_TOOLTIPS[fallbackLang]?.PHOSPHORUS?.content || "Phosphorus information.";
      case 'potassium':
        return SENSOR_TOOLTIPS[lang]?.POTASSIUM?.content || SENSOR_TOOLTIPS[fallbackLang]?.POTASSIUM?.content || "Potassium information.";
      case 'ph':
      case 'soil ph':
        return SENSOR_TOOLTIPS[lang]?.SOIL_PH?.content || SENSOR_TOOLTIPS[fallbackLang]?.SOIL_PH?.content || "Soil pH information.";
      case 'air quality':
        return SENSOR_TOOLTIPS[lang]?.AIR_QUALITY?.content || SENSOR_TOOLTIPS[fallbackLang]?.AIR_QUALITY?.content || "Air quality information.";
      case 'rain':
        return SENSOR_TOOLTIPS[lang]?.RAIN_SENSOR?.content || SENSOR_TOOLTIPS[fallbackLang]?.RAIN_SENSOR?.content || "Rain sensor information.";
      default:
        return '';
    }
  };

  const getAnalyticsTooltip = (type: string): string => {
    const lang = currentLanguage || 'en';
    const fallbackLang = 'en';
    
    switch (type.toLowerCase()) {
      case 'monthly_yield':
        return ANALYTICS_TOOLTIPS[lang]?.MONTHLY_YIELD?.content || ANALYTICS_TOOLTIPS[fallbackLang]?.MONTHLY_YIELD?.content || "Monthly yield analytics.";
      case 'soil_moisture_trends':
        return ANALYTICS_TOOLTIPS[lang]?.SOIL_MOISTURE_TRENDS?.content || ANALYTICS_TOOLTIPS[fallbackLang]?.SOIL_MOISTURE_TRENDS?.content || "Soil moisture trends.";
      case 'pest_incidence':
        return ANALYTICS_TOOLTIPS[lang]?.PEST_INCIDENCE?.content || ANALYTICS_TOOLTIPS[fallbackLang]?.PEST_INCIDENCE?.content || "Pest incidence analytics.";
      case 'metrics_cards':
        return ANALYTICS_TOOLTIPS[lang]?.METRICS_CARDS?.content || ANALYTICS_TOOLTIPS[fallbackLang]?.METRICS_CARDS?.content || "Performance metrics cards.";
      case 'ai_data_analyst':
        return ANALYTICS_TOOLTIPS[lang]?.AI_DATA_ANALYST?.content || ANALYTICS_TOOLTIPS[fallbackLang]?.AI_DATA_ANALYST?.content || "AI data analyst.";
      default:
        return '';
    }
  };

  const getMLModelTooltip = (modelType: string): string => {
    const lang = currentLanguage || 'en';
    const fallbackLang = 'en';
    
    switch (modelType.toLowerCase()) {
      case 'yield_prediction':
        return ML_MODELS_TOOLTIPS[lang]?.YIELD_PREDICTION?.content || ML_MODELS_TOOLTIPS[fallbackLang]?.YIELD_PREDICTION?.content || "Yield prediction model.";
      case 'disease_detection':
        return ML_MODELS_TOOLTIPS[lang]?.DISEASE_DETECTION?.content || ML_MODELS_TOOLTIPS[fallbackLang]?.DISEASE_DETECTION?.content || "Disease detection model.";
      case 'crop_recommendation':
        return ML_MODELS_TOOLTIPS[lang]?.CROP_RECOMMENDATION?.content || ML_MODELS_TOOLTIPS[fallbackLang]?.CROP_RECOMMENDATION?.content || "Crop recommendation model.";
      case 'optimal_planting':
        return ML_MODELS_TOOLTIPS[lang]?.OPTIMAL_PLANTING?.content || ML_MODELS_TOOLTIPS[fallbackLang]?.OPTIMAL_PLANTING?.content || "Optimal planting model.";
      case 'harvesting_time':
        return ML_MODELS_TOOLTIPS[lang]?.HARVESTING_TIME?.content || ML_MODELS_TOOLTIPS[fallbackLang]?.HARVESTING_TIME?.content || "Harvesting time model.";
      case 'training_hub':
        return ML_MODELS_TOOLTIPS[lang]?.TRAINING_HUB?.content || ML_MODELS_TOOLTIPS[fallbackLang]?.TRAINING_HUB?.content || "AI training hub.";
      default:
        return '';
    }
  };

  return {
    getSensorTooltip,
    getStatusTooltip,
    getChartTooltip,
    getDashboardTooltip,
    getMetricTooltip,
    getAnalyticsTooltip,
    getMLModelTooltip
  };
};
