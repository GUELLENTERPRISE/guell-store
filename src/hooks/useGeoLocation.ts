import { useState, useEffect } from 'react';

interface GeoLocationData {
  country: string;
  countryCode: string;
  city: string;
  isLoading: boolean;
  error: string | null;
}

export const useGeoLocation = () => {
  const [geoData, setGeoData] = useState<GeoLocationData>({
    country: '',
    countryCode: '',
    city: '',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ip-api.com/json/?fields=country,countryCode,city');
        if (!response.ok) {
          throw new Error('Failed to fetch location');
        }
        const data = await response.json();
        setGeoData({
          country: data.country || '',
          countryCode: data.countryCode || '',
          city: data.city || '',
          isLoading: false,
          error: null
        });
      } catch (error) {
        setGeoData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    fetchLocation();
  }, []);

  return geoData;
};

// Map country codes to language codes
export const countryToLanguageMap: Record<string, string> = {
  // English-speaking countries
  'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en', 'IE': 'en',
  // Spanish-speaking countries
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es',
  // French-speaking countries
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'MC': 'fr',
  // German-speaking countries
  'DE': 'de', 'AT': 'de',
  // Italian-speaking countries
  'IT': 'it',
  // Portuguese-speaking countries
  'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
  // Chinese-speaking regions
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'SG': 'zh',
  // Japanese
  'JP': 'ja',
  // Korean
  'KR': 'ko',
  // Arabic-speaking countries
  'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'MA': 'ar', 'DZ': 'ar', 'TN': 'ar', 'IQ': 'ar', 'SY': 'ar', 'JO': 'ar', 'LB': 'ar', 'KW': 'ar', 'QA': 'ar', 'BH': 'ar', 'OM': 'ar', 'YE': 'ar', 'LY': 'ar', 'SD': 'ar',
  // Hindi
  'IN': 'hi',
  // Russian
  'RU': 'ru', 'BY': 'ru', 'KZ': 'ru',
  // Dutch
  'NL': 'nl',
  // Swedish
  'SE': 'sv',
  // Norwegian
  'NO': 'no',
  // Danish
  'DK': 'da',
  // Finnish
  'FI': 'fi',
  // Polish
  'PL': 'pl',
  // Turkish
  'TR': 'tr',
  // Thai
  'TH': 'th',
};
