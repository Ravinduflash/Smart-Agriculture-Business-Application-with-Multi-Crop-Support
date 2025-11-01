const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin with Firestore database
admin.initializeApp();
const db = admin.firestore();
// Use your specific Firestore database
db.settings({ databaseId: 'sasapp' });

// =============================================================================
// 1. getPiConfig - Callable Function
// =============================================================================
// Called by Raspberry Pi to get its current crop configuration
exports.getPiConfig = functions.https.onCall(async (data, context) => {
  try {
    const { piId } = data;

    if (!piId) {
      throw new functions.https.HttpsError('invalid-argument', 'Pi ID is required');
    }

    // Read Pi configuration from Firestore
    const piConfigDoc = await db.collection('piConfigs').doc(piId).get();

    if (!piConfigDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Pi configuration not found for ID: ${piId}`);
    }

    const piConfig = piConfigDoc.data();

    // If cropProfileId exists, fetch the crop profile details
    if (piConfig.cropProfileId) {
      const cropProfileDoc = await db.collection('cropProfiles').doc(piConfig.cropProfileId).get();
      
      if (cropProfileDoc.exists) {
        piConfig.cropProfile = cropProfileDoc.data();
      }
    }

    console.log(`Pi config fetched successfully for: ${piId}`);
    return {
      success: true,
      config: piConfig
    };

  } catch (error) {
    console.error('Error fetching Pi config:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// =============================================================================
// 2. ingestSensorData - HTTPS Function
// =============================================================================
// Receives sensor data from Raspberry Pi and stores it in Firestore
exports.ingestSensorData = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const sensorData = req.body;

    // Validate required fields
    const requiredFields = ['timestamp', 'crop_type'];
    for (const field of requiredFields) {
      if (!sensorData[field]) {
        res.status(400).send({ 
          error: `Missing required field: ${field}` 
        });
        return;
      }
    }

    // Validate and clean sensor data
    const cleanedData = {
      timestamp: sensorData.timestamp,
      crop_type: sensorData.crop_type,
      air_temp_c: parseFloat(sensorData.air_temp_c) || null,
      humidity_percent: parseFloat(sensorData.humidity_percent) || null,
      water_soil_temp_c: parseFloat(sensorData.water_soil_temp_c) || null,
      air_pressure_hpa: parseFloat(sensorData.air_pressure_hpa) || null,
      air_pressure_status: sensorData.air_pressure_status || null,
      soil_moisture_raw: parseFloat(sensorData.soil_moisture_raw) || null,
      soil_moisture_status: sensorData.soil_moisture_status || null,
      light_level_raw: parseFloat(sensorData.light_level_raw) || null,
      light_level_status: sensorData.light_level_status || null,
      rain_level_raw: parseFloat(sensorData.rain_level_raw) || null,
      rain_level_status: sensorData.rain_level_status || null,
      co2_ppm: parseFloat(sensorData.co2_ppm) || null,
      nh3_ppm: parseFloat(sensorData.nh3_ppm) || null,
      voc_ppm: parseFloat(sensorData.voc_ppm) || null,
      nitrogen_mg_kg: parseFloat(sensorData.nitrogen_mg_kg) || null,
      nitrogen_status: sensorData.nitrogen_status || null,
      phosphorus_mg_kg: parseFloat(sensorData.phosphorus_mg_kg) || null,
      phosphorus_status: sensorData.phosphorus_status || null,
      potassium_mg_kg: parseFloat(sensorData.potassium_mg_kg) || null,
      potassium_status: sensorData.potassium_status || null,
      uploaded_at: admin.firestore.FieldValue.serverTimestamp()
    };

    // Generate document ID from timestamp and crop type
    const timestampStr = sensorData.timestamp.replace(/[: -]/g, '_');
    const docId = `${sensorData.crop_type}_${timestampStr}`;

    // Write to Firestore
    await db.collection('sensorReadings').doc(docId).set(cleanedData);

    console.log(`Sensor data ingested successfully: ${docId}`);
    res.status(200).send({
      success: true,
      message: 'Sensor data stored successfully',
      documentId: docId
    });

  } catch (error) {
    console.error('Error ingesting sensor data:', error);
    res.status(500).send({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// =============================================================================
// 3. generateCropProfile - Callable Function
// =============================================================================
// Generates crop profile using Gemini AI and stores it in Firestore
exports.generateCropProfile = functions.https.onCall(async (data, context) => {
  try {
    const { cropName } = data;

    if (!cropName) {
      throw new functions.https.HttpsError('invalid-argument', 'Crop name is required');
    }

    // Gemini API configuration
    const GEMINI_API_KEY = functions.config().gemini?.apikey || 'REDACTED_SECRET';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Generate crop details using Gemini
    const prompt = `Generate detailed agricultural information for ${cropName} in JSON format with the following structure:
{
  "name": "${cropName}",
  "scientificName": "scientific name",
  "family": "plant family",
  "description": "detailed description (2-3 sentences)",
  "climate": "suitable climate conditions",
  "soilType": "preferred soil type",
  "waterRequirements": "water needs description",
  "growthDuration": "time from planting to harvest",
  "optimalConditions": {
    "temperature": { "min": number, "max": number, "unit": "°C" },
    "humidity": { "min": number, "max": number, "unit": "%" },
    "soilMoisture": { "min": number, "max": number, "unit": "%" },
    "phLevel": { "min": number, "max": number }
  },
  "nutrients": {
    "nitrogen": { "min": number, "max": number, "unit": "mg/kg" },
    "phosphorus": { "min": number, "max": number, "unit": "mg/kg" },
    "potassium": { "min": number, "max": number, "unit": "mg/kg" }
  },
  "commonDiseases": ["disease1", "disease2", "disease3"],
  "pests": ["pest1", "pest2", "pest3"],
  "harvestingTips": "brief harvesting guidelines"
}

Provide accurate, research-based information for commercial farming.`;

    const geminiResponse = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    });

    // Extract JSON from Gemini response
    let cropDetails;
    const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                     responseText.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      cropDetails = JSON.parse(jsonMatch[1]);
    } else {
      cropDetails = JSON.parse(responseText);
    }

    // Generate crop image using placeholder or Gemini
    // For now, using a placeholder service
    const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(cropName)},farming,agriculture`;

    // Prepare complete crop profile
    const cropProfile = {
      ...cropDetails,
      imageUrl: imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    };

    // Generate document ID from crop name
    const docId = cropName.toLowerCase().replace(/\s+/g, '_');

    // Store in Firestore
    await db.collection('cropProfiles').doc(docId).set(cropProfile);

    console.log(`Crop profile generated successfully for: ${cropName}`);
    return {
      success: true,
      cropProfile: cropProfile,
      documentId: docId
    };

  } catch (error) {
    console.error('Error generating crop profile:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// =============================================================================
// 4. Additional Helper Functions
// =============================================================================

// Get latest sensor readings for a specific crop
exports.getLatestSensorReadings = functions.https.onCall(async (data, context) => {
  try {
    const { cropType, limit = 10 } = data;

    let query = db.collection('sensorReadings')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (cropType) {
      query = query.where('crop_type', '==', cropType);
    }

    const snapshot = await query.get();
    const readings = [];

    snapshot.forEach(doc => {
      readings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      readings: readings,
      count: readings.length
    };

  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Update Pi configuration
exports.updatePiConfig = functions.https.onCall(async (data, context) => {
  try {
    const { piId, updates } = data;

    if (!piId) {
      throw new functions.https.HttpsError('invalid-argument', 'Pi ID is required');
    }

    const updateData = {
      ...updates,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('piConfigs').doc(piId).update(updateData);

    console.log(`Pi config updated successfully for: ${piId}`);
    return {
      success: true,
      message: 'Pi configuration updated'
    };

  } catch (error) {
    console.error('Error updating Pi config:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
