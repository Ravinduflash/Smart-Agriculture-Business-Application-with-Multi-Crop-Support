# Multi-Language Tooltip System Guide

## Overview
The Smart Agriculture Dashboard now supports multi-language tooltips in English, Tamil, and Sinhala. This system provides expert-level explanations written in farmer-friendly language for all dashboard elements.

## Available Languages
- **English (en)**: Default language
- **Tamil (ta)**: தமிழ்
- **Sinhala (si)**: සිංහල

## How to Use

### 1. Using the Smart Tooltip Component

```tsx
import SmartTooltip from '../components/SmartTooltip';

// For sensor tooltips
<SmartTooltip tooltipType="sensor" tooltipKey="TEMPERATURE">
  <div className="sensor-card">Temperature: 25°C</div>
</SmartTooltip>

// For status tooltips
<SmartTooltip tooltipType="status" tooltipKey="OPTIMAL">
  <div className="status-indicator">✓ Optimal</div>
</SmartTooltip>

// For chart tooltips
<SmartTooltip tooltipType="chart" tooltipKey="LINE_CHART">
  <div className="chart-container">
    {/* Your chart component */}
  </div>
</SmartTooltip>
```

### 2. Using the useTooltip Hook

```tsx
import { useTooltip } from '../hooks/useTooltip';

const MyComponent = () => {
  const { getSensorTooltip, currentLanguage } = useTooltip();
  
  // Get tooltip content
  const temperatureTooltip = getSensorTooltip('TEMPERATURE');
  
  return (
    <div>
      <h3>{temperatureTooltip.title}</h3>
      <p>{temperatureTooltip.content}</p>
      <small>Current language: {currentLanguage}</small>
    </div>
  );
};
```

### 3. Available Tooltip Types

#### Sensor Tooltips
- `TEMPERATURE`: Air temperature around crops
- `HUMIDITY`: Air humidity levels
- `SOIL_MOISTURE`: Soil moisture content
- `SOIL_TEMPERATURE`: Soil temperature
- `LIGHT_INTENSITY`: Light intensity in Lux
- `SOIL_PH`: Soil pH levels
- `NITROGEN`: Soil nitrogen content
- `PHOSPHORUS`: Soil phosphorus content
- `POTASSIUM`: Soil potassium content
- `AIR_QUALITY`: Air quality measurements
- `RAIN_SENSOR`: Rain detection
- `HISTORICAL_DATA`: Historical data charts

#### Status Tooltips
- `OPTIMAL`: Perfect conditions
- `STABLE`: Good conditions
- `WARNING`: Approaching problematic levels
- `CRITICAL`: Needs immediate attention
- `DRY_NEEDS_IRRIGATION`: Soil too dry
- `OPTIMAL_MOISTURE`: Perfect moisture
- `WET_REDUCE_IRRIGATION`: Soil too wet
- `WATERLOGGED`: Soil waterlogged
- `TOO_COLD`: Temperature too low
- `OPTIMAL_TEMPERATURE`: Perfect temperature
- `TOO_HOT`: Temperature too high
- `TOO_DRY`: Air too dry
- `OPTIMAL_HUMIDITY`: Perfect humidity
- `TOO_HUMID`: Air too humid
- `TOO_DARK`: Not enough light
- `ADEQUATE_LIGHT`: Good light levels
- `INTENSE_LIGHT`: Very bright light
- `NO_RAIN`: No rainfall
- `LIGHT_RAIN`: Light rainfall
- `HEAVY_RAIN`: Heavy rainfall

#### Chart Tooltips
- `AREA_CHART`: Area chart explanation
- `LINE_CHART`: Line chart explanation
- `BAR_CHART`: Bar chart explanation
- `TEMPERATURE_CHART`: Temperature chart
- `HUMIDITY_CHART`: Humidity chart
- `MOISTURE_CHART`: Soil moisture chart
- `LIGHT_CHART`: Light intensity chart
- `NPK_CHART`: NPK nutrient chart

#### Analytics Tooltips
- `MONTHLY_YIELD`: Monthly yield analysis
- `SOIL_MOISTURE_TRENDS`: Soil moisture trends
- `PEST_INCIDENCE`: Pest incidence analysis
- `METRICS_CARDS`: Performance metrics
- `AI_DATA_ANALYST`: AI data analyst

#### ML Models Tooltips
- `YIELD_PREDICTION`: Yield prediction model
- `DISEASE_DETECTION`: Disease detection model
- `CROP_RECOMMENDATION`: Crop recommendation model
- `OPTIMAL_PLANTING`: Optimal planting time model
- `HARVESTING_TIME`: Harvesting time model
- `TRAINING_HUB`: AI training hub

## Language Switching
The tooltips automatically switch language when the user changes the language in the dashboard. The system:
1. Uses the current language from `LanguageContext`
2. Falls back to English if content is not available in the selected language
3. Provides default content if no translation is found

## Customization

### Adding New Tooltip Content
To add new tooltip content, update the `tooltipContent.ts` file:

```typescript
export const SENSOR_TOOLTIPS: TooltipContentByLanguage = {
  en: {
    NEW_SENSOR: {
      title: "New Sensor",
      content: "Description of the new sensor..."
    }
  },
  ta: {
    NEW_SENSOR: {
      title: "புதிய சென்சார்",
      content: "புதிய சென்சாரின் விளக்கம்..."
    }
  },
  si: {
    NEW_SENSOR: {
      title: "නව සංවේදකය",
      content: "නව සංවේදකයේ විස්තරය..."
    }
  }
};
```

### Styling
The tooltips use Tailwind CSS classes and can be customized by modifying the `SmartTooltip` component. Key styling features:
- Dark theme with gray-800 background
- Yellow title text for better contrast
- Responsive positioning
- Smooth animations
- Maximum width control

## Migration from Old System
If you're migrating from the old tooltip system:

1. **Keep existing tooltips**: The `useTooltip` hook still supports the old `getTooltipContent` method
2. **Gradually migrate**: Use `SmartTooltip` component for new tooltips
3. **Update components**: Replace `Tooltip` with `SmartTooltip` where needed

## Best Practices
1. **Use descriptive keys**: Choose clear, descriptive keys for tooltips
2. **Keep content concise**: While detailed, keep explanations farmer-friendly
3. **Test all languages**: Ensure tooltips work correctly in all supported languages
4. **Use fallbacks**: Always provide English content as a fallback
5. **Consistent terminology**: Use consistent terms across all languages

## Examples

### Sensor Card with Tooltip
```tsx
<SmartTooltip tooltipType="sensor" tooltipKey="TEMPERATURE" position="top">
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold">Temperature</h3>
    <p className="text-2xl text-blue-600">25°C</p>
  </div>
</SmartTooltip>
```

### Status Indicator with Tooltip
```tsx
<SmartTooltip tooltipType="status" tooltipKey="OPTIMAL" position="bottom">
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
    ✓ Optimal
  </span>
</SmartTooltip>
```

### Chart with Tooltip
```tsx
<SmartTooltip tooltipType="chart" tooltipKey="LINE_CHART" position="left">
  <div className="chart-container">
    <LineChart data={chartData} />
  </div>
</SmartTooltip>
```

This system provides a comprehensive, scalable solution for multi-language tooltips that enhances the user experience for farmers across different language communities.
