/**
 * Utility to add a sample forecast to daily_forecasts collection
 * This will create the collection in Firebase if it doesn't exist
 * Run this once to initialize the collection with sample data
 */

import { firestoreService } from '../services/firestoreService';

export async function addSampleForecast() {
  try {
    console.log('Adding sample forecast to daily_forecasts collection...');

    // Sample forecast data matching your ML model output
    const sampleForecast = {
      cycle_id: 'cycle_001', // Links to harvest_cycles collection
      days_elapsed: 15,
      forecast_timestamp: new Date().toISOString(),
      
      // ML Model Predictions
      forecasted_yield_g_plant: 91.9, // From your RandomForestRegressor
      forecasted_harvest_days: 33.0, // From your model
      total_forecasted_yield_g: 1286.6, // Calculated: 91.9 * 14 plants
      
      // Context Data (used for prediction)
      current_height_cm: 45.5,
      current_avg_temp: 28.5,
      current_avg_humidity: 65.2,
      current_avg_moisture: 55.8,
      active_plant_count_used: 14
    };

    const success = await firestoreService.addDailyForecast(sampleForecast);

    if (success) {
      console.log('✅ Sample forecast added successfully!');
      console.log('📊 Check Firebase Console: daily_forecasts collection should now exist');
      console.log('Sample data:', sampleForecast);
      return true;
    } else {
      console.error('❌ Failed to add sample forecast');
      return false;
    }
  } catch (error) {
    console.error('❌ Error adding sample forecast:', error);
    return false;
  }
}

// Multiple samples for testing charts
export async function addMultipleSampleForecasts() {
  try {
    console.log('Adding multiple sample forecasts...');
    
    const forecasts = [
      {
        cycle_id: 'cycle_001',
        days_elapsed: 5,
        forecast_timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        forecasted_yield_g_plant: 75.2,
        forecasted_harvest_days: 38.0,
        total_forecasted_yield_g: 1052.8,
        current_height_cm: 15.3,
        current_avg_temp: 27.8,
        current_avg_humidity: 68.5,
        current_avg_moisture: 60.2,
        active_plant_count_used: 14
      },
      {
        cycle_id: 'cycle_001',
        days_elapsed: 10,
        forecast_timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        forecasted_yield_g_plant: 85.6,
        forecasted_harvest_days: 35.5,
        total_forecasted_yield_g: 1198.4,
        current_height_cm: 32.8,
        current_avg_temp: 28.2,
        current_avg_humidity: 66.8,
        current_avg_moisture: 57.5,
        active_plant_count_used: 14
      },
      {
        cycle_id: 'cycle_001',
        days_elapsed: 15,
        forecast_timestamp: new Date().toISOString(),
        forecasted_yield_g_plant: 91.9,
        forecasted_harvest_days: 33.0,
        total_forecasted_yield_g: 1286.6,
        current_height_cm: 45.5,
        current_avg_temp: 28.5,
        current_avg_humidity: 65.2,
        current_avg_moisture: 55.8,
        active_plant_count_used: 14
      }
    ];

    let successCount = 0;
    for (const forecast of forecasts) {
      const success = await firestoreService.addDailyForecast(forecast);
      if (success) {
        successCount++;
        console.log(`✅ Added forecast for day ${forecast.days_elapsed}`);
      }
    }

    console.log(`\n📊 Added ${successCount}/${forecasts.length} sample forecasts`);
    console.log('🔥 Check Firebase Console: daily_forecasts collection');
    return successCount === forecasts.length;
  } catch (error) {
    console.error('❌ Error adding multiple forecasts:', error);
    return false;
  }
}
