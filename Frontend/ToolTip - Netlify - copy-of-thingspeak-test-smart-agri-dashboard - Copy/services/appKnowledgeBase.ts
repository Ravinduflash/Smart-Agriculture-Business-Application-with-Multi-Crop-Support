// Smart Agriculture App Knowledge Base
// This contains all the specific information about your app's features, navigation, and functionality

export interface KnowledgeItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedTopics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const APP_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // NAVIGATION & BASIC USAGE
  {
    id: 'nav-001',
    category: 'navigation',
    question: 'How do I navigate through the app?',
    answer: 'Use the sidebar menu on the left to navigate between different sections:\n• Dashboard - Overview of your farm data\n• Crop Management - Manage your crops\n• IoT Sensors - Monitor sensor readings\n• Analytics & Reports - View detailed analytics\n• ML Models - Access machine learning features\n• Notifications - Check alerts and updates\n• Settings - Configure app preferences\n\nClick any menu item to instantly switch between sections.',
    keywords: ['navigation', 'menu', 'sidebar', 'sections', 'navigate'],
    relatedTopics: ['dashboard', 'crop-management', 'sensors'],
    difficulty: 'beginner'
  },
  
  // CROP MANAGEMENT
  {
    id: 'crop-001',
    category: 'crop-management',
    question: 'How do I add a new crop to the system?',
    answer: 'To add a new crop:\n1. Go to "Crop Management" from the sidebar menu\n2. Click the "Add New Crop" button\n3. Fill in the crop details:\n   • Crop name and type\n   • Planting date\n   • Expected harvest date\n   • Field location\n   • Soil requirements\n4. Click "Save Crop" to add it to your system\n\nYour new crop will appear in the crop list and you can track its progress through growth stages.',
    keywords: ['add crop', 'new crop', 'crop management', 'planting', 'create crop'],
    relatedTopics: ['crop-tracking', 'harvest-planning', 'soil-management'],
    difficulty: 'beginner'
  },
  
  {
    id: 'crop-002',
    category: 'crop-management',
    question: 'How do I track crop growth stages?',
    answer: 'Track crop growth stages in the Crop Management section:\n1. Select your crop from the crop list\n2. View the growth timeline showing:\n   • Germination stage\n   • Vegetative growth\n   • Flowering stage\n   • Fruit development\n   • Harvest readiness\n3. Update growth stage manually or let the system auto-detect based on sensor data\n4. Set alerts for important growth milestones\n\nThe system uses your IoT sensor data to automatically update growth stages when possible.',
    keywords: ['crop growth', 'growth stages', 'timeline', 'tracking', 'stages'],
    relatedTopics: ['sensors', 'alerts', 'harvest-planning'],
    difficulty: 'intermediate'
  },

  {
    id: 'crop-003',
    category: 'crop-management',
    question: 'How do I get crop recommendations for my farm?',
    answer: 'Get crop recommendations using our dual recommendation system:\n\n**Option 1: AI-Based Recommendations (Available Now)**\n1. Go to ML Models → "AI Crop Recommendations"\n2. Input your farm parameters (soil type, climate, size)\n3. Review AI suggestions based on:\n   • Soil analysis\n   • Climate compatibility\n   • Market trends\n   • Historical yield data\n4. Compare multiple crop options\n5. Get profitability analysis\n\n**Option 2: Custom Recommendation Engine (Coming Soon)**\n• Personalized to your specific farm history\n• Customizable criteria weighting\n• Local market integration\n• Advanced crop rotation planning\n\n**Best Practice:**\n• Start with AI recommendations for immediate planning\n• Keep detailed farm records for future custom recommendations\n• Consider both systems for comprehensive crop planning\n\nBoth systems help optimize crop selection for maximum yield and profitability.',
    keywords: ['crop recommendations', 'crop selection', 'AI recommendations', 'custom recommendations', 'farm planning'],
    relatedTopics: ['ai-recommendations', 'crop-planning', 'farm-optimization'],
    difficulty: 'intermediate'
  },

  {
    id: 'crop-004',
    category: 'crop-management',
    question: 'How do I plan crop rotation with the recommendation engines?',
    answer: 'Plan effective crop rotation using both recommendation engines:\n\n**Using AI-Based Engine:**\n1. Go to ML Models → "AI Crop Recommendations"\n2. Select "Crop Rotation Planning"\n3. Input your current/previous crops\n4. Get suggestions for:\n   • Compatible next crops\n   • Soil health improvement\n   • Pest and disease management\n   • Nutrient balance optimization\n\n**Preparing for Custom Engine:**\n• Record detailed crop rotation history\n• Track soil health changes between rotations\n• Monitor pest and disease patterns\n• Document yield improvements from rotation\n\n**Rotation Planning Tips:**\n• Rotate crop families (legumes → grains → vegetables)\n• Consider soil nutrient needs and contributions\n• Plan for pest and disease interruption\n• Balance high and low input crops\n• Consider market demand timing\n\n**Benefits of Good Rotation:**\n• Improved soil health\n• Reduced pest and disease pressure\n• Better nutrient utilization\n• Increased overall farm profitability\n\nThe custom engine will provide even more personalized rotation strategies when available.',
    keywords: ['crop rotation', 'rotation planning', 'soil health', 'pest management', 'nutrient management'],
    relatedTopics: ['soil-management', 'pest-control', 'farm-optimization'],
    difficulty: 'advanced'
  },
  
  // IOT SENSORS
  {
    id: 'sensor-001',
    category: 'sensors',
    question: 'How do I monitor soil moisture levels?',
    answer: 'Monitor soil moisture in the IoT Sensors section:\n1. Go to "IoT Sensors" from the sidebar\n2. Find the "Soil Moisture" sensor card\n3. View current readings:\n   • Percentage of soil moisture\n   • Status (Dry, Optimal, Wet)\n   • Trend over time\n4. Click on the sensor for detailed historical data\n5. Set up alerts for low/high moisture levels\n\nThe system updates readings every 20 seconds and provides irrigation recommendations based on your crop needs.',
    keywords: ['soil moisture', 'sensors', 'irrigation', 'moisture levels', 'monitoring'],
    relatedTopics: ['irrigation', 'crop-health', 'alerts'],
    difficulty: 'beginner'
  },
  
  {
    id: 'sensor-002',
    category: 'sensors',
    question: 'How do I check temperature and humidity readings?',
    answer: 'Check environmental conditions in IoT Sensors:\n1. Navigate to "IoT Sensors" section\n2. View the Temperature and Humidity cards showing:\n   • Current temperature in °C/°F\n   • Current humidity percentage\n   • Status indicators (Normal, High, Low)\n   • 24-hour trend graphs\n3. Click on any sensor card for detailed analysis\n4. Set up automated alerts for extreme conditions\n\nThe system monitors optimal ranges for your specific crops and provides recommendations.',
    keywords: ['temperature', 'humidity', 'environmental', 'monitoring', 'weather'],
    relatedTopics: ['crop-health', 'alerts', 'climate-control'],
    difficulty: 'beginner'
  },
  
  {
    id: 'sensor-003',
    category: 'sensors',
    question: 'How do I set up sensor alerts and notifications?',
    answer: 'Set up sensor alerts:\n1. Go to IoT Sensors section\n2. Click on any sensor card\n3. Click "Alert Settings" button\n4. Configure thresholds:\n   • Minimum and maximum values\n   • Alert frequency\n   • Notification methods (email, app, SMS)\n5. Save your alert preferences\n\nYou can also manage all alerts from the Notifications section in the sidebar.',
    keywords: ['alerts', 'notifications', 'thresholds', 'monitoring', 'warnings'],
    relatedTopics: ['notifications', 'monitoring', 'automation'],
    difficulty: 'intermediate'
  },
  
  // DASHBOARD
  {
    id: 'dash-001',
    category: 'dashboard',
    question: 'What information is shown on the dashboard?',
    answer: 'The Dashboard provides an overview of your entire farm:\n• Real-time sensor readings (soil moisture, temperature, humidity)\n• Crop health status and growth stages\n• Yield prediction charts\n• Disease detection alerts\n• Soil quality analysis\n• AI farming recommendations\n• Weather conditions\n• Recent notifications\n\nThis gives you a complete picture of your farm status at a glance.',
    keywords: ['dashboard', 'overview', 'farm status', 'summary', 'monitoring'],
    relatedTopics: ['sensors', 'crops', 'analytics'],
    difficulty: 'beginner'
  },
  
  {
    id: 'dash-002',
    category: 'dashboard',
    question: 'How do I understand the yield prediction charts?',
    answer: 'Yield prediction charts show:\n1. Expected harvest quantities over time\n2. Comparison with historical data\n3. Confidence intervals (prediction accuracy)\n4. Factors affecting yield:\n   • Weather conditions\n   • Soil quality\n   • Crop health\n   • Irrigation efficiency\n\nThe predictions update daily based on current conditions and machine learning models trained on your farm data.',
    keywords: ['yield prediction', 'harvest', 'charts', 'forecasting', 'analytics'],
    relatedTopics: ['analytics', 'machine-learning', 'harvest-planning'],
    difficulty: 'intermediate'
  },

  {
    id: 'dash-003',
    category: 'dashboard',
    question: 'Where can I see crop recommendations on the dashboard?',
    answer: 'Access crop recommendations from the dashboard:\n\n**Dashboard Widgets:**\n• "Recommended Crops" widget shows top 3 AI suggestions\n• "Seasonal Planning" widget displays planting recommendations\n• "Market Insights" widget shows profitable crop options\n• "Rotation Suggestions" widget for crop rotation planning\n\n**Quick Access:**\n1. View recommendation summary cards\n2. Click "View All Recommendations" for detailed analysis\n3. Access both AI and custom recommendation engines\n4. See recommendation confidence scores\n\n**Dashboard Integration:**\n• Recommendations update based on current conditions\n• Integration with sensor data for soil-based suggestions\n• Weather-based planting time recommendations\n• Market price integration for profitability analysis\n\n**Getting Started:**\n• Click any recommendation card for details\n• Use "Get Recommendations" button for full analysis\n• Access ML Models section for advanced features\n\nThe dashboard provides a quick overview, while the ML Models section offers detailed recommendation analysis.',
    keywords: ['dashboard recommendations', 'crop suggestions', 'recommendation widgets', 'quick access'],
    relatedTopics: ['ml-models', 'crop-recommendations', 'dashboard-navigation'],
    difficulty: 'beginner'
  },
  
  // ANALYTICS & REPORTS
  {
    id: 'analytics-001',
    category: 'analytics',
    question: 'How do I generate farm performance reports?',
    answer: 'Generate reports in Analytics & Reports:\n1. Go to "Analytics & Reports" from sidebar\n2. Select report type:\n   • Crop performance\n   • Sensor data analysis\n   • Yield tracking\n   • Resource usage\n3. Choose time period (daily, weekly, monthly, yearly)\n4. Select specific crops or fields\n5. Click "Generate Report"\n6. Export as PDF or Excel for sharing\n\nReports include charts, trends, and actionable insights.',
    keywords: ['reports', 'analytics', 'performance', 'data analysis', 'export'],
    relatedTopics: ['data-export', 'performance-tracking', 'insights'],
    difficulty: 'intermediate'
  },
  
  {
    id: 'analytics-002',
    category: 'analytics',
    question: 'How do I analyze historical sensor data?',
    answer: 'Analyze historical data:\n1. Navigate to Analytics & Reports\n2. Select "Historical Data Analysis"\n3. Choose sensors to analyze:\n   • Soil moisture trends\n   • Temperature patterns\n   • Humidity variations\n   • NPK levels over time\n4. Set date range for analysis\n5. View interactive charts with:\n   • Trend lines\n   • Seasonal patterns\n   • Anomaly detection\n   • Correlation analysis\n\nUse this data to optimize irrigation schedules and crop management.',
    keywords: ['historical data', 'trends', 'analysis', 'patterns', 'optimization'],
    relatedTopics: ['sensors', 'optimization', 'data-insights'],
    difficulty: 'advanced'
  },
  
  // MACHINE LEARNING
  {
    id: 'ml-001',
    category: 'machine-learning',
    question: 'How do I use the machine learning models in the ML Models section?',
    answer: 'The ML Models section contains 5 fully functional models:\n\n**1. Yield Prediction Model**\n• Click "Train Model" to analyze crop yield potential\n• Input crop name and field size\n• Get detailed yield predictions and recommendations\n• Download results for record keeping\n\n**2. Disease Detection Model**\n• Upload plant images for disease analysis\n• Uses computer vision to identify diseases\n• Get treatment recommendations\n• Track disease patterns over time\n\n**3. Crop Recommendation Engine**\n• Input environmental conditions (temperature, moisture, pH)\n• Get AI-powered crop suggestions\n• Compare multiple crop options\n• Download recommendations as JSON\n\n**4. Optimal Planting Model**\n• Analyze best planting times for crops\n• Input crop type and planned planting date\n• Get seasonal recommendations\n• Plan crop rotations effectively\n\n**5. Harvest Prediction Model**\n• Predict optimal harvest timing\n• Input crop details and field information\n• Get harvest date estimates and quality predictions\n• Plan harvesting logistics\n\nAll models provide downloadable results and integrate with your farm data.',
    keywords: ['ML models', 'machine learning', 'train model', 'yield prediction', 'disease detection', 'crop recommendations', 'planting model', 'harvest prediction'],
    relatedTopics: ['ai-recommendations', 'crop-planning', 'disease-management'],
    difficulty: 'intermediate'
  },
  
  {
    id: 'ml-002',
    category: 'machine-learning',
    question: 'How do I train and run the ML models to get actual results?',
    answer: 'Train and run ML models to get real outputs:\n\n**Training Process:**\n1. Go to ML Models section\n2. Click "Train Model" on any model card\n3. Fill in required parameters:\n   • Crop name, field size, environmental conditions\n   • Upload images for disease detection\n   • Set planting dates for timing models\n4. Click train/run button and wait for processing\n5. View detailed results in the modal\n6. Download results for future reference\n\n**Available Models:**\n• **Yield Prediction**: Analyzes crop potential and provides yield forecasts\n• **Disease Detection**: Computer vision analysis of plant health\n• **Crop Recommendations**: AI-powered crop selection based on conditions\n• **Optimal Planting**: Seasonal timing analysis for best planting periods\n• **Harvest Prediction**: Timing and quality predictions for harvest planning\n\n**Getting Results:**\n• Models provide immediate output after training\n• Results include detailed analysis and recommendations\n• Download capability for all model outputs\n• Integration with farm management workflows\n\n**Training Hub:**\n• Central dashboard showing all model performance\n• Quick access to frequently used models\n• Training status and scheduling information\n\nAll models are fully functional and provide actionable insights for farm management.',
    keywords: ['train models', 'ML training', 'model results', 'machine learning output', 'model training', 'AI results'],
    relatedTopics: ['ml-models', 'farm-optimization', 'ai-analysis'],
    difficulty: 'intermediate'
  },

  {
    id: 'ml-003',
    category: 'machine-learning',
    question: 'How do I use the AI-based crop recommendation engine?',
    answer: 'Use the AI-based crop recommendation engine:\n1. Go to "ML Models" section\n2. Select "AI Crop Recommendations"\n3. The AI analyzes multiple factors:\n   • Soil composition and quality\n   • Climate patterns and weather data\n   • Historical yield data\n   • Market trends and prices\n   • Regional crop performance\n4. Get recommendations for:\n   • Best crops for your soil type\n   • Optimal planting times\n   • Expected yield predictions\n   • Profitability analysis\n5. View detailed analysis with confidence scores\n6. Compare multiple crop options side-by-side\n\nThe AI uses machine learning trained on agricultural datasets to provide data-driven crop selection guidance.',
    keywords: ['AI crop recommendations', 'crop selection', 'machine learning', 'soil analysis', 'yield prediction', 'crop planning'],
    relatedTopics: ['crop-planning', 'soil-analysis', 'yield-forecasting', 'profitability'],
    difficulty: 'intermediate'
  },

  {
    id: 'ml-004',
    category: 'machine-learning',
    question: 'What is the custom crop recommendation engine?',
    answer: 'The custom crop recommendation engine is an advanced feature currently in development:\n\n**Planned Features:**\n• Personalized recommendations based on your specific farm history\n• Integration with your local agricultural conditions\n• Customizable criteria weighting (yield vs. profitability vs. sustainability)\n• Local market integration for price predictions\n• Seasonal planning with crop rotation optimization\n• Resource requirement analysis (water, fertilizer, labor)\n\n**Current Status:**\n• Feature is under development\n• Will be available in a future update\n• You can use the AI-based recommendation engine in the meantime\n\n**How it will differ from AI engine:**\n• More personalized to your specific farm\n• Customizable recommendation criteria\n• Integration with your historical data\n• Local market and supplier integration\n\nStay tuned for updates on this exciting feature!',
    keywords: ['custom crop recommendations', 'personalized recommendations', 'farm-specific', 'custom engine', 'future feature', 'development'],
    relatedTopics: ['crop-planning', 'farm-optimization', 'ai-recommendations'],
    difficulty: 'advanced'
  },

  {
    id: 'ml-005',
    category: 'machine-learning',
    question: 'What is the difference between AI-based and custom crop recommendation engines?',
    answer: 'Comparison of the two crop recommendation engines:\n\n**AI-Based Recommendation Engine (Available Now):**\n• Uses general agricultural AI models\n• Analyzes standard factors (soil, climate, market)\n• Provides broad recommendations\n• Works with generic agricultural datasets\n• Good for general crop selection guidance\n• Immediate availability\n\n**Custom Recommendation Engine (Coming Soon):**\n• Personalized to your specific farm\n• Learns from your historical data\n• Customizable recommendation criteria\n• Integration with local suppliers/markets\n• Considers your specific goals (profit, sustainability, etc.)\n• Advanced crop rotation optimization\n• Resource-specific recommendations\n\n**When to use which:**\n• Use AI-based for: General crop selection, new farm setups, quick decisions\n• Use custom for: Long-term planning, farm-specific optimization, advanced strategies\n\n**Current Recommendation:**\nStart with the AI-based engine now, and prepare for the custom engine release by maintaining good historical data records.',
    keywords: ['crop recommendation comparison', 'AI vs custom', 'recommendation engines', 'crop selection', 'farm planning'],
    relatedTopics: ['crop-planning', 'ai-recommendations', 'farm-optimization'],
    difficulty: 'intermediate'
  },

  {
    id: 'ml-006',
    category: 'machine-learning',
    question: 'How do I prepare my farm data for the custom crop recommendation engine?',
    answer: 'Prepare your farm data for the upcoming custom recommendation engine:\n\n**Data Collection Steps:**\n1. **Historical Records:**\n   • Document all past crop types and varieties\n   • Record planting and harvest dates\n   • Track yield quantities and quality\n   • Note any issues or challenges\n\n2. **Sensor Data Management:**\n   • Ensure consistent sensor readings\n   • Maintain soil moisture, temperature, and NPK data\n   • Keep weather condition records\n   • Document irrigation and fertilization schedules\n\n3. **Financial Records:**\n   • Track input costs (seeds, fertilizer, labor)\n   • Record selling prices and market conditions\n   • Calculate profitability per crop\n   • Monitor resource usage costs\n\n4. **Farm-Specific Information:**\n   • Soil testing results\n   • Field characteristics and microclimates\n   • Available resources and constraints\n   • Personal farming goals and preferences\n\n**Data Quality Tips:**\n• Use consistent measurement units\n• Regular data backup and validation\n• Document any unusual events or conditions\n• Maintain detailed crop growth stage records\n\nGood data preparation now will enable better personalized recommendations later!',
    keywords: ['data preparation', 'farm data', 'custom recommendations', 'historical records', 'data collection'],
    relatedTopics: ['data-management', 'farm-optimization', 'record-keeping'],
    difficulty: 'advanced'
  },
  
  // NOTIFICATIONS
  {
    id: 'notif-001',
    category: 'notifications',
    question: 'How do I manage alerts and notifications?',
    answer: 'Manage notifications:\n1. Go to "Notifications" from sidebar\n2. View all alerts categorized by:\n   • Critical alerts (immediate attention)\n   • Warnings (should address soon)\n   • Information (FYI updates)\n3. Configure notification preferences:\n   • Email notifications\n   • SMS alerts\n   • In-app notifications\n4. Set quiet hours and frequency limits\n5. Mark notifications as read/unread\n\nYou can also access recent notifications from the header bell icon.',
    keywords: ['notifications', 'alerts', 'messages', 'warnings', 'settings'],
    relatedTopics: ['alerts', 'settings', 'communication'],
    difficulty: 'beginner'
  },
  
  // SETTINGS & CONFIGURATION
  {
    id: 'settings-001',
    category: 'settings',
    question: 'How do I configure my farm profile and preferences?',
    answer: 'Configure your farm settings:\n1. Go to "Settings" from sidebar\n2. Update Farm Profile:\n   • Farm name and location\n   • Farm size and crop types\n   • Contact information\n3. Set Preferences:\n   • Language settings\n   • Units (metric/imperial)\n   • Time zone\n   • Notification preferences\n4. Configure Sensor Settings:\n   • Calibration parameters\n   • Reading intervals\n   • Alert thresholds\n5. Save all changes\n\nProper configuration ensures accurate readings and relevant recommendations.',
    keywords: ['settings', 'configuration', 'profile', 'preferences', 'calibration'],
    relatedTopics: ['setup', 'customization', 'optimization'],
    difficulty: 'beginner'
  },
  
  // TROUBLESHOOTING
  {
    id: 'trouble-001',
    category: 'troubleshooting',
    question: 'Why are my sensor readings showing "N/A" or not updating?',
    answer: 'Sensor reading issues can be caused by:\n1. Check sensor connections:\n   • Ensure sensors are properly connected\n   • Verify power supply\n   • Check for loose wires\n2. Network connectivity:\n   • Confirm WiFi/internet connection\n   • Check signal strength\n3. Sensor calibration:\n   • Go to Settings → Sensor Calibration\n   • Run calibration procedure\n4. Contact support if issues persist\n\nThe system will show "N/A" when sensors are offline or readings are outside normal ranges.',
    keywords: ['sensor issues', 'troubleshooting', 'not updating', 'connection', 'calibration'],
    relatedTopics: ['sensors', 'connectivity', 'maintenance'],
    difficulty: 'intermediate'
  },

  {
    id: 'trouble-002',
    category: 'troubleshooting',
    question: 'Why are my crop recommendations not showing or seem inaccurate?',
    answer: 'Crop recommendation issues can be caused by:\n\n**Common Issues:**\n1. **Insufficient Farm Data:**\n   • Ensure soil testing data is complete\n   • Verify climate/location information\n   • Check that farm size and type are accurate\n\n2. **Sensor Data Problems:**\n   • Confirm all sensors are working properly\n   • Check soil moisture, temperature, and NPK readings\n   • Verify sensor calibration is current\n\n3. **Profile Configuration:**\n   • Go to Settings → Farm Profile\n   • Update farm location and climate zone\n   • Verify crop history and preferences\n\n4. **AI Engine Issues:**\n   • Try refreshing the ML Models page\n   • Check internet connection for AI processing\n   • Clear browser cache and reload\n\n**Improving Recommendation Accuracy:**\n• Provide detailed soil analysis results\n• Maintain consistent sensor data\n• Update farm goals and constraints\n• Record detailed crop performance history\n\n**If Custom Engine Shows "Coming Soon":**\n• This feature is still in development\n• Use AI-based recommendations in the meantime\n• Keep collecting farm data for future custom recommendations\n\nFor persistent issues, contact support with your farm profile details.',
    keywords: ['crop recommendations', 'recommendation problems', 'inaccurate suggestions', 'AI issues', 'troubleshooting'],
    relatedTopics: ['crop-recommendations', 'farm-profile', 'sensor-calibration'],
    difficulty: 'intermediate'
  },

  {
    id: 'trouble-003',
    category: 'troubleshooting',
    question: 'How do I improve the accuracy of my crop recommendations?',
    answer: 'Improve crop recommendation accuracy with these steps:\n\n**Data Quality Improvements:**\n1. **Comprehensive Soil Testing:**\n   • Conduct annual soil tests\n   • Include pH, NPK, organic matter, and micronutrients\n   • Test different field zones separately\n   • Update results in Settings → Farm Profile\n\n2. **Accurate Farm Information:**\n   • Precise location and climate zone\n   • Correct farm size and field characteristics\n   • Accurate irrigation and drainage information\n   • Proper crop history records\n\n3. **Quality Sensor Data:**\n   • Ensure sensors are properly calibrated\n   • Maintain consistent readings over time\n   • Replace faulty sensors promptly\n   • Keep sensors clean and well-maintained\n\n**Historical Data Management:**\n• Record detailed crop performance\n• Track input costs and yields\n• Document weather impacts\n• Note any unusual conditions or events\n\n**System Optimization:**\n• Regularly update your farm profile\n• Provide feedback on recommendation accuracy\n• Use both AI and future custom engines\n• Keep the system updated with current data\n\n**Long-term Benefits:**\n• More accurate recommendations over time\n• Better yield predictions\n• Improved profitability analysis\n• Personalized farming strategies\n\nThe custom recommendation engine will use this data for even more accurate, personalized suggestions.',
    keywords: ['recommendation accuracy', 'data quality', 'soil testing', 'farm profile', 'improvement'],
    relatedTopics: ['data-management', 'soil-analysis', 'farm-optimization'],
    difficulty: 'advanced'
  },

  {
    id: 'ml-006',
    category: 'machine-learning',
    question: 'How do I train ML models in the ML Models section?',
    answer: 'To train ML models in the ML Models section:\n\n**Step-by-Step Training Process:**\n1. **Navigate to ML Models page**\n2. **Select the model you want to train:**\n   • Yield Prediction Model\n   • Disease Detection Model\n   • Crop Recommendation Model\n   • Optimal Planting Model\n   • Harvest Time Model\n\n3. **Click "Train" or "Run Model" button**\n4. **Enter required parameters:**\n   • Crop name (required for most models)\n   • Environmental conditions (temperature, moisture, pH)\n   • Field size and planting dates\n   • Upload images for disease detection\n\n5. **Wait for training to complete**\n6. **Review detailed results in modal popup**\n7. **Download training reports and results**\n\n**Training Tips:**\n• Each model has specific input requirements\n• Results include accuracy metrics and recommendations\n• Training data is processed using AI and historical patterns\n• Results can be downloaded for record keeping\n• Models improve with more training data\n\n**Expected Outputs:**\n• Detailed analysis reports\n• Actionable recommendations\n• Confidence scores and accuracy metrics\n• Downloadable results files\n\nAll models provide immediate, runnable output with practical insights for farm management.',
    keywords: ['ML training', 'model training', 'yield prediction', 'disease detection', 'training steps', 'ML Models page'],
    relatedTopics: ['ml-models', 'training-procedures', 'model-parameters'],
    difficulty: 'intermediate'
  },

  {
    id: 'ml-007',
    category: 'machine-learning',
    question: 'What models are available in ML Models section and how do I get runnable output?',
    answer: 'The ML Models section contains 5 fully functional models with runnable output:\n\n**1. Yield Prediction Model (92% accuracy)**\n• **Input:** Crop name, field size, environmental conditions\n• **Output:** Expected yield forecasts, optimal growing conditions\n• **Training:** Uses AI analysis of crop requirements and conditions\n• **Results:** Downloadable yield predictions and recommendations\n\n**2. Disease Detection Model (88% accuracy)**\n• **Input:** Plant images, crop type, symptoms\n• **Output:** Disease identification, treatment recommendations\n• **Training:** Computer vision analysis of plant health\n• **Results:** Disease classification with confidence scores\n\n**3. Crop Recommendation Model**\n• **Input:** Temperature, moisture, pH, soil conditions\n• **Output:** Optimal crop suggestions with reasoning\n• **Training:** AI-powered analysis of environmental suitability\n• **Results:** JSON format crop recommendations\n\n**4. Optimal Planting Model**\n• **Input:** Crop type, planting date, location\n• **Output:** Best planting periods, seasonal recommendations\n• **Training:** Analysis of weather patterns and growth cycles\n• **Results:** Detailed planting schedule recommendations\n\n**5. Harvest Time Model**\n• **Input:** Crop name, field size, planting date\n• **Output:** Harvest timing predictions, quality estimates\n• **Training:** Growth cycle analysis and maturity prediction\n• **Results:** Harvest scheduling with quality metrics\n\n**Getting Runnable Output:**\n• All models provide immediate results after training\n• Results include detailed analysis and actionable insights\n• Download capabilities for all model outputs\n• Integration with farm management workflows\n\n**Training Process:**\n1. Click model training button\n2. Fill required parameters\n3. Wait for processing\n4. View results in popup modal\n5. Download results for future reference\n\nEvery model provides practical, actionable output for real farm management decisions.',
    keywords: ['ML models', 'yield prediction', 'disease detection', 'crop recommendation', 'planting model', 'harvest prediction', 'runnable output', 'model results'],
    relatedTopics: ['ml-models', 'farm-optimization', 'ai-analysis'],
    difficulty: 'intermediate'
  },

  {
    id: 'ml-008',
    category: 'machine-learning',
    question: 'How do I get actual training output and results from ML models?',
    answer: 'Get actual training output and results from ML models:\n\n**Training Execution:**\n1. **Go to ML Models page**\n2. **Select any model card**\n3. **Click "Train Model" button**\n4. **Fill in the training form:**\n   • Crop name (e.g., "Tomatoes", "Rice", "Wheat")\n   • Environmental parameters (temperature, moisture, pH)\n   • Field information (size, planting date)\n   • Upload images for disease detection\n\n5. **Click "Start Training" and wait for processing**\n6. **View comprehensive results in modal popup**\n\n**What You Get:**\n• **Detailed Analysis Reports:** Complete breakdown of model predictions\n• **Actionable Recommendations:** Specific advice for your farm\n• **Accuracy Metrics:** Confidence scores and reliability indicators\n• **Visual Data:** Charts and graphs showing predictions\n• **Download Options:** Save results as text files or JSON\n\n**Real Training Examples:**\n• **Yield Model:** "Yield Prediction for Tomatoes: Expected 85-95% optimal yield"\n• **Disease Model:** "Disease Detection: 87% confidence of Leaf Blight detected"\n• **Crop Rec:** "Recommended crops: Beans (8 weeks), Lettuce (6 weeks)"\n• **Planting:** "Optimal planting: March-April for best results"\n• **Harvest:** "Harvest in 65 days with Premium (A+) quality grade"\n\n**Training Features:**\n• **Real AI Integration:** Models use actual Google Gemini AI\n• **Live Processing:** Real-time analysis of your input data\n• **Immediate Results:** No waiting for offline processing\n• **Downloadable Reports:** Save all training results\n• **Integration Ready:** Results connect to farm management workflows\n\nAll models provide immediately actionable, real-world training output for effective farm management.',
    keywords: ['ML training output', 'model results', 'training execution', 'actual results', 'download reports', 'training process'],
    relatedTopics: ['ml-models', 'training-procedures', 'farm-optimization'],
    difficulty: 'intermediate'
  },
  
  // ADVANCED FEATURES
  {
    id: 'advanced-001',
    category: 'advanced',
    question: 'How do I set up automated irrigation based on sensor data?',
    answer: 'Set up automated irrigation:\n1. Go to IoT Sensors → Soil Moisture\n2. Click "Automation Settings"\n3. Configure triggers:\n   • Moisture threshold (e.g., below 30%)\n   • Time restrictions (avoid midday)\n   • Weather conditions (don\'t water if rain expected)\n4. Set irrigation parameters:\n   • Duration and intensity\n   • Zones to water\n   • Repeat intervals\n5. Enable automation and monitor\n\nThe system will automatically trigger irrigation when conditions are met.',
    keywords: ['automation', 'irrigation', 'automated watering', 'smart irrigation', 'triggers'],
    relatedTopics: ['sensors', 'automation', 'water-management'],
    difficulty: 'advanced'
  },
  
  // MOBILE ACCESS
  {
    id: 'mobile-001',
    category: 'mobile',
    question: 'How do I access the app on mobile devices?',
    answer: 'Access on mobile:\n1. Open your mobile browser\n2. Navigate to your app URL\n3. The app is fully responsive and works on:\n   • Smartphones (iOS/Android)\n   • Tablets\n   • All screen sizes\n4. For better experience:\n   • Add to home screen for app-like access\n   • Use landscape mode for charts\n   • Enable notifications in browser\n\nAll features are available on mobile with touch-optimized interface.',
    keywords: ['mobile', 'smartphone', 'tablet', 'responsive', 'touch'],
    relatedTopics: ['accessibility', 'user-interface', 'notifications'],
    difficulty: 'beginner'
  }
];

// Categories for organizing knowledge
export const KNOWLEDGE_CATEGORIES = {
  navigation: 'Navigation & Basic Usage',
  'crop-management': 'Crop Management & Planning',
  sensors: 'IoT Sensors & Monitoring',
  dashboard: 'Dashboard & Overview',
  analytics: 'Analytics & Reports',
  'machine-learning': 'AI & Machine Learning',
  notifications: 'Notifications & Alerts',
  settings: 'Settings & Configuration',
  troubleshooting: 'Troubleshooting & Support',
  advanced: 'Advanced Features',
  mobile: 'Mobile Access'
};

// Function to search knowledge base
export const searchKnowledgeBase = (query: string): KnowledgeItem[] => {
  const searchTerms = query.toLowerCase().split(' ');
  
  return APP_KNOWLEDGE_BASE.filter(item => {
    const searchableText = `${item.question} ${item.answer} ${item.keywords.join(' ')}`.toLowerCase();
    return searchTerms.some(term => searchableText.includes(term));
  }).sort((a, b) => {
    // Sort by relevance - count matching terms
    const aMatches = searchTerms.filter(term => 
      `${a.question} ${a.answer} ${a.keywords.join(' ')}`.toLowerCase().includes(term)
    ).length;
    const bMatches = searchTerms.filter(term => 
      `${b.question} ${b.answer} ${b.keywords.join(' ')}`.toLowerCase().includes(term)
    ).length;
    return bMatches - aMatches;
  });
};

// Get related topics
export const getRelatedTopics = (currentItem: KnowledgeItem): KnowledgeItem[] => {
  return APP_KNOWLEDGE_BASE.filter(item => 
    item.id !== currentItem.id && 
    (item.relatedTopics.some(topic => currentItem.relatedTopics.includes(topic)) ||
     item.category === currentItem.category)
  ).slice(0, 3);
};
