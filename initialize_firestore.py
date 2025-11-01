"""
Initialize Firestore Collections
Run this once to set up your database structure

Usage:
    python initialize_firestore.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase
cred = credentials.Certificate(r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\Credientals\gen-lang-client-0092156800-3f84a3882b65.json')
firebase_admin.initialize_app(cred)

db = firestore.client(database_id='sasapp')

print("=" * 70)
print("Firestore Database Initialization")
print("=" * 70)
print()

# 1. Create Crop Profiles
print("1. Creating cropProfiles collection...")
crop_profiles = [
    {
        'cropId': 'amaranthus',
        'name': 'Amaranthus',
        'imageUrl': 'https://storage.googleapis.com/smart-agri-images/amaranthus.jpg',
        'description': 'Amaranthus is a versatile and nutritious leafy green vegetable that thrives in warm climates. Rich in vitamins A, C, and iron.',
        'optimalConditions': {
            'waterNeeds': 'Moderate - Regular watering but avoid waterlogging',
            'optimalPh': '6.0 - 7.0',
            'sunlight': 'Full Sun (6-8 hours daily)',
            'temperature': '20-30°C optimal growing temperature',
            'additionalTips': 'Resistant to heat and drought. Grows quickly, ready to harvest in 3-4 weeks. Prefers well-drained soil with organic matter.'
        },
        'createdAt': firestore.SERVER_TIMESTAMP,
        'lastUpdated': firestore.SERVER_TIMESTAMP
    },
    {
        'cropId': 'kangkong',
        'name': 'Kangkong (Water Spinach)',
        'imageUrl': 'https://storage.googleapis.com/smart-agri-images/kangkong.jpg',
        'description': 'Kangkong, also known as water spinach, is a semi-aquatic tropical plant grown for its tender shoots and leaves.',
        'optimalConditions': {
            'waterNeeds': 'High - Requires consistent moisture or shallow water',
            'optimalPh': '5.5 - 7.0',
            'sunlight': 'Full Sun to Partial Shade',
            'temperature': '25-30°C optimal, can tolerate up to 35°C',
            'additionalTips': 'Grows well in wetlands or hydroponic systems. Fast-growing, harvest in 4-6 weeks. Regular harvesting promotes bushier growth.'
        },
        'createdAt': firestore.SERVER_TIMESTAMP,
        'lastUpdated': firestore.SERVER_TIMESTAMP
    }
]

for crop in crop_profiles:
    db.collection('cropProfiles').document(crop['cropId']).set(crop)
    print(f"   ✓ Created crop profile: {crop['name']}")

print()

# 2. Create Pi Configuration
print("2. Creating piConfigs collection...")
pi_config = {
    'piId': 'pi_unit_001',
    'activeCropProfileId': 'amaranthus',
    'status': 'offline',
    'lastUpdated': firestore.SERVER_TIMESTAMP
}
db.collection('piConfigs').document('pi_unit_001').set(pi_config)
print("   ✓ Created Pi configuration: pi_unit_001")
print()

# 3. Create Chatbot Knowledge Base
print("3. Creating chatbotKnowledgeBase collection...")
knowledge_entries = [
    {
        'topic': 'General',
        'question': 'What is this Smart Agriculture System?',
        'answer': 'This is an IoT-based Smart Agriculture System that monitors environmental conditions like temperature, humidity, soil moisture, and NPK levels to help farmers make data-driven decisions for optimal crop growth.',
        'language': 'en',
        'tags': ['general', 'info', 'introduction'],
        'lastUpdated': firestore.SERVER_TIMESTAMP
    },
    {
        'topic': 'Soil Moisture',
        'question': 'What does a soil moisture reading of 400 mean?',
        'answer': 'A soil moisture raw value of 400 indicates that the soil is becoming dry and may need irrigation soon. Optimal levels are typically between 500-700 for most crops.',
        'language': 'en',
        'tags': ['soil', 'moisture', 'irrigation', 'sensors'],
        'lastUpdated': firestore.SERVER_TIMESTAMP
    },
    {
        'topic': 'NPK Levels',
        'question': 'What are NPK levels and why are they important?',
        'answer': 'NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K) - the three essential nutrients for plant growth. Nitrogen promotes leaf growth, Phosphorus supports root and flower development, and Potassium helps overall plant health and disease resistance.',
        'language': 'en',
        'tags': ['npk', 'nutrients', 'fertilizer', 'soil health'],
        'lastUpdated': firestore.SERVER_TIMESTAMP
    },
    {
        'topic': 'Temperature',
        'question': 'What is the ideal temperature for growing vegetables?',
        'answer': 'Most tropical vegetables grow best in temperatures between 20-30°C. Temperatures below 15°C or above 35°C can stress plants and reduce growth. Monitor your dashboard for temperature alerts.',
        'language': 'en',
        'tags': ['temperature', 'climate', 'growing conditions'],
        'lastUpdated': firestore.SERVER_TIMESTAMP
    },
    {
        'topic': 'Crop Selection',
        'question': 'How do I choose which crop to grow?',
        'answer': 'Select crops based on: 1) Your local climate and season, 2) Soil type and quality, 3) Water availability, 4) Market demand, and 5) Your experience level. Use our ML-based crop recommendation feature for personalized suggestions.',
        'language': 'en',
        'tags': ['crop selection', 'recommendation', 'planning'],
        'lastUpdated': firestore.SERVER_TIMESTAMP
    }
]

for entry in knowledge_entries:
    db.collection('chatbotKnowledgeBase').add(entry)
    print(f"   ✓ Added knowledge: {entry['question'][:50]}...")

print()

# 4. Initialize collections (empty, will be populated by app)
print("4. Initializing empty collections...")
print("   ✓ users (will be created on first user registration)")
print("   ✓ sensorReadings (will be populated by Raspberry Pi)")
print("   ✓ mlPredictions (will be created by ML models)")
print()

print("=" * 70)
print("✅ Firestore Initialization Complete!")
print("=" * 70)
print()
print("Next steps:")
print("1. Update Firebase config in React app (src/config/firebase.ts)")
print("2. Set up Firebase Security Rules in Firebase Console")
print("3. Start Raspberry Pi data collection script")
print("4. Launch React app: npm run dev")
print()
print("For detailed instructions, see QUICK_START_FIRESTORE.md")
