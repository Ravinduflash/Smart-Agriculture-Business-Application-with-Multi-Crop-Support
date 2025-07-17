import { useEffect } from 'react';
import { useHelpMode, HelpableElement } from '../contexts/HelpModeContext';

export const useHelpableElement = (element: HelpableElement) => {
  const { registerHelpableElement, unregisterHelpableElement } = useHelpMode();

  useEffect(() => {
    registerHelpableElement(element);
    return () => {
      unregisterHelpableElement(element.id);
    };
  }, [element, registerHelpableElement, unregisterHelpableElement]);
};
