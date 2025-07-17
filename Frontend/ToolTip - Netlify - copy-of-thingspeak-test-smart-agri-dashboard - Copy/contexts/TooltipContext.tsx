import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TooltipContextType {
  isTooltipEnabled: boolean;
  toggleTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};

interface TooltipProviderProps {
  children: ReactNode;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(false); // Default to OFF

  // Load tooltip preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tooltipEnabled');
      if (saved) {
        setIsTooltipEnabled(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Error loading tooltip preference:', error);
    }
  }, []);

  const toggleTooltip = () => {
    setIsTooltipEnabled(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('tooltipEnabled', JSON.stringify(newValue));
      } catch (error) {
        console.warn('Error saving tooltip preference:', error);
      }
      return newValue;
    });
  };

  return (
    <TooltipContext.Provider value={{
      isTooltipEnabled,
      toggleTooltip
    }}>
      {children}
    </TooltipContext.Provider>
  );
};

export default TooltipContext;
