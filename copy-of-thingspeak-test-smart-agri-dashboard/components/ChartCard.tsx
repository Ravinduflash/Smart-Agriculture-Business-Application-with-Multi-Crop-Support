
import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={`bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <h3 className="text-lg font-semibold text-textDark mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-textMedium mb-4">{subtitle}</p>}
      <div className="h-64 md:h-80"> {/* Default height, can be overridden by children */}
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
