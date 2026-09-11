import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, 
  DollarSign, 
  Euro, 
  PoundSterling,
  MapPin,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  countries: string[];
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, setLocation } = useLanguage();
  
  const [settings, setSettings] = useState({
    language: 'en',
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const [isSaving, setIsSaving] = useState(false);

  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
  ];

  const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', countries: ['US'] },
    { code: 'EUR', symbol: '€', name: 'Euro', countries: ['DE', 'FR', 'ES', 'IT'] },
    { code: 'GBP', symbol: '£', name: 'British Pound', countries: ['GB'] },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', countries: ['JP'] },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', countries: ['CA'] },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', countries: ['AU'] }
  ];

  const countries: Country[] = [
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
    { code: 'MX', name: 'Mexico', currency: 'MXN', flag: '🇲🇽' },
    { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', currency: 'EUR', flag: '🇮🇹' },
    { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
    { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', flag: '🇧🇷' },
    { code: 'AR', name: 'Argentina', currency: 'ARS', flag: '🇦🇷' }
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'America/Mexico_City', label: 'Central Standard Time (Mexico)' },
    { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT)' }
  ];

  const handleLanguageChange = (languageCode: string) => {
    setSettings(prev => ({ ...prev, language: languageCode }));
    const language = languages.find(l => l.code === languageCode);
    if (language && currentLanguage) {
      setLocation({
        country: settings.country,
        city: 'New York',
        zipCode: '10001',
        language: language
      });
    }
    toast.success('Language updated successfully!');
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSettings(prev => ({ 
        ...prev, 
        country: countryCode,
        currency: country.currency,
        timezone: getDefaultTimezone(countryCode)
      }));
      toast.success('Country and currency updated successfully!');
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSettings(prev => ({ ...prev, currency: currencyCode }));
    toast.success('Currency updated successfully!');
  };

  const handleTimezoneChange = (timezone: string) => {
    setSettings(prev => ({ ...prev, timezone }));
    toast.success('Timezone updated successfully!');
  };

  const handleDateFormatChange = (dateFormat: string) => {
    setSettings(prev => ({ ...prev, dateFormat }));
    toast.success('Date format updated successfully!');
  };

  const handleTimeFormatChange = (timeFormat: string) => {
    setSettings(prev => ({ ...prev, timeFormat }));
    toast.success('Time format updated successfully!');
  };

  const getDefaultTimezone = (countryCode: string): string => {
    const timezoneMap: { [key: string]: string } = {
      'US': 'America/New_York',
      'ES': 'Europe/Madrid',
      'MX': 'America/Mexico_City',
      'CA': 'America/Toronto',
      'GB': 'Europe/London',
      'DE': 'Europe/Berlin',
      'FR': 'Europe/Paris',
      'IT': 'Europe/Rome',
      'JP': 'Asia/Tokyo',
      'AU': 'Australia/Sydney',
      'BR': 'America/Sao_Paulo',
      'AR': 'America/Argentina/Buenos_Aires'
    };
    return timezoneMap[countryCode] || 'America/New_York';
  };

  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('All settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === settings.currency);
    return currency?.symbol || '$';
  };

  const getCurrencyIcon = (currencyCode: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'USD': <DollarSign className="w-4 h-4" />,
      'EUR': <Euro className="w-4 h-4" />,
      'GBP': <PoundSterling className="w-4 h-4" />,
      'JPY': <DollarSign className="w-4 h-4" />
    };
    return iconMap[currencyCode] || <DollarSign className="w-4 h-4" />;
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/account')}
              className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-gray-100"
            >
              ← Back to Account
            </Button>
            <div>
              <h1 className="text-2xl font-light text-foreground dark:text-gray-100">Settings</h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Language, region, and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Language & Region */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-light text-foreground dark:text-gray-100">Language & Region</CardTitle>
                  <CardDescription className="text-sm">Set your preferred language and location</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <div>
                            <div>{lang.name}</div>
                            <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country/Region</label>
                <Select value={settings.country} onValueChange={handleCountryChange}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{country.flag}</span>
                          <div>
                            <div>{country.name}</div>
                            <div className="text-xs text-muted-foreground">{currencies.find(c => c.code === country.currency)?.symbol}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-muted rounded">
                            {getCurrencyIcon(currency.code)}
                          </div>
                          <div>
                            <div>{currency.name}</div>
                            <div className="text-xs text-muted-foreground">{currency.symbol}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-light text-foreground">Date & Time</CardTitle>
                  <CardDescription className="text-sm">Configure your date and time preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timezone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Timezone</label>
                <Select value={settings.timezone} onValueChange={handleTimezoneChange}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Format</label>
                <Select value={settings.dateFormat} onValueChange={handleDateFormatChange}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                    <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time Format</label>
                <Select value={settings.timeFormat} onValueChange={handleTimeFormatChange}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (3:30 PM)</SelectItem>
                    <SelectItem value="24h">24-hour (15:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Current Settings Preview */}
          <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">Current Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Language</div>
                  <div className="font-medium text-foreground">
                    {languages.find(l => l.code === settings.language)?.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Country</div>
                  <div className="font-medium text-foreground">
                    {countries.find(c => c.code === settings.country)?.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Currency</div>
                  <div className="font-medium text-foreground">
                    {currencies.find(c => c.code === settings.currency)?.name} ({getCurrentCurrencySymbol()})
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Timezone</div>
                  <div className="font-medium text-foreground">
                    {timezones.find(t => t.value === settings.timezone)?.label}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveAllSettings}
              disabled={isSaving}
              className="bg-gray-900 text-white hover:bg-gray-800 px-8"
            >
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
