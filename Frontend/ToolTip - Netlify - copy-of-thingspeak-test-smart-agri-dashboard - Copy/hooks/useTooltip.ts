import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { 
  getTooltipContent, 
  TooltipContent,
  SENSOR_TOOLTIPS,
  STATUS_TOOLTIPS,
  CHART_TOOLTIPS,
  ANALYTICS_TOOLTIPS,
  ML_MODELS_TOOLTIPS
} from '../constants/tooltipContent';

export const useTooltip = () => {
  const { t, currentLanguage } = useContext(LanguageContext);
  
  const getTooltip = (
    type: 'sensor' | 'status' | 'chart' | 'analytics' | 'ml',
    key: string
  ): TooltipContent => {
    return getTooltipContent(type, key, currentLanguage);
  };

  // Helper functions for each tooltip type
  const getSensorTooltip = (key: string): TooltipContent => {
    const lang = currentLanguage || 'en';
    return SENSOR_TOOLTIPS[lang]?.[key] || SENSOR_TOOLTIPS['en']?.[key] || { 
      title: key, 
      content: "No description available." 
    };
  };

  const getStatusTooltip = (key: string): TooltipContent => {
    const lang = currentLanguage || 'en';
    return STATUS_TOOLTIPS[lang]?.[key] || STATUS_TOOLTIPS['en']?.[key] || { 
      title: key, 
      content: "No description available." 
    };
  };

  const getChartTooltip = (key: string): TooltipContent => {
    const lang = currentLanguage || 'en';
    return CHART_TOOLTIPS[lang]?.[key] || CHART_TOOLTIPS['en']?.[key] || { 
      title: key, 
      content: "No description available." 
    };
  };

  const getAnalyticsTooltip = (key: string): TooltipContent => {
    const lang = currentLanguage || 'en';
    return ANALYTICS_TOOLTIPS[lang]?.[key] || ANALYTICS_TOOLTIPS['en']?.[key] || { 
      title: key, 
      content: "No description available." 
    };
  };

  const getMLTooltip = (key: string): TooltipContent => {
    return ML_MODELS_TOOLTIPS[currentLanguage]?.[key] || ML_MODELS_TOOLTIPS['en']?.[key] || { 
      title: key, 
      content: "No description available." 
    };
  };

  return {
    // Legacy support for existing translation keys
    getTooltipContent: (key: string) => t(key),
    
    // New multi-language tooltip methods
    getTooltip,
    getSensorTooltip,
    getStatusTooltip,
    getChartTooltip,
    getAnalyticsTooltip,
    getMLTooltip,
    currentLanguage,
    
    // Legacy tooltip keys (for backward compatibility)
    tooltipKeys: {
      temperature: 'tooltips.temperature',
      humidity: 'tooltips.humidity',
      soilMoisture: 'tooltips.soilMoisture',
      soilTemperature: 'tooltips.soilTemperature',
      lightIntensity: 'tooltips.lightIntensity',
      nitrogen: 'tooltips.nitrogen',
      phosphorus: 'tooltips.phosphorus',
      potassium: 'tooltips.potassium',
      soilPH: 'tooltips.soilPH',
      airQuality: 'tooltips.airQuality',
      rainSensor: 'tooltips.rainSensor',
      historicalCharts: 'tooltips.historicalCharts',
    }
  };
};
