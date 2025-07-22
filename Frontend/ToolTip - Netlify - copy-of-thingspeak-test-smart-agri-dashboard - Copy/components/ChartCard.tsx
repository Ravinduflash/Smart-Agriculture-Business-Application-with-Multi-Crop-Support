
import React from 'react';
import Tooltip from './Tooltip';
import SmartTooltip from './SmartTooltip';
import { TooltipContent } from '../constants/tooltipContent';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  tooltipContent?: string | TooltipContent;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className, tooltipContent }) => {
  const cardContent = (
    <div className={`bg-card p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <h3 className="text-base sm:text-lg font-semibold text-textDark mb-1">{title}</h3>
      {subtitle && <p className="text-xs sm:text-sm text-textMedium mb-2 sm:mb-3 line-clamp-2">{subtitle}</p>}
      <div className="h-64 sm:h-80 md:h-96 lg:h-[400px]"> {/* Increased height for better chart display */}
        {children}
      </div>
    </div>
  );

  if (!tooltipContent) {
    return cardContent;
  }

  // Handle both string and TooltipContent object
  if (typeof tooltipContent === 'string') {
    return (
      <Tooltip content={tooltipContent} position="top" maxWidth="350px">
        {cardContent}
      </Tooltip>
    );
  } else {
    return (
      <SmartTooltip content={tooltipContent} position="top" maxWidth="350px">
        {cardContent}
      </SmartTooltip>
    );
  }
};

export default ChartCard;
