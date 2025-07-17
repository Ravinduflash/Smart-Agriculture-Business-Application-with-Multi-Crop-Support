// To run this code you need to install the following dependencies:
// npm install @google/generative-ai
// npm install -D @types/node

import {
  GoogleGenerativeAI,
} from '@google/generative-ai';

export interface HelpContentMapping {
  [key: string]: {
    title: string;
    description: string;
    aiPrompt: string;
  };
}

// Advanced AI Training System with Google Gemini
export class SmartAgricultureAITrainer {
  private ai: GoogleGenerativeAI;
  private model: string = 'gemini-1.5-flash';

  constructor() {
    this.ai = new GoogleGenerativeAI(
      process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
    );
  }

  async generateTrainedResponse(userQuery: string, contextData?: any): Promise<string> {
    try {
      // Get the generative model
      const model = this.ai.getGenerativeModel({ model: this.model });

      // Create the prompt with training data
      const prompt = `You are an expert Smart Agriculture AI assistant with comprehensive knowledge about farming, IoT sensors, crop management, and agricultural technology. You have been trained on the complete Smart Agriculture App Knowledge Base and can provide detailed, practical advice to farmers.

Smart Agriculture App Knowledge Base:
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
    answer: 'Use the sidebar menu on the left to navigate between different sections:\\n• Dashboard - Overview of your farm data\\n• Crop Management - Manage your crops\\n• IoT Sensors - Monitor sensor readings\\n• Analytics & Reports - View detailed analytics\\n• ML Models - Access machine learning features\\n• Notifications - Check alerts and updates\\n• Settings - Configure app preferences\\n\\nClick any menu item to instantly switch between sections.',
    keywords: ['navigation', 'menu', 'sidebar', 'sections', 'navigate'],
    relatedTopics: ['dashboard', 'crop-management', 'sensors'],
    difficulty: 'beginner'
  },
  
  // CROP MANAGEMENT
  {
    id: 'crop-001',
    category: 'crop-management',
    question: 'How do I add a new crop to the system?',
    answer: 'To add a new crop:\\n1. Go to "Crop Management" from the sidebar menu\\n2. Click the "Add New Crop" button\\n3. Fill in the crop details:\\n   • Crop name and type\\n   • Planting date\\n   • Expected harvest date\\n   • Field location\\n   • Soil requirements\\n4. Click "Save Crop" to add it to your system\\n\\nYour new crop will appear in the crop list and you can track its progress through growth stages.',
    keywords: ['add crop', 'new crop', 'crop management', 'planting', 'create crop'],
    relatedTopics: ['crop-tracking', 'harvest-planning', 'soil-management'],
    difficulty: 'beginner'
  },
  
  // IOT SENSORS
  {
    id: 'sensor-001',
    category: 'sensors',
    question: 'How do I monitor soil moisture levels?',
    answer: 'Monitor soil moisture in the IoT Sensors section:\\n1. Go to "IoT Sensors" from the sidebar\\n2. Find the "Soil Moisture" sensor card\\n3. View current readings:\\n   • Percentage of soil moisture\\n   • Status (Dry, Optimal, Wet)\\n   • Trend over time\\n4. Click on the sensor for detailed historical data\\n5. Set up alerts for low/high moisture levels\\n\\nThe system updates readings every 20 seconds and provides irrigation recommendations based on your crop needs.',
    keywords: ['soil moisture', 'sensors', 'irrigation', 'moisture levels', 'monitoring'],
    relatedTopics: ['irrigation', 'crop-health', 'alerts'],
    difficulty: 'beginner'
  },
  
  // MACHINE LEARNING
  {
    id: 'ml-001',
    category: 'machine-learning',
    question: 'How do I use the machine learning models in the ML Models section?',
    answer: 'The ML Models section contains 5 fully functional models:\\n\\n**1. Yield Prediction Model**\\n• Click "Train Model" to analyze crop yield potential\\n• Input crop name and field size\\n• Get detailed yield predictions and recommendations\\n• Download results for record keeping\\n\\n**2. Disease Detection Model**\\n• Upload plant images for disease analysis\\n• Uses computer vision to identify diseases\\n• Get treatment recommendations\\n• Track disease patterns over time\\n\\n**3. Crop Recommendation Engine**\\n• Input environmental conditions (temperature, moisture, pH)\\n• Get AI-powered crop suggestions\\n• Compare multiple crop options\\n• Download recommendations as JSON\\n\\n**4. Optimal Planting Model**\\n• Analyze best planting times for crops\\n• Input crop type and planned planting date\\n• Get seasonal recommendations\\n• Plan crop rotations effectively\\n\\n**5. Harvest Prediction Model**\\n• Predict optimal harvest timing\\n• Input crop details and field information\\n• Get harvest date estimates and quality predictions\\n• Plan harvesting logistics\\n\\nAll models provide downloadable results and integrate with your farm data.',
    keywords: ['ML models', 'machine learning', 'train model', 'yield prediction', 'disease detection', 'crop recommendations', 'planting model', 'harvest prediction'],
    relatedTopics: ['ai-recommendations', 'crop-planning', 'disease-management'],
    difficulty: 'intermediate'
  }
];

User Question: "${userQuery}"
${contextData ? `Context Data: ${JSON.stringify(contextData)}` : ''}

Please provide a comprehensive, practical answer based on your training knowledge about smart agriculture systems. Be conversational, helpful, and provide actionable guidance that farmers can use immediately.`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text || 'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';
    } catch (error) {
      console.error('Google Gemini AI Training Error:', error);
      return 'I apologize, but I encountered an issue processing your request. Please check your internet connection and try again, or contact support for assistance.';
    }
  }
}

export const HELP_CONTENT_MAPPINGS: HelpContentMapping = {
  // Dashboard sensor cards
  'soil-moisture-card': {
    title: 'Soil Moisture Sensor',
    description: 'Real-time soil moisture levels measured in ADC units',
    aiPrompt: `Please explain:
1.  Why soil moisture is important for farming.
2.  How to interpret the ADC unit readings for soil moisture, and what different levels (e.g., low, optimal, high) indicate.
3.  What specific actions farmers should consider taking based on these moisture levels.
4.  Any tips for effective soil moisture management.`
  },
  'temperature-card': {
    title: 'Temperature Sensor',
    description: 'Current air temperature readings in Celsius',
    aiPrompt: `Please explain:
1.  Why continuous temperature monitoring is crucial for agricultural success.
2.  How current air temperature affects various aspects of crop growth and health.
3.  What optimal temperature ranges are typically ideal for different common crops, and implications of deviations.
4.  Actions farmers can take based on temperature readings (e.g., climate control, planting adjustments).`
  },
  'humidity-card': {
    title: 'Humidity Sensor',
    description: 'Current air humidity percentage',
    aiPrompt: `Please explain:
1.  Why humidity monitoring is important for plant health and preventing issues like fungal diseases.
2.  How current air humidity affects different stages of plant growth.
3.  What optimal humidity ranges are ideal for various crops, and the risks associated with excessively high or low humidity.
4.  Actions farmers might consider to manage humidity levels in their growing environment.`
  },
  
  // Dashboard charts
  'yield-prediction-chart': {
    title: 'Yield Prediction Chart',
    description: 'AI-powered crop yield forecasting based on current conditions',
    aiPrompt: `Please explain:
1.  How these AI-powered yield predictions are generated, considering factors like environmental conditions and historical data.
2.  The practical utility of these forecasts for farmers in terms of planning and decision-making.
3.  How to effectively use this information for planning harvests, optimizing resource allocation, and timing market sales.
4.  What factors can influence the accuracy of these predictions and how farmers can help improve them.`
  },
  'disease-detection-chart': {
    title: 'Disease Detection Chart',
    description: 'Plant health status and disease detection results',
    aiPrompt: `Please explain:
1.  How the system performs disease detection and identifies the health status of crops (healthy vs. potentially diseased).
2.  The critical importance of early disease detection for preventing widespread crop loss.
3.  What immediate actions farmers should take when diseases are detected or suspected based on this chart.
4.  Preventative measures and best practices to maintain overall crop health.`
  },
  'soil-quality-chart': {
    title: 'Soil Quality Overview',
    description: 'Comprehensive soil health metrics and quality indicators',
    aiPrompt: `Please explain:
1.  Why maintaining optimal soil quality is fundamental to successful farming and long-term land productivity.
2.  How to interpret the various soil health metrics (nutrient levels, pH balance, organic matter content) displayed in the chart.
3.  What actionable steps farmers can take to improve or maintain specific soil quality parameters.
4.  The interconnectedness of these metrics and their overall impact on crop vigor and yield.`
  },
  'ai-farming-advisor': {
    title: 'AI Farming Advisor',
    description: 'Personalized farming recommendations based on sensor data',
    aiPrompt: `Please explain:
1.  How the AI Farming Advisor leverages real-time sensor data (soil moisture, temperature, humidity) to generate personalized recommendations.
2.  The types of actionable advice provided by the advisor (e.g., irrigation schedules, pest warnings, nutrient suggestions).
3.  How farmers can apply these recommendations to optimize their operations and improve crop outcomes.
4.  Tips for getting the most value from the AI Farming Advisor.`
  },
  
  // ML Models section
  'ml-models-training': {
    title: 'ML Models Training Hub',
    description: 'Comprehensive machine learning model training and execution center',
    aiPrompt: `Please explain:
1.  How to use the 5 fully functional ML models: Yield Prediction, Disease Detection, Crop Recommendations, Optimal Planting, and Harvest Prediction.
2.  The training process: clicking "Train Model", filling parameters, and getting comprehensive results.
3.  What types of outputs each model provides (predictions, recommendations, downloadable reports).
4.  How to interpret model results and apply them to farm management decisions.`
  },
  
  // Upcoming models section
  'optimal-planting-model': {
    title: 'Optimal Planting Time Model',
    description: 'AI model for determining the best planting times',
    aiPrompt: `Please explain:
1.  Why precise planting timing is crucial in agriculture for maximizing yield and crop health.
2.  How this AI model will analyze factors like weather patterns, soil conditions, and historical data to recommend optimal planting times.
3.  The benefits farmers can expect from using this model to optimize their planting schedules for different crops.
4.  What kind of data input will be most valuable for this model to provide accurate recommendations.`
  },
  'harvesting-time-model': {
    title: 'Harvesting Time Model',
    description: 'AI model for optimal harvest timing predictions',
    aiPrompt: `Please explain:
1.  Why predicting the optimal harvest time is critical for ensuring crop quality, maximizing yield, and achieving market profitability.
2.  How this AI model will forecast optimal harvest dates based on crop maturity, environmental conditions, and market factors.
3.  The advantages farmers will gain from using this model to plan their harvesting logistics and market entry.
4.  Key factors the model will consider to ensure accurate harvest predictions.`
  },
  
  // IoT Sensors page elements
  'sensor-grid': {
    title: 'IoT Sensors Overview',
    description: 'Real-time readings from all connected sensors',
    aiPrompt: `Please explain:
1.  The purpose of the IoT sensors grid and how it provides a comprehensive overview of farm conditions.
2.  Why each type of sensor (soil moisture, temperature, humidity, light intensity, NPK levels) is important for effective farm monitoring.
3.  How these various sensor readings work together to give a holistic picture of the farm environment.
4.  Tips for navigating and quickly assessing the health of different farm areas using this grid.`
  },
  'historical-charts': {
    title: 'Historical Data Charts',
    description: 'Time-series data visualization for sensor readings',
    aiPrompt: `Please explain:
1.  The value of analyzing historical sensor data for understanding long-term trends and patterns in environmental conditions.
2.  How to effectively read and interpret time-series charts to identify significant changes or anomalies.
3.  How farmers can use historical data to make more informed decisions about irrigation, fertilization, and crop management strategies.
4.  Examples of insights that can be gained from reviewing past sensor performance.`
  },
  'sensor-table': {
    title: 'All Sensors Table',
    description: 'Comprehensive table of all sensor readings and statuses',
    aiPrompt: `Please explain:
1.  How to efficiently navigate and interpret the comprehensive data presented in the all sensors table.
2.  The meaning of different status indicators (e.g., "Optimal," "Warning," "Critical," "Offline") for various sensor readings.
3.  What specific actions farmers should take based on different values or statuses displayed in the table.
4.  Tips for using the table to quickly identify areas requiring attention or unusual sensor behavior.`
  }
};

export const getHelpContent = (elementId: string): HelpContentMapping[string] | null => {
  return HELP_CONTENT_MAPPINGS[elementId] || null;
};

// Enhanced contextual prompt generation with AI training integration
export const getContextualPrompt = (elementId: string, contextData?: any): string => {
  const content = getHelpContent(elementId);
  if (!content) {
    return 'You are a friendly agricultural expert helping users understand their smart farming dashboard. The user has clicked on an element and needs help. Please provide a helpful, practical explanation about the farming dashboard element the user clicked on, and how it relates to their farming operations.';
  }
  
  return `You are a friendly agricultural expert helping users understand their smart farming dashboard. A user has clicked on "${content.title}" which is described as: "${content.description}". 

${content.aiPrompt}

${contextData ? `Additional context data: ${JSON.stringify(contextData)}` : ''}

Please provide a clear, practical explanation that helps the user understand both what they're looking at and how to use this information effectively for their farming operations. Keep your response conversational and focused on actionable insights.`;
};

// Advanced AI-powered help response generator
export const generateAIHelpResponse = async (elementId: string, contextData?: any): Promise<string> => {
  const aiTrainer = new SmartAgricultureAITrainer();
  const content = getHelpContent(elementId);
  
  if (!content) {
    return await aiTrainer.generateTrainedResponse(
      'A user needs help with an unknown dashboard element. Please provide general guidance about smart farming dashboard navigation and usage.',
      contextData
    );
  }

  const userQuery = `Help me understand the "${content.title}" - ${content.description}. ${content.aiPrompt}`;
  return await aiTrainer.generateTrainedResponse(userQuery, contextData);
};

// Smart chatbot integration for general farming queries
export const processSmartFarmingQuery = async (userQuery: string, contextData?: any): Promise<string> => {
  const aiTrainer = new SmartAgricultureAITrainer();
  return await aiTrainer.generateTrainedResponse(userQuery, contextData);
};

export const isHelpEnabledElement = (elementId: string): boolean => {
  return elementId in HELP_CONTENT_MAPPINGS;
};
