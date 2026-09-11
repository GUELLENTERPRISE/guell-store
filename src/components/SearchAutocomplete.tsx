
import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Clock, X, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useTranslation } from '@/hooks/useTranslation';
import { useHaptics } from '@/hooks/useHaptics';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchAutocomplete = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = 'Search products...' 
}: SearchAutocompleteProps) => {
  const { t } = useTranslation();
  const { lightTap, mediumTap } = useHaptics();
  const { data: storefrontSettings } = useStorefrontSettings();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { textSuggestions: suggestions, productSuggestions } = useSearchSuggestions(value);
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const { isSupported: voiceSupported, isListening, transcript, startListening, stopListening } = useVoiceSearch();

  // Check if product is from verified store
  const isVerifiedStore = (brand?: string) => {
    if (!brand) return false;
    const verifiedStores = storefrontSettings?.verified_stores || [];
    return verifiedStores.some((store) => store.toLowerCase() === brand.toLowerCase());
  };

  useEffect(() => {
    if (transcript) {
      onChange(transcript);
      handleSearch(transcript);
    }
  }, [transcript, onChange, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addRecentSearch(query);
      onSearch(query);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    lightTap();
    onChange(suggestion);
    handleSearch(suggestion);
  };

  const handleVoiceToggle = () => {
    mediumTap();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(value);
    }
  };

  const displaySuggestions = value.length >= 2 ? suggestions : [];
  const showRecentSearches = value.length === 0 && recentSearches.length > 0;

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-12"
        />
        {voiceSupported && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-1 ${
              isListening ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={handleVoiceToggle}
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showSuggestions && (displaySuggestions.length > 0 || showRecentSearches) && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-card border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {showRecentSearches && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="flex items-center w-full p-2 text-left hover:bg-background rounded text-sm"
                  onClick={() => handleSuggestionClick(search)}
                >
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {displaySuggestions.length > 0 && (
            <div className="p-2">
              <span className="text-sm font-medium text-muted-foreground mb-2 block">Suggestions</span>
              {displaySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex items-center w-full p-2 text-left hover:bg-background rounded text-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  aria-label={`Search for ${suggestion}`}
                  role="option"
                >
                  <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}

              {/* Product Predictions */}
              {productSuggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-muted-foreground mb-2 block">Products</span>
                  {productSuggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="flex items-center w-full p-2 text-left hover:bg-background rounded text-sm"
                      onClick={() => handleSuggestionClick(product.name)}
                      aria-label={`Search for ${product.name}`}
                      role="option"
                    >
                      <div className="w-8 h-8 mr-3 flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <Search className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="truncate font-medium">{product.name}</span>
                          {isVerifiedStore(product.brand) && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        {product.brand && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{product.brand}</span>
                            {isVerifiedStore(product.brand) && (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            )}
                          </div>
                        )}
                        <div className="text-xs text-foreground font-medium">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
