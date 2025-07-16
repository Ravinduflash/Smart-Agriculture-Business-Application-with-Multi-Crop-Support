import React, { createContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, LANGUAGES } from '../constants';

// Dynamically import locales using fetch
const loadLocaleData = async (locale: LanguageCode) => {
  try {
    // Paths are relative to the public root directory where index.html is served.
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load locale data for ${locale}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading locale ${locale}:`, error);
    // Fallback to English if a locale fails to load
    if (locale !== 'en') {
      const fallbackResponse = await fetch(`/locales/en.json`);
      if (fallbackResponse.ok) {
        return await fallbackResponse.json();
      }
    }
    return {}; // Return empty object if all else fails
  }
};

interface LanguageContextType {
  currentLanguage: LanguageCode;
  changeLanguage: (language: LanguageCode) => void;
  translations: Record<string, string>;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

// Define the default value for the context explicitly
const defaultContextValue: LanguageContextType = {
  currentLanguage: 'en',
  changeLanguage: () => {
    // This default function should ideally not be called.
    // console.warn("Default changeLanguage called - LanguageProvider might not be set up correctly.");
  },
  translations: {},
  t: (key: string) => {
    // console.warn(`Default t function called for key: ${key} - Translations might not be loaded.`);
    return key; // Return the key itself as a fallback
  },
};

export const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const localeData = await loadLocaleData(currentLanguage);
      setTranslations(localeData);
    };
    fetchTranslations();
  }, [currentLanguage]);

  const changeLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language);
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[key] || key; // Fallback to key if not found
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      });
    }
    return translation;
  }, [translations]);


  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};