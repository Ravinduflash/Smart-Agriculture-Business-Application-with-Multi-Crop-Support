
import React, { useContext } from 'react';
import ChartCard from '../components/ChartCard';
import { IconChip } from '../constants';
import { LanguageContext } from '../contexts/LanguageContext';

const MLModelsPage: React.FC = () => {
  const { t } = useContext(LanguageContext);

  const commonCardClasses = "w-full";
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-textDark">{t('mlModels.pageTitle')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <ChartCard
          title={t('mlModels.yieldPrediction.title')}
          subtitle={t('mlModels.yieldPrediction.status', { statusValue: t('mlModels.common.statusValue.active'), accuracyValue: "92" })}
          className={commonCardClasses}
        >
          <div className="flex flex-col items-center justify-center h-full text-textMedium">
            <IconChip className="w-16 h-16 text-primary mb-4" />
            <p className="text-lg">{t('mlModels.common.modelType.regression')}</p>
            <p>{t('mlModels.common.lastTrainedLabel')}: 2025-05-15</p>
            <button className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm">
              {t('mlModels.buttons.viewDetailsRetrain')}
            </button>
          </div>
        </ChartCard>

        <ChartCard
          title={t('mlModels.diseaseDetection.title')}
          subtitle={t('mlModels.diseaseDetection.status', { statusValue: t('mlModels.common.statusValue.active'), accuracyValue: "88" })}
          className={commonCardClasses}
        >
          <div className="flex flex-col items-center justify-center h-full text-textMedium">
            <IconChip className="w-16 h-16 text-secondary mb-4" />
            <p className="text-lg">{t('mlModels.common.modelType.classification')}</p>
            <p>{t('mlModels.common.lastTrainedLabel')}: 2025-05-10</p>
            <button className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors text-sm">
              {t('mlModels.buttons.viewDetailsRetrain')}
            </button>
          </div>
        </ChartCard>

        <ChartCard
          title={t('mlModels.cropRecommendation.title')}
          subtitle={t('mlModels.cropRecommendation.status', { statusValue: t('mlModels.common.statusValue.inDevelopment')})}
          className={commonCardClasses}
        >
          <div className="flex flex-col items-center justify-center h-full text-textMedium">
            <IconChip className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg">{t('mlModels.common.modelType.optimization')}</p>
            <p>{t('mlModels.common.nextUpdateLabel')}: {t('mlModels.common.pending')}</p>
            <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm" disabled>
              {t('mlModels.buttons.configureComingSoon')}
            </button>
          </div>
        </ChartCard>

        {/* New Model: Optimal Planting Periods */}
        <ChartCard
          title={t('mlModels.optimalPlanting.title')}
          subtitle={t('mlModels.optimalPlanting.status', { statusValue: t('mlModels.common.statusValue.inDevelopment')})}
          className={commonCardClasses}
        >
          <div className="flex flex-col items-center justify-center h-full text-textMedium">
            <IconChip className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg">{t('mlModels.common.modelType.forecasting')}</p>
            <p>{t('mlModels.common.nextUpdateLabel')}: {t('mlModels.common.pending')}</p>
            <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm" disabled>
              {t('mlModels.buttons.configureComingSoon')}
            </button>
          </div>
        </ChartCard>

        {/* New Model: Harvesting Time Estimation */}
        <ChartCard
          title={t('mlModels.harvestingTime.title')}
          subtitle={t('mlModels.harvestingTime.status', { statusValue: t('mlModels.common.statusValue.inDevelopment')})}
          className={commonCardClasses}
        >
          <div className="flex flex-col items-center justify-center h-full text-textMedium">
            <IconChip className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg">{t('mlModels.common.modelType.predictive')}</p>
            <p>{t('mlModels.common.nextUpdateLabel')}: {t('mlModels.common.pending')}</p>
            <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm" disabled>
              {t('mlModels.buttons.configureComingSoon')}
            </button>
          </div>
        </ChartCard>

      </div>

      <div className="bg-card p-6 rounded-xl shadow-lg mt-8">
        <h3 className="text-lg font-semibold text-textDark mb-4">{t('mlModels.trainingHub.title')}</h3>
        <p className="text-textMedium mb-4">
          {t('mlModels.trainingHub.description')}
        </p>
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-textMedium">{t('mlModels.trainingHub.placeholder')}</p>
        </div>
      </div>
    </div>
  );
};

export default MLModelsPage;
