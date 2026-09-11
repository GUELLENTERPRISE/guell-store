
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/data/translations';

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  
  const getTranslation = (key: string, params?: Record<string, string | number>): string => {
    const langCode = currentLanguage?.code || 'en';
    const langTranslations = translations[langCode] || translations['en'];
    
    // Navigate through nested keys (e.g., "header.searchPlaceholder")
    const keys = key.split('.');
    let value: unknown = langTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        const englishTranslations = translations['en'];
        let englishValue: unknown = englishTranslations;
        for (const fallbackK of keys) {
          if (englishValue && typeof englishValue === 'object' && fallbackK in englishValue) {
            englishValue = englishValue[fallbackK];
          } else {
            return key; // Return key if no translation found
          }
        }
        value = englishValue;
        break;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace parameters in the translation
    if (params) {
      return Object.entries(params).reduce((text, [param, val]) => {
        return text.replace(`{${param}}`, String(val));
      }, value);
    }
    
    return value;
  };
  
  return { t: getTranslation, currentLanguage };
};
