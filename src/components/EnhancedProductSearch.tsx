
import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, X, Camera, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { useCategories } from '@/hooks/useCategories';
import { usePopularSearches } from '@/hooks/useSearchAnalytics';
import ProductCard from '@/components/ProductCard';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import SearchPagination from '@/components/SearchPagination';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useTranslation } from '@/hooks/useTranslation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface EnhancedProductSearchProps {
  initialQuery?: string;
  categoryFilter?: string;
  onClose?: () => void;
}

const EnhancedProductSearch = ({ initialQuery = '', categoryFilter, onClose }: EnhancedProductSearchProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showScanner, setShowScanner] = useState(false);
  const [showPopularSearches, setShowPopularSearches] = useState(false);

  const { data: categories } = useCategories();
  const { data: popularSearches } = usePopularSearches();
  const { 
    data: searchResults, 
    isLoading, 
    search,
    searchByBarcode,
    goToPage,
    handleResultClick,
    prefetchNextPage,
    currentPage
  } = useEnhancedSearch({
    query: initialQuery,
    categoryId: categoryFilter,
  });

  const handleSearch = () => {
    search({
      query: searchQuery,
      categoryId: selectedCategory || undefined,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
      brand: selectedBrand || undefined,
      color: selectedColor || undefined,
      sortBy: sortBy === 'relevance' ? undefined : sortBy as any,
    });
    setShowPopularSearches(false);
  };

  // Trigger search on mount if initial query or category is provided
  useEffect(() => {
    if (initialQuery || categoryFilter) {
      handleSearch();
    }
  }, [initialQuery, categoryFilter, handleSearch]);

  // Prefetch next page when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        prefetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefetchNextPage, handleScroll]);

  const handleAutocompleteSearch = (query: string) => {
    setSearchQuery(query);
    search({
      query,
      categoryId: selectedCategory || undefined,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
      brand: selectedBrand || undefined,
      color: selectedColor || undefined,
      sortBy: sortBy === 'relevance' ? undefined : sortBy as any,
    });
    setShowPopularSearches(false);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setSearchQuery(`Barcode: ${barcode}`);
    searchByBarcode(barcode);
    setShowScanner(false);
    setShowPopularSearches(false);
  };

  const handlePopularSearchClick = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    handleAutocompleteSearch(searchTerm);
  };

  const handleProductClick = (productId: string, position: number) => {
    handleResultClick(productId, position);
  };

  const handleSearchInputFocus = () => {
    if (!searchQuery && popularSearches && popularSearches.length > 0) {
      setShowPopularSearches(true);
    }
  };

  const availableBrands = [...new Set(searchResults?.products?.map(p => p.brand).filter(Boolean) || [])];
  const availableColors = [...new Set(searchResults?.products?.map(p => p.color).filter(Boolean) || [])];

  return (
    <div className="p-4 space-y-4">
      {/* Close button for modal/overlay usage */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Search Header with Autocomplete and Barcode Scanner */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1" onClick={handleSearchInputFocus}>
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleAutocompleteSearch}
            placeholder={t('search.placeholder') || 'Search products...'}
          />
        </div>
        <Button onClick={handleSearch}>
          {t('search.search') || 'Search'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowScanner(true)}
          title="Scan Barcode"
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>

      {/* Popular Searches */}
      {showPopularSearches && popularSearches && popularSearches.length > 0 && (
        <div className="bg-background p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Popular Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.slice(0, 8).map((search) => (
              <Badge
                key={search.search_query}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handlePopularSearchClick(search.search_query)}
              >
                {search.search_query} ({search.search_count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('search.allCategories') || 'All Categories'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('search.allCategories') || 'All Categories'}</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Input
            placeholder={t('search.minPrice') || 'Min Price'}
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-24"
            type="number"
          />
          <span>-</span>
          <Input
            placeholder={t('search.maxPrice') || 'Max Price'}
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-24"
            type="number"
          />
        </div>

        {availableBrands.length > 0 && (
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Brands</SelectItem>
              {availableBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {availableColors.length > 0 && (
          <Select value={selectedColor} onValueChange={setSelectedColor}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Colors</SelectItem>
              {availableColors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">{t('search.relevance') || 'Relevance'}</SelectItem>
            <SelectItem value="price">{t('search.priceLowToHigh') || 'Price: Low to High'}</SelectItem>
            <SelectItem value="rating">{t('search.rating') || 'Rating'}</SelectItem>
            <SelectItem value="created_at">{t('search.newest') || 'Newest'}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>{t('search.searching') || 'Searching'}...</p>
          </div>
        ) : searchResults && searchResults.products.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {searchResults.totalCount} results found
                {searchResults.searchDuration && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({searchResults.searchDuration}ms)
                  </span>
                )}
              </p>
            </div>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-4'
            }>
              {searchResults.products.map((product, index) => (
                <div 
                  key={product.id}
                  onClick={() => handleProductClick(product.id, index + 1)}
                >
                  <ProductCard
                    id={product.id}
                    title={product.name}
                    price={product.price}
                    originalPrice={product.original_price}
                    rating={product.rating || 0}
                    reviews={product.review_count || 0}
                    imageUrl={product.images?.[0] || '/placeholder.svg'}
                    isPrime={product.is_prime}
                    brand={product.brand || ''}
                    specifications={product.specifications ? Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`) : []}
                    slug={product.slug}
                  />
                </div>
              ))}
            </div>
            
            {searchResults.totalPages > 1 && (
              <SearchPagination
                currentPage={currentPage}
                totalPages={searchResults.totalPages}
                onPageChange={goToPage}
                totalResults={searchResults.totalCount}
                resultsPerPage={searchResults.resultsPerPage}
              />
            )}
          </>
        ) : (searchQuery || selectedCategory) ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('search.noResults') || 'No results found'}</p>
          </div>
        ) : null}
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onScan={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default EnhancedProductSearch;
