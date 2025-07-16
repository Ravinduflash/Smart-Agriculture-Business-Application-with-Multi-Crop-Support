// Tooltip content for smart agriculture dashboard
// Expert-level explanations written in farmer-friendly language

export const SENSOR_TOOLTIPS = {
  TEMPERATURE: {
    title: "Air Temperature",
    content: "This measures the temperature of the air around your crops. Temperature affects how fast plants grow, when they flower, and how much water they need. Most crops grow best between 20-30°C (68-86°F). If it's too hot (above 35°C), plants may stop growing or become stressed. If it's too cold (below 15°C), growth slows down significantly."
  },
  
  HUMIDITY: {
    title: "Air Humidity",
    content: "This shows how much moisture is in the air around your crops. Humidity affects disease risk and water loss from plant leaves. Ideal humidity is 50-70% for most crops. High humidity (above 80%) can cause fungal diseases and mold. Low humidity (below 40%) makes plants lose water faster and may cause leaf burn."
  },
  
  SOIL_MOISTURE: {
    title: "Soil Moisture",
    content: "This measures how much water is in the soil around plant roots. The reading shows raw sensor values (ADC) - lower numbers mean more moisture. Most crops need consistent moisture but not waterlogged soil. The ideal range varies by crop: vegetables need more water than grains. Too dry means plants wilt; too wet means roots can rot."
  },
  
  SOIL_TEMPERATURE: {
    title: "Soil Temperature",
    content: "This measures the temperature of the soil where plant roots grow. Soil temperature affects root development, nutrient uptake, and seed germination. Most crops prefer soil temperatures between 18-24°C (64-75°F). Cold soil (below 10°C) slows root growth. Hot soil (above 30°C) can damage roots and reduce water absorption."
  },
  
  LIGHT_INTENSITY: {
    title: "Light Intensity",
    content: "This measures how much light is reaching your crops, shown in 'Lux' units. Plants need light for photosynthesis (making food). Full sunlight is about 50,000-100,000 Lux. Most crops need at least 10,000 Lux for good growth. Too little light means weak, spindly plants. Some crops like lettuce can grow with less light than others like tomatoes."
  },
  
  SOIL_PH: {
    title: "Soil pH (Acidity/Alkalinity)",
    content: "This measures how acidic or alkaline your soil is on a scale from 0-14. A pH of 7 is neutral. Below 7 is acidic (sour), above 7 is alkaline (basic). Most crops grow best in slightly acidic to neutral soil (pH 6.0-7.0). Wrong pH prevents plants from absorbing nutrients even if they're present in the soil."
  },
  
  NITROGEN: {
    title: "Soil Nitrogen (N)",
    content: "Nitrogen is the nutrient that makes plants grow green and leafy. It's essential for stem and leaf development. Plants with enough nitrogen have dark green leaves and strong growth. Too little nitrogen causes yellow leaves and stunted growth. Too much nitrogen causes excessive leaf growth but poor fruit/grain production."
  },
  
  PHOSPHORUS: {
    title: "Soil Phosphorus (P)",
    content: "Phosphorus helps plants develop strong roots, flowers, and fruits. It's crucial for seed formation and energy transfer within plants. Plants with enough phosphorus have good root systems and flower/fruit well. Too little phosphorus causes purple leaves and poor flowering. It's especially important during planting and flowering stages."
  },
  
  POTASSIUM: {
    title: "Soil Potassium (K)",
    content: "Potassium helps plants resist disease, cope with stress, and produce quality fruits. It regulates water movement and helps plants use other nutrients efficiently. Plants with enough potassium have strong stems and good disease resistance. Too little potassium causes brown leaf edges and weak plants that are easily damaged by wind or disease."
  },
  
  AIR_QUALITY: {
    title: "Air Quality (Gas Sensor)",
    content: "This measures harmful gases in the air around your crops, shown in PPM (Parts Per Million). It detects gases like ammonia from fertilizers, carbon dioxide, and other airborne chemicals. High levels of harmful gases can damage plant leaves and reduce growth. Good air quality means healthier plants and better yields."
  },
  
  RAIN_SENSOR: {
    title: "Rain Detection",
    content: "This sensor detects rainfall and measures its intensity. It shows readings like 'No Rain', 'Light Rain', or 'Heavy Rain'. Rain provides natural irrigation but too much can cause waterlogging and disease. Knowing rain patterns helps you plan irrigation - you can reduce watering when rain is expected and increase it during dry periods."
  },
  
  HISTORICAL_DATA: {
    title: "Historical Data Charts",
    content: "These charts show how your sensor readings have changed over time - hours, days, or weeks. Trends help you understand patterns in your field conditions. For example, you might see soil moisture dropping each day, telling you when to irrigate. Or temperature patterns might help you predict when pests will be active. Use these trends to make better farming decisions."
  }
};

// Tooltip content for different sensor statuses
export const STATUS_TOOLTIPS = {
  OPTIMAL: "Conditions are perfect for plant growth and health.",
  STABLE: "Conditions are good and within acceptable ranges.",
  WARNING: "Conditions are approaching problematic levels - monitor closely.",
  CRITICAL: "Conditions need immediate attention to prevent crop damage.",
  
  // Soil Moisture specific
  DRY_NEEDS_IRRIGATION: "Soil is too dry - plants may be stressed and need water soon.",
  OPTIMAL_MOISTURE: "Soil moisture is perfect for healthy plant growth.",
  WET_REDUCE_IRRIGATION: "Soil is quite wet - reduce watering to prevent root problems.",
  WATERLOGGED: "Soil is too wet - drainage needed to prevent root rot.",
  
  // Temperature specific
  TOO_COLD: "Temperature is too low - plant growth will be slow.",
  OPTIMAL_TEMPERATURE: "Temperature is perfect for plant growth.",
  TOO_HOT: "Temperature is too high - plants may be stressed.",
  
  // Humidity specific
  TOO_DRY: "Air is too dry - plants may lose water quickly.",
  OPTIMAL_HUMIDITY: "Air humidity is perfect for plant health.",
  TOO_HUMID: "Air is too humid - risk of fungal diseases increases.",
  
  // Light specific
  TOO_DARK: "Not enough light - plants may grow weak and spindly.",
  ADEQUATE_LIGHT: "Good light levels for plant growth.",
  INTENSE_LIGHT: "Very bright light - may cause leaf burn in sensitive plants.",
  
  // Rain specific
  NO_RAIN: "No rainfall detected - irrigation may be needed.",
  LIGHT_RAIN: "Light rainfall - good for gentle watering.",
  HEAVY_RAIN: "Heavy rainfall - may cause waterlogging if prolonged.",
  
  // NPK specific
  NPK_DEFICIENCY: "One or more nutrients are too low - fertilizer may be needed.",
  NPK_OPTIMAL: "All nutrients are at good levels for plant growth.",
  NPK_EXCESS: "Some nutrients are too high - may cause imbalanced growth.",
  
  // General
  NOT_AVAILABLE: "Sensor data is not currently available - check sensor connection."
};

// Chart-specific tooltips
export const CHART_TOOLTIPS = {
  AREA_CHART: "This area chart shows how values change over time. The colored area makes it easy to see trends and patterns.",
  LINE_CHART: "This line chart shows the exact progression of values over time. Each point represents a sensor reading.",
  BAR_CHART: "This bar chart compares values across different time periods or categories.",
  TEMPERATURE_CHART: "Track temperature changes to optimize planting times and predict plant development stages.",
  HUMIDITY_CHART: "Monitor humidity patterns to prevent diseases and optimize irrigation timing.",
  MOISTURE_CHART: "Watch soil moisture trends to perfect your irrigation schedule and avoid over/under-watering.",
  LIGHT_CHART: "Track light patterns to understand how much sunlight your crops receive throughout the day.",
  NPK_CHART: "Monitor nutrient levels over time to know when and how much fertilizer to apply."
};

// Analytics page tooltips
export const ANALYTICS_TOOLTIPS = {
  MONTHLY_YIELD: "This chart shows your crop yields month by month. Use this to identify seasonal patterns, track improvements, and plan better harvest schedules. Higher bars indicate more productive months.",
  SOIL_MOISTURE_TRENDS: "This chart tracks soil moisture levels over time. It helps you understand seasonal moisture patterns and optimize your irrigation schedule. Consistent moisture levels usually lead to better crop growth.",
  PEST_INCIDENCE: "This chart shows the percentage of pest problems over time. Use it to identify when pests are most active and plan preventive treatments. Lower percentages indicate better pest control.",
  METRICS_CARDS: "These cards show key performance indicators for your farm. They provide quick insights into your overall farm health and productivity. Green status indicates good performance, yellow shows areas for improvement, and red indicates issues needing attention.",
  AI_DATA_ANALYST: "This AI-powered tool analyzes all your farm data and provides personalized insights and recommendations. It can identify patterns you might miss and suggest actionable improvements for better crop yields."
};

// ML Models page tooltips  
export const ML_MODELS_TOOLTIPS = {
  YIELD_PREDICTION: "This AI model predicts your future crop yields based on current growing conditions, weather patterns, and historical data. Higher accuracy means more reliable predictions. Use these predictions to plan harvesting, storage, and market timing.",
  DISEASE_DETECTION: "This AI model analyzes plant images to detect diseases early before they spread. It can identify various plant diseases and suggest treatments. Early detection saves crops and reduces losses.",
  CROP_RECOMMENDATION: "This AI model will analyze your soil conditions, climate, and market prices to recommend the best crops to plant. It considers factors like profitability, growing requirements, and seasonal timing to maximize your success.",
  OPTIMAL_PLANTING: "This AI model will predict the best times to plant different crops based on weather forecasts, soil conditions, and historical data. Proper timing can significantly improve crop yields and reduce risks.",
  HARVESTING_TIME: "This AI model will estimate the optimal harvest time for your crops based on growth stages, weather conditions, and market prices. Harvesting at the right time ensures maximum quality and profitability.",
  TRAINING_HUB: "This section will allow you to train custom AI models using your own farm data. You can upload data, configure model parameters, and create personalized AI tools for your specific farming needs."
};

// Dashboard-specific tooltips
export const DASHBOARD_TOOLTIPS = {
  SENSOR_GRID: "This grid shows real-time readings from all your sensors. Click on any card to see detailed information and historical charts.",
  AI_ADVISOR: "The AI Farming Advisor analyzes your current sensor data and provides personalized recommendations for better crop management.",
  QUICK_ACTIONS: "These buttons provide quick access to common farming tasks and detailed sensor information."
};
