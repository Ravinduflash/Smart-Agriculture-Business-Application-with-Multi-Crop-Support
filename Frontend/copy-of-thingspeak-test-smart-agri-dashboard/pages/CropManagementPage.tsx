
import React, { useState, useEffect, useContext } from 'react';
import { Crop, OptimalConditions, SensorType, CropRecommendation, Sensor } from '../types';
import { getMockCrops, getMockSensors } from '../services/mockDataService';
import { IconPlus, IconSun, IconWaterDrop, IconLeaf, DEFAULT_IMAGE_URL } from '../constants';
import Modal from '../components/Modal';
import { getCropOptimalConditions, getAICropRecommendations, generateCropImage } from '../services/geminiService';
import Spinner from '../components/Spinner';
import GeminiResponseDisplay from '../components/GeminiResponseDisplay';
import { LanguageContext } from '../contexts/LanguageContext';
import { fetchThingSpeakData, parseFloatSafe, ThingSpeakFeed } from '../services/thingSpeakService'; // Added Sensor type

const CropCard: React.FC<{ crop: Crop; t: (key: string) => string }> = ({ crop, t }) => (
  <div className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <img src={crop.imageUrl || DEFAULT_IMAGE_URL} alt={crop.name} className="w-full h-40 object-cover" 
      onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE_URL)}
    />
    <div className="p-4">
      <h3 className="text-xl font-semibold text-textDark mb-2">{crop.name}</h3>
      <div className="text-sm text-textMedium space-y-1">
        <p className="flex items-center"><IconWaterDrop className="w-4 h-4 mr-2 text-primary" /> {t('cropManagement.card.water')}: {crop.waterNeeds}</p>
        <p className="flex items-center"><IconLeaf className="w-4 h-4 mr-2 text-primary" /> {t('cropManagement.card.ph')}: {crop.optimalPh}</p>
        <p className="flex items-center"><IconSun className="w-4 h-4 mr-2 text-primary" /> {t('cropManagement.card.sunlight')}: {crop.sunlight}</p>
      </div>
      {crop.lastUpdated && <p className="text-xs text-gray-400 mt-3">{t('cropManagement.card.updated')}: {crop.lastUpdated}</p>}
       {crop.details && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-textMedium mb-1">{t('cropManagement.card.aiInsights')}:</h4>
            <p className="text-xs text-gray-600">{crop.details}</p>
          </div>
        )}
    </div>
  </div>
);

interface LiveSensorValues {
    temp: number | null;
    moisture: number | null;
    ph: number | null; // pH will remain null from ThingSpeak as it's not directly provided by fields 1-8
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
}

function CropManagementPage(): JSX.Element {
  const { currentLanguage, t } = useContext(LanguageContext);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [suggestedConditions, setSuggestedConditions] = useState<OptimalConditions | string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [liveSensorData, setLiveSensorData] = useState<LiveSensorValues>({ temp: null, moisture: null, ph: null, nitrogen: null, phosphorus: null, potassium: null });
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(true);
  const [useLiveData, setUseLiveData] = useState(true);
  const [manualTemperature, setManualTemperature] = useState('');
  const [manualMoisture, setManualMoisture] = useState('');
  const [manualPh, setManualPh] = useState('6.5'); // Default manual pH

  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[] | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  useEffect(() => {
    setCrops(getMockCrops());
    const loadLiveData = async () => {
        setIsLoadingLiveData(true);
        const tsData = await fetchThingSpeakData(1); // Fetch latest entry
        if (tsData && tsData.feeds.length > 0) {
            const latestFeed: ThingSpeakFeed = tsData.feeds[0];
            setLiveSensorData({
                temp: parseFloatSafe(latestFeed.field1),
                moisture: parseFloatSafe(latestFeed.field4),
                ph: null, // pH is not directly available from ThingSpeak fields 1-8
                nitrogen: parseFloatSafe(latestFeed.field6),
                phosphorus: parseFloatSafe(latestFeed.field7),
                potassium: parseFloatSafe(latestFeed.field8)
            });
        } else {
             // Keep nulls or set to some N/A indicator if preferred
            setLiveSensorData({ temp: null, moisture: null, ph: null, nitrogen: null, phosphorus: null, potassium: null });
        }
        setIsLoadingLiveData(false);
    };
    loadLiveData();
  }, []);

  const handleAddCrop = () => {
    if (!newCropName.trim()) return; 
    
    const newCropEntry: Crop = {
      id: String(crops.length + 1 + Date.now()),
      name: newCropName,
      imageUrl: generatedImageUrl || DEFAULT_IMAGE_URL, 
      waterNeeds: typeof suggestedConditions === 'object' && suggestedConditions?.waterNeeds ? suggestedConditions.waterNeeds : t('common.na'),
      optimalPh: typeof suggestedConditions === 'object' && suggestedConditions?.optimalPh ? suggestedConditions.optimalPh : t('common.na'),
      sunlight: typeof suggestedConditions === 'object' && suggestedConditions?.sunlight ? suggestedConditions.sunlight : t('common.na'),
      details: typeof suggestedConditions === 'object' && suggestedConditions?.additionalTips ? suggestedConditions.additionalTips : 
               (typeof suggestedConditions === 'string' ? suggestedConditions : undefined),
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setCrops(prevCrops => [newCropEntry, ...prevCrops]);
    
    resetModalState();
    setIsModalOpen(false);
  };

  const handleFetchSuggestionsAndImage = async () => {
    if (!newCropName.trim()) return;
    
    setIsLoadingSuggestions(true);
    setIsLoadingImage(true);
    setSuggestedConditions(null); 
    setGeneratedImageUrl(null);
    setImageError(null);

    try {
      const conditionsPromise = getCropOptimalConditions({ cropName: newCropName }, currentLanguage, t);
      const imagePromise = generateCropImage(newCropName, t);

      const [conditionsResult, imageResultString] = await Promise.all([conditionsPromise, imagePromise]);
      
      setSuggestedConditions(conditionsResult);

      if (imageResultString.startsWith('data:image/jpeg;base64,')) {
        setGeneratedImageUrl(imageResultString);
        setImageError(null);
      } else { 
        setGeneratedImageUrl(null);
        setImageError(imageResultString); 
      }
    } catch (error) { 
      console.error("Error in fetching suggestions or image pipeline:", error);
      if (suggestedConditions === null && !(error instanceof Error && error.message.includes('API_KEY missing'))) {
          setSuggestedConditions(t('gemini.common.error.fetchError'));
      }
      if (imageError === null) {
          setImageError(t('gemini.common.error.fetchError') + " " + t('gemini.common.error.defaultImage'));
      }
    } finally {
      setIsLoadingSuggestions(false);
      setIsLoadingImage(false);
    }
  };
  
  const resetModalState = () => {
    setNewCropName('');
    setSuggestedConditions(null);
    setGeneratedImageUrl(null);
    setImageError(null);
    setIsLoadingSuggestions(false);
    setIsLoadingImage(false);
  };

  const openModal = () => {
    resetModalState();
    setIsModalOpen(true);
  };

  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendations(null);
    setRecommendationError(null);

    let temp: number, moisture: number, phValue: number; 
    // NPK values are for context but Gemini prompt for recommendation primarily uses temp, moisture, pH
    let nitrogen: number | null = null, phosphorus: number | null = null, potassium: number | null = null;


    if (useLiveData) {
      if (isLoadingLiveData) {
        setRecommendationError(t('cropManagement.recommendation.error.loadingLiveData'));
        setIsLoadingRecommendations(false);
        return;
      }
      if (liveSensorData.temp === null || liveSensorData.moisture === null) { 
        setRecommendationError(t('cropManagement.recommendation.error.incompleteLiveData'));
        setIsLoadingRecommendations(false);
        return;
      }
      temp = liveSensorData.temp;
      moisture = liveSensorData.moisture;
      // pH is not from ThingSpeak, so use manualPh. Defaulted to 6.5 if manualPh is empty.
      phValue = parseFloat(manualPh) || 6.5; 
      nitrogen = liveSensorData.nitrogen;
      phosphorus = liveSensorData.phosphorus;
      potassium = liveSensorData.potassium;

    } else {
      temp = parseFloat(manualTemperature);
      moisture = parseFloat(manualMoisture);
      phValue = parseFloat(manualPh);

      if (isNaN(temp) || isNaN(moisture) || isNaN(phValue)) {
        setRecommendationError(t('cropManagement.recommendation.error.invalidManualInput'));
        setIsLoadingRecommendations(false);
        return;
      }
    }
    
    // Construct conditions for Gemini. The prompt might need to be adjusted if NPK values are to be explicitly used by Gemini for recommendations.
    // For now, it mainly uses temp, moisture, pH.
    const conditionsForGemini = { temperature: temp, moisture: moisture, ph: phValue };


    const result = await getAICropRecommendations(conditionsForGemini, currentLanguage, t);
    
    if (typeof result === 'string') { 
        setRecommendationError(result); 
    } else if (result && Array.isArray(result)) {
        setRecommendations(result);
    } else { 
        setRecommendationError(t('cropManagement.recommendation.error.fetchFailed'));
    }
    
    setIsLoadingRecommendations(false);
    setIsRecommendationModalOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-textDark">{t('cropManagement.pageTitle')}</h2>
        <button
          onClick={openModal}
          className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary-dark transition-colors flex items-center"
          aria-label={t('cropManagement.addNewCrop')}
        >
          <IconPlus className="w-5 h-5 mr-2" /> {t('cropManagement.addNewCrop')}
        </button>
      </div>

      {crops.length === 0 ? (
        <p className="text-textMedium text-center py-8">{t('cropManagement.noCrops')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <CropCard key={crop.id} crop={crop} t={t} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('cropManagement.modal.title')}>
        <div className="space-y-4">
          <div>
            <label htmlFor="cropName" className="block text-sm font-medium text-gray-700 mb-1">{t('cropManagement.modal.cropName')}</label>
            <input
              type="text"
              id="cropName"
              value={newCropName}
              onChange={(e) => setNewCropName(e.target.value)}
              placeholder={t('cropManagement.modal.cropName.placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              aria-required="true"
            />
          </div>
          <button
            onClick={handleFetchSuggestionsAndImage}
            disabled={isLoadingSuggestions || isLoadingImage || !newCropName.trim()}
            className="w-full bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {(isLoadingSuggestions || isLoadingImage) ? <Spinner size="sm" color="text-white" /> : t('cropManagement.modal.getAISuggestions')}
          </button>

          {isLoadingImage && (
            <div className="mt-4 p-3 text-center" aria-live="polite">
                <Spinner size="md" />
                <p className="text-sm text-gray-600 mt-2">{t('cropManagement.modal.loadingImage')}</p>
            </div>
          )}
          {generatedImageUrl && !isLoadingImage && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-2">{t('cropManagement.modal.imagePreview')}</h4>
                <img src={generatedImageUrl} alt={`${newCropName} AI generated preview`} className="w-full h-40 object-contain rounded-md border border-gray-300" />
            </div>
          )}
          {imageError && !isLoadingImage && (
             <div role="alert" className="mt-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {imageError}
             </div>
          )}

          {isLoadingSuggestions && !suggestedConditions && (
             <div className="mt-4 p-3 text-center" aria-live="polite">
                <Spinner size="md" />
                <p className="text-sm text-gray-600 mt-2">{t('cropManagement.modal.loadingConditions')}</p>
            </div>
          )}
          {suggestedConditions && !isLoadingSuggestions && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-2">{t('cropManagement.modal.aiSuggestedConditions')}</h4>
              {typeof suggestedConditions === 'string' ? (
                <GeminiResponseDisplay response={suggestedConditions} />
              ) : (
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>{t('cropManagement.modal.waterNeeds')}:</strong> {suggestedConditions.waterNeeds}</p>
                  <p><strong>{t('cropManagement.modal.optimalPh')}:</strong> {suggestedConditions.optimalPh}</p>
                  <p><strong>{t('cropManagement.modal.sunlight')}:</strong> {suggestedConditions.sunlight}</p>
                  {suggestedConditions.additionalTips && <p className="mt-2"><strong>{t('cropManagement.modal.tips')}:</strong> {suggestedConditions.additionalTips}</p>}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
           <button type="button" onClick={() => { resetModalState(); setIsModalOpen(false);}} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            {t('cropManagement.modal.cancel')}
          </button>
          <button
            onClick={handleAddCrop}
            disabled={!newCropName.trim() || isLoadingSuggestions || isLoadingImage}
            className="bg-primary text-white px-4 py-2 rounded-md shadow hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {t('cropManagement.modal.addCrop')}
          </button>
        </div>
      </Modal>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-textDark mb-3 flex items-center">
          {t('cropManagement.recommendation.engineTitle')} <span role="img" aria-label="sparkles" className="ml-2"></span>
        </h2>
        <p className="text-textMedium mb-6">
          {t('cropManagement.recommendation.engineSubtitle')}
        </p>
        <div className="bg-card p-6 rounded-xl shadow-lg">
          <div className="space-y-4">
          <div className="flex items-center">
                <input
                    id="useLiveData"
                    name="useLiveData"
                    type="checkbox"
                    checked={useLiveData}
                    onChange={(e) => setUseLiveData(e.target.checked)}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    disabled={isLoadingLiveData}
                />
                <label htmlFor="useLiveData" className="ml-2 block text-sm text-gray-900">
                    {t('cropManagement.recommendation.useLiveData')}
                    {isLoadingLiveData && <span className="text-xs text-gray-500 ml-1"> ({t('cropManagement.recommendation.loadingLiveData')})</span>}
                    {!isLoadingLiveData && (
                        <span className="text-xs text-gray-500 ml-1">
                            (
                            {`${t('cropManagement.recommendation.liveData.temp')}: ${liveSensorData.temp ?? t('common.na')}°C, `}
                            {`${t('cropManagement.recommendation.liveData.moisture')}: ${liveSensorData.moisture ?? t('common.na')}%, `}
                            {`${t('cropManagement.recommendation.liveData.ph')}: ${t('common.na')} (Use manual input below), `}
                            {`N: ${liveSensorData.nitrogen ?? t('common.na')}, P: ${liveSensorData.phosphorus ?? t('common.na')}, K: ${liveSensorData.potassium ?? t('common.na')}`}
                            )
                        </span>
                    )}
                </label>
            </div>


            {!useLiveData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div>
                  <label htmlFor="manualTemp" className="block text-sm font-medium text-gray-700">{t('cropManagement.recommendation.manualInput.temp')}</label>
                  <input type="number" id="manualTemp" value={manualTemperature} onChange={(e) => setManualTemperature(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" placeholder="e.g., 25" aria-label={t('cropManagement.recommendation.manualInput.temp')}/>
                </div>
                <div>
                  <label htmlFor="manualMoisture" className="block text-sm font-medium text-gray-700">{t('cropManagement.recommendation.manualInput.moisture')}</label>
                  <input type="number" id="manualMoisture" value={manualMoisture} onChange={(e) => setManualMoisture(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" placeholder="e.g., 60" aria-label={t('cropManagement.recommendation.manualInput.moisture')}/>
                </div>
                <div>
                  <label htmlFor="manualPh" className="block text-sm font-medium text-gray-700">{t('cropManagement.recommendation.manualInput.ph')}</label>
                  <input type="number" id="manualPh" step="0.1" value={manualPh} onChange={(e) => setManualPh(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" placeholder="e.g., 6.5" aria-label={t('cropManagement.recommendation.manualInput.ph')}/>
                </div>
              </div>
            )}
             <button
                onClick={handleGetRecommendations}
                disabled={isLoadingRecommendations || (useLiveData && isLoadingLiveData)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-150 ease-in-out disabled:opacity-70 flex items-center justify-center text-base"
            >
                {isLoadingRecommendations ? <Spinner size="sm" color="text-white" /> : (<><span role="img" aria-label="sparkles" className="mr-2"></span> {t('cropManagement.recommendation.button.getRecommendations')}</>)}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
        title={t('cropManagement.recommendation.modal.title')}
        footer={
            <button
                onClick={() => setIsRecommendationModalOpen(false)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md shadow transition-colors"
            >
                {t('cropManagement.recommendation.modal.close')}
            </button>
        }
      >
        {isLoadingRecommendations && <Spinner className="my-8" aria-label={t('cropManagement.recommendation.modal.loading')}/>}
        {recommendationError && <GeminiResponseDisplay response={recommendationError} className="border-red-500 bg-red-50" />}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow">
                <h4 className="text-lg font-semibold text-primary mb-1">{rec.cropName}</h4>
                <p className="text-sm text-gray-700 mb-1"><strong>{t('cropManagement.recommendation.modal.reason')}:</strong> {rec.reason}</p>
                <p className="text-sm text-gray-600"><strong>{t('cropManagement.recommendation.modal.growingPeriod')}:</strong> {rec.estimatedGrowingPeriod}</p>
              </div>
            ))}
          </div>
        )}
        {recommendations && recommendations.length === 0 && !recommendationError && (
            <p className="text-textMedium text-center py-4">{t('cropManagement.recommendation.modal.noResults')}</p>
        )}
      </Modal>

    </div>
  );
}

export default CropManagementPage;
