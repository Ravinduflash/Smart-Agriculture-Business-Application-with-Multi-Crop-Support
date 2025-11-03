/**
 * Notification Service
 * Handles real-time notifications for sensor status changes, crop management, and harvest cycles
 */

import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { NotificationMessage, SensorType, Sensor } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export type NotificationType = 
  | 'sensor_status_change'
  | 'crop_added'
  | 'crop_deleted'
  | 'crop_updated'
  | 'harvest_cycle_saved'
  | 'harvest_cycle_updated'
  | 'harvest_cycle_deleted'
  | 'system_alert'
  | 'warning'
  | 'info';

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

interface NotificationData {
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  metadata?: {
    sensorType?: SensorType;
    oldStatus?: string;
    newStatus?: string;
    sensorValue?: string | number;
    cropId?: string;
    cropName?: string;
    cycleId?: string;
    [key: string]: any;
  };
  userId?: string;
  createdAt?: Timestamp;
  read?: boolean;
}

class NotificationService {
  private previousSensorStates: Map<SensorType, string> = new Map();
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.initializeBrowserNotifications();
  }

  // ==================== BROWSER NOTIFICATIONS ====================
  
  /**
   * Request browser notification permission
   */
  async initializeBrowserNotifications(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('⚠️ Browser notifications not supported');
      return;
    }

    this.notificationPermission = Notification.permission;

    if (this.notificationPermission === 'default') {
      try {
        this.notificationPermission = await Notification.requestPermission();
        console.log('🔔 Notification permission:', this.notificationPermission);
      } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
      }
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(title: string, options: NotificationOptions): void {
    if (this.notificationPermission === 'granted' && 'Notification' in window) {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Optional: Handle click event
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('❌ Error showing browser notification:', error);
      }
    }
  }

  // ==================== FIRESTORE NOTIFICATIONS ====================
  
  /**
   * Add a notification to Firestore
   */
  async addNotification(data: NotificationData): Promise<string | null> {
    try {
      const notificationDoc: NotificationData = {
        ...data,
        createdAt: Timestamp.now(),
        read: false
      };

      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationDoc);
      
      console.log('✅ Notification added to Firestore:', docRef.id);

      // Also show browser notification
      this.showBrowserNotification(data.title, {
        body: data.message,
        tag: data.type,
        requireInteraction: data.severity === 'error'
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding notification:', error);
      return null;
    }
  }

  /**
   * Get all notifications
   */
  async getNotifications(limitCount: number = 50): Promise<NotificationMessage[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: this.mapTypeToMessageType(data.type, data.severity),
          title: data.title,
          message: data.message,
          timestamp: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          read: data.read || false
        } as NotificationMessage;
      });
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    callback: (notifications: NotificationMessage[]) => void,
    limitCount: number = 50
  ): () => void {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const notifications = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: this.mapTypeToMessageType(data.type, data.severity),
            title: data.title,
            message: data.message,
            timestamp: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            read: data.read || false
          } as NotificationMessage;
        });
        callback(notifications);
      },
      (error) => {
        console.error('❌ Error in notifications subscription:', error);
      }
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { read: true });
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach(document => {
        batch.update(document.ref, { read: true });
      });

      await batch.commit();
      console.log(`✅ Marked ${querySnapshot.docs.length} notifications as read`);
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  }

  // ==================== SENSOR STATUS MONITORING ====================
  
  /**
   * Check for sensor status changes and create notifications
   */
  async checkSensorStatusChanges(sensors: Sensor[]): Promise<void> {
    for (const sensor of sensors) {
      const sensorKey = sensor.type;
      const currentStatus = String(sensor.status);
      const previousStatus = this.previousSensorStates.get(sensorKey);

      // Check if status has changed
      if (previousStatus && previousStatus !== currentStatus && currentStatus !== 'notAvailable') {
        await this.notifySensorStatusChange(sensor, previousStatus, currentStatus);
      }

      // Update the previous state
      this.previousSensorStates.set(sensorKey, currentStatus);
    }
  }

  /**
   * Notify about sensor status change
   */
  private async notifySensorStatusChange(
    sensor: Sensor,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const sensorName = this.getSensorDisplayName(sensor.type);
    const severity = this.getSeverityFromStatus(newStatus);
    
    let message = `${sensorName} status changed from "${this.formatStatusName(oldStatus)}" to "${this.formatStatusName(newStatus)}"`;
    
    // Add sensor value if available
    if (sensor.currentValue !== null && typeof sensor.currentValue !== 'object') {
      const unit = typeof sensor.unit === 'string' ? sensor.unit : '';
      message += ` (Current: ${sensor.currentValue}${unit})`;
    }

    await this.addNotification({
      type: 'sensor_status_change',
      severity,
      title: `⚠️ ${sensorName} Alert`,
      message,
      metadata: {
        sensorType: sensor.type,
        oldStatus,
        newStatus,
        sensorValue: sensor.currentValue
      }
    });
  }

  // ==================== CROP MANAGEMENT NOTIFICATIONS ====================
  
  /**
   * Notify when a new crop is added
   */
  async notifyCropAdded(cropName: string, cropId: string): Promise<void> {
    await this.addNotification({
      type: 'crop_added',
      severity: 'success',
      title: '✅ New Crop Added',
      message: `"${cropName}" has been successfully added to your crop management system.`,
      metadata: { cropId, cropName }
    });
  }

  /**
   * Notify when a crop is deleted
   */
  async notifyCropDeleted(cropName: string, cropId: string): Promise<void> {
    await this.addNotification({
      type: 'crop_deleted',
      severity: 'info',
      title: '🗑️ Crop Deleted',
      message: `"${cropName}" has been removed from your crop management system.`,
      metadata: { cropId, cropName }
    });
  }

  /**
   * Notify when a crop is updated
   */
  async notifyCropUpdated(cropName: string, cropId: string): Promise<void> {
    await this.addNotification({
      type: 'crop_updated',
      severity: 'info',
      title: '📝 Crop Updated',
      message: `"${cropName}" profile has been updated successfully.`,
      metadata: { cropId, cropName }
    });
  }

  // ==================== HARVEST CYCLE NOTIFICATIONS ====================
  
  /**
   * Notify when a harvest cycle is saved
   */
  async notifyHarvestCycleSaved(cycleId: string, cropName: string): Promise<void> {
    await this.addNotification({
      type: 'harvest_cycle_saved',
      severity: 'success',
      title: '🌾 Harvest Cycle Saved',
      message: `New harvest cycle "${cycleId}" for ${cropName} has been recorded successfully.`,
      metadata: { cycleId, cropName }
    });
  }

  /**
   * Notify when a harvest cycle is updated
   */
  async notifyHarvestCycleUpdated(cycleId: string): Promise<void> {
    await this.addNotification({
      type: 'harvest_cycle_updated',
      severity: 'info',
      title: '📊 Harvest Cycle Updated',
      message: `Harvest cycle "${cycleId}" information has been updated.`,
      metadata: { cycleId }
    });
  }

  /**
   * Notify when a harvest cycle is deleted
   */
  async notifyHarvestCycleDeleted(cycleId: string): Promise<void> {
    await this.addNotification({
      type: 'harvest_cycle_deleted',
      severity: 'warning',
      title: '⚠️ Harvest Cycle Deleted',
      message: `Harvest cycle "${cycleId}" has been deleted from the system.`,
      metadata: { cycleId }
    });
  }

  // ==================== HELPER FUNCTIONS ====================
  
  private getSensorDisplayName(sensorType: SensorType): string {
    const names: Record<SensorType, string> = {
      [SensorType.SoilMoisture]: 'Soil Moisture',
      [SensorType.Temperature]: 'Air Temperature',
      [SensorType.Humidity]: 'Humidity',
      [SensorType.SoilTemperature]: 'Soil Temperature',
      [SensorType.LightIntensity]: 'Light Intensity',
      [SensorType.RainLevel]: 'Rain Level',
      [SensorType.AirPressure]: 'Air Pressure',
      [SensorType.GasLevels]: 'Gas Levels',
      [SensorType.NPKSensor]: 'NPK Levels'
    };
    return names[sensorType] || sensorType;
  }

  private formatStatusName(status: string): string {
    // Convert camelCase or enum values to readable format
    return status
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private getSeverityFromStatus(status: string): NotificationSeverity {
    const lowerStatus = status.toLowerCase();
    
    // Critical/Error statuses
    if (lowerStatus.includes('critical') || 
        lowerStatus.includes('waterlogged') ||
        lowerStatus.includes('toohot') ||
        lowerStatus.includes('heatstress') ||
        lowerStatus.includes('excess')) {
      return 'error';
    }
    
    // Warning statuses
    if (lowerStatus.includes('warning') ||
        lowerStatus.includes('dry') ||
        lowerStatus.includes('wet') ||
        lowerStatus.includes('toocold') ||
        lowerStatus.includes('toodry') ||
        lowerStatus.includes('toohumid') ||
        lowerStatus.includes('deficiency') ||
        lowerStatus.includes('attention')) {
      return 'warning';
    }
    
    // Success/Optimal statuses
    if (lowerStatus.includes('optimal') ||
        lowerStatus.includes('normal') ||
        lowerStatus.includes('stable')) {
      return 'success';
    }
    
    return 'info';
  }

  private mapTypeToMessageType(
    type: NotificationType, 
    severity: NotificationSeverity
  ): 'success' | 'info' | 'warning' | 'error' {
    // Map notification type and severity to NotificationMessage type
    if (severity === 'error') return 'error';
    if (severity === 'warning') return 'warning';
    if (severity === 'success') return 'success';
    return 'info';
  }

  /**
   * Initialize sensor state tracking
   * Call this when the app starts to prevent false alerts
   */
  initializeSensorStates(sensors: Sensor[]): void {
    sensors.forEach(sensor => {
      this.previousSensorStates.set(sensor.type, String(sensor.status));
    });
    console.log('✅ Initialized sensor state tracking for', sensors.length, 'sensors');
  }

  /**
   * Clear all sensor states (useful for testing)
   */
  clearSensorStates(): void {
    this.previousSensorStates.clear();
    console.log('🔄 Cleared all sensor states');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
