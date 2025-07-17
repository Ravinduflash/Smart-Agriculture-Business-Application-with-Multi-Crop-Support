// Example: Adding Custom Knowledge Items for Your Specific Farm
// Copy this code to services/appKnowledgeBase.ts to add more specific knowledge

// Add these items to the APP_KNOWLEDGE_BASE array:

// FARM-SPECIFIC FEATURES
{
  id: 'farm-001',
  category: 'crop-management',
  question: 'How do I set up crop rotation schedules?',
  answer: 'To set up crop rotation:\n1. Go to Crop Management\n2. Click "Rotation Planner"\n3. Select your field zones\n4. Choose crop sequence (e.g., corn → soybeans → wheat)\n5. Set rotation cycle duration\n6. Configure seasonal timings\n7. Save rotation plan\n\nThe system will automatically suggest optimal rotation based on soil health and nutrient requirements.',
  keywords: ['crop rotation', 'rotation planner', 'seasonal planning', 'soil health'],
  relatedTopics: ['soil-management', 'harvest-planning', 'nutrient-management'],
  difficulty: 'intermediate'
},

{
  id: 'farm-002',
  category: 'sensors',
  question: 'How do I interpret NPK sensor readings?',
  answer: 'NPK sensors measure soil nutrients:\n\n**Nitrogen (N)**: 0-50 ppm\n• Low (0-20): Crops may show yellowing\n• Optimal (20-40): Healthy green growth\n• High (40-50): Risk of excessive vegetation\n\n**Phosphorus (P)**: 0-30 ppm\n• Low (0-10): Poor root development\n• Optimal (10-25): Strong root system\n• High (25-30): May inhibit micronutrient uptake\n\n**Potassium (K)**: 0-40 ppm\n• Low (0-15): Weak stems, disease susceptibility\n• Optimal (15-35): Good disease resistance\n• High (35-40): May affect calcium uptake\n\nCheck readings weekly and adjust fertilization accordingly.',
  keywords: ['NPK', 'soil nutrients', 'nitrogen', 'phosphorus', 'potassium', 'fertilizer'],
  relatedTopics: ['soil-analysis', 'fertilization', 'crop-nutrition'],
  difficulty: 'advanced'
},

{
  id: 'farm-003',
  category: 'analytics',
  question: 'How do I analyze yield predictions accuracy?',
  answer: 'Analyze yield prediction accuracy:\n1. Go to Analytics & Reports\n2. Select "Yield Analysis"\n3. Compare predicted vs actual yields:\n   • Green bars: Predictions within 5% of actual\n   • Yellow bars: Predictions within 10% of actual\n   • Red bars: Predictions more than 10% off\n4. View accuracy metrics:\n   • MAPE (Mean Absolute Percentage Error)\n   • R² correlation coefficient\n   • Confidence intervals\n5. Identify factors affecting accuracy:\n   • Weather variations\n   • Pest/disease incidents\n   • Irrigation changes\n\nUse this data to improve future predictions and planning.',
  keywords: ['yield prediction', 'accuracy analysis', 'prediction validation', 'forecasting'],
  relatedTopics: ['machine-learning', 'harvest-planning', 'data-analysis'],
  difficulty: 'advanced'
},

// WORKFLOW-SPECIFIC QUESTIONS
{
  id: 'workflow-001',
  category: 'crop-management',
  question: 'What is the complete workflow for adding a new crop season?',
  answer: 'Complete new crop season workflow:\n\n**Phase 1: Planning**\n1. Go to Crop Management → "New Season"\n2. Select crop type and variety\n3. Choose field location and size\n4. Set planting and harvest dates\n5. Configure irrigation schedule\n\n**Phase 2: Preparation**\n6. Check soil conditions (NPK levels)\n7. Set up sensors for the field\n8. Configure automated alerts\n9. Plan fertilization schedule\n\n**Phase 3: Monitoring**\n10. Track daily sensor readings\n11. Monitor growth stages\n12. Adjust irrigation based on weather\n13. Watch for pest/disease alerts\n\n**Phase 4: Harvest**\n14. Monitor harvest readiness indicators\n15. Schedule harvest operations\n16. Record actual yields\n17. Analyze season performance\n\nThis workflow ensures optimal crop management from planning to harvest.',
  keywords: ['new season', 'crop workflow', 'seasonal planning', 'complete process'],
  relatedTopics: ['planning', 'monitoring', 'harvest-management'],
  difficulty: 'intermediate'
},

{
  id: 'workflow-002',
  category: 'troubleshooting',
  question: 'My crop is showing yellow leaves, what should I check?',
  answer: 'Yellow leaves troubleshooting checklist:\n\n**Immediate Checks:**\n1. Check soil moisture levels (sensors)\n2. Review recent weather conditions\n3. Examine NPK readings, especially nitrogen\n4. Look for pest activity signs\n\n**Possible Causes & Solutions:**\n\n**Nitrogen Deficiency** (most common):\n• Symptoms: Yellowing from bottom leaves up\n• Solution: Apply nitrogen fertilizer\n• Prevention: Monitor NPK sensors regularly\n\n**Overwatering:**\n• Symptoms: Yellow leaves + soft stems\n• Solution: Reduce irrigation frequency\n• Check: Soil moisture sensors\n\n**Underwatering:**\n• Symptoms: Yellow + wilted leaves\n• Solution: Increase irrigation\n• Check: Soil moisture below 30%\n\n**Disease:**\n• Symptoms: Yellow spots or patterns\n• Solution: Use AI disease detection feature\n• Action: Apply appropriate treatment\n\n**Natural Aging:**\n• Symptoms: Lower leaves yellowing late in season\n• Solution: Normal process, no action needed\n\nUse the ML Models → Disease Detection for accurate diagnosis.',
  keywords: ['yellow leaves', 'plant problems', 'diagnosis', 'troubleshooting', 'plant health'],
  relatedTopics: ['disease-detection', 'plant-nutrition', 'irrigation-management'],
  difficulty: 'intermediate'
},

// INTEGRATION QUESTIONS
{
  id: 'integration-001',
  category: 'advanced',
  question: 'How do I integrate weather data with irrigation scheduling?',
  answer: 'Weather-based irrigation integration:\n\n**Setup:**\n1. Go to Settings → "Weather Integration"\n2. Enable weather data sync\n3. Set your farm\'s precise location\n4. Configure weather thresholds\n\n**Automation Rules:**\n5. Go to IoT Sensors → "Automation"\n6. Create rule: "Skip irrigation if rain >5mm expected"\n7. Set rule: "Increase irrigation if temperature >30°C"\n8. Configure: "Reduce irrigation if humidity >80%"\n\n**Smart Scheduling:**\n9. Enable "Smart Irrigation Mode"\n10. Set base irrigation schedule\n11. Allow weather adjustments (±50% of base)\n12. Set minimum/maximum irrigation limits\n\n**Monitoring:**\n13. Check "Weather Impact" dashboard\n14. Review irrigation efficiency reports\n15. Monitor water usage vs weather correlation\n\n**Benefits:**\n• 20-30% water savings\n• Optimal soil moisture\n• Reduced plant stress\n• Lower operational costs\n\nThe system will automatically adjust irrigation based on real-time weather conditions.',
  keywords: ['weather integration', 'smart irrigation', 'automated scheduling', 'weather-based'],
  relatedTopics: ['automation', 'irrigation-optimization', 'water-management'],
  difficulty: 'advanced'
},

// MOBILE-SPECIFIC QUESTIONS
{
  id: 'mobile-001',
  category: 'mobile',
  question: 'How do I quickly check sensor alerts on mobile?',
  answer: 'Quick mobile sensor alerts:\n\n**Home Screen Widget:**\n1. Add app to home screen\n2. Enable notifications in browser\n3. Critical alerts appear instantly\n\n**Fast Dashboard Access:**\n4. Open app → Dashboard loads automatically\n5. Sensor cards show color-coded status:\n   • Green: Normal readings\n   • Yellow: Attention needed\n   • Red: Critical alerts\n\n**Quick Actions:**\n6. Tap any sensor card for details\n7. Use "Quick View" for graphs\n8. Swipe between sensor types\n\n**Notification Management:**\n9. Tap notification to jump to issue\n10. Use "Snooze" for non-critical alerts\n11. Set "Quiet Hours" for nighttime\n\n**Offline Mode:**\n12. Recent data cached for offline viewing\n13. Sync automatically when connected\n14. Offline mode indicator in header\n\n**Pro Tips:**\n• Use landscape mode for better charts\n• Enable location services for weather\n• Set up emergency contacts for critical alerts\n• Use voice commands for hands-free operation',
  keywords: ['mobile alerts', 'quick check', 'smartphone', 'notifications', 'mobile dashboard'],
  relatedTopics: ['notifications', 'mobile-interface', 'quick-access'],
  difficulty: 'beginner'
}

// PERFORMANCE OPTIMIZATION
{
  id: 'performance-001',
  category: 'troubleshooting',
  question: 'How do I optimize app performance for large farms?',
  answer: 'Large farm optimization tips:\n\n**Data Management:**\n1. Go to Settings → "Data Management"\n2. Set data retention periods:\n   • Raw sensor data: 30 days\n   • Hourly averages: 1 year\n   • Daily summaries: 5 years\n3. Enable automatic data archiving\n\n**Sensor Configuration:**\n4. Adjust reading frequencies:\n   • Critical sensors: Every 10 minutes\n   • Monitoring sensors: Every 30 minutes\n   • Reference sensors: Every hour\n5. Group sensors by zones for efficiency\n\n**Dashboard Optimization:**\n6. Customize dashboard to show priority data\n7. Use "Zones View" instead of individual sensors\n8. Enable "Lite Mode" for slower connections\n\n**Network Optimization:**\n9. Use WiFi instead of cellular when possible\n10. Enable data compression in settings\n11. Schedule heavy operations during off-peak hours\n\n**Browser Settings:**\n12. Clear cache monthly\n13. Enable hardware acceleration\n14. Use Chrome or Firefox for best performance\n15. Close unused tabs\n\n**Performance Monitoring:**\n16. Check system health in Settings\n17. Review load times in Analytics\n18. Monitor data transfer usage\n\nExpected performance: <3 seconds page load, <1 second sensor updates.',
  keywords: ['performance optimization', 'large farm', 'slow loading', 'system performance'],
  relatedTopics: ['system-optimization', 'data-management', 'network-settings'],
  difficulty: 'advanced'
}

// Add these examples to your knowledge base using the Training Manager
// or by directly editing the appKnowledgeBase.ts file
