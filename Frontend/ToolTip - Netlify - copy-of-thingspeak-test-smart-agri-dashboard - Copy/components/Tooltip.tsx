import React, { useState, useRef, useEffect } from 'react';
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = '',
  position = 'top',
  maxWidth = '300px',
  delay = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
          {content}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
