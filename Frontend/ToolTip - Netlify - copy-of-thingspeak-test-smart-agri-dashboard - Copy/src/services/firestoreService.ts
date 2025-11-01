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
  ML_PREDICTIONS: 'mlPredictions'
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
    temperature: string;
    additionalTips: string;
  };
  createdAt: Timestamp;
  lastUpdated: Timestamp;
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
}

// Export singleton instance
export const firestoreService = new FirestoreService();
export default firestoreService;
