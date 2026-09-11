
import React, { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { worldLocations, WorldLocation } from '@/data/worldLocations';

const LocationSelector = () => {
  const { currentLocation, setLocation, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');

  const filteredLocations = worldLocations.filter(location => {
    const matchesSearch = searchQuery === '' || 
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.zipCode.includes(searchQuery) ||
      (location.state && location.state.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCountry = selectedCountry === '' || selectedCountry === 'all' || location.country === selectedCountry;
    const matchesContinent = selectedContinent === '' || selectedContinent === 'all' || location.continent === selectedContinent;
    
    return matchesSearch && matchesCountry && matchesContinent;
  });

  const uniqueCountries = [...new Set(worldLocations.map(loc => loc.country))].sort();
  const uniqueContinents = [...new Set(worldLocations.map(loc => loc.continent))].sort();

  const handleLocationSelect = (location: WorldLocation) => {
    // Keep the same language (English) regardless of location
    setLocation({
      country: location.country,
      city: location.city,
      zipCode: location.zipCode,
      language: availableLanguages[0] // Always use English
    });
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedContinent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center space-x-1 text-sm p-2 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 ease-out backdrop-blur-md bg-card/10 border border-white/20 rounded-lg shadow-lg hover:bg-card/20 hover:shadow-xl">
          <MapPin className="w-4 h-4" />
          <div>
            <div className="text-xs text-gray-300 flex items-center gap-1">
              {currentLocation.country} {currentLocation.zipCode}
              <span className="text-lg">{worldLocations.find(loc => loc.country === currentLocation.country)?.flag || currentLocation.language.flag}</span>
            </div>
            <div className="font-bold">{t('header.updateLocation')}</div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t('location.chooseLocation')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800">
          <p>{t('location.locationNotice')}</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('location.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedContinent} onValueChange={setSelectedContinent}>
              <SelectTrigger>
                <SelectValue placeholder={t('location.filterContinent')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('location.allContinents')}</SelectItem>
                {uniqueContinents.map(continent => (
                  <SelectItem key={continent} value={continent}>
                    {t(`location.continents.${continent}`) || continent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder={t('location.filterCountry')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('location.allCountries')}</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedCountry || selectedContinent) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              <X className="w-4 h-4 mr-2" />
              {t('location.clearFilters')}
            </Button>
          )}

          <div className="text-sm text-muted-foreground mb-2">
            {t('location.showingLocations', { count: filteredLocations.length })}
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredLocations.map((location, index) => {
              return (
                <div
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-background transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">
                        {location.city}
                        {location.state && `, ${location.state}`}
                        , {location.country}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{location.zipCode}</span>
                        <span>•</span>
                        <span>{t(`location.continents.${location.continent}`) || location.continent}</span>
                      </div>
                    </div>
                    <div className="text-lg ml-4">{location.flag}</div>
                  </div>
                </div>
              );
            })}
            {filteredLocations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('location.noLocationsFound')}</p>
                <p className="text-sm">{t('location.tryAdjusting')}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
