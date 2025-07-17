import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { debugNavigation, forceNavigationRefresh } from '../utils/navigationDebug';

interface NavigationContextType {
  currentPath: string;
  navigateTo: (path: string) => void;
  isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentPath(location.pathname);
    setIsNavigating(false);
    debugNavigation('Location changed', location.pathname);
  }, [location.pathname]);

  // Reset navigation state after timeout
  useEffect(() => {
    if (isNavigating) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isNavigating]);

  const navigateTo = useCallback((path: string) => {
    if (isNavigating || currentPath === path) {
      debugNavigation('Navigation blocked', `${path} (current: ${currentPath}, isNavigating: ${isNavigating})`);
      return;
    }
    
    setIsNavigating(true);
    debugNavigation('Navigation started', path);
    
    // Primary navigation attempt
    try {
      navigate(path, { replace: false });
      
      // Multiple fallback strategies
      const fallbackStrategies = [
        // Strategy 1: Direct hash manipulation
        () => {
          if (window.location.hash !== `#${path}`) {
            window.location.hash = path;
          }
        },
        // Strategy 2: Force page refresh if needed
        () => {
          forceNavigationRefresh();
        },
        // Strategy 3: Manual location change
        () => {
          window.location.href = `${window.location.origin}${window.location.pathname}#${path}`;
        }
      ];

      // Try fallback strategies with delays
      fallbackStrategies.forEach((strategy, index) => {
        setTimeout(strategy, (index + 1) * 100);
      });
      
    } catch (error) {
      console.error('Navigation error:', error);
      // Emergency fallback
      window.location.hash = path;
    }
  }, [navigate, currentPath, isNavigating]);

  return (
    <NavigationContext.Provider value={{ currentPath, navigateTo, isNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
