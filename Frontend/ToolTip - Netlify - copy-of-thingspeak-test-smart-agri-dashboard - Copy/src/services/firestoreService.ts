import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
export const COLLECTIONS = {
  CROP_PROFILES: 'cropProfiles',
  SENSOR_READINGS: 'sensorReadings',
  PI_CONFIGS: 'piConfigs',
  USERS: 'users',
  CHATBOT_KNOWLEDGE: 'chatbotKnowledgeBase',
  ML_PREDICTIONS: 'mlPredictions',
  HARVEST_CYCLES: 'harvest_cycles',
  DAILY_FORECASTS: 'daily_forecasts'
};

// TypeScript Interfaces
export interface CropProfile {
  cropId: string;
  name: string;
  imageUrl: string;
  description: string;
  optimalConditions: {
    waterNeeds: string;
    optimalPh: string;
    sunlight: string;
    temperature?: string;
    soilType?: string;
    growthDuration?: string;
    additionalTips?: string;
  };
  createdAt?: Timestamp;
  lastUpdated?: Timestamp;
}

export interface SensorReading {
  id?: string;
  timestamp: string; // Format: "2025-11-01 14:30:00"
  crop_id: string; // Changed from crop_type to match Firestore data
  crop_type?: string; // Optional for backward compatibility
  air_temp_c: number | null;
  humidity_percent: number | null;
  water_soil_temp_c: number | null;
  air_pressure_hpa: number | null;
  air_pressure_status: string | null;
  soil_moisture_raw: number | null;
  soil_moisture_status: string | null;
  light_level_raw: number | null;
  light_level_status: string | null;
  rain_level_raw: number | null;
  rain_level_status: string | null;
  co2_ppm: number | null;
  nh3_ppm: number | null;
  voc_ppm: number | null;
  nitrogen_mg_kg: number | null;
  nitrogen_status: string | null;
  phosphorus_mg_kg: number | null;
  phosphorus_status: string | null;
  potassium_mg_kg: number | null;
  potassium_status: string | null;
  uploaded_at?: Timestamp;
}

export interface PiConfig {
  piId: string;
  activeCropProfileId: string;
  lastUpdated: Timestamp;
  status: 'online' | 'offline' | 'error';
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: 'farmer' | 'admin';
  createdAt: Timestamp;
  preferences: {
    selectedCropProfileId: string | null;
    language: 'en' | 'si' | 'ta';
  };
}

export interface ChatbotKnowledge {
  knowledgeId?: string;
  topic: string;
  question: string;
  answer: string;
  language: 'en' | 'si' | 'ta';
  tags: string[];
  lastUpdated: Timestamp;
}

export interface MLPrediction {
  predictionId?: string;
  cropProfileId: string;
  type: 'yield' | 'disease' | 'recommendation';
  prediction: any;
  confidence: number;
  timestamp: Timestamp;
}

export interface DailyForecast {
  id?: string;
  cycle_id: string;
  days_elapsed: number;
  forecast_timestamp: string; // ISO 8601 format
  forecasted_yield_g_plant: number;
  forecasted_harvest_days: number;
  total_forecasted_yield_g: number;
  // Optional context data
  current_height_cm?: number;
  current_avg_temp?: number;
  current_avg_humidity?: number;
  current_avg_moisture?: number;
  active_plant_count_used?: number;
  created_at?: string;
}

// Firestore Helper Functions
class FirestoreService {
  
  // ==================== CROP PROFILES ====================
  
  async getCropProfile(cropId: string): Promise<CropProfile | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CROP_PROFILES, cropId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { cropId, ...docSnap.data() } as CropProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting crop profile:', error);
      return null;
    }
  }

  async getAllCropProfiles(): Promise<CropProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CROP_PROFILES));
      return querySnapshot.docs.map(doc => ({ 
        cropId: doc.id, 
        ...doc.data() 
      } as CropProfile));
    } catch (error) {
      console.error('Error getting crop profiles:', error);
      return [];
    }
  }

  async saveCropProfile(cropProfile: Omit<CropProfile, 'createdAt' | 'lastUpdated'>): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.CROP_PROFILES, cropProfile.cropId);
      await setDoc(docRef, {
        ...cropProfile,
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error saving crop profile:', error);
      return false;
    }
  }

  // Alias method for consistency with other CRUD operations
  async addCropProfile(cropProfile: Omit<CropProfile, 'createdAt' | 'lastUpdated'>): Promise<boolean> {
    return this.saveCropProfile(cropProfile);
  }

  async updateCropProfile(cropId: string, updates: Partial<CropProfile>): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.CROP_PROFILES, cropId);
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating crop profile:', error);
      return false;
    }
  }

  async deleteCropProfile(cropId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.CROP_PROFILES, cropId);
      await deleteDoc(docRef);
      console.log('✅ Crop profile deleted from Firestore:', cropId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting crop profile:', error);
      return false;
    }
  }

  // ==================== SENSOR READINGS ====================
  
  /**
   * Get latest sensor readings for a specific crop type
   * @param cropType - The crop type (e.g., "amaranthus")
   * @param limitCount - Number of readings to fetch
   */
  async getLatestSensorReadings(
    cropType: string = 'amaranthus', 
    limitCount: number = 1
  ): Promise<SensorReading[]> {
    try {
      console.log(`🔍 Firestore Query: Fetching ${limitCount} readings for crop_id="${cropType}"`);
      const q = query(
        collection(db, COLLECTIONS.SENSOR_READINGS),
        where('crop_id', '==', cropType),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const readings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to string format
        const timestamp = data.timestamp?.toDate ? 
          this.formatTimestampToString(data.timestamp.toDate()) : 
          data.timestamp;
        
        return { 
          id: doc.id, 
          ...data,
          timestamp,
          crop_id: data.crop_id || data.crop_type // Support both field names
        } as SensorReading;
      });
      
      console.log(`✅ Firestore Success: Retrieved ${readings.length} sensor readings`);
      if (readings.length > 0) {
        console.log('📊 Latest reading timestamp:', readings[0].timestamp);
        console.log('📊 Sample data:', {
          temp: readings[0].air_temp_c,
          humidity: readings[0].humidity_percent,
          soil_moisture: readings[0].soil_moisture_raw
        });
      }
      
      return readings;
    } catch (error) {
      console.error('❌ Error getting sensor readings:', error);
      return [];
    }
  }

  /**
   * Helper function to format Date to "YYYY-MM-DD HH:MM:SS" string
   */
  private formatTimestampToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Get all sensor readings (for any crop) - useful for Dashboard overview
   * @param limitCount - Number of readings to fetch
   */
  async getAllSensorReadings(limitCount: number = 100): Promise<SensorReading[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SENSOR_READINGS),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate ? 
          this.formatTimestampToString(data.timestamp.toDate()) : 
          data.timestamp;
        
        return { 
          id: doc.id, 
          ...data,
          timestamp,
          crop_id: data.crop_id || data.crop_type
        } as SensorReading;
      });
    } catch (error) {
      console.error('Error getting all sensor readings:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time sensor readings updates
   * @param cropType - The crop type to filter by (optional)
   * @param callback - Function to call when data changes
   * @param limitCount - Number of readings to fetch
   */
  subscribeToSensorReadings(
    callback: (readings: SensorReading[]) => void,
    cropType?: string,
    limitCount: number = 100
  ): () => void {
    let q = query(
      collection(db, COLLECTIONS.SENSOR_READINGS),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (cropType) {
      q = query(
        collection(db, COLLECTIONS.SENSOR_READINGS),
        where('crop_id', '==', cropType),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }

    return onSnapshot(
      q,
      (querySnapshot) => {
        const readings = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as SensorReading));
        callback(readings);
      },
      (error) => {
        console.error('Error in sensor readings subscription:', error);
      }
    );
  }

  async addSensorReading(reading: Omit<SensorReading, 'id'>): Promise<boolean> {
    try {
      const docRef = doc(collection(db, COLLECTIONS.SENSOR_READINGS));
      await setDoc(docRef, reading);
      return true;
    } catch (error) {
      console.error('Error adding sensor reading:', error);
      return false;
    }
  }

  /**
   * Get sensor readings within a date range
   * @param cropType - The crop type
   * @param startDate - Start date string (YYYY-MM-DD HH:MM:SS)
   * @param endDate - End date string (YYYY-MM-DD HH:MM:SS)
   * @param limitCount - Maximum number of readings
   */
  async getSensorReadingsByDateRange(
    cropType: string,
    startDate: string,
    endDate: string,
    limitCount: number = 500
  ): Promise<SensorReading[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SENSOR_READINGS),
        where('crop_id', '==', cropType),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate ? 
          this.formatTimestampToString(data.timestamp.toDate()) : 
          data.timestamp;
        
        return { 
          id: doc.id, 
          ...data,
          timestamp,
          crop_id: data.crop_id || data.crop_type
        } as SensorReading;
      });
    } catch (error) {
      console.error('Error getting sensor readings by date range:', error);
      return [];
    }
  }

  // ==================== PI CONFIGURATION ====================
  
  async getPiConfig(piId: string = 'pi_unit_001'): Promise<PiConfig | null> {
    try {
      const docRef = doc(db, COLLECTIONS.PI_CONFIGS, piId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { piId, ...docSnap.data() } as PiConfig;
      }
      return null;
    } catch (error) {
      console.error('Error getting Pi config:', error);
      return null;
    }
  }

  async updatePiConfig(piId: string, cropProfileId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.PI_CONFIGS, piId);
      await updateDoc(docRef, {
        activeCropProfileId: cropProfileId,
        lastUpdated: Timestamp.now(),
        status: 'online'
      });
      return true;
    } catch (error) {
      console.error('Error updating Pi config:', error);
      return false;
    }
  }

  async initializePiConfig(piId: string, cropProfileId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.PI_CONFIGS, piId);
      await setDoc(docRef, {
        piId,
        activeCropProfileId: cropProfileId,
        lastUpdated: Timestamp.now(),
        status: 'online'
      });
      return true;
    } catch (error) {
      console.error('Error initializing Pi config:', error);
      return false;
    }
  }

  subscribeToPiConfig(
    piId: string, 
    callback: (config: PiConfig | null) => void
  ): () => void {
    const docRef = doc(db, COLLECTIONS.PI_CONFIGS, piId);
    
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ piId, ...docSnap.data() } as PiConfig);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in Pi config subscription:', error);
      }
    );
  }

  // ==================== USER MANAGEMENT ====================
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { userId, ...docSnap.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async createUserProfile(userProfile: Omit<UserProfile, 'createdAt'>): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userProfile.userId);
      await setDoc(docRef, {
        ...userProfile,
        createdAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  }

  async updateUserSelectedCrop(userId: string, cropProfileId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(docRef, {
        'preferences.selectedCropProfileId': cropProfileId
      });
      return true;
    } catch (error) {
      console.error('Error updating user selected crop:', error);
      return false;
    }
  }

  async updateUserLanguage(userId: string, language: 'en' | 'si' | 'ta'): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(docRef, {
        'preferences.language': language
      });
      return true;
    } catch (error) {
      console.error('Error updating user language:', error);
      return false;
    }
  }

  // ==================== CHATBOT KNOWLEDGE BASE ====================
  
  async getChatbotKnowledge(
    language: 'en' | 'si' | 'ta', 
    topic?: string
  ): Promise<ChatbotKnowledge[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.CHATBOT_KNOWLEDGE),
        where('language', '==', language)
      );

      if (topic) {
        q = query(q, where('tags', 'array-contains', topic));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        knowledgeId: doc.id, 
        ...doc.data() 
      } as ChatbotKnowledge));
    } catch (error) {
      console.error('Error getting chatbot knowledge:', error);
      return [];
    }
  }

  async addChatbotKnowledge(
    knowledge: Omit<ChatbotKnowledge, 'knowledgeId' | 'lastUpdated'>
  ): Promise<boolean> {
    try {
      const docRef = doc(collection(db, COLLECTIONS.CHATBOT_KNOWLEDGE));
      await setDoc(docRef, {
        ...knowledge,
        lastUpdated: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error adding chatbot knowledge:', error);
      return false;
    }
  }

  async updateChatbotKnowledge(
    knowledgeId: string,
    updates: Partial<ChatbotKnowledge>
  ): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.CHATBOT_KNOWLEDGE, knowledgeId);
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating chatbot knowledge:', error);
      return false;
    }
  }

  // ==================== ML PREDICTIONS ====================
  
  async getMLPredictions(
    cropProfileId: string,
    type?: 'yield' | 'disease' | 'recommendation'
  ): Promise<MLPrediction[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.ML_PREDICTIONS),
        where('cropProfileId', '==', cropProfileId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      if (type) {
        q = query(q, where('type', '==', type));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        predictionId: doc.id, 
        ...doc.data() 
      } as MLPrediction));
    } catch (error) {
      console.error('Error getting ML predictions:', error);
      return [];
    }
  }

  async addMLPrediction(prediction: Omit<MLPrediction, 'predictionId'>): Promise<boolean> {
    try {
      const docRef = doc(collection(db, COLLECTIONS.ML_PREDICTIONS));
      await setDoc(docRef, prediction);
      return true;
    } catch (error) {
      console.error('Error adding ML prediction:', error);
      return false;
    }
  }

  // ==================== HARVEST CYCLES ====================
  
  async addHarvestCycle(harvestData: any): Promise<boolean> {
    try {
      // Get all existing harvest cycles to determine the next cycle number
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.HARVEST_CYCLES));
      const existingCycles = querySnapshot.docs.map(doc => doc.id);
      
      // Find the highest cycle number
      let maxCycleNum = 0;
      existingCycles.forEach(id => {
        const match = id.match(/^cycle_(\d+)$/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxCycleNum) maxCycleNum = num;
        }
      });
      
      // Generate next cycle ID
      const nextCycleNum = maxCycleNum + 1;
      const cycleId = `cycle_${String(nextCycleNum).padStart(3, '0')}`;
      
      const docRef = doc(db, COLLECTIONS.HARVEST_CYCLES, cycleId);
      await setDoc(docRef, harvestData);
      console.log(`✅ Harvest cycle added to Firestore with ID: ${cycleId}`);
      return true;
    } catch (error) {
      console.error('❌ Error adding harvest cycle:', error);
      return false;
    }
  }

  async getHarvestCycles(cropId?: string): Promise<any[]> {
    try {
      let q = query(collection(db, COLLECTIONS.HARVEST_CYCLES), orderBy('created_at', 'desc'));
      
      if (cropId) {
        q = query(
          collection(db, COLLECTIONS.HARVEST_CYCLES),
          where('crop_id', '==', cropId),
          orderBy('created_at', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting harvest cycles:', error);
      return [];
    }
  }

  async updateHarvestCycle(cycleId: string, updates: any): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.HARVEST_CYCLES, cycleId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      console.log('✅ Harvest cycle updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating harvest cycle:', error);
      return false;
    }
  }

  async deleteHarvestCycle(cycleId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.HARVEST_CYCLES, cycleId);
      await deleteDoc(docRef);
      console.log('✅ Harvest cycle deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting harvest cycle:', error);
      return false;
    }
  }

  // ==================== DAILY FORECASTS ====================
  
  async addDailyForecast(forecastData: Omit<DailyForecast, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const docRef = doc(collection(db, COLLECTIONS.DAILY_FORECASTS));
      await setDoc(docRef, {
        ...forecastData,
        created_at: new Date().toISOString()
      });
      console.log('✅ Daily forecast added to Firestore');
      return true;
    } catch (error) {
      console.error('❌ Error adding daily forecast:', error);
      return false;
    }
  }

  async getDailyForecastsByCycle(cycleId: string): Promise<DailyForecast[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.DAILY_FORECASTS),
        where('cycle_id', '==', cycleId),
        orderBy('days_elapsed', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DailyForecast));
    } catch (error) {
      console.error('Error getting daily forecasts:', error);
      return [];
    }
  }

  async getLatestForecastByCycle(cycleId: string): Promise<DailyForecast | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.DAILY_FORECASTS),
        where('cycle_id', '==', cycleId),
        orderBy('days_elapsed', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as DailyForecast;
    } catch (error) {
      console.error('Error getting latest forecast:', error);
      return null;
    }
  }

  async deleteDailyForecast(forecastId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTIONS.DAILY_FORECASTS, forecastId);
      await deleteDoc(docRef);
      console.log('✅ Daily forecast deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting daily forecast:', error);
      return false;
    }
  }

  // ==================== MIGRATION UTILITY ====================
  
  /**
   * Migrate existing harvest_cycles to use cycle_001, cycle_002, etc. format
   * This is a one-time migration utility
   */
  async migrateHarvestCyclesToNewIds(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Starting harvest cycles migration...');
      
      // Get all existing harvest cycles
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.HARVEST_CYCLES));
      
      if (querySnapshot.empty) {
        return { success: true, message: 'No harvest cycles to migrate' };
      }

      const existingDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));

      console.log(`📊 Found ${existingDocs.length} harvest cycles to migrate`);

      // Sort by created_at to maintain order
      existingDocs.sort((a, b) => {
        const dateA = a.data.created_at || a.data.planting_date || '';
        const dateB = b.data.created_at || b.data.planting_date || '';
        return dateA.localeCompare(dateB);
      });

      // Create new documents with cycle_001, cycle_002, etc.
      let successCount = 0;
      for (let i = 0; i < existingDocs.length; i++) {
        const cycleId = `cycle_${String(i + 1).padStart(3, '0')}`;
        const oldId = existingDocs[i].id;

        // Skip if already in correct format
        if (oldId === cycleId) {
          console.log(`✓ ${oldId} already in correct format, skipping`);
          successCount++;
          continue;
        }

        try {
          // Create new document with new ID
          const newDocRef = doc(db, COLLECTIONS.HARVEST_CYCLES, cycleId);
          await setDoc(newDocRef, existingDocs[i].data);
          console.log(`✓ Migrated ${oldId} → ${cycleId}`);

          // Delete old document
          const oldDocRef = doc(db, COLLECTIONS.HARVEST_CYCLES, oldId);
          await deleteDoc(oldDocRef);
          console.log(`✓ Deleted old document ${oldId}`);

          successCount++;
        } catch (error) {
          console.error(`❌ Error migrating ${oldId}:`, error);
        }
      }

      const message = `✅ Migration complete! Migrated ${successCount}/${existingDocs.length} harvest cycles`;
      console.log(message);
      return { success: true, message };
      
    } catch (error) {
      const errorMsg = `❌ Migration failed: ${error}`;
      console.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
export default firestoreService;
