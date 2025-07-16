import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export const useTooltip = () => {
  const { t } = useContext(LanguageContext);

  return {
    getTooltipContent: (key: string) => t(key),
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
