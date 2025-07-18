
import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={`bg-card p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <h3 className="text-base sm:text-lg font-semibold text-textDark mb-1">{title}</h3>
      {subtitle && <p className="text-xs sm:text-sm text-textMedium mb-3 sm:mb-4 line-clamp-2">{subtitle}</p>}
      <div className="h-48 sm:h-64 md:h-80"> {/* Responsive height */}
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
