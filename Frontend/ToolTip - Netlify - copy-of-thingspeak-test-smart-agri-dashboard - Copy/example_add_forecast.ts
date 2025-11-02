/**
 * Example: How to Add Daily Forecast from ML Model
 * 
 * This shows how to save your crop yield prediction model results
 * to the daily_forecasts collection in Firestore
 */

import { firestoreService } from './src/services/firestoreService';

// Example function to add a daily forecast
async function addForecastExample() {
  
  // Sample data from your ML model output
  // This would come from your Python model or Cloud Function
  const forecastData = {
    cycle_id: "cycle_002",                    // Link to active harvest cycle
    days_elapsed: 15,                         // Days since planting
    forecast_timestamp: new Date().toISOString(), // When forecast was made
    
    // ML Model Predictions (from your Jupyter notebook output)
    forecasted_yield_g_plant: 91.9,          // "Predicted Yield: 91.9 g/plant"
    forecasted_harvest_days: 33.0,           // "Predicted Harvest Time: 33.0 days"
    total_forecasted_yield_g: 91.9 * 14,     // Total for all plants (1286.6 g)
    
    // Context data (optional but useful for dashboard)
    current_height_cm: 16.5,                 // From harvest_cycles.current_height_cm
    current_avg_temp: 28.2,                  // From recent sensor readings average
    current_avg_humidity: 72.5,              // From recent sensor readings average
    current_avg_moisture: 45000,             // From recent sensor readings average
    active_plant_count_used: 14              // From harvest_cycles
  };

  // Save to Firestore
  const success = await firestoreService.addDailyForecast(forecastData);
  
  if (success) {
    console.log('✅ Forecast saved successfully!');
  } else {
    console.error('❌ Failed to save forecast');
  }
}

// Example: Get all forecasts for a specific harvest cycle
async function getForecasts() {
  const cycleId = "cycle_002";
  
  // Get all forecasts for this cycle (sorted by days_elapsed)
  const forecasts = await firestoreService.getDailyForecastsByCycle(cycleId);
  
  console.log(`Found ${forecasts.length} forecasts for ${cycleId}`);
  forecasts.forEach(f => {
    console.log(`Day ${f.days_elapsed}: ${f.forecasted_yield_g_plant} g/plant`);
  });
}

// Example: Get the latest forecast only
async function getLatestForecast() {
  const cycleId = "cycle_002";
  
  const latest = await firestoreService.getLatestForecastByCycle(cycleId);
  
  if (latest) {
    console.log('Latest Forecast:');
    console.log(`  Day: ${latest.days_elapsed}`);
    console.log(`  Yield: ${latest.forecasted_yield_g_plant} g/plant`);
    console.log(`  Total: ${latest.total_forecasted_yield_g} g`);
    console.log(`  Harvest in: ${latest.forecasted_harvest_days} days`);
  } else {
    console.log('No forecasts found');
  }
}

// Usage:
// 1. Call addForecastExample() when your ML model generates a prediction
// 2. Call getForecasts() to show forecast history in your dashboard
// 3. Call getLatestForecast() to show current prediction

export { addForecastExample, getForecasts, getLatestForecast };
