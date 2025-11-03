import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
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
import { useTooltip } from '../hooks/useTooltip';
import { firestoreService } from '../src/services/firestoreService';
import { mapFirestoreReadingToSensors } from '../services/firestoreSensorMapper';
import { notificationService } from '../services/notificationService';

const POLLING_INTERVAL = 20000; // 20 seconds
const AI_ADVICE_INTERVAL = 300000; // 5 minutes (300,000 ms)

const DashboardPage: React.FC = () => {
  const { currentLanguage, t } = useContext(LanguageContext);
  const { getChartTooltip } = useTooltip();
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const sensorsRef = useRef(sensors); // Ref to track current sensors for interval callback
  const [yieldPrediction, setYieldPrediction] = useState<ChartData[]>([]);
  const [diseaseData, setDiseaseData] = useState<PieChartData[]>([]);
  const [soilQualityData, setSoilQualityData] = useState<PieChartData[]>([]);
  const [farmingAdvice, setFarmingAdvice] = useState<string | null>(null);
  const [isLoadingSensors, setIsLoadingSensors] = useState<boolean>(true);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [isUpcomingModelsOpen, setIsUpcomingModelsOpen] = useState(false);
  const [isLoadingSoilQuality, setIsLoadingSoilQuality] = useState<boolean>(true);

  // Initialize sensors with proper defaults after context is loaded
  useEffect(() => {
    if (sensors.length === 0 && t) {
      const initializedSensors = getMockSensors().map(s => ({
        ...s, 
        status: (s.type === SensorType.SoilMoisture ? SoilMoistureStatusType.NotAvailable :
                s.type === SensorType.Temperature ? TemperatureStatusType.NotAvailable :
                s.type === SensorType.Humidity ? HumidityStatusType.NotAvailable : 'Stable') as Sensor['status'], 
        currentValue: t('common.na') 
      }));
      setSensors(initializedSensors);
      sensorsRef.current = initializedSensors;
      
      // Initialize sensor states in notification service to prevent false alerts on first load
      notificationService.initializeSensorStates(initializedSensors);
    }
  }, [t, sensors.length]);


  const loadSensorData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoadingSensors(true);
    try {
      const initialSensorsBase = getMockSensors(); // Base structure
      
      // Fetch from Firestore using correct crop ID from sensor_simulator
      const readings = await firestoreService.getLatestSensorReadings('crop_1762085977354', 1);
      const latestReading = readings.length > 0 ? readings[0] : null;
      
      console.log('📡 Dashboard: Fetched latest sensor reading:', latestReading ? 'Data available' : 'No data');
      
      // Map Firestore data to sensors
      const processedSensors = mapFirestoreReadingToSensors(latestReading, initialSensorsBase, t);
      
      setSensors(processedSensors);
      sensorsRef.current = processedSensors; // Update ref with current sensors
      
      // Check for sensor status changes and create notifications (skip on initial load)
      if (!isInitialLoad) {
        await notificationService.checkSensorStatusChanges(processedSensors);
      }
    } catch (error) {
      console.error('Error loading sensor data from Firestore:', error);
      // Fallback to ThingSpeak if Firestore fails
      const initialSensorsBase = getMockSensors();
      const thingSpeakData = await fetchThingSpeakData(1);
      const processedSensors = mapThingSpeakDataToSensors(thingSpeakData, initialSensorsBase, t);
      setSensors(processedSensors);
      sensorsRef.current = processedSensors;
    }
    if (isInitialLoad) setIsLoadingSensors(false);
  }, [t]);

  useEffect(() => {
    loadSensorData(true); // Initial load

    setYieldPrediction(getMockYieldPrediction());
    setDiseaseData([
      { name: t('dashboard.healthy'), value: 95, color: '#10B981' },
      { name: t('dashboard.diseased'), value: 5, color: '#EF4444' },
    ]);
    
    // Load real soil quality data from Firestore
    const loadSoilQualityData = async () => {
      setIsLoadingSoilQuality(true);
      try {
        // Fetch last 100 sensor readings to get a good sample
        const readings = await firestoreService.getLatestSensorReadings('crop_1762085977354', 100);
        
        console.log(`📊 Fetched ${readings.length} sensor readings for soil quality analysis`);
        
        // Count soil_moisture_status categorical variables
        const statusCounts: { [key: string]: number } = {
          'Optimal': 0,
          'Wet': 0,
          'Dry': 0
        };
        
        readings.forEach((reading: any, index: number) => {
          const status = reading.soil_moisture_status;
          
          // Debug: Log first few readings to verify data
          if (index < 5) {
            console.log(`Reading ${index + 1}:`, {
              timestamp: reading.timestamp,
              soil_moisture_status: status,
              soil_moisture_raw: reading.soil_moisture_raw
            });
          }
          
          if (status === 'Optimal' || status === 'optimal') {
            statusCounts['Optimal']++;
          } else if (status === 'Wet' || status === 'wet') {
            statusCounts['Wet']++;
          } else if (status === 'Dry' || status === 'dry') {
            statusCounts['Dry']++;
          }
        });
        
        console.log('📈 Status counts:', statusCounts);
        
        const total = statusCounts['Optimal'] + statusCounts['Wet'] + statusCounts['Dry'];
        
        console.log(`📊 Total counted: ${total} out of ${readings.length} readings`);
        
        if (total > 0) {
          // Calculate percentages and create chart data
          const optimalPercent = Math.round((statusCounts['Optimal'] / total) * 100);
          const wetPercent = Math.round((statusCounts['Wet'] / total) * 100);
          const dryPercent = Math.round((statusCounts['Dry'] / total) * 100);
          
          console.log('📊 Percentages:', { optimalPercent, wetPercent, dryPercent });
          
          const chartData: PieChartData[] = [
            { 
              name: t('dashboard.optimal'), 
              value: optimalPercent, 
              color: '#10B981' 
            },
            { 
              name: t('dashboard.wet'), 
              value: wetPercent, 
              color: '#3B82F6' 
            },
            { 
              name: t('dashboard.dry'), 
              value: dryPercent, 
              color: '#EF4444' 
            }
          ];
          
          setSoilQualityData(chartData);
          console.log('✅ Loaded soil quality data from Firestore:', chartData);
        } else {
          // Fallback to mock data if no readings
          console.warn('⚠️ No soil moisture readings found, using mock data');
          setSoilQualityData([
            { name: t('dashboard.optimal'), value: 70, color: '#10B981' },
            { name: t('dashboard.fair'), value: 20, color: '#F59E0B' },
            { name: t('dashboard.poor'), value: 10, color: '#EF4444' },
          ]);
        }
      } catch (error) {
        console.error('❌ Error loading soil quality data:', error);
        // Fallback to mock data
        setSoilQualityData([
          { name: t('dashboard.optimal'), value: 70, color: '#10B981' },
          { name: t('dashboard.fair'), value: 20, color: '#F59E0B' },
          { name: t('dashboard.poor'), value: 10, color: '#EF4444' },
        ]);
      } finally {
        setIsLoadingSoilQuality(false);
      }
    };
    
    loadSoilQualityData();
    
    const intervalId = setInterval(() => {
      loadSensorData(false); // Subsequent polling
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [t, loadSensorData]);

  useEffect(() => {
    const fetchAdvice = async () => {
      if (sensorsRef.current.length > 0 && !isLoadingSensors) {
        const tempSensor = sensorsRef.current.find(s => s.type === SensorType.Temperature);
        const moistureSensor = sensorsRef.current.find(s => s.type === SensorType.SoilMoisture);
        
        if (tempSensor && moistureSensor && moistureSensor.status && tempSensor.status) {
          const tempValue = typeof tempSensor.currentValue === 'number' ? tempSensor.currentValue : 
                            (typeof tempSensor.currentValue === 'string' ? parseFloatSafe(tempSensor.currentValue) : null);
          
          // The getFarmingAdvice function expects a single moistureStatusKey.
          // We can combine or prioritize. For now, let's pass soil moisture status.
          // The prompt for getFarmingAdvice itself uses the temperature value and the moisture status key.
          // So, if we want to pass the temperature status (e.g., "Too Cold"), the Gemini prompt would need adjustment.
          // Currently, it takes numerical temp and a moisture status string.

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
    
    // Initial fetch of AI advice
    if (!isLoadingSensors && sensorsRef.current.length > 0) {
        fetchAdvice();
    }
    
    // Set up interval for AI advice refresh every 5 minutes
    const adviceIntervalId = setInterval(() => {
      if (!isLoadingSensors && sensorsRef.current.length > 0) {
        fetchAdvice();
      }
    }, AI_ADVICE_INTERVAL);

    return () => clearInterval(adviceIntervalId);
    
  }, [currentLanguage, t, isLoadingSensors]); // Removed 'sensors' dependency to prevent frequent updates


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
    navigate(sensorType ? `/iot-sensors?sensor=${encodeURIComponent(sensorType)}` : '/iot-sensors');
  };
  
  const getTranslatedStatus = (statusKey: Sensor['status']): string => {
    if (statusKey === undefined || statusKey === null) {
      return t('iotSensors.status.notAvailable', { fallback: t('common.na') });
    }

    const statusString = typeof statusKey === 'string' ? statusKey : String(statusKey);

    let subKey = statusString; // Default to the key itself if not mapped below

    if (Object.values(SoilMoistureStatusType).includes(statusKey as SoilMoistureStatusType) ||
        Object.values(TemperatureStatusType).includes(statusKey as TemperatureStatusType) ||
        Object.values(HumidityStatusType).includes(statusKey as HumidityStatusType)) {
      // These enum values are already camelCase or suitable for direct use (e.g., 'optimalMoisture', 'tooCold')
      subKey = statusString;
    } else if (typeof statusKey === 'string' && generalSensorStatusValues.includes(statusKey as GeneralSensorStatus)) {
      // For GeneralSensorStatus (e.g., 'Optimal', 'Critical'), convert to lowercase
      subKey = statusString.toLowerCase();
    }
    
    const key = `iotSensors.status.${subKey}`;
    return t(key, { fallback: statusString });
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {soilMoistureSensor && (
          <div data-help-id="soil-moisture-card">
            <DashboardCard 
              title={t('dashboard.soilMoisture')} 
              value={getCardValue(soilMoistureSensor.currentValue)} 
              unit={"ADC"} 
              status={getTranslatedStatus(soilMoistureSensor.status)} 
              statusTextColorClass={getStatusTextColorClass(soilMoistureSensor.status)}
              icon={<IconWaterDrop className="w-8 h-8" />} 
              detailsLinkText={t('dashboard.seeMore')}
              onDetailsLinkClick={() => handleSeeMoreClick(SensorType.SoilMoisture)}
              sensorType={SensorType.SoilMoisture}
            />
          </div>
        )}
        {temperatureSensor && (
          <div data-help-id="temperature-card">
            <DashboardCard 
              title={t('dashboard.temperature')} 
              value={getCardValue(temperatureSensor.currentValue)} 
              unit={getCardUnit(temperatureSensor.unit)} 
              status={getTranslatedStatus(temperatureSensor.status)}
              statusTextColorClass={getStatusTextColorClass(temperatureSensor.status)}
              icon={<IconSun className="w-8 h-8" />} 
              detailsLinkText={t('dashboard.seeMore')}
              onDetailsLinkClick={() => handleSeeMoreClick(SensorType.Temperature)}
              sensorType={SensorType.Temperature}
            />
          </div>
        )}
        {humiditySensor && (
          <div data-help-id="humidity-card">
            <DashboardCard 
              title={t('dashboard.humidity')} 
              value={getCardValue(humiditySensor.currentValue)} 
              unit={getCardUnit(humiditySensor.unit)} 
              status={getTranslatedStatus(humiditySensor.status)}
              statusTextColorClass={getStatusTextColorClass(humiditySensor.status)}
              icon={<IconLeaf className="w-8 h-8" />} 
              detailsLinkText={t('dashboard.seeMore')}
              onDetailsLinkClick={() => handleSeeMoreClick(SensorType.Humidity)}
              sensorType={SensorType.Humidity}
            />
          </div>
        )}
      </div>

      {(isLoadingAdvice || farmingAdvice || (!isLoadingSensors && !farmingAdvice)) && (
          <div data-help-id="ai-farming-advisor" className="bg-card p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-textDark mb-2">{t('dashboard.aiFarmingAdvisor')}</h3>
            {isLoadingAdvice && <Spinner />}
            {!isLoadingAdvice && farmingAdvice && <GeminiResponseDisplay response={farmingAdvice} />}
            {!isLoadingAdvice && !farmingAdvice && !isLoadingSensors && 
              <p className="text-sm text-gray-500">{t('dashboard.errors.sensorDataError', {fallback: "Could not generate advice due to missing sensor data."})}</p>
            }
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div data-help-id="yield-prediction-chart">
          <ChartCard 
            title={t('dashboard.yieldPrediction')} 
            subtitle={t('dashboard.yieldPrediction.subtitle')}
            tooltipContent={getChartTooltip('YIELD_PREDICTION')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldPrediction} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" name={t('dashboard.charts.legend.predictedYield')} stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div data-help-id="disease-detection-chart">
          <ChartCard 
            title={t('dashboard.diseaseDetection')} 
            subtitle={t('dashboard.diseaseDetection.subtitle')}
            tooltipContent={getChartTooltip('DISEASE_DETECTION')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diseaseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} >
                  {diseaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        
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
            <div id="upcoming-models-content" className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <ChartCard 
                  title={t('mlModels.optimalPlanting.title')} 
                  subtitle={t('dashboard.optimalPlanting.subtitle')}
                  className="min-h-[250px]"
              >
                <div className="flex flex-col justify-center h-full p-4 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">🤖 {t('dashboard.mlModels.whatIsML')}</h4>
                    <p className="text-xs text-blue-700 leading-relaxed mb-3">
                      {t('dashboard.mlModels.optimalPlanting.description')}
                    </p>
                    <h5 className="text-xs font-semibold text-blue-800 mb-1">{t('dashboard.mlModels.thisModelWillHelp')}</h5>
                    <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-line">
                      {t('dashboard.mlModels.optimalPlanting.benefits')}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <IconChip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h5 className="text-xs font-medium text-gray-700 mb-1">🚧 {t('dashboard.mlModels.comingSoon')}</h5>
                    <p className="text-xs text-gray-600">{t('dashboard.mlModels.developmentStatus')}</p>
                  </div>
                </div>
              </ChartCard>

              <ChartCard 
                  title={t('mlModels.harvestingTime.title')} 
                  subtitle={t('dashboard.harvestingTime.subtitle')}
                  className="min-h-[250px]"
              >
                <div className="flex flex-col justify-center h-full p-4 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">🤖 {t('dashboard.mlModels.whatIsML')}</h4>
                    <p className="text-xs text-green-700 leading-relaxed mb-3">
                      {t('dashboard.mlModels.harvestingTime.description')}
                    </p>
                    <h5 className="text-xs font-semibold text-green-800 mb-1">{t('dashboard.mlModels.thisModelWillHelp')}</h5>
                    <p className="text-xs text-green-700 leading-relaxed whitespace-pre-line">
                      {t('dashboard.mlModels.harvestingTime.benefits')}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <IconChip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h5 className="text-xs font-medium text-gray-700 mb-1">🚧 {t('dashboard.mlModels.comingSoon')}</h5>
                    <p className="text-xs text-gray-600">{t('dashboard.mlModels.developmentStatus')}</p>
                  </div>
                </div>
              </ChartCard>

              <ChartCard 
                  title={t('dashboard.mlModels.cropRecommendation.title')} 
                  subtitle={t('dashboard.mlModels.cropRecommendation.subtitle')}
                  className="min-h-[250px]"
              >
                <div className="flex flex-col justify-center h-full p-4 space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">🤖 {t('dashboard.mlModels.whatIsML')}</h4>
                    <p className="text-xs text-purple-700 leading-relaxed mb-3">
                      {t('dashboard.mlModels.cropRecommendation.description')}
                    </p>
                    <h5 className="text-xs font-semibold text-purple-800 mb-1">{t('dashboard.mlModels.thisModelWillHelp')}</h5>
                    <p className="text-xs text-purple-700 leading-relaxed whitespace-pre-line">
                      {t('dashboard.mlModels.cropRecommendation.benefits')}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <IconChip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h5 className="text-xs font-medium text-gray-700 mb-1">🚧 {t('dashboard.mlModels.comingSoon')}</h5>
                    <p className="text-xs text-gray-600">{t('dashboard.mlModels.developmentStatus')}</p>
                  </div>
                </div>
              </ChartCard>
            </div>
          )}
        </div>

        <div data-help-id="soil-quality-chart" className="lg:col-span-2">
          <ChartCard 
            title={t('dashboard.soilQualityOverview')} 
            subtitle={t('dashboard.soilQualityOverview.subtitle')} 
            className="lg:col-span-2"
            tooltipContent={getChartTooltip('SOIL_QUALITY')}
          >
            {isLoadingSoilQuality ? (
              <div className="flex justify-center items-center h-full">
                <Spinner size="md" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={soilQualityData} layout="horizontal" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} unit="%"/>
                      <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}/>
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="value" name={t('dashboard.charts.legend.qualityScore')} radius={[4, 4, 0, 0]}>
                           {soilQualityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;