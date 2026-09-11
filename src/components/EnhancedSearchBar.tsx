import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Mic, Clock, X, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchSuggestions, ProductSuggestion } from '@/hooks/useSearchSuggestions';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useTranslation } from '@/hooks/useTranslation';
import { useHaptics } from '@/hooks/useHaptics';
import { useFuzzySearch } from '@/hooks/useFuzzySearch';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/currency';

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedSearchBar = ({ 
  onSearch, 
  placeholder,
  className 
}: EnhancedSearchBarProps) => {
  const { t } = useTranslation();
  const { lightTap, mediumTap } = useHaptics();
  const { data: storefrontSettings } = useStorefrontSettings();
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { textSuggestions: suggestions, productSuggestions } = useSearchSuggestions(value);
  const { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch } = useRecentSearches();
  const { isSupported: voiceSupported, isListening, transcript, startListening, stopListening } = useVoiceSearch();
  const { similarProducts, isLoading: isFuzzyLoading } = useFuzzySearch(value);

  // Check if product is from verified store
  const isVerifiedStore = (brand?: string) => {
    if (!brand) return false;
    const verifiedStores = storefrontSettings?.verified_stores || [];
    return verifiedStores.some((store) => store.toLowerCase() === brand.toLowerCase());
  };

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setValue(transcript);
      handleSearch(transcript);
    }
  }, [transcript]);

  // Handle click outside
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

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      onSearch(query.trim());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [addRecentSearch, onSearch]);

  const handleSuggestionClick = (suggestion: string) => {
    lightTap();
    setValue(suggestion);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = getAllSuggestions();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < allSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
        handleSuggestionClick(allSuggestions[selectedIndex]);
      } else {
        handleSearch(value);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const getAllSuggestions = () => {
    const result: string[] = [];
    if (value.length === 0 && recentSearches.length > 0) {
      result.push(...recentSearches);
    }
    if (value.length >= 2) {
      result.push(...suggestions);
      // Add similar products if no exact suggestions
      if (suggestions.length === 0 && similarProducts.length > 0) {
        result.push(...similarProducts.map(p => p.name));
      }
    }
    return result;
  };

  const displaySuggestions = value.length >= 2 ? suggestions : [];
  const showRecentSearches = value.length === 0 && recentSearches.length > 0;
  const showProductSuggestions = value.length >= 2 && productSuggestions.length > 0;
  const showFuzzyResults = value.length >= 2 && suggestions.length === 0 && similarProducts.length > 0;

  return (
    <div className={cn("relative flex-1", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10" />
        <Input
          ref={inputRef}
          placeholder={placeholder || t('search.placeholder') || 'Search products...'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-20 bg-card/90 backdrop-blur-sm text-foreground border-0 shadow-lg rounded-2xl h-12 focus:shadow-xl focus:bg-card transition-all duration-300"
        />
        
        {/* Integrated Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {voiceSupported && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "p-1 h-8 w-8 rounded-lg",
                isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted'
              )}
              onClick={handleVoiceToggle}
              title={isListening ? 'Stop listening' : 'Voice search'}
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}
          
          <Button 
            onClick={() => handleSearch(value)} 
            className="bg-orange-400 hover:bg-orange-500 text-foreground p-2 h-8 w-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Voice Listening Indicator */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg z-50 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-700">Listening... Speak now</span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && !isListening && (displaySuggestions.length > 0 || showRecentSearches || showFuzzyResults) && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-card border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearRecentSearches();
                  }}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-gray-700"
                >
                  Clear all
                </Button>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between w-full p-2 text-left hover:bg-background rounded text-sm group",
                    selectedIndex === index && "bg-muted"
                  )}
                >
                  <button
                    className="flex items-center flex-1"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Product Suggestions with Images */}
          {showProductSuggestions && (
            <div className="p-2">
              <span className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Products
              </span>
              <div className="space-y-1">
                {productSuggestions.slice(0, 6).map((product, index) => {
                  const actualIndex = showRecentSearches ? recentSearches.length + index : index;
                  return (
                    <button
                      key={product.id}
                      className={cn(
                        "flex items-center w-full p-2 text-left hover:bg-background rounded text-sm group",
                        selectedIndex === actualIndex && "bg-muted"
                      )}
                      onClick={() => handleSuggestionClick(product.name)}
                    >
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate flex items-center gap-1">
                          {highlightMatch(product.name, value)}
                          {isVerifiedStore(product.brand) && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        {product.brand && (
                          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            {product.brand}
                            {isVerifiedStore(product.brand) && (
                              <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-semibold text-foreground">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Text Suggestions (fallback) */}
          {displaySuggestions.length > 0 && !showProductSuggestions && (
            <div className="p-2">
              <span className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Suggestions
              </span>
              {displaySuggestions.map((suggestion, index) => {
                const actualIndex = showRecentSearches ? recentSearches.length + index : index;
                return (
                  <button
                    key={index}
                    className={cn(
                      "flex items-center w-full p-2 text-left hover:bg-background rounded text-sm",
                      selectedIndex === actualIndex && "bg-muted"
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-gray-700">{highlightMatch(suggestion, value)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fuzzy Match / Similar Products */}
          {showFuzzyResults && (
            <div className="p-2 border-t border-gray-100">
              <span className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Did you mean?
              </span>
              {similarProducts.slice(0, 5).map((product, index) => {
                const actualIndex = showRecentSearches ? recentSearches.length + index : index;
                return (
                  <button
                    key={product.id}
                    className={cn(
                      "flex items-center w-full p-2 text-left hover:bg-background rounded text-sm",
                      selectedIndex === actualIndex && "bg-muted"
                    )}
                    onClick={() => handleSuggestionClick(product.name)}
                  >
                    <Search className="w-4 h-4 mr-2 text-amber-500" />
                    <span className="text-gray-700">{product.name}</span>
                    {product.brand && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {product.brand}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results Message */}
          {value.length >= 2 && displaySuggestions.length === 0 && similarProducts.length === 0 && !isFuzzyLoading && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No suggestions found. Press Enter to search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <strong key={i} className="text-primary">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default EnhancedSearchBar;
