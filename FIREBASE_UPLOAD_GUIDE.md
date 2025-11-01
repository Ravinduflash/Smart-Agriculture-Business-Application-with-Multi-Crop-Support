# Firebase CSV Upload Guide for Amaranthus Dataset

## 📋 Overview
This guide helps you upload your Amaranthus CSV dataset to Firebase Realtime Database without changing any existing project code.

---

## 🚀 Quick Start

### Step 1: Install Required Dependencies
```bash
pip install firebase-admin pandas
```

### Step 2: Get Firebase Credentials

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project** (or create a new one)
3. **Go to Project Settings** (⚙️ icon)
4. **Navigate to "Service Accounts" tab**
5. **Click "Generate New Private Key"**
6. **Save the JSON file as `serviceAccountKey.json`**
7. **Find your Database URL** in the Realtime Database section
   - Format: `https://your-project-id.firebaseio.com`

### Step 3: Update Configuration

Open `firebase_csv_uploader.py` and update these lines:

```python
CREDENTIALS_PATH = 'path/to/serviceAccountKey.json'  # Update this
DATABASE_URL = 'https://your-project-id.firebaseio.com'  # Update this
CSV_FILE = 'amaranthus dataset 1 from 6-19 to 7-22.csv'  # Update if needed
```

### Step 4: Run the Upload Script

```bash
python firebase_csv_uploader.py
```

---

## 📊 Firebase Database Structure

After upload, your data will be organized like this:

```
crops/
└── amaranthus/
    ├── metadata/
    │   ├── crop_name: "Amaranthus"
    │   ├── date_range: "6-19 to 7-22"
    │   ├── upload_timestamp: "2025-10-29T10:23:30"
    │   ├── total_records: 150
    │   ├── columns: ["date", "temperature", "humidity", ...]
    │   └── data_types: {...}
    └── sensor_data/
        ├── 0: {date: "...", temperature: 25.5, ...}
        ├── 1: {date: "...", temperature: 26.2, ...}
        └── ...
```

---

## 🔧 Usage Options

### Option 1: Simple Upload (Small Files)
**Best for:** < 1000 records

```python
uploader = AmaranthusDataUploader(CREDENTIALS_PATH, DATABASE_URL)
uploader.upload_csv_to_realtime_db(CSV_FILE)
```

### Option 2: Batch Upload (Large Files)
**Best for:** > 1000 records or large datasets

```python
uploader = AmaranthusDataUploader(CREDENTIALS_PATH, DATABASE_URL)
uploader.upload_with_batch_processing(CSV_FILE, batch_size=100)
```

---

## ✅ Verify Upload

Use this code to verify data was uploaded correctly:

```python
from firebase_admin import db

ref = db.reference('crops/amaranthus')
data = ref.get()

# Check metadata
print(data['metadata'])

# Check first few records
print(data['sensor_data'][:5])
```

---

## 🔒 Security Best Practices

### 1. Protect Your Credentials
Add to `.gitignore`:
```gitignore
# Firebase credentials
serviceAccountKey.json
*-firebase-adminsdk-*.json
```

### 2. Set Up Firebase Security Rules
In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "crops": {
      "amaranthus": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### 3. Environment Variables (Recommended)
Instead of hardcoding paths, use environment variables:

```python
import os
from dotenv import load_dotenv

load_dotenv()

CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH')
DATABASE_URL = os.getenv('FIREBASE_DATABASE_URL')
```

Create `.env` file:
```env
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

---

## 💰 Cost Considerations

### Firebase Realtime Database Free Tier:
- **Storage:** 1 GB
- **Downloads:** 10 GB/month
- **Simultaneous Connections:** 100

### Pricing After Free Tier:
- **Storage:** $5/GB/month
- **Downloads:** $1/GB

**💡 Tip:** For very large datasets (> 100MB), consider using Firebase Cloud Storage instead.

---

## 🐛 Troubleshooting

### Error: "Permission Denied"
**Solution:** Check your Firebase Security Rules and ensure the service account has proper permissions.

### Error: "File Not Found"
**Solution:** Verify the CSV file path and ensure it exists in the correct location.

### Error: "Firebase Already Initialized"
**Solution:** Restart your Python script. Firebase can only be initialized once per session.

### Error: "Connection Timeout"
**Solution:** Check your internet connection and Firebase Database URL.

---

## 📝 Example CSV Format

Ensure your CSV follows this structure:

```csv
date,temperature,humidity,soil_moisture,light_intensity,co2_level
2025-06-19,25.5,65.2,450,8500,420
2025-06-20,26.1,63.8,440,8700,415
...
```

---

## 🔄 Updating Existing Data

To update existing data instead of replacing:

```python
ref = db.reference('crops/amaranthus/sensor_data')
ref.update({
    'additional_field': 'new_value'
})
```

---

## 📚 Additional Resources

- [Firebase Admin Python SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firebase Realtime Database Guide](https://firebase.google.com/docs/database)
- [Pandas Documentation](https://pandas.pydata.org/docs/)

---

## 📞 Support

For issues related to:
- **Firebase:** Check Firebase Console logs
- **Python Script:** Check terminal error messages
- **CSV Format:** Verify column names and data types

---

## ⚠️ Important Notes

1. **Backup your CSV** before uploading
2. **Test with a small dataset** first
3. **Monitor Firebase usage** in the console
4. **Keep credentials secure** - never commit to Git
5. **Set up proper security rules** before production use

---

**Created by:** Smart Agriculture System Team  
**Date:** October 29, 2025  
**Version:** 1.0
