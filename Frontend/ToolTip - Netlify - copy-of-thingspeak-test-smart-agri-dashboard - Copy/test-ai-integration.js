// Test script for Google Gemini AI integration
// Run this to verify the AI training system is working

import { processSmartFarmingQuery } from './services/helpContentService';

async function testGeminiIntegration() {
  console.log('🚀 Testing Google Gemini AI Integration...');
  
  try {
    // Test basic query
    const response = await processSmartFarmingQuery(
      'How do I add a new crop to my farm?',
      { currentPage: 'dashboard', timestamp: new Date().toISOString() }
    );
    
    console.log('✅ AI Response:', response);
    
    // Test ML models query
    const mlResponse = await processSmartFarmingQuery(
      'What ML models are available and how do I train them?',
      { currentPage: 'ml-models', timestamp: new Date().toISOString() }
    );
    
    console.log('✅ ML Models Response:', mlResponse);
    
    console.log('🎉 Google Gemini AI integration is working!');
  } catch (error) {
    console.error('❌ Error testing AI integration:', error);
    console.log('Make sure you have set your REACT_APP_GEMINI_API_KEY in the .env file');
  }
}

// Uncomment to run the test
// testGeminiIntegration();

export default testGeminiIntegration;
