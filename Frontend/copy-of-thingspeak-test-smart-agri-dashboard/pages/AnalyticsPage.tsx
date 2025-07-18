
import React, { useState, useEffect, useContext } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { AnalyticsMetric, MonthlyReportData } from '../types';
import { getMockAnalyticsMetrics, getMockMonthlyYieldReport, getMockSoilMoistureTrends, getMockPestIncidenceReport } from '../services/mockDataService';
import ChartCard from '../components/ChartCard';
import DashboardCard from '../components/DashboardCard';
import { generateDataInsights } from '../services/geminiService';
import Spinner from '../components/Spinner';
import GeminiResponseDisplay from '../components/GeminiResponseDisplay';
import { LanguageContext } from '../contexts/LanguageContext';

export default function AnalyticsPage(): JSX.Element {
  const { currentLanguage, t } = useContext(LanguageContext);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [monthlyYield, setMonthlyYield] = useState<MonthlyReportData[]>([]);
  const [soilMoisture, setSoilMoisture] = useState<MonthlyReportData[]>([]);
  const [pestIncidence, setPestIncidence] = useState<MonthlyReportData[]>([]);
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    setMetrics(getMockAnalyticsMetrics());
    const yieldData = getMockMonthlyYieldReport();
    const moistureData = getMockSoilMoistureTrends();
    const pestData = getMockPestIncidenceReport();
    setMonthlyYield(yieldData);
    setSoilMoisture(moistureData);
    setPestIncidence(pestData);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <DashboardCard
            key={metric.key}
            title={t(metric.key)}
            value={metric.value}
            unit={metric.unit ? (metric.unit === 'tons' ? t('analytics.units.tons') : metric.unit) : undefined}
            status={metric.status ? t(`analytics.status.${metric.status.toLowerCase().replace(/ /g, '')}`) : undefined}
            icon={metric.icon}
          />
        ))}
      </div>
      
      <div className="bg-card p-6 rounded-xl shadow-lg">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('analytics.monthlyYield.title')} subtitle={t('analytics.monthlyYield.subtitle')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyYield} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} unit={` ${t('analytics.units.tons')}`} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="value" name={t('analytics.monthlyYield.legend')} fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('analytics.soilMoisture.title')} subtitle={t('analytics.soilMoisture.subtitle')}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={soilMoisture} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="value" name={t('analytics.soilMoisture.legend')} stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title={t('analytics.pestIncidence.title')} subtitle={t('analytics.pestIncidence.subtitle')} className="lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pestIncidence} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="value" name={t('analytics.pestIncidence.legend')} stroke="#EF4444" strokeWidth={2} />
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
