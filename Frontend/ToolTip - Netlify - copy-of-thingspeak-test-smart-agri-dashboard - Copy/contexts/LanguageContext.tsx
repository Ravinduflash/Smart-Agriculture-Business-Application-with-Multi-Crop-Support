import React, { createContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, LANGUAGES } from '../constants';

// Dynamically import locales using fetch
const loadLocaleData = async (locale: LanguageCode) => {
  try {
    console.log(`Loading locale data for: ${locale}`);
    // Paths are relative to the public root directory where index.html is served.
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load locale data for ${locale}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded locale data for ${locale}`, Object.keys(data).length, 'keys');
    return data;
  } catch (error) {
    console.error(`Error loading locale ${locale}:`, error);
    // Fallback to English if a locale fails to load
    if (locale !== 'en') {
      console.log('Falling back to English locale');
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setIsLoading(true);
        const localeData = await loadLocaleData(currentLanguage);
        setTranslations(localeData);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Provide fallback translations on error
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
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

  // Show loading state while translations are being fetched
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F3F4F6'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #10B981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>Loading Smart Agriculture Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};