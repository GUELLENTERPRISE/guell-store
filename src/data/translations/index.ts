
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { pt } from './pt';

export interface Translation {
  [key: string]: string | Translation;
}

export const translations: Record<string, Translation> = {
  en,
  es,
  fr,
  de,
  pt,
  // Fallback to supported languages for other language codes
  it: en, // Italian fallback to English
  zh: en, // Chinese fallback to English
  ja: en, // Japanese fallback to English
  ko: en, // Korean fallback to English
  ar: en, // Arabic fallback to English
  hi: en, // Hindi fallback to English
  ru: en, // Russian fallback to English
  nl: en, // Dutch fallback to English
  sv: en, // Swedish fallback to English
  no: en, // Norwegian fallback to English
  da: en, // Danish fallback to English
  fi: en, // Finnish fallback to English
  pl: en, // Polish fallback to English
  tr: en, // Turkish fallback to English
  th: en, // Thai fallback to English
};
