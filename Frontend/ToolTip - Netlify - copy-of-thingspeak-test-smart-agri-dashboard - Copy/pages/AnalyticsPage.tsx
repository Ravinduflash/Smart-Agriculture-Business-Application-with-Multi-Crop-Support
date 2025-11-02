
import React, { useState, useEffect, useContext } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';
import { AnalyticsMetric, MonthlyReportData } from '../types';
import { getMockAnalyticsMetrics, getMockMonthlyYieldReport, getMockSoilMoistureTrends, getMockPestIncidenceReport } from '../services/mockDataService';
import ChartCard from '../components/ChartCard';
import DashboardCard from '../components/DashboardCard';
import { generateDataInsights } from '../services/geminiService';
import Spinner from '../components/Spinner';
import GeminiResponseDisplay from '../components/GeminiResponseDisplay';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTooltipContent } from '../hooks/useTooltipContent';
import { firestoreService } from '../src/services/firestoreService';

export default function AnalyticsPage(): JSX.Element {
  const { currentLanguage, t } = useContext(LanguageContext);
  const { getAnalyticsTooltip } = useTooltipContent();
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [monthlyYield, setMonthlyYield] = useState<MonthlyReportData[]>([]);
  const [soilMoisture, setSoilMoisture] = useState<MonthlyReportData[]>([]);
  const [pestIncidence, setPestIncidence] = useState<MonthlyReportData[]>([]);
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [firestoreTotalYield, setFirestoreTotalYield] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load mock data first
      const mockMetrics = getMockAnalyticsMetrics();
      setMetrics(mockMetrics);

      // Fetch total yield from Firestore harvest_cycles
      try {
        const { totalYieldKg } = await firestoreService.getTotalYieldFromHarvestCycles();
        setFirestoreTotalYield(totalYieldKg);
        
        // Update the first metric (Total Yield YTD) with Firestore data
        const updatedMetrics = [...mockMetrics];
        updatedMetrics[0] = {
          ...updatedMetrics[0],
          value: totalYieldKg.toFixed(0),
          unit: 'kg',
          status: totalYieldKg > 0 ? 'On Target' : 'No Data'
        };
        setMetrics(updatedMetrics);

        // Fetch harvest cycles yield data for chart
        const cyclesYieldData = await firestoreService.getHarvestCyclesYieldData();
        if (cyclesYieldData.length > 0) {
          setMonthlyYield(cyclesYieldData);
        } else {
          // Fallback to mock data if no Firestore data
          setMonthlyYield(getMockMonthlyYieldReport());
        }

        // Fetch soil moisture trends data by cycle
        const moistureTrendsData = await firestoreService.getSoilMoistureTrendsByCycle();
        if (moistureTrendsData.length > 0) {
          setSoilMoisture(moistureTrendsData);
        } else {
          // Fallback to mock data if no Firestore data
          setSoilMoisture(getMockSoilMoistureTrends());
        }

        // Fetch pest loss data from harvest cycles
        const pestLossData = await firestoreService.getPestLossDataByCycle();
        if (pestLossData.length > 0) {
          setPestIncidence(pestLossData);
        } else {
          // Fallback to mock data if no Firestore data
          setPestIncidence(getMockPestIncidenceReport());
        }
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
        // Fallback to mock data on error
        setMonthlyYield(getMockMonthlyYieldReport());
        setSoilMoisture(getMockSoilMoistureTrends());
        setPestIncidence(getMockPestIncidenceReport());
      }
    };

    loadData();
  }, []);

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    const fetchedInsights = await generateDataInsights({
      yieldData: monthlyYield,
      moistureData: soilMoisture,
      pestData: pestIncidence.map(p => ({month: p.name, incidenceRate: p.value}))
    }, currentLanguage, t);
    setInsights(fetchedInsights);
    setIsLoadingInsights(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-textDark">{t('analytics.pageTitle')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => (
          <DashboardCard
            key={metric.key}
            title={t(metric.key)}
            value={metric.value}
            unit={metric.unit ? (metric.unit === 'tons' ? t('analytics.units.tons') : metric.unit === 'kg' ? 'kg' : metric.unit) : undefined}
            status={metric.status ? t(`analytics.status.${metric.status.toLowerCase().replace(/ /g, '')}`) : undefined}
            icon={metric.icon}
            tooltipContent={getAnalyticsTooltip('metrics_cards')}
          />
        ))}
      </div>
      
      <div className="bg-card p-6 rounded-xl shadow-lg relative group">
        <div className="absolute top-4 right-4 z-10">
          <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold cursor-help hover:bg-gray-400 transition-colors">
            ?
          </div>
          <div className="absolute right-0 top-6 w-64 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
            {getAnalyticsTooltip('ai_data_analyst')}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-semibold text-textDark mb-2 sm:mb-0">{t('analytics.aiDataAnalyst.title')}</h3>
          <button
            onClick={handleGenerateInsights}
            disabled={isLoadingInsights}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center self-start sm:self-center"
          >
            {isLoadingInsights ? <Spinner size="sm" color="text-white" /> : t('analytics.aiDataAnalyst.button')}
          </button>
        </div>
        {isLoadingInsights && <Spinner />}
        {!isLoadingInsights && insights && <GeminiResponseDisplay response={insights} />}
         {!isLoadingInsights && !insights && <p className="text-sm text-textMedium">{t('analytics.aiDataAnalyst.initialMessage')}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard 
          title={monthlyYield.length > 0 && monthlyYield[0].name.includes('Cycle') ? 'Harvest Cycles Yield Report' : t('analytics.monthlyYield.title')}
          subtitle={monthlyYield.length > 0 && monthlyYield[0].name.includes('Cycle') ? 'Yield from each harvest cycle' : t('analytics.monthlyYield.subtitle')}
          tooltipContent={getAnalyticsTooltip('monthly_yield')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyYield} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} unit={monthlyYield.length > 0 && monthlyYield[0].name.includes('Cycle') ? ' kg' : ` ${t('analytics.units.tons')}`} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="value" name={t('analytics.monthlyYield.legend')} fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title={soilMoisture.length > 0 && soilMoisture[0].name.includes('Aug') ? 'Soil Moisture Trends - Cycle 2 (Daily)' : t('analytics.soilMoisture.title')}
          subtitle={soilMoisture.length > 0 && soilMoisture[0].name.includes('Aug') ? 'Daily soil moisture raw values for Cycle 2' : t('analytics.soilMoisture.subtitle')}
          tooltipContent={getAnalyticsTooltip('soil_moisture_trends')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={soilMoisture} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} unit={soilMoisture.length > 0 && soilMoisture[0].name.includes('Aug') ? '' : '%'} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="value" name={soilMoisture.length > 0 && soilMoisture[0].name.includes('Aug') ? 'Raw Value' : t('analytics.soilMoisture.legend')} stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard 
          title={pestIncidence.length > 0 && pestIncidence[0].name.includes('Cycle') ? 'Pest Loss Report by Harvest Cycle' : t('analytics.pestIncidence.title')}
          subtitle={pestIncidence.length > 0 && pestIncidence[0].name.includes('Cycle') ? 'Percentage of yield lost to pests in each cycle' : t('analytics.pestIncidence.subtitle')}
          className="lg:col-span-2"
          tooltipContent={getAnalyticsTooltip('pest_incidence')}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pestIncidence} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} unit="%" />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="value" name={pestIncidence.length > 0 && pestIncidence[0].name.includes('Cycle') ? 'Pest Loss %' : t('analytics.pestIncidence.legend')} stroke="#EF4444" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-lg text-center">
        <h3 className="text-lg font-semibold text-textDark mb-4">{t('analytics.downloadReports.title')}</h3>
        <div className="space-x-0 space-y-2 sm:space-x-3 sm:space-y-0">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto">{t('analytics.downloadReports.monthlyPdf')}</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto">{t('analytics.downloadReports.yearlyCsv')}</button>
        </div>
      </div>
    </div>
  );
}
