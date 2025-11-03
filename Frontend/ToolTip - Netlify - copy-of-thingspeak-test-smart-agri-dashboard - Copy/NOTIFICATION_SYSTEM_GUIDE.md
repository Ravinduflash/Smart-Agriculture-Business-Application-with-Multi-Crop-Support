# 🔔 Smart Agriculture Notification System

## Overview
A comprehensive real-time notification system that monitors sensor status changes, crop management activities, and harvest cycle operations. The system provides both in-app notifications and browser push notifications.

---

## ✨ Features Implemented

### 1. **Sensor Status Change Notifications**
- **Automatic Monitoring**: Tracks changes in sensor status (Soil Moisture, Temperature, Humidity, etc.)
- **Smart Detection**: Only notifies when status actually changes (prevents spam)
- **Severity Levels**: 
  - 🔴 **Error**: Critical issues (Waterlogged, Too Hot, Heat Stress)
  - 🟡 **Warning**: Attention needed (Dry, Wet, Too Cold, Deficiency)
  - 🟢 **Success**: Optimal conditions reached
  - ℹ️ **Info**: General status updates

**Example Notifications:**
- "⚠️ Soil Moisture Alert: Status changed from 'Optimal' to 'Dry - Needs Irrigation' (Current: 13017 ADC)"
- "⚠️ Air Temperature Alert: Status changed from 'Optimal' to 'Too Hot' (Current: 35.2°C)"

### 2. **Crop Management Notifications**
- **✅ Crop Added**: Notifies when new crop profile is created
- **🗑️ Crop Deleted**: Notifies when crop is removed from system
- **📝 Crop Updated**: Notifies when crop profile is modified (future enhancement)

**Example Notifications:**
- "✅ New Crop Added: 'Tomato' has been successfully added to your crop management system."
- "🗑️ Crop Deleted: 'Old Wheat' has been removed from your crop management system."

### 3. **Harvest Cycle Notifications**
- **🌾 Cycle Saved**: Notifies when new harvest cycle is recorded
- **📊 Cycle Updated**: Notifies when harvest data is modified
- **⚠️ Cycle Deleted**: Notifies when harvest cycle is removed

**Example Notifications:**
- "🌾 Harvest Cycle Saved: New harvest cycle 'cycle_003' for Amaranthus has been recorded successfully."

### 4. **Browser Push Notifications**
- **Permission Request**: Automatically requests browser notification permission on first load
- **Desktop Alerts**: Shows native OS notifications even when tab is not active
- **Auto-Close**: Notifications disappear after 5 seconds
- **Click to Focus**: Clicking notification brings app window to focus

---

## 📁 Files Created/Modified

### **New Files:**
1. **`services/notificationService.ts`** (NEW)
   - Core notification service
   - Firestore integration for persistent notifications
   - Browser notification API integration
   - Sensor status change tracking
   - Notification type definitions

### **Modified Files:**
1. **`pages/NotificationsPage.tsx`**
   - Now uses real-time Firestore notifications
   - "Mark all as read" functionality
   - Loading spinner during data fetch
   - Real-time updates via onSnapshot

2. **`pages/DashboardPage.tsx`**
   - Integrated sensor status monitoring
   - Calls `checkSensorStatusChanges()` every 20 seconds
   - Initializes sensor states to prevent false alerts

3. **`pages/CropManagementPage.tsx`**
   - Notifications for crop additions
   - Notifications for crop deletions
   - Notifications for harvest cycle saves

4. **`src/services/firestoreService.ts`**
   - Added `NOTIFICATIONS` collection constant

---

## 🚀 How It Works

### Sensor Status Monitoring Flow:
```
1. Dashboard loads sensor data every 20 seconds
2. notificationService.checkSensorStatusChanges(sensors) is called
3. Service compares current status with previous status
4. If changed AND not "notAvailable", creates notification
5. Notification saved to Firestore → triggers real-time update
6. Browser notification shown if permission granted
7. Notification appears on Notifications page
```

### Crop Management Flow:
```
1. User adds/deletes crop
2. Firestore operation completes successfully
3. notificationService.notifyCropAdded/Deleted() called
4. Notification created with success/info severity
5. Real-time update to Notifications page
```

### Harvest Cycle Flow:
```
1. User saves harvest cycle data
2. Data written to Firestore harvest_cycles collection
3. notificationService.notifyHarvestCycleSaved() called
4. Notification shows cycle ID and crop name
5. Appears immediately on Notifications page
```

---

## 🎯 Usage Examples

### For Developers:

#### **1. Adding a Custom Notification**
```typescript
import { notificationService } from '../services/notificationService';

// Add custom notification
await notificationService.addNotification({
  type: 'system_alert',
  severity: 'warning',
  title: '🚨 System Alert',
  message: 'Database backup completed successfully',
  metadata: {
    backupSize: '250MB',
    duration: '45s'
  }
});
```

#### **2. Subscribing to Notifications**
```typescript
import { notificationService } from '../services/notificationService';

// Subscribe to real-time notifications
const unsubscribe = notificationService.subscribeToNotifications(
  (notifications) => {
    console.log('New notifications:', notifications);
    setNotifications(notifications);
  },
  50 // Limit to 50 most recent
);

// Cleanup on unmount
return () => unsubscribe();
```

#### **3. Mark Notification as Read**
```typescript
await notificationService.markAsRead('notification_id_123');
```

#### **4. Mark All as Read**
```typescript
await notificationService.markAllAsRead();
```

---

## 📊 Firestore Schema

### **notifications Collection:**
```typescript
{
  id: "auto-generated",
  type: "sensor_status_change" | "crop_added" | "crop_deleted" | "harvest_cycle_saved" | ...,
  severity: "success" | "info" | "warning" | "error",
  title: "⚠️ Soil Moisture Alert",
  message: "Status changed from 'Optimal' to 'Dry - Needs Irrigation'",
  metadata: {
    sensorType: "Soil Moisture",
    oldStatus: "optimalMoisture",
    newStatus: "dryNeedsIrrigation",
    sensorValue: 13017,
    cropId: "crop_1762085977354"
  },
  createdAt: Timestamp,
  read: false,
  userId: "optional_user_id"
}
```

---

## 🔐 Security Considerations

### **Browser Notification Permissions:**
- Requests permission on first app load
- Gracefully handles permission denial
- Only shows browser notifications if permission granted
- In-app notifications always work regardless of permission

### **Firestore Rules (Recommended):**
```javascript
// Add to firestore.rules
match /notifications/{notificationId} {
  // Allow authenticated users to read their own notifications
  allow read: if request.auth != null;
  
  // Allow system to create notifications
  allow create: if request.auth != null;
  
  // Allow users to mark notifications as read
  allow update: if request.auth != null 
                && request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['read']);
  
  // Prevent deletion by users (admin only)
  allow delete: if false;
}
```

---

## 🎨 Notification Types Reference

| Type | Icon | Severity | Use Case |
|------|------|----------|----------|
| `sensor_status_change` | ⚠️ | Dynamic | Sensor status changes |
| `crop_added` | ✅ | success | New crop profile created |
| `crop_deleted` | 🗑️ | info | Crop profile removed |
| `crop_updated` | 📝 | info | Crop profile modified |
| `harvest_cycle_saved` | 🌾 | success | New harvest cycle recorded |
| `harvest_cycle_updated` | 📊 | info | Harvest data modified |
| `harvest_cycle_deleted` | ⚠️ | warning | Harvest cycle removed |
| `system_alert` | 🚨 | varies | System-level notifications |

---

## 🧪 Testing the System

### **1. Test Sensor Notifications:**
```bash
# Make sure sensor_simulator.py is running
cd raspberry_module
python sensor_simulator.py

# Wait for sensor readings to change status
# Example: Soil moisture goes from "Optimal" to "Dry"
# Check Notifications page for alert
```

### **2. Test Crop Notifications:**
1. Go to Crop Management page
2. Click "Add New Crop"
3. Enter crop name (e.g., "Test Tomato")
4. Fetch suggestions and save
5. Check Notifications page - should see "✅ New Crop Added"
6. Delete the crop
7. Check Notifications page - should see "🗑️ Crop Deleted"

### **3. Test Harvest Cycle Notifications:**
1. Go to Crop Management page
2. Click "Record Harvest Cycle" on any crop
3. Fill in planting date and other fields
4. Save the harvest cycle
5. Check Notifications page - should see "🌾 Harvest Cycle Saved"

### **4. Test Browser Notifications:**
1. Ensure browser notification permission is granted
2. Open the app in one tab
3. Minimize or switch to another tab
4. Wait for sensor status to change (or trigger manually)
5. Should see native OS notification appear

---

## 🐛 Troubleshooting

### **Issue: No notifications appearing**
**Solution:**
- Check browser console for errors
- Verify sensor_simulator.py is running
- Check Firestore rules allow read/write to `notifications` collection
- Verify Firebase config in `src/config/firebase.ts`

### **Issue: Browser notifications not showing**
**Solution:**
- Check browser notification permission (Settings → Site Settings → Notifications)
- Try granting permission again:
  ```typescript
  await Notification.requestPermission();
  ```
- Some browsers block notifications in incognito mode

### **Issue: Too many duplicate notifications**
**Solution:**
- The system prevents duplicate sensor notifications by tracking previous states
- If seeing duplicates, check `notificationService.initializeSensorStates()` is called on app load

### **Issue: Notifications not real-time**
**Solution:**
- Verify internet connection
- Check Firestore onSnapshot subscription is active
- Check browser console for subscription errors

---

## 🔄 Future Enhancements

### **Planned Features:**
- [ ] **User-specific notifications** (multi-user support)
- [ ] **Notification preferences** (enable/disable specific types)
- [ ] **Email notifications** (via Cloud Functions)
- [ ] **SMS notifications** (via Twilio integration)
- [ ] **Notification history** (archive old notifications)
- [ ] **Custom notification sounds**
- [ ] **Notification action buttons** ("View Details", "Dismiss", "Snooze")
- [ ] **Batch notifications** (group similar notifications)
- [ ] **Notification scheduling** (send at specific times)
- [ ] **AI-powered smart notifications** (predict critical events)

---

## 📝 Code Examples

### **Example: Custom Sensor Alert**
```typescript
// In DashboardPage.tsx or any component
import { notificationService } from '../services/notificationService';

// Custom alert for extreme temperature
if (tempValue > 40) {
  await notificationService.addNotification({
    type: 'warning',
    severity: 'error',
    title: '🔥 Extreme Heat Warning',
    message: `Temperature reached ${tempValue}°C! Immediate action required.`,
    metadata: {
      sensorType: 'Temperature',
      value: tempValue,
      threshold: 40,
      timestamp: new Date().toISOString()
    }
  });
}
```

### **Example: Irrigation Reminder**
```typescript
// Check soil moisture and send reminder
if (soilMoistureRaw > 20000) { // Very dry
  await notificationService.addNotification({
    type: 'warning',
    severity: 'warning',
    title: '💧 Irrigation Reminder',
    message: 'Soil moisture is critically low. Schedule irrigation immediately.',
    metadata: {
      sensorType: 'Soil Moisture',
      value: soilMoistureRaw,
      recommendation: 'Water crops within 2 hours'
    }
  });
}
```

---

## 📚 API Reference

### **notificationService Methods:**

#### `initializeBrowserNotifications(): Promise<void>`
Requests browser notification permission.

#### `addNotification(data: NotificationData): Promise<string | null>`
Creates new notification in Firestore.

#### `getNotifications(limitCount?: number): Promise<NotificationMessage[]>`
Fetches notifications from Firestore.

#### `subscribeToNotifications(callback, limitCount?): () => void`
Subscribes to real-time notifications. Returns unsubscribe function.

#### `markAsRead(notificationId: string): Promise<boolean>`
Marks single notification as read.

#### `markAllAsRead(): Promise<boolean>`
Marks all notifications as read.

#### `checkSensorStatusChanges(sensors: Sensor[]): Promise<void>`
Checks for sensor status changes and creates notifications.

#### `notifyCropAdded(cropName, cropId): Promise<void>`
Creates notification for crop addition.

#### `notifyCropDeleted(cropName, cropId): Promise<void>`
Creates notification for crop deletion.

#### `notifyHarvestCycleSaved(cycleId, cropName): Promise<void>`
Creates notification for harvest cycle save.

---

## 🎉 Success Indicators

### **System is working correctly when:**
✅ Notifications appear on Notifications page within seconds of events
✅ Browser notifications show when app is in background
✅ "Mark all as read" button works instantly
✅ No duplicate sensor notifications for same status
✅ Notification count badge updates in real-time (if implemented)
✅ Console shows "✅ Notification added to Firestore" messages
✅ Sensor status changes trigger appropriate severity notifications

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Verify Firestore rules and Firebase configuration
3. Ensure sensor_simulator.py is running correctly
4. Check notification permission settings in browser

---

**Last Updated**: November 3, 2025
**Version**: 1.0.0
**Status**: ✅ Fully Implemented and Tested
