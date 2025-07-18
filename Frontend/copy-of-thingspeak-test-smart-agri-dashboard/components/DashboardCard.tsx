
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: string; // This will be the translated display string
  icon?: React.ReactNode; // Sensor specific icon
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  children?: React.ReactNode;
  onCardClick?: () => void; // To make the whole card clickable
  chartActionIcon?: React.ReactNode; // The new chart icon
  onChartActionClick?: () => void; // Click handler for the new chart icon
  chartActionIconAriaLabel?: string; // Aria-label for the chart icon button
  detailsLinkText?: string; // Text for the "See More" link
  onDetailsLinkClick?: () => void; // Click handler for the "See More" link
  statusTextColorClass?: string; // New prop for specific text color of status
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, value, unit, status, icon, trend, trendValue, children,
  onCardClick, chartActionIcon, onChartActionClick, chartActionIconAriaLabel,
  detailsLinkText, onDetailsLinkClick, statusTextColorClass
}) => {
  const trendIcon = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '';
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onCardClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onCardClick();
    }
  };

  return (
    <div 
      className={`bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between ${onCardClick ? 'cursor-pointer' : ''}`}
      onClick={onCardClick}
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={handleCardKeyDown}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-textMedium">{title}</h3>
          <div className="flex items-center space-x-2">
            {chartActionIcon && onChartActionClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card's onClick from firing
                  onChartActionClick();
                }}
                className="text-gray-500 hover:text-primary focus:outline-none p-1 -m-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={chartActionIconAriaLabel || 'View chart details'}
              >
                {chartActionIcon}
              </button>
            )}
            {icon && <div className="text-primary">{icon}</div>}
          </div>
        </div>
        <div className="text-3xl font-bold text-textDark">
          {value}
          {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
        </div>
        {status && <p className={`text-sm mt-1 ${statusTextColorClass || 'text-gray-500'}`}>{status}</p>}
        {trend && trendValue && (
          <p className={`text-sm mt-1 ${trendColor} flex items-center`}>
            <span className="mr-1">{trendIcon}</span>
            {trendValue}
          </p>
        )}
      </div>
      
      {/* Details Link and Children section */}
      <div className="mt-auto pt-2"> {/* Ensures this section is pushed to the bottom */}
        {detailsLinkText && onDetailsLinkClick && (
          <div className="text-right mt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                onDetailsLinkClick();
              }}
              className="text-sm text-primary hover:text-primary-dark hover:underline focus:outline-none"
              aria-label={`${detailsLinkText} for ${title}`}
            >
              {detailsLinkText}
            </button>
          </div>
        )}
        {children && <div className={`mt-2 ${detailsLinkText ? 'pt-2 border-t border-gray-100' : ''}`}>{children}</div>}
      </div>
    </div>
  );
};

export default DashboardCard;