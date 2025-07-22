import React, { useState, useRef, useEffect } from 'react';
import { tooltipManager } from '../utils/tooltipManager';
import { useTooltip } from '../hooks/useTooltip';
import { TooltipContent } from '../constants/tooltipContent';

interface SmartTooltipProps {
  // Either provide content directly or use the smart tooltip system
  content?: string | TooltipContent;
  
  // Smart tooltip system props
  tooltipType?: 'sensor' | 'status' | 'chart' | 'analytics' | 'ml';
  tooltipKey?: string;
  
  // Regular tooltip props
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  delay?: number;
  showTitle?: boolean; // Whether to show the title in addition to content
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  tooltipType,
  tooltipKey,
  children,
  className = '',
  position = 'top',
  maxWidth = '300px',
  delay = 500,
  showTitle = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(() => tooltipManager.getEnabled());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // Get tooltip content from the smart tooltip system
  const { getTooltip } = useTooltip();

  // Subscribe to tooltip manager state changes
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
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // If tooltips are disabled globally, don't show anything
  if (!isTooltipEnabled) {
    return <>{children}</>;
  }

  // Get the tooltip content
  const getTooltipContent = (): { title?: string; content: string } => {
    // If content is provided directly
    if (content) {
      if (typeof content === 'string') {
        return { content };
      } else if (content && typeof content === 'object') {
        // Add safety checks for object content
        const title = content.title || undefined;
        const contentText = content.content || 'No description available.';
        return { title, content: contentText };
      }
    }
    
    // If using smart tooltip system
    if (tooltipType && tooltipKey) {
      const smartContent = getTooltip(tooltipType, tooltipKey);
      // Add safety checks to prevent undefined errors
      if (smartContent && typeof smartContent === 'object') {
        return { 
          title: smartContent.title || tooltipKey, 
          content: smartContent.content || 'No description available.' 
        };
      }
    }
    
    // Fallback
    return { content: 'No tooltip content available' };
  };

  const calculatePosition = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = event.clientX;
    let y = event.clientY;
    
    // Adjust position based on preferred position and viewport constraints
    switch (position) {
      case 'top':
        y = rect.top - 10;
        x = rect.left + rect.width / 2;
        break;
      case 'bottom':
        y = rect.bottom + 10;
        x = rect.left + rect.width / 2;
        break;
      case 'left':
        x = rect.left - 10;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + 10;
        y = rect.top + rect.height / 2;
        break;
    }
    
    // Ensure tooltip stays within viewport
    if (x + 150 > viewportWidth) x = viewportWidth - 150;
    if (x < 10) x = 10;
    if (y + 100 > viewportHeight) y = viewportHeight - 100;
    if (y < 10) y = 10;
    
    setTooltipPosition({ x, y });
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    calculatePosition(event);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isVisible) {
      calculatePosition(event);
    }
  };

  const getTooltipClasses = () => {
    const baseClasses = `
      fixed z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg
      pointer-events-none transition-opacity duration-200 ease-in-out
      ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `;
    
    return baseClasses.trim();
  };

  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 bg-gray-800 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseArrow} left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2`;
      case 'right':
        return `${baseArrow} right-full top-1/2 transform -translate-y-1/2 translate-x-1/2`;
      default:
        return baseArrow;
    }
  };

  const tooltipContent = getTooltipContent();

  return (
    <div
      ref={containerRef}
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={getTooltipClasses()}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          maxWidth: maxWidth,
          transform: position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 
                    position === 'left' || position === 'right' ? 'translateY(-50%)' : 'none'
        }}
      >
        <div className={getArrowClasses()}></div>
        <div className="relative z-10">
          {showTitle && tooltipContent.title && (
            <div className="font-semibold text-yellow-300 mb-1">
              {tooltipContent.title}
            </div>
          )}
          <div className="text-gray-100">
            {tooltipContent.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTooltip;
