import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Location {
  country: string;
  city: string;
  zipCode: string;
  language: Language;
}

interface LanguageContextType {
  currentLanguage: Language;
  currentLocation: Location;
  setLocation: (location: Location) => void;
  availableLanguages: Language[];
  wasAutoDetected: boolean;
  resetAutoDetection: () => void;
}

const defaultLanguages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
];

const defaultLocation: Location = {
  country: 'United States',
  city: 'New York',
  zipCode: '10001',
  language: defaultLanguages[0] // English
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location>(defaultLocation);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wasAutoDetected, setWasAutoDetected] = useState(false);
  
  const detectAndSetLanguage = useCallback(() => {
    // Check if user already has a saved location preference
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        // Always use English regardless of saved language
        setCurrentLocation({
          ...parsedLocation,
          language: defaultLanguages[0] // Always English
        });
        setIsInitialized(true);
        return;
      } catch (error) {
        // Error handled silently - TODO: add proper error reporting
      }
    }

    // Use default location without network call to prevent hanging
    setCurrentLocation(defaultLocation);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    detectAndSetLanguage();
  }, [detectAndSetLanguage]);

  const setLocation = (location: Location) => {
    // Always use English regardless of location selected
    const updatedLocation = {
      ...location,
      language: defaultLanguages[0] // Always English
    };
    
    setCurrentLocation(updatedLocation);
    setWasAutoDetected(false);
    localStorage.setItem('userLocation', JSON.stringify(updatedLocation));
    localStorage.removeItem('locationAutoDetected');
    
    // Location updated
  };

  const resetAutoDetection = () => {
    localStorage.removeItem('userLocation');
    localStorage.removeItem('locationAutoDetected');
    detectAndSetLanguage();
  };

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <LanguageContext.Provider value={{
      currentLanguage: currentLocation.language,
      currentLocation,
      setLocation,
      availableLanguages: defaultLanguages,
      wasAutoDetected,
      resetAutoDetection
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.error('useLanguage must be used within a LanguageProvider. Make sure your component is wrapped with LanguageProvider.');
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
