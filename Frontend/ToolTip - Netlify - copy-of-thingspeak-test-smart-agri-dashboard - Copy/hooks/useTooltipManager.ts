import { useState, useEffect, useRef, useCallback } from 'react';
import { tooltipManager } from '../utils/tooltipManager';

export const useTooltipManager = () => {
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(() => tooltipManager.getEnabled());
  const toggleTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const handleTooltipStateChange = (event: CustomEvent) => {
      if (mountedRef.current) {
        setIsTooltipEnabled(event.detail.enabled);
      }
    };

    // Listen for tooltip state changes
    window.addEventListener('tooltipStateChanged', handleTooltipStateChange as EventListener);
    
    return () => {
      mountedRef.current = false;
      window.removeEventListener('tooltipStateChanged', handleTooltipStateChange as EventListener);
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current);
      }
    };
  }, []);

  const toggleTooltip = useCallback(() => {
    // Prevent rapid toggling that might cause issues
    if (toggleTimeoutRef.current) {
      clearTimeout(toggleTimeoutRef.current);
    }
    
    toggleTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        tooltipManager.toggle();
      }
    }, 50);
  }, []);

  return {
    isTooltipEnabled,
    toggleTooltip
  };
};
