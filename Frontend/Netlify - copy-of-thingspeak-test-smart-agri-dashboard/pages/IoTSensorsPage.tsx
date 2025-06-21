

import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Sensor, SensorType, SensorDataPoint, SoilMoistureStatusType, TemperatureStatusType, HumidityStatusType, SoilTemperatureStatusType, LightIntensityStatusType, RainLevelStatusType, AirPressureStatusType, GasLevelsStatusType, NPKStatusType, GeneralSensorStatus, generalSensorStatusValues } from '../types';
import { getMockSensors } from '../services/mockDataService';
import ChartCard from '../components/ChartCard';
import DashboardCard from '../components/DashboardCard'; 
import { IconWaterDrop, IconSun, IconLeaf, IconSensor, IconChip, IconChartBar } from '../constants'; 
import { LanguageContext } from '../contexts/LanguageContext';
import { fetchThingSpeakData, mapThingSpeakDataToSensors } from '../services/thingSpeakService';
import Spinner from '../components/Spinner';

interface ChartLineConfig {
  dataKey: string;
  nameKey: string; // Translation key for legend name
  strokeColor: string;
  fillId?: string; // For Area charts
}

interface ChartConfig {
  titleKey: string;
  subtitleKey: string;
  subtitleValues?: Record<string, string | number>;
  yAxisUnit: string;
  yAxisDomain?: [number | string, number | string];
  chartType: 'AreaChart' | 'LineChart';
  lines: ChartLineConfig[];
}

const POLLING_INTERVAL = 20000; // 20 seconds
const HISTORICAL_RESULTS_ON_POLL = 20; // Number of results to fetch during polling for charts
const INITIAL_HISTORICAL_RESULTS = 100; // Number of results for initial chart load


const IoTSensorsPage: React.FC = () => {
  const { t, currentLanguage } = useContext(LanguageContext);
  const [sensors, setSensors] = useState<Sensor[]>([]); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const chartCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const location = useLocation(); 

  const mapCompositeSensorToNA = (type: SensorType, tFunc: (key: string) => string, originalValue?: any): Record<string, string | number> => {
      const na = tFunc('common.na');
      let baseObject: Record<string, string | number> = {};

      if (typeof originalValue === 'object' && originalValue !== null) {
        Object.keys(originalValue).forEach(key => {
            baseObject[key] = originalValue[key] ?? na;
        });
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
  
  const loadSensorData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    
    const initialMockSensorsBase = getMockSensors();
     const placeholderSensors = initialMockSensorsBase.map(s => ({
        ...s, 
        currentValue: (s.type === SensorType.NPKSensor || s.type === SensorType.GasLevels) 
                        ? mapCompositeSensorToNA(s.type, t, s.currentValue)
                        : t('common.na'),
        status: s.type === SensorType.SoilMoisture ? SoilMoistureStatusType.NotAvailable :
                s.type === SensorType.Temperature ? TemperatureStatusType.NotAvailable :
                s.type === SensorType.Humidity ? HumidityStatusType.NotAvailable : 
                s.type === SensorType.SoilTemperature ? SoilTemperatureStatusType.NotAvailable :
                s.type === SensorType.LightIntensity ? LightIntensityStatusType.NotAvailable :
                s.type === SensorType.RainLevel ? RainLevelStatusType.NotAvailable :
                s.type === SensorType.AirPressure ? AirPressureStatusType.NotAvailable :
                s.type === SensorType.GasLevels ? GasLevelsStatusType.NotAvailable :
                s.type === SensorType.NPKSensor ? NPKStatusType.NotAvailable :
                'Stable', 
        historicalData: [] 
    } as Sensor));


    if (isInitialLoad && sensors.length === 0) {
        setSensors(placeholderSensors);
    }
    
    const resultsToFetch = isInitialLoad ? INITIAL_HISTORICAL_RESULTS : HISTORICAL_RESULTS_ON_POLL;
    const thingSpeakData = await fetchThingSpeakData(resultsToFetch); 
    
    const processedSensors = mapThingSpeakDataToSensors(thingSpeakData, initialMockSensorsBase, t);
    setSensors(processedSensors);
    
    if (isInitialLoad) setIsLoading(false);
  }, [t, sensors.length]); // Added sensors.length to deps for initial placeholder logic

  useEffect(() => {
    loadSensorData(true); 
    
    const intervalId = setInterval(() => {
      loadSensorData(false); 
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loadSensorData]); 

  useEffect(() => {
    if (!isLoading && location.hash) {
      const sensorTypeFromHash = location.hash.substring(1) as SensorType;
      if (sensorTypeFromHash && chartCardRefs.current[sensorTypeFromHash]) {
        setTimeout(() => { 
          chartCardRefs.current[sensorTypeFromHash]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 100);
      }
    }
  }, [isLoading, location.hash]);


  const handleSensorCardInteraction = (sensorType: SensorType) => {
    const targetElement = chartCardRefs.current[sensorType];
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        console.warn(`No historical chart found for sensor type: ${sensorType}, or ref not set.`);
    }
  };


  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case SensorType.SoilMoisture: return <IconWaterDrop className="w-6 h-6" />;
      case SensorType.Temperature: return <IconSun className="w-6 h-6" />;
      case SensorType.Humidity: return <IconLeaf className="w-6 h-6" />;
      case SensorType.LightIntensity: return <IconSun className="w-6 h-6" />;
      case SensorType.SoilTemperature: return <IconSun className="w-6 h-6" />;; 
      case SensorType.RainLevel: return <IconWaterDrop className="w-6 h-6" />; 
      case SensorType.AirPressure: return <IconSensor className="w-6 h-6" />; 
      case SensorType.GasLevels: return <IconChip className="w-6 h-6" />; 
      case SensorType.NPKSensor: return <IconLeaf className="w-6 h-6" />; 
      default: return <IconSensor className="w-6 h-6" />;
    }
  };

  const getTranslatedSensorType = (type: SensorType): string => {
    const key = `iotSensors.sensorType.${type.toLowerCase().replace(/\s+/g, '')}`;
    return t(key, { fallback: type });
  };
  
  const getTranslatedStatus = (statusKey: Sensor['status']): string => {
    let subKey = statusKey.toString(); 

    if (Object.values(SoilMoistureStatusType).includes(statusKey as SoilMoistureStatusType) ||
        Object.values(TemperatureStatusType).includes(statusKey as TemperatureStatusType) ||
        Object.values(HumidityStatusType).includes(statusKey as HumidityStatusType) ||
        Object.values(SoilTemperatureStatusType).includes(statusKey as SoilTemperatureStatusType) ||
        Object.values(LightIntensityStatusType).includes(statusKey as LightIntensityStatusType) ||
        Object.values(RainLevelStatusType).includes(statusKey as RainLevelStatusType) ||
        Object.values(AirPressureStatusType).includes(statusKey as AirPressureStatusType) ||
        Object.values(GasLevelsStatusType).includes(statusKey as GasLevelsStatusType) ||
        Object.values(NPKStatusType).includes(statusKey as NPKStatusType) 
      ) { 
      subKey = statusKey.toString();
    } else if (typeof statusKey === 'string' && generalSensorStatusValues.includes(statusKey as GeneralSensorStatus)) {
      subKey = statusKey.toLowerCase();
    }
    
    const key = `iotSensors.status.${subKey}`;
    return t(key, { fallback: statusKey.toString() });
  };

  const getStatusTextColorClass = (statusKey: Sensor['status']): string => {
    switch (statusKey) {
        // Optimal statuses
        case SoilMoistureStatusType.OptimalMoisture:
        case TemperatureStatusType.OptimalTemperature:
        case HumidityStatusType.OptimalHumidity:
        case SoilTemperatureStatusType.Optimal:
        case LightIntensityStatusType.BrightLight: 
        case AirPressureStatusType.NormalPressure:
        case GasLevelsStatusType.Optimal:
        case NPKStatusType.Optimal: // New
        case 'Optimal': // General Optimal
        case 'Stable':  // General Stable
            return 'text-green-500';

        // Warning/Actionable but not critical statuses
        case SoilMoistureStatusType.DryNeedsIrrigation:
        case SoilMoistureStatusType.WetReduceIrrigation:
        case HumidityStatusType.TooDry:
        case HumidityStatusType.TooHumid:
        case LightIntensityStatusType.MediumLight:
        case AirPressureStatusType.LowPressure: 
        case GasLevelsStatusType.Attention:
        case NPKStatusType.Deficiency: // New - Yellow for deficiency
        case 'Warning':
            return 'text-yellow-500';
        
        // Cool/High Pressure (Clear) statuses
        case TemperatureStatusType.TooCold:
        case SoilTemperatureStatusType.Cool:
        case AirPressureStatusType.HighPressure: 
            return 'text-sky-500'; 
        
        // Critical/Hot/Excess statuses
        case TemperatureStatusType.TooHot:
        case SoilTemperatureStatusType.HeatStress:
        case SoilMoistureStatusType.Waterlogged:
        case NPKStatusType.Excess: // New - Red for excess
        case 'Critical': 
            return 'text-red-500';
        
        // Dark/Low Light statuses
        case LightIntensityStatusType.VeryDark:
            return 'text-indigo-600'; 
        case LightIntensityStatusType.LowLight:
            return 'text-gray-500'; 

        // Rain Level statuses
        case RainLevelStatusType.LightRain:
            return 'text-sky-500'; 
        case RainLevelStatusType.ModerateRain:
            return 'text-blue-500';
        case RainLevelStatusType.HeavyRain:
            return 'text-indigo-600';
        case RainLevelStatusType.Dry: 
        case RainLevelStatusType.NotAvailable: 
            return 'text-gray-500';

        // Not Available statuses for other sensors
        case SoilMoistureStatusType.NotAvailable:
        case TemperatureStatusType.NotAvailable:
        case HumidityStatusType.NotAvailable:
        case SoilTemperatureStatusType.NotAvailable:
        case LightIntensityStatusType.NotAvailable:
        case AirPressureStatusType.NotAvailable:
        case GasLevelsStatusType.NotAvailable:
        case NPKStatusType.NotAvailable: // New
        default: 
            return 'text-gray-500';
    }
  };
  
  const gridSensorTypesForCards: SensorType[] = [
    SensorType.SoilMoisture, SensorType.Temperature, SensorType.Humidity,
    SensorType.SoilTemperature, SensorType.LightIntensity, SensorType.NPKSensor,
    SensorType.RainLevel, SensorType.AirPressure, SensorType.GasLevels,
  ];

  const dashboardCardSensors = gridSensorTypesForCards.map(type => {
    return sensors.find(s => s.type === type) || 
           getMockSensors().find(ms => ms.type === type) || 
           { 
             id: type, type: type, 
             currentValue: t('common.na'), unit: '', 
             status: type === SensorType.SoilMoisture ? SoilMoistureStatusType.NotAvailable :
                     type === SensorType.Temperature ? TemperatureStatusType.NotAvailable :
                     type === SensorType.Humidity ? HumidityStatusType.NotAvailable : 
                     type === SensorType.SoilTemperature ? SoilTemperatureStatusType.NotAvailable :
                     type === SensorType.LightIntensity ? LightIntensityStatusType.NotAvailable :
                     type === SensorType.RainLevel ? RainLevelStatusType.NotAvailable : 
                     type === SensorType.AirPressure ? AirPressureStatusType.NotAvailable :
                     type === SensorType.GasLevels ? GasLevelsStatusType.NotAvailable :
                     type === SensorType.NPKSensor ? NPKStatusType.NotAvailable :
                     'Critical', 
             historicalData: [] 
           } as Sensor;
  }).filter(s => s !== undefined) as Sensor[];


  const sensorsForHistoricalCharts = sensors.filter(
    s => s.historicalData && s.historicalData.length > 0 && 
    [ 
      SensorType.Temperature, SensorType.SoilMoisture, SensorType.Humidity,
      SensorType.LightIntensity, SensorType.SoilTemperature, SensorType.NPKSensor
    ].includes(s.type)
  );


  const renderCompositeSensorDetails = (sensor: Sensor) => {
    if (typeof sensor.currentValue !== 'object' || sensor.currentValue === null) {
      return <p>{String(sensor.currentValue)} {typeof sensor.unit === 'string' ? sensor.unit : ''}</p>;
    }

    const valueObject = sensor.currentValue as Record<string, string | number>;
    const units = typeof sensor.unit === 'object' ? sensor.unit : null;
    const naText = t('common.na');

    if (sensor.type === SensorType.GasLevels) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-baseline"><span className="text-sm text-textMedium">{t('iotSensors.gasLevels.co2')}:</span><div className="text-right"><span className="text-xl font-bold text-textDark">{valueObject.co2 ?? naText}</span><span className="text-xs text-textMedium ml-1">{units?.co2 || 'ppm'}</span></div></div>
          <div className="flex justify-between items-baseline"><span className="text-sm text-textMedium">{t('iotSensors.gasLevels.nh3')}:</span><div className="text-right"><span className="text-xl font-bold text-textDark">{valueObject.nh3 ?? naText}</span><span className="text-xs text-textMedium ml-1">{units?.nh3 || 'ppm'}</span></div></div>
          <div className="flex justify-between items-baseline"><span className="text-sm text-textMedium">{t('iotSensors.gasLevels.voc')}:</span><div className="text-right"><span className="text-xl font-bold text-textDark">{valueObject.voc ?? naText}</span><span className="text-xs text-textMedium ml-1">{units?.voc || 'ppm'}</span></div></div>
        </div>
      );
    }

    if (sensor.type === SensorType.NPKSensor) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-baseline"><span className="text-sm text-textMedium">{t('iotSensors.npkSensor.nitrogen')}:</span><div className="text-right"><span className="text-xl font-bold text-textDark">{valueObject.nitrogen ?? naText}</span><span className="text-xs text-textMedium ml-1">{units?.nitrogen || 'mg/kg'}</span></div></div>
          <div className="flex justify-between items-baseline"><span className="text-sm text-textMedium">{t('iotSensors.npkSensor.phosphorus')}:</span><div className="text-right"><span className="text-xl font-bold text-textDark">{valueObject.phosphorus ?? naText}</span><span className="text-xs text-textMedium ml-1">{units?.phosphorus || 'mg/kg'}</span></div></div>
          <div className="flex justify-between items-baseline"><span className="text-sm text-textMedium">{t('iotSensors.npkSensor.potassium')}:</span><div className="text-right"><span className="text-xl font-bold text-textDark">{valueObject.potassium ?? naText}</span><span className="text-xs text-textMedium ml-1">{units?.potassium || 'mg/kg'}</span></div></div>
        </div>
      );
    }
    return null;
  };
  
  const getCardValue = (sensor: Sensor, isComposite: boolean): string | number => {
    if (isComposite) return '\u00A0'; 
    return sensor.currentValue === null ? t('common.na') : 
           (typeof sensor.currentValue === 'number' || typeof sensor.currentValue === 'string') ? sensor.currentValue : t('common.na');
  };

  const getCardUnit = (sensor: Sensor, isComposite: boolean): string | undefined => {
    if (isComposite) return ''; 
    if (sensor.type === SensorType.SoilMoisture) {
        return "ADC";
    }
    return typeof sensor.unit === 'string' ? sensor.unit : undefined;
  };
  
  const getChartConfig = (sensor: Sensor): ChartConfig => {
    const na = t('common.na');
    let config: ChartConfig = {
      titleKey: '', subtitleKey: '', subtitleValues: {}, yAxisUnit: '',
      chartType: 'AreaChart', lines: []
    };
    const currentValue = sensor.currentValue;

    switch (sensor.type) {
      case SensorType.Temperature:
        config = { titleKey: 'iotSensors.charts.temperature.title', subtitleKey: 'iotSensors.charts.temperature.subtitleCurrent', subtitleValues: { value: typeof currentValue === 'number' || typeof currentValue === 'string' ? currentValue : na }, yAxisUnit: '°C', chartType: 'AreaChart', lines: [{ dataKey: 'value', nameKey: 'iotSensors.charts.legend.temperature', strokeColor: '#F59E0B', fillId: 'colorTemp' }]}; break;
      case SensorType.SoilMoisture:
        config = { titleKey: 'iotSensors.charts.soilMoisture.title', subtitleKey: 'iotSensors.charts.soilMoisture.subtitleCurrent', subtitleValues: { value:  typeof currentValue === 'number' || typeof currentValue === 'string' ? currentValue : na }, yAxisUnit: 'ADC', chartType: 'AreaChart', lines: [{ dataKey: 'value', nameKey: 'iotSensors.charts.legend.soilMoisture', strokeColor: '#3B82F6', fillId: 'colorMoisture' }]}; break;
      case SensorType.Humidity:
        config = { titleKey: 'iotSensors.charts.humidity.title', subtitleKey: 'iotSensors.charts.humidity.subtitleCurrent', subtitleValues: { value:  typeof currentValue === 'number' || typeof currentValue === 'string' ? currentValue : na }, yAxisUnit: '%', yAxisDomain: [0, 100], chartType: 'LineChart', lines: [{ dataKey: 'value', nameKey: 'iotSensors.charts.legend.humidity', strokeColor: '#10B981' }]}; break;
      case SensorType.LightIntensity:
        config = { titleKey: 'iotSensors.charts.lightIntensity.title', subtitleKey: 'iotSensors.charts.lightIntensity.subtitleCurrent', subtitleValues: { value:  typeof currentValue === 'number' || typeof currentValue === 'string' ? currentValue : na }, yAxisUnit: 'lux', chartType: 'AreaChart', lines: [{ dataKey: 'value', nameKey: 'iotSensors.charts.legend.lightIntensity', strokeColor: '#EAB308', fillId: 'colorLightIntensity' }]}; break;
      case SensorType.SoilTemperature:
        config = { titleKey: 'iotSensors.charts.soilTemperature.title', subtitleKey: 'iotSensors.charts.soilTemperature.subtitleCurrent', subtitleValues: { value:  typeof currentValue === 'number' || typeof currentValue === 'string' ? currentValue : na }, yAxisUnit: '°C', chartType: 'AreaChart', lines: [{ dataKey: 'value', nameKey: 'iotSensors.charts.legend.soilTemperature', strokeColor: '#EA580C', fillId: 'colorSoilTemp' }]}; break;
      case SensorType.NPKSensor:
        const NPKValues = currentValue as {nitrogen?: any, phosphorus?: any, potassium?: any};
        config = { titleKey: 'iotSensors.charts.npkLevels.title', subtitleKey: 'iotSensors.charts.npkLevels.subtitleCurrent',
          subtitleValues: { 
            nitrogen: NPKValues?.nitrogen ?? na, 
            phosphorus: NPKValues?.phosphorus ?? na, 
            potassium: NPKValues?.potassium ?? na 
          },
          yAxisUnit: 'mg/kg', chartType: 'AreaChart',
          lines: [
            { dataKey: 'nitrogen', nameKey: 'iotSensors.charts.legend.nitrogen', strokeColor: '#0D9488', fillId: 'colorNitrogen' },
            { dataKey: 'phosphorus', nameKey: 'iotSensors.charts.legend.phosphorus', strokeColor: '#A78BFA', fillId: 'colorPhosphorus' },
            { dataKey: 'potassium', nameKey: 'iotSensors.charts.legend.potassium', strokeColor: '#FB923C', fillId: 'colorPotassium' },
          ]}; break;
      default:
        const genericType = sensor.type.toLowerCase().replace(/\s+/g, '');
        config = { titleKey: `iotSensors.charts.${genericType}.title`, subtitleKey: `iotSensors.charts.${genericType}.subtitleCurrent`, subtitleValues: { value: typeof currentValue === 'number' || typeof currentValue === 'string' ? currentValue : na }, yAxisUnit: typeof sensor.unit === 'string' ? sensor.unit : '', chartType: 'AreaChart', lines: [{ dataKey: 'value', nameKey: `iotSensors.charts.legend.${genericType}`, strokeColor: '#777777', fillId: `color${sensor.type.replace(/\s+/g, '')}` }]};
    }
    return config;
  };
  
  const formatChartTimestamp = (isoTimestamp: string) => {
    const date = new Date(isoTimestamp);
    if (isNaN(date.getTime())) {
      return isoTimestamp; 
    }
    return date.toLocaleTimeString(currentLanguage, { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-textDark">{t('iotSensors.pageTitle')}</h2>
      
      {isLoading && sensors.length === 0 && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}

      {sensors.length > 0 && (
        <>          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {dashboardCardSensors.map(sensor => {
                if (!sensor) return null;
                const isComposite = sensor.type === SensorType.NPKSensor || sensor.type === SensorType.GasLevels;
                const hasHistoricalChart = sensorsForHistoricalCharts.some(histSensor => histSensor.type === sensor.type);
                const sensorTitle = getTranslatedSensorType(sensor.type);
                
                return (
                    <DashboardCard 
                        key={sensor.id}
                        title={sensorTitle}
                        value={getCardValue(sensor, isComposite)}
                        unit={getCardUnit(sensor, isComposite)}
                        status={getTranslatedStatus(sensor.status)}
                        statusTextColorClass={getStatusTextColorClass(sensor.status)}
                        icon={getSensorIcon(sensor.type)}
                        onCardClick={hasHistoricalChart ? () => handleSensorCardInteraction(sensor.type) : undefined}
                        chartActionIcon={hasHistoricalChart ? <IconChartBar className="w-5 h-5" /> : undefined}
                        onChartActionClick={hasHistoricalChart ? () => handleSensorCardInteraction(sensor.type) : undefined}
                        chartActionIconAriaLabel={hasHistoricalChart ? t('iotSensors.actions.viewChart', { sensorName: sensorTitle }) : undefined}
                    >
                        {isComposite && renderCompositeSensorDetails(sensor)}
                    </DashboardCard>
                );
            })}
          </div>          {sensorsForHistoricalCharts.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-textDark">{t('iotSensors.historicalData.title')}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/><stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorLightIntensity" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EAB308" stopOpacity={0.8}/><stop offset="95%" stopColor="#EAB308" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorSoilTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EA580C" stopOpacity={0.8}/><stop offset="95%" stopColor="#EA580C" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorNitrogen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/><stop offset="95%" stopColor="#0D9488" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorPhosphorus" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#A78BFA" stopOpacity={0.8}/><stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorPotassium" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FB923C" stopOpacity={0.8}/><stop offset="95%" stopColor="#FB923C" stopOpacity={0}/></linearGradient>
                  </defs>
                </svg>
                {sensorsForHistoricalCharts.map(sensor => {
                  if (!sensor.historicalData || sensor.historicalData.length === 0) return (
                    <div key={`${sensor.id}-chart-wrapper-nodata`} ref={el => { chartCardRefs.current[sensor.type] = el; }} className="w-full">
                      <ChartCard title={getTranslatedSensorType(sensor.type)} subtitle={t('common.na')}>
                        <div className="flex items-center justify-center h-full text-textMedium">{t('iotSensors.historicalData.noData', {sensorName: getTranslatedSensorType(sensor.type)})}</div>
                      </ChartCard>
                    </div>
                  );

                  const config = getChartConfig(sensor);
                  const ChartComponent = config.chartType === 'LineChart' ? LineChart : AreaChart;

                  return (
                    <div key={`${sensor.id}-chart-wrapper`} ref={el => { chartCardRefs.current[sensor.type] = el; }} className="w-full">
                        <ChartCard title={t(config.titleKey)} subtitle={t(config.subtitleKey, config.subtitleValues)}>
                          <ResponsiveContainer width="100%" height={300}>
                            <ChartComponent data={sensor.historicalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis 
                                dataKey="timestamp" 
                                tickFormatter={formatChartTimestamp} 
                                tick={{ fill: '#6B7280', fontSize: 10 }} 
                                className="text-xs"
                              />
                              <YAxis 
                                tick={{ fill: '#6B7280', fontSize: 10 }} 
                                unit={config.yAxisUnit} 
                                domain={config.yAxisDomain as [number | string, number | string] | undefined} 
                                allowDataOverflow={true}
                                className="text-xs"
                              />
                              <Tooltip 
                                labelFormatter={formatChartTimestamp} 
                                contentStyle={{ 
                                  backgroundColor: 'white', 
                                  border: '1px solid #ccc', 
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }} 
                              />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              {config.lines.map(line => (
                                config.chartType === 'LineChart' ? (
                                  <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} name={t(line.nameKey)} stroke={line.strokeColor} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls={false} />
                                ) : (
                                  <Area key={line.dataKey} type="monotone" dataKey={line.dataKey} name={t(line.nameKey)} stroke={line.strokeColor} fillOpacity={1} fill={`url(#${line.fillId})`} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls={false} />
                                )
                              ))}
                            </ChartComponent>
                          </ResponsiveContainer>
                        </ChartCard>
                      </div>
                  );
                })}
              </div>
            </div>
          )}
           {sensorsForHistoricalCharts.length === 0 && !isLoading && sensors.length > 0 && (
             <p className="text-textMedium text-center py-4">{t('iotSensors.historicalData.noneAvailable')}</p>
           )}          <div className="mt-8 bg-card p-4 sm:p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-textDark mb-4">{t('iotSensors.allReadings.title')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('iotSensors.table.header.sensorType')}</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('iotSensors.table.header.currentValue')}</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('iotSensors.table.header.unit')}</th>
                    <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('iotSensors.table.header.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{sensors.map(sensor => {
                    let displayValue: string;
                    let displayUnit: string;

                    if (typeof sensor.currentValue === 'object' && sensor.currentValue !== null) {
                      const cv = sensor.currentValue as Record<string, any>;
                      if (sensor.type === SensorType.GasLevels) { 
                        displayValue = `${t('iotSensors.gasLevels.co2')}: ${cv.co2 ?? t('common.na')}, ${t('iotSensors.gasLevels.nh3')}: ${cv.nh3 ?? t('common.na')}, ${t('iotSensors.gasLevels.voc')}: ${cv.voc ?? t('common.na')}`;
                        const units = sensor.unit as {co2?: string};
                        displayUnit = units?.co2 || 'ppm'; 
                      } else if (sensor.type === SensorType.NPKSensor) {
                        displayValue = `${t('iotSensors.npkSensor.nitrogen')}: ${cv.nitrogen ?? t('common.na')}, ${t('iotSensors.npkSensor.phosphorus')}: ${cv.phosphorus ?? t('common.na')}, ${t('iotSensors.npkSensor.potassium')}: ${cv.potassium ?? t('common.na')}`;
                        const units = sensor.unit as {nitrogen?: string};
                        displayUnit = units?.nitrogen || 'mg/kg';
                      } else {
                        displayValue = Object.entries(cv).map(([key, val]) => `${key}: ${val ?? t('common.na')}`).join(', ');
                        displayUnit = '';
                      }
                    } else { 
                      displayValue = sensor.currentValue === null ? t('common.na') : String(sensor.currentValue);
                      if (sensor.type === SensorType.SoilMoisture) {
                        displayUnit = "ADC";
                      } else {
                        displayUnit = typeof sensor.unit === 'string' ? sensor.unit : '';
                      }
                    }
                    
                    const statusKey = sensor.status;
                    const statusColorClass = getStatusTextColorClass(statusKey);                    return (
                      <tr key={sensor.id}>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="whitespace-nowrap">{getTranslatedSensorType(sensor.type)}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate" title={displayValue}>{displayValue}</div>
                          <div className="sm:hidden text-xs text-gray-400 mt-1">{displayUnit}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{displayUnit}</td>
                        <td className="px-3 sm:px-6 py-4 text-sm">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${statusColorClass.includes('green') ? 'bg-green-100 text-green-800' :
                              statusColorClass.includes('sky') ? 'bg-sky-100 text-sky-800' : 
                              statusColorClass.includes('blue') ? 'bg-blue-100 text-blue-800' : 
                              statusColorClass.includes('yellow') ? 'bg-yellow-100 text-yellow-800' :
                              statusColorClass.includes('red') ? 'bg-red-100 text-red-800' :
                              statusColorClass.includes('indigo') ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {getTranslatedStatus(statusKey)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IoTSensorsPage;