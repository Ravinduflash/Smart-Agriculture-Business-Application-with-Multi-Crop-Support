import React from 'react';
import { useTooltip } from '../hooks/useTooltip';

/**
 * Example component showing how to use the multi-language tooltip system
 * This component demonstrates how to get tooltips for different types of content
 */
const TooltipExample: React.FC = () => {
  const { getSensorTooltip, getStatusTooltip, getChartTooltip, currentLanguage } = useTooltip();

  // Example usage of different tooltip types
  const temperatureTooltip = getSensorTooltip('TEMPERATURE');
  const humidityTooltip = getSensorTooltip('HUMIDITY');
  const soilMoistureTooltip = getSensorTooltip('SOIL_MOISTURE');
  
  const optimalStatusTooltip = getStatusTooltip('OPTIMAL');
  const warningStatusTooltip = getStatusTooltip('WARNING');
  
  const lineChartTooltip = getChartTooltip('LINE_CHART');
  const areaChartTooltip = getChartTooltip('AREA_CHART');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Multi-Language Tooltip System Demo</h2>
      <p>Current Language: <strong>{currentLanguage}</strong></p>
      
      <h3>Sensor Tooltips</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Temperature:</strong> {temperatureTooltip?.title || 'Temperature'}
        <br />
        <small>{temperatureTooltip?.content || 'No information available'}</small>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Humidity:</strong> {humidityTooltip?.title || 'Humidity'}
        <br />
        <small>{humidityTooltip?.content || 'No information available'}</small>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Soil Moisture:</strong> {soilMoistureTooltip?.title || 'Soil Moisture'}
        <br />
        <small>{soilMoistureTooltip?.content || 'No information available'}</small>
      </div>

      <h3>Status Tooltips</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Optimal:</strong> {optimalStatusTooltip?.title || 'Optimal'}
        <br />
        <small>{optimalStatusTooltip?.content || 'No information available'}</small>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Warning:</strong> {warningStatusTooltip?.title || 'Warning'}
        <br />
        <small>{warningStatusTooltip?.content || 'No information available'}</small>
      </div>

      <h3>Chart Tooltips</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Line Chart:</strong> {lineChartTooltip?.title || 'Line Chart'}
        <br />
        <small>{lineChartTooltip?.content || 'No information available'}</small>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Area Chart:</strong> {areaChartTooltip?.title || 'Area Chart'}
        <br />
        <small>{areaChartTooltip?.content || 'No information available'}</small>
      </div>
    </div>
  );
};

export default TooltipExample;
