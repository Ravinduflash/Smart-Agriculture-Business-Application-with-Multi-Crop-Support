import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface HelpableElement {
  id: string;
  name: string;
  description: string;
  category: 'sensor' | 'chart' | 'card' | 'widget' | 'component';
  contextData?: any;
}

interface HelpModeContextType {
  isHelpModeActive: boolean;
  setHelpModeActive: (active: boolean) => void;
  activeHelpElement: HelpableElement | null;
  setActiveHelpElement: (element: HelpableElement | null) => void;
  helpableElements: Map<string, HelpableElement>;
  registerHelpableElement: (element: HelpableElement) => void;
  unregisterHelpableElement: (id: string) => void;
  handleHelpElementClick: (elementId: string) => void;
  onHelpElementClicked?: (elementId: string, element: HelpableElement | null) => void;
}

const HelpModeContext = createContext<HelpModeContextType | undefined>(undefined);

export const useHelpMode = () => {
  const context = useContext(HelpModeContext);
  if (!context) {
    throw new Error('useHelpMode must be used within a HelpModeProvider');
  }
  return context;
};

interface HelpModeProviderProps {
  children: ReactNode;
  onHelpElementClicked?: (elementId: string, element: HelpableElement | null) => void;
}

export const HelpModeProvider: React.FC<HelpModeProviderProps> = ({ 
  children, 
  onHelpElementClicked 
}) => {
  const [isHelpModeActive, setIsHelpModeActive] = useState(false);
  const [activeHelpElement, setActiveHelpElement] = useState<HelpableElement | null>(null);
  const [helpableElements, setHelpableElements] = useState<Map<string, HelpableElement>>(new Map());

  const setHelpModeActive = useCallback((active: boolean) => {
    setIsHelpModeActive(active);
    if (!active) {
      setActiveHelpElement(null);
    }
    // Change cursor style when help mode is active
    if (active) {
      document.body.style.cursor = 'help';
    } else {
      document.body.style.cursor = 'default';
    }
  }, []);

  const registerHelpableElement = useCallback((element: HelpableElement) => {
    setHelpableElements(prev => new Map(prev).set(element.id, element));
  }, []);

  const unregisterHelpableElement = useCallback((id: string) => {
    setHelpableElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const handleHelpElementClick = useCallback((elementId: string) => {
    if (!isHelpModeActive) return;
    
    const element = helpableElements.get(elementId);
    if (element) {
      setActiveHelpElement(element);
      if (onHelpElementClicked) {
        onHelpElementClicked(elementId, element);
      }
    } else {
      // If no helpable element found, set a generic "not helpable" element
      const notHelpableElement: HelpableElement = {
        id: 'not-helpable',
        name: 'Non-helpable element',
        description: 'This element doesn\'t have help information available. Please click on a specific data card, chart, or sensor reading to learn more about it.',
        category: 'component'
      };
      setActiveHelpElement(notHelpableElement);
      if (onHelpElementClicked) {
        onHelpElementClicked(elementId, notHelpableElement);
      }
    }
  }, [isHelpModeActive, helpableElements, onHelpElementClicked]);

  // Global click listener for help mode - Only active when help mode is enabled
  useEffect(() => {
    // TEMPORARILY DISABLED FOR TESTING
    // Only handle clicks when help mode is explicitly active
    if (!isHelpModeActive) return;

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check for navigation elements - be more specific and comprehensive
      const isNavigationLink = target.closest('a[href]') || 
                              target.tagName === 'A' ||
                              target.closest('button:not([data-help-id])') ||
                              target.tagName === 'BUTTON' && !target.getAttribute('data-help-id') ||
                              target.closest('[role="button"]:not([data-help-id])') ||
                              target.closest('[data-navigate]') ||
                              target.closest('nav') ||
                              target.closest('aside') ||
                              target.closest('.sidebar') ||
                              target.closest('[class*="nav"]') ||
                              target.closest('[class*="menu"]') ||
                              target.closest('[role="menuitem"]') ||
                              target.closest('input') ||
                              target.closest('select') ||
                              target.closest('textarea') ||
                              target.closest('[contenteditable]') ||
                              target.closest('.fixed.z-50') ||
                              // React Router specific
                              target.closest('[class*="active"]') ||
                              target.closest('[aria-current]') ||
                              // Form elements
                              target.closest('form') ||
                              target.closest('label') ||
                              // Interactive elements
                              target.closest('[tabindex]:not([data-help-id])') ||
                              target.closest('[onclick]:not([data-help-id])') ||
                              // Modal or popup elements
                              target.closest('[role="dialog"]') ||
                              target.closest('[role="modal"]') ||
                              target.closest('.modal') ||
                              target.closest('.popup');

      // If click is on navigation/interactive element, don't interfere
      if (isNavigationLink) {
        return; // Allow normal behavior
      }
      
      // Only handle help clicks on elements that are specifically marked as helpable
      const helpElement = target.closest('[data-help-id]');
      if (helpElement) {
        event.preventDefault();
        event.stopPropagation();
        
        const helpId = helpElement.getAttribute('data-help-id');
        if (helpId) {
          handleHelpElementClick(helpId);
        }
      } else {
        // For non-helpable elements, only prevent default if we're sure it's not interactive
        const isInteractiveElement = target.closest('a, button, input, select, textarea, [role="button"], [tabindex], [onclick]');
        if (!isInteractiveElement) {
          event.preventDefault();
          event.stopPropagation();
          handleHelpElementClick('not-helpable');
        }
      }
    };

    // COMMENTED OUT TO TEST NAVIGATION
    // Only add listener when help mode is active
    // if (isHelpModeActive) {
    //   document.addEventListener('click', handleGlobalClick, true);
    //   document.body.style.cursor = 'help';
    // } else {
    //   document.body.style.cursor = 'default';
    // }

    // return () => {
    //   document.removeEventListener('click', handleGlobalClick, true);
    //   document.body.style.cursor = 'default';
    // };
  }, [isHelpModeActive, handleHelpElementClick]);

  // Cleanup cursor style on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  return (
    <HelpModeContext.Provider value={{
      isHelpModeActive,
      setHelpModeActive,
      activeHelpElement,
      setActiveHelpElement,
      helpableElements,
      registerHelpableElement,
      unregisterHelpableElement,
      handleHelpElementClick,
      onHelpElementClicked
    }}>
      {children}
    </HelpModeContext.Provider>
  );
};
