

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import ChartCard from '../components/ChartCard';
import { Sensor, ChartData, PieChartData, SensorType, SoilMoistureStatusType, GeneralSensorStatus, TemperatureStatusType, HumidityStatusType, generalSensorStatusValues } from '../types';
import { getMockSensors, getMockYieldPrediction, getMockDiseaseDetection, getMockSoilQuality } from '../services/mockDataService';
import { IconWaterDrop, IconSun, IconLeaf, IconChip, IconChevronDown } from '../constants'; 
import Spinner from '../components/Spinner';
import { getFarmingAdvice } from '../services/geminiService';
import GeminiResponseDisplay from '../components/GeminiResponseDisplay';
import { LanguageContext } from '../contexts/LanguageContext';
import { fetchThingSpeakData, mapThingSpeakDataToSensors, parseFloatSafe } from '../services/thingSpeakService';

const POLLING_INTERVAL = 20000; // 20 seconds

const DashboardPage: React.FC = () => {
  const { currentLanguage, t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>(getMockSensors().map(s => ({
    ...s, 
    status: s.type === SensorType.SoilMoisture ? SoilMoistureStatusType.NotAvailable :
            s.type === SensorType.Temperature ? TemperatureStatusType.NotAvailable :
            s.type === SensorType.Humidity ? HumidityStatusType.NotAvailable : 'Stable', 
    currentValue: t('common.na') 
  })));
  const [yieldPrediction, setYieldPrediction] = useState<ChartData[]>([]);
  const [diseaseData, setDiseaseData] = useState<PieChartData[]>([]);
  const [soilQualityData, setSoilQualityData] = useState<PieChartData[]>([]);
  const [farmingAdvice, setFarmingAdvice] = useState<string | null>(null);
  const [isLoadingSensors, setIsLoadingSensors] = useState<boolean>(true);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [isUpcomingModelsOpen, setIsUpcomingModelsOpen] = useState(false);


  const loadSensorData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoadingSensors(true);
    const initialSensorsBase = getMockSensors(); // Base structure
    const thingSpeakData = await fetchThingSpeakData(1); // Fetch only latest for dashboard cards
    const processedSensors = mapThingSpeakDataToSensors(thingSpeakData, initialSensorsBase, t);
    setSensors(processedSensors);
    if (isInitialLoad) setIsLoadingSensors(false);
  }, [t]);

  useEffect(() => {
    loadSensorData(true); // Initial load

    setYieldPrediction(getMockYieldPrediction());
    setDiseaseData([
      { name: t('dashboard.healthy'), value: 95, color: '#10B981' },
      { name: t('dashboard.diseased'), value: 5, color: '#EF4444' },
    ]);
    setSoilQualityData([
      { name: t('dashboard.optimal'), value: 70, color: '#10B981' },
      { name: t('dashboard.fair'), value: 20, color: '#F59E0B' },
      { name: t('dashboard.poor'), value: 10, color: '#EF4444' },
    ]);
    
    const intervalId = setInterval(() => {
      loadSensorData(false); // Subsequent polling
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [t, loadSensorData]);

  useEffect(() => {
    const fetchAdvice = async () => {
      if (sensors.length > 0 && !isLoadingSensors) {
        const tempSensor = sensors.find(s => s.type === SensorType.Temperature);
        const moistureSensor = sensors.find(s => s.type === SensorType.SoilMoisture);
        
        if (tempSensor && moistureSensor && moistureSensor.status && tempSensor.status) {
          const tempValue = typeof tempSensor.currentValue === 'number' ? tempSensor.currentValue : 
                            (typeof tempSensor.currentValue === 'string' ? parseFloatSafe(tempSensor.currentValue) : null);
          
          const moistureStatusKey = moistureSensor.status as SoilMoistureStatusType; // Assuming dashboard primarily uses soil moisture for advice trigger
          const tempStatusKey = tempSensor.status as TemperatureStatusType; // Get temperature status for advice context

          // The getFarmingAdvice function expects a single moistureStatusKey.
          // We can combine or prioritize. For now, let's pass soil moisture status.
          // The prompt for getFarmingAdvice itself uses the temperature value and the moisture status key.
          // So, if we want to pass the temperature status (e.g., "Too Cold"), the Gemini prompt would need adjustment.
          // Currently, it takes numerical temp and a moisture status string.

          let adviceStatusKey = moistureStatusKey;
          // If a more complex logic is needed to derive a single 'status' for advice from multiple sensors,
          // it would be implemented here. For now, using moistureStatusKey for the advice call.

          if (tempValue !== null) {
            setIsLoadingAdvice(true);
            // The farming advice prompt already considers the numerical temperature.
            // The `moistureStatusKey` passed should be from the `SoilMoistureStatusType` for the current prompt.
            const advice = await getFarmingAdvice("General Vegetables", { 
              temp: tempValue,
              // Make sure to pass a SoilMoistureStatusType or a GeneralSensorStatus string key that Gemini understands.
              // For the current setup, moistureSensor.status should be SoilMoistureStatusType.
              moistureStatusKey: moistureSensor.status as SoilMoistureStatusType | GeneralSensorStatus 
            }, currentLanguage, t);
            setFarmingAdvice(advice);
            setIsLoadingAdvice(false);
          } else {
            if(!isLoadingSensors) {
                setFarmingAdvice(t('dashboard.errors.sensorDataError'));
            }
            setIsLoadingAdvice(false);
          }
        } else {
             if(!isLoadingSensors && tempSensor && (!moistureSensor || !moistureSensor.status)) {
                setFarmingAdvice(t('dashboard.errors.sensorDataError', {fallback: "Soil moisture or temperature status is unavailable."}));
             }
             setIsLoadingAdvice(false);
        }
      }
    };
    
    if (!isLoadingSensors || sensors.length > 0) {
        fetchAdvice();
    }
    
  }, [sensors, currentLanguage, t, isLoadingSensors]);


  const soilMoistureSensor = sensors.find(s => s.type === SensorType.SoilMoisture);
  const temperatureSensor = sensors.find(s => s.type === SensorType.Temperature);
  const humiditySensor = sensors.find(s => s.type === SensorType.Humidity);

  const getCardValue = (cv: Sensor['currentValue']): string | number => {
    if (cv === null) {
      return t('common.na');
    }
    if (typeof cv === 'object') {
      return t('common.na'); 
    }
    return cv;
  };
  
  const getCardUnit = (unit: string | { [key: string]: string }): string | undefined => {
    return typeof unit === 'string' ? unit : undefined;
  };

  const handleSeeMoreClick = (sensorType?: SensorType) => {
    navigate(sensorType ? `/iot-sensors#${sensorType}` : '/iot-sensors');
  };
  
  const getTranslatedStatus = (statusKey: Sensor['status']): string => {
    let subKey = statusKey.toString(); // Default to the key itself if not mapped below

    if (Object.values(SoilMoistureStatusType).includes(statusKey as SoilMoistureStatusType) ||
        Object.values(TemperatureStatusType).includes(statusKey as TemperatureStatusType) ||
        Object.values(HumidityStatusType).includes(statusKey as HumidityStatusType)) {
      // These enum values are already camelCase or suitable for direct use (e.g., 'optimalMoisture', 'tooCold')
      subKey = statusKey.toString();
    } else if (typeof statusKey === 'string' && generalSensorStatusValues.includes(statusKey as GeneralSensorStatus)) {
      // For GeneralSensorStatus (e.g., 'Optimal', 'Critical'), convert to lowercase
      subKey = statusKey.toLowerCase();
    }
    
    const key = `iotSensors.status.${subKey}`;
    return t(key, { fallback: statusKey.toString() });
  };

  const getStatusTextColorClass = (statusKey: Sensor['status']): string => {
    switch (statusKey) {
        // Soil Moisture
        case SoilMoistureStatusType.OptimalMoisture:
        // Temperature
        case TemperatureStatusType.OptimalTemperature:
        // Humidity
        case HumidityStatusType.OptimalHumidity:
        // General
        case 'Optimal':
        case 'Stable': // Retaining 'Stable' from GeneralSensorStatus
            return 'text-green-500';

        case SoilMoistureStatusType.DryNeedsIrrigation:
        case SoilMoistureStatusType.WetReduceIrrigation:
        case HumidityStatusType.TooDry:
        case HumidityStatusType.TooHumid:
        case 'Warning':
            return 'text-yellow-500';
        
        case TemperatureStatusType.TooCold:
            return 'text-blue-500'; // Specific color for too cold
        
        case TemperatureStatusType.TooHot:
        case SoilMoistureStatusType.Waterlogged:
        case 'Critical':
            return 'text-red-500';

        case SoilMoistureStatusType.NotAvailable:
        case TemperatureStatusType.NotAvailable:
        case HumidityStatusType.NotAvailable:
        default: // Includes any unmapped GeneralSensorStatus or new statuses
            return 'text-gray-500';
    }
  };


  return (
    <div className="space-y-6">
      {isLoadingSensors && sensors.every(s => s.currentValue === t('common.na')) && <div className="flex justify-center py-8"><Spinner size="lg" /></div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {soilMoistureSensor && (
          <DashboardCard 
            title={t('dashboard.soilMoisture')} 
            value={getCardValue(soilMoistureSensor.currentValue)} 
            unit={"ADC"} 
            status={getTranslatedStatus(soilMoistureSensor.status)} 
            statusTextColorClass={getStatusTextColorClass(soilMoistureSensor.status)}
            icon={<IconWaterDrop className="w-8 h-8" />} 
            detailsLinkText={t('dashboard.seeMore')}
            onDetailsLinkClick={() => handleSeeMoreClick(SensorType.SoilMoisture)}
          />
        )}
        {temperatureSensor && (
          <DashboardCard 
            title={t('dashboard.temperature')} 
            value={getCardValue(temperatureSensor.currentValue)} 
            unit={getCardUnit(temperatureSensor.unit)} 
            status={getTranslatedStatus(temperatureSensor.status)}
            statusTextColorClass={getStatusTextColorClass(temperatureSensor.status)}
            icon={<IconSun className="w-8 h-8" />} 
            detailsLinkText={t('dashboard.seeMore')}
            onDetailsLinkClick={() => handleSeeMoreClick(SensorType.Temperature)}
          />
        )}
        {humiditySensor && (
          <DashboardCard 
            title={t('dashboard.humidity')} 
            value={getCardValue(humiditySensor.currentValue)} 
            unit={getCardUnit(humiditySensor.unit)} 
            status={getTranslatedStatus(humiditySensor.status)}
            statusTextColorClass={getStatusTextColorClass(humiditySensor.status)}
            icon={<IconLeaf className="w-8 h-8" />} 
            detailsLinkText={t('dashboard.seeMore')}
            onDetailsLinkClick={() => handleSeeMoreClick(SensorType.Humidity)}
          />
        )}
      </div>

      {(isLoadingAdvice || farmingAdvice || (!isLoadingSensors && !farmingAdvice)) && (
          <div className="bg-card p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-textDark mb-2">{t('dashboard.aiFarmingAdvisor')}</h3>
            {isLoadingAdvice && <Spinner />}
            {!isLoadingAdvice && farmingAdvice && <GeminiResponseDisplay response={farmingAdvice} />}
            {!isLoadingAdvice && !farmingAdvice && !isLoadingSensors && 
              <p className="text-sm text-gray-500">{t('dashboard.errors.sensorDataError', {fallback: "Could not generate advice due to missing sensor data."})}</p>
            }
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('dashboard.yieldPrediction')} subtitle={t('dashboard.yieldPrediction.subtitle')}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yieldPrediction} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="value" name={t('dashboard.charts.legend.predictedYield')} stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('dashboard.diseaseDetection')} subtitle={t('dashboard.diseaseDetection.subtitle')}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={diseaseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} >
                {diseaseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg">
          <button
            onClick={() => setIsUpcomingModelsOpen(!isUpcomingModelsOpen)}
            className="w-full flex justify-between items-center text-left text-lg font-semibold text-textDark focus:outline-none"
            aria-expanded={isUpcomingModelsOpen}
            aria-controls="upcoming-models-content"
          >
            <span>{t('dashboard.upcomingModels.title')}</span>
            <IconChevronDown className={`w-5 h-5 transform transition-transform duration-200 ${isUpcomingModelsOpen ? 'rotate-180' : ''}`} />
          </button>
          {isUpcomingModelsOpen && (
            <div id="upcoming-models-content" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard 
                  title={t('mlModels.optimalPlanting.title')} 
                  subtitle={t('dashboard.optimalPlanting.subtitle')}
                  className="min-h-[250px]"
              >
                <div className="flex flex-col items-center justify-center h-full text-textMedium p-4">
                  <IconChip className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-center text-sm">{t('dashboard.optimalPlanting.placeholder')}</p>
                </div>
              </ChartCard>

              <ChartCard 
                  title={t('mlModels.harvestingTime.title')} 
                  subtitle={t('dashboard.harvestingTime.subtitle')}
                  className="min-h-[250px]"
              >
                <div className="flex flex-col items-center justify-center h-full text-textMedium p-4">
                  <IconChip className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-center text-sm">{t('dashboard.harvestingTime.placeholder')}</p>
                </div>
              </ChartCard>
            </div>
          )}
        </div>

        <ChartCard title={t('dashboard.soilQualityOverview')} subtitle={t('dashboard.soilQualityOverview.subtitle')} className="lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={soilQualityData} layout="horizontal" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} unit="%"/>
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}/>
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="value" name={t('dashboard.charts.legend.qualityScore')} radius={[4, 4, 0, 0]}>
                         {soilQualityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardPage;