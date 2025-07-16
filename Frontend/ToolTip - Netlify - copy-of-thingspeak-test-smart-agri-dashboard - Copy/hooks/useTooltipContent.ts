import { SENSOR_TOOLTIPS, STATUS_TOOLTIPS, CHART_TOOLTIPS, DASHBOARD_TOOLTIPS, ANALYTICS_TOOLTIPS, ML_MODELS_TOOLTIPS } from '../constants/tooltipContent';
import { SensorType } from '../types';

export const useTooltipContent = () => {

  const getSensorTooltip = (sensorType: SensorType): string => {
    switch (sensorType) {
      case SensorType.Temperature:
        return SENSOR_TOOLTIPS.TEMPERATURE.content;
      case SensorType.Humidity:
        return SENSOR_TOOLTIPS.HUMIDITY.content;
      case SensorType.SoilMoisture:
        return SENSOR_TOOLTIPS.SOIL_MOISTURE.content;
      case SensorType.SoilTemperature:
        return SENSOR_TOOLTIPS.SOIL_TEMPERATURE.content;
      case SensorType.LightIntensity:
        return SENSOR_TOOLTIPS.LIGHT_INTENSITY.content;
      case SensorType.NPKSensor:
        return `${SENSOR_TOOLTIPS.NITROGEN.content}\n\n${SENSOR_TOOLTIPS.PHOSPHORUS.content}\n\n${SENSOR_TOOLTIPS.POTASSIUM.content}`;
      case SensorType.GasLevels:
        return SENSOR_TOOLTIPS.AIR_QUALITY.content;
      case SensorType.RainLevel:
        return SENSOR_TOOLTIPS.RAIN_SENSOR.content;
      case SensorType.AirPressure:
        return "This measures atmospheric pressure, which affects weather patterns. Changes in pressure can indicate incoming weather changes that affect your crops.";
      default:
        return "This sensor provides important information about your crop growing conditions.";
    }
  };

  const getStatusTooltip = (status: string): string => {
    // Convert status to uppercase and replace spaces with underscores for lookup
    const statusKey = status.toUpperCase().replace(/\s+/g, '_');
    
    // Check if the status exists in STATUS_TOOLTIPS
    if (statusKey in STATUS_TOOLTIPS) {
      return STATUS_TOOLTIPS[statusKey as keyof typeof STATUS_TOOLTIPS];
    }
    
    // Fallback for common status patterns
    if (status.toLowerCase().includes('optimal')) return STATUS_TOOLTIPS.OPTIMAL;
    if (status.toLowerCase().includes('stable')) return STATUS_TOOLTIPS.STABLE;
    if (status.toLowerCase().includes('warning')) return STATUS_TOOLTIPS.WARNING;
    if (status.toLowerCase().includes('critical')) return STATUS_TOOLTIPS.CRITICAL;
    
    return `Current status: ${status}`;
  };

  const getChartTooltip = (sensorType?: SensorType): string => {
    let baseTooltip = SENSOR_TOOLTIPS.HISTORICAL_DATA.content;
    
    if (sensorType) {
      switch (sensorType) {
        case SensorType.Temperature:
          baseTooltip = CHART_TOOLTIPS.TEMPERATURE_CHART;
          break;
        case SensorType.Humidity:
          baseTooltip = CHART_TOOLTIPS.HUMIDITY_CHART;
          break;
        case SensorType.SoilMoisture:
          baseTooltip = CHART_TOOLTIPS.MOISTURE_CHART;
          break;
        case SensorType.LightIntensity:
          baseTooltip = CHART_TOOLTIPS.LIGHT_CHART;
          break;
        case SensorType.NPKSensor:
          baseTooltip = CHART_TOOLTIPS.NPK_CHART;
          break;
      }
    }
    
    return baseTooltip;
  };

  const getDashboardTooltip = (element: string): string => {
    switch (element) {
      case 'sensor_grid':
        return DASHBOARD_TOOLTIPS.SENSOR_GRID;
      case 'ai_advisor':
        return DASHBOARD_TOOLTIPS.AI_ADVISOR;
      case 'quick_actions':
        return DASHBOARD_TOOLTIPS.QUICK_ACTIONS;
      default:
        return '';
    }
  };

  const getMetricTooltip = (metricName: string): string => {
    switch (metricName.toLowerCase()) {
      case 'temperature':
        return SENSOR_TOOLTIPS.TEMPERATURE.content;
      case 'humidity':
        return SENSOR_TOOLTIPS.HUMIDITY.content;
      case 'soil moisture':
        return SENSOR_TOOLTIPS.SOIL_MOISTURE.content;
      case 'soil temperature':
        return SENSOR_TOOLTIPS.SOIL_TEMPERATURE.content;
      case 'light intensity':
        return SENSOR_TOOLTIPS.LIGHT_INTENSITY.content;
      case 'nitrogen':
        return SENSOR_TOOLTIPS.NITROGEN.content;
      case 'phosphorus':
        return SENSOR_TOOLTIPS.PHOSPHORUS.content;
      case 'potassium':
        return SENSOR_TOOLTIPS.POTASSIUM.content;
      case 'ph':
      case 'soil ph':
        return SENSOR_TOOLTIPS.SOIL_PH.content;
      case 'air quality':
        return SENSOR_TOOLTIPS.AIR_QUALITY.content;
      case 'rain':
        return SENSOR_TOOLTIPS.RAIN_SENSOR.content;
      default:
        return '';
    }
  };

  const getAnalyticsTooltip = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'monthly_yield':
        return ANALYTICS_TOOLTIPS.MONTHLY_YIELD;
      case 'soil_moisture_trends':
        return ANALYTICS_TOOLTIPS.SOIL_MOISTURE_TRENDS;
      case 'pest_incidence':
        return ANALYTICS_TOOLTIPS.PEST_INCIDENCE;
      case 'metrics_cards':
        return ANALYTICS_TOOLTIPS.METRICS_CARDS;
      case 'ai_data_analyst':
        return ANALYTICS_TOOLTIPS.AI_DATA_ANALYST;
      default:
        return '';
    }
  };

  const getMLModelTooltip = (modelType: string): string => {
    switch (modelType.toLowerCase()) {
      case 'yield_prediction':
        return ML_MODELS_TOOLTIPS.YIELD_PREDICTION;
      case 'disease_detection':
        return ML_MODELS_TOOLTIPS.DISEASE_DETECTION;
      case 'crop_recommendation':
        return ML_MODELS_TOOLTIPS.CROP_RECOMMENDATION;
      case 'optimal_planting':
        return ML_MODELS_TOOLTIPS.OPTIMAL_PLANTING;
      case 'harvesting_time':
        return ML_MODELS_TOOLTIPS.HARVESTING_TIME;
      case 'training_hub':
        return ML_MODELS_TOOLTIPS.TRAINING_HUB;
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
