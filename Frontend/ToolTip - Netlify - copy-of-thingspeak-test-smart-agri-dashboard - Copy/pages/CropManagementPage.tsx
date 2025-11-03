
import React, { useState, useEffect, useContext } from 'react';
import { Crop, OptimalConditions, CropRecommendation } from '../types';
import { getMockCrops } from '../services/mockDataService';
import { IconPlus, IconSun, IconWaterDrop, IconLeaf, IconTrash, DEFAULT_IMAGE_URL } from '../constants';
import Modal from '../components/Modal';
import { getCropOptimalConditions, getAICropRecommendations, generateCropImage } from '../services/geminiService';
import Spinner from '../components/Spinner';
import GeminiResponseDisplay from '../components/GeminiResponseDisplay';
import { LanguageContext } from '../contexts/LanguageContext';
import { fetchThingSpeakData, parseFloatSafe, ThingSpeakFeed } from '../services/thingSpeakService';
import { firestoreService, CropProfile } from '../src/services/firestoreService';
import { notificationService } from '../services/notificationService';

const CropCard: React.FC<{ crop: Crop; t: (key: string) => string; onDelete: (cropId: string) => void }> = ({ crop, t, onDelete }) => (
  <div className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
    <button
      onClick={() => onDelete(crop.id)}
      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
      aria-label={t('cropManagement.card.delete')}
      title={t('cropManagement.card.delete')}
    >
      <IconTrash className="w-4 h-4" />
    </button>
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

  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[] | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<Crop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Harvest Cycle Management State
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [selectedCropForHarvest, setSelectedCropForHarvest] = useState<Crop | null>(null);
  const [harvestFormData, setHarvestFormData] = useState({
    planting_date: '',
    status: 'active' as 'active' | 'inactive' | 'completed',
    current_height_cm: '',
    final_harvest_date: '',
    final_actual_yield_g_total: '',
    final_plant_count: '',
    final_pest_loss_g: '',
    final_avg_weight_g: ''
  });
  const [isSavingHarvest, setIsSavingHarvest] = useState(false);

  useEffect(() => {
    // Load crops from Firestore instead of mock data
    const loadCropsFromFirestore = async () => {
      try {
        const firestoreCrops = await firestoreService.getAllCropProfiles();
        
        // Transform Firestore crop profiles to match the Crop interface
        const transformedCrops: Crop[] = firestoreCrops.map((profile: CropProfile) => ({
          id: profile.cropId,
          name: profile.name,
          imageUrl: profile.imageUrl || DEFAULT_IMAGE_URL,
          waterNeeds: profile.optimalConditions.waterNeeds,
          optimalPh: profile.optimalConditions.optimalPh,
          sunlight: profile.optimalConditions.sunlight,
          details: profile.description,
          lastUpdated: profile.lastUpdated 
            ? new Date((profile.lastUpdated as any).toDate()).toLocaleString()
            : new Date().toLocaleString()
        }));
        
        setCrops(transformedCrops);
        console.log('✅ Loaded crops from Firestore:', transformedCrops);
      } catch (error) {
        console.error('❌ Error loading crops from Firestore:', error);
        // Fallback to mock data if Firestore fails
        setCrops(getMockCrops());
      }
    };

    loadCropsFromFirestore();
    
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

  const handleAddCrop = async () => {
    if (!newCropName.trim()) return; 
    
    const cropId = `crop_${Date.now()}`;
    
    const newCropEntry: Crop = {
      id: cropId,
      name: newCropName,
      imageUrl: generatedImageUrl || DEFAULT_IMAGE_URL, 
      waterNeeds: typeof suggestedConditions === 'object' && suggestedConditions?.waterNeeds ? suggestedConditions.waterNeeds : t('common.na'),
      optimalPh: typeof suggestedConditions === 'object' && suggestedConditions?.optimalPh ? suggestedConditions.optimalPh : t('common.na'),
      sunlight: typeof suggestedConditions === 'object' && suggestedConditions?.sunlight ? suggestedConditions.sunlight : t('common.na'),
      details: typeof suggestedConditions === 'object' && suggestedConditions?.additionalTips ? suggestedConditions.additionalTips : 
               (typeof suggestedConditions === 'string' ? suggestedConditions : undefined),
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    // Save to Firestore
    try {
      console.log('💾 Saving crop profile to Firestore:', newCropEntry.name);
      
      const cropProfile: Omit<CropProfile, 'id'> = {
        cropId: cropId,
        name: newCropEntry.name,
        imageUrl: newCropEntry.imageUrl || DEFAULT_IMAGE_URL,
        description: newCropEntry.details || '',
        optimalConditions: {
          waterNeeds: newCropEntry.waterNeeds,
          optimalPh: newCropEntry.optimalPh,
          sunlight: newCropEntry.sunlight,
          temperature: '', // Not captured in current form
          soilType: '', // Not captured in current form
          growthDuration: '' // Not captured in current form
        },
        // Firestore will add createdAt and lastUpdated timestamps automatically
      };
      
      const success = await firestoreService.addCropProfile(cropProfile);
      
      if (success) {
        console.log('✅ Crop profile saved successfully to Firestore');
        // Add to local state to show immediately
        setCrops(prevCrops => [newCropEntry, ...prevCrops]);
        
        // Send notification about crop being added
        await notificationService.notifyCropAdded(newCropEntry.name, cropId);
      } else {
        console.error('❌ Failed to save crop profile to Firestore');
        alert(t('cropManagement.error.saveFailed') || 'Failed to save crop profile. Please try again.');
        return;
      }
    } catch (error) {
      console.error('❌ Error saving crop profile:', error);
      alert(t('cropManagement.error.saveFailed') || 'Failed to save crop profile. Please try again.');
      return;
    }
    
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

  const handleDeleteClick = (cropId: string) => {
    const crop = crops.find(c => c.id === cropId);
    if (crop) {
      setCropToDelete(crop);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!cropToDelete) return;

    setIsDeleting(true);
    console.log('🗑️ Deleting crop profile from Firestore:', cropToDelete.name);

    try {
      const success = await firestoreService.deleteCropProfile(cropToDelete.id);
      
      if (success) {
        console.log('✅ Crop profile deleted successfully from Firestore');
        // Remove from local state
        setCrops(prevCrops => prevCrops.filter(c => c.id !== cropToDelete.id));
        
        // Send notification about crop deletion
        await notificationService.notifyCropDeleted(cropToDelete.name, cropToDelete.id);
        
        setIsDeleteModalOpen(false);
        setCropToDelete(null);
      } else {
        console.error('❌ Failed to delete crop profile from Firestore');
        alert(t('cropManagement.error.deleteFailed') || 'Failed to delete crop profile. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error deleting crop profile:', error);
      alert(t('cropManagement.error.deleteFailed') || 'Failed to delete crop profile. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCropToDelete(null);
  };

  // Harvest Cycle Management Functions
  const handleOpenHarvestForm = (crop: Crop) => {
    setSelectedCropForHarvest(crop);
    setIsHarvestModalOpen(true);
    // Reset form
    setHarvestFormData({
      planting_date: '',
      status: 'active',
      current_height_cm: '',
      final_harvest_date: '',
      final_actual_yield_g_total: '',
      final_plant_count: '',
      final_pest_loss_g: '',
      final_avg_weight_g: ''
    });
  };

  const handleSaveHarvestCycle = async () => {
    if (!selectedCropForHarvest || !harvestFormData.planting_date) {
      alert(t('cropManagement.harvest.error.missingPlantingDate') || 'Please enter planting date');
      return;
    }

    // Validate based on status
    if (harvestFormData.status === 'completed') {
      if (!harvestFormData.final_harvest_date || !harvestFormData.final_actual_yield_g_total || 
          !harvestFormData.final_plant_count) {
        alert(t('cropManagement.harvest.error.missingCompletedFields') || 'Please fill all required fields for completed harvest');
        return;
      }
    }

    setIsSavingHarvest(true);
    console.log('💾 Saving harvest cycle to Firestore');

    try {
      const harvestCycleData: any = {
        crop_id: selectedCropForHarvest.id,
        crop_type: selectedCropForHarvest.name,
        planting_date: new Date(harvestFormData.planting_date).toISOString(),
        status: harvestFormData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add status-specific fields
      if (harvestFormData.status === 'active' && harvestFormData.current_height_cm) {
        harvestCycleData.current_height_cm = parseFloat(harvestFormData.current_height_cm);
        harvestCycleData.last_height_update = new Date().toISOString();
      }

      if (harvestFormData.status === 'completed') {
        harvestCycleData.final_harvest_date = new Date(harvestFormData.final_harvest_date).toISOString();
        harvestCycleData.final_actual_yield_g_total = parseFloat(harvestFormData.final_actual_yield_g_total);
        harvestCycleData.final_plant_count = parseInt(harvestFormData.final_plant_count);
        harvestCycleData.final_pest_loss_g = harvestFormData.final_pest_loss_g ? parseFloat(harvestFormData.final_pest_loss_g) : 0;
        harvestCycleData.final_avg_weight_g = harvestFormData.final_avg_weight_g ? parseFloat(harvestFormData.final_avg_weight_g) : 0;
      }

      // Save to Firestore harvest_cycles collection
      const success = await firestoreService.addHarvestCycle(harvestCycleData);

      if (success) {
        console.log('✅ Harvest cycle saved successfully');
        
        // Send notification about harvest cycle being saved
        // The cycle ID will be generated by Firestore, so we use a generic message
        await notificationService.notifyHarvestCycleSaved(
          'New Cycle', 
          selectedCropForHarvest.name
        );
        
        setIsHarvestModalOpen(false);
        setSelectedCropForHarvest(null);
        alert(t('cropManagement.harvest.success.saved') || 'Harvest cycle saved successfully!');
      } else {
        console.error('❌ Failed to save harvest cycle');
        alert(t('cropManagement.harvest.error.saveFailed') || 'Failed to save harvest cycle. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving harvest cycle:', error);
      alert(t('cropManagement.harvest.error.saveFailed') || 'Failed to save harvest cycle. Please try again.');
    } finally {
      setIsSavingHarvest(false);
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {crops.map((crop) => (
            <CropCard key={crop.id} crop={crop} t={t} onDelete={handleDeleteClick} />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
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
          {t('cropManagement.harvest.sectionTitle')} <span role="img" aria-label="plant" className="ml-2">🌱</span>
        </h2>
        <p className="text-textMedium mb-6">
          {t('cropManagement.harvest.sectionSubtitle')}
        </p>
        
        <div className="bg-card p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-textDark mb-4">{t('cropManagement.harvest.selectCrop')}</h3>
          {crops.length === 0 ? (
            <p className="text-textMedium text-center py-4">{t('cropManagement.harvest.noCropsAvailable')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => handleOpenHarvestForm(crop)}
                  className="bg-white border-2 border-gray-200 hover:border-primary rounded-lg p-4 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={crop.imageUrl || DEFAULT_IMAGE_URL} 
                      alt={crop.name} 
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE_URL)}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{crop.name}</h4>
                      <p className="text-xs text-gray-500">{t('cropManagement.harvest.clickToManage')}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title={t('cropManagement.delete.modal.title')}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t('cropManagement.delete.modal.message')} <strong className="text-red-600">{cropToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            {t('cropManagement.delete.modal.warning')}
          </p>
          {cropToDelete && (
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <img 
                src={cropToDelete.imageUrl || DEFAULT_IMAGE_URL} 
                alt={cropToDelete.name} 
                className="w-full h-32 object-cover rounded-md mb-2"
                onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE_URL)}
              />
              <h4 className="font-semibold text-gray-800">{cropToDelete.name}</h4>
              <p className="text-sm text-gray-600">{cropToDelete.details || t('common.na')}</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={handleCancelDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {t('cropManagement.delete.modal.cancel')}
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow transition-colors disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" color="text-white" />
                <span className="ml-2">{t('cropManagement.delete.modal.deleting')}</span>
              </>
            ) : (
              <>
                <IconTrash className="w-4 h-4 mr-2" />
                {t('cropManagement.delete.modal.confirm')}
              </>
            )}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        title={`${t('cropManagement.harvest.modal.title')} - ${selectedCropForHarvest?.name || ''}`}
      >
        <div className="space-y-4">
          {/* Planting Date - Required */}
          <div>
            <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-1">
              {t('cropManagement.harvest.modal.plantingDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="plantingDate"
              value={harvestFormData.planting_date}
              onChange={(e) => setHarvestFormData({...harvestFormData, planting_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
              required
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              {t('cropManagement.harvest.modal.status')} <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={harvestFormData.status}
              onChange={(e) => setHarvestFormData({...harvestFormData, status: e.target.value as 'active' | 'inactive' | 'completed'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
            >
              <option value="active">{t('cropManagement.harvest.modal.statusActive')}</option>
              <option value="inactive">{t('cropManagement.harvest.modal.statusInactive')}</option>
              <option value="completed">{t('cropManagement.harvest.modal.statusCompleted')}</option>
            </select>
          </div>

          {/* Active Status Fields */}
          {harvestFormData.status === 'active' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="text-sm font-semibold text-green-800 mb-3">{t('cropManagement.harvest.modal.activeFields')}</h4>
              <div>
                <label htmlFor="currentHeight" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cropManagement.harvest.modal.currentHeight')} (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="currentHeight"
                  value={harvestFormData.current_height_cm}
                  onChange={(e) => setHarvestFormData({...harvestFormData, current_height_cm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="e.g., 16.5"
                />
                <p className="text-xs text-gray-500 mt-1">{t('cropManagement.harvest.modal.heightNote')}</p>
              </div>
            </div>
          )}

          {/* Completed Status Fields */}
          {harvestFormData.status === 'completed' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-3">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">{t('cropManagement.harvest.modal.completedFields')}</h4>
              
              <div>
                <label htmlFor="finalHarvestDate" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cropManagement.harvest.modal.finalHarvestDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="finalHarvestDate"
                  value={harvestFormData.final_harvest_date}
                  onChange={(e) => setHarvestFormData({...harvestFormData, final_harvest_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="totalYield" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cropManagement.harvest.modal.totalYield')} (g) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="totalYield"
                    value={harvestFormData.final_actual_yield_g_total}
                    onChange={(e) => setHarvestFormData({...harvestFormData, final_actual_yield_g_total: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
                    placeholder="e.g., 1750"
                  />
                </div>

                <div>
                  <label htmlFor="plantCount" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cropManagement.harvest.modal.plantCount')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="plantCount"
                    value={harvestFormData.final_plant_count}
                    onChange={(e) => setHarvestFormData({...harvestFormData, final_plant_count: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
                    placeholder="e.g., 14"
                  />
                </div>

                <div>
                  <label htmlFor="pestLoss" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cropManagement.harvest.modal.pestLoss')} (g)
                  </label>
                  <input
                    type="number"
                    id="pestLoss"
                    value={harvestFormData.final_pest_loss_g}
                    onChange={(e) => setHarvestFormData({...harvestFormData, final_pest_loss_g: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
                    placeholder="e.g., 360"
                  />
                </div>

                <div>
                  <label htmlFor="avgWeight" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cropManagement.harvest.modal.avgWeight')} (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="avgWeight"
                    value={harvestFormData.final_avg_weight_g}
                    onChange={(e) => setHarvestFormData({...harvestFormData, final_avg_weight_g: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-gray-900"
                    placeholder="e.g., 90"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => setIsHarvestModalOpen(false)}
            disabled={isSavingHarvest}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {t('cropManagement.harvest.modal.cancel')}
          </button>
          <button
            onClick={handleSaveHarvestCycle}
            disabled={isSavingHarvest}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md shadow transition-colors disabled:opacity-50 flex items-center"
          >
            {isSavingHarvest ? (
              <>
                <Spinner size="sm" color="text-white" />
                <span className="ml-2">{t('cropManagement.harvest.modal.saving')}</span>
              </>
            ) : (
              t('cropManagement.harvest.modal.save')
            )}
          </button>
        </div>
      </Modal>

    </div>
  );
}

export default CropManagementPage;
