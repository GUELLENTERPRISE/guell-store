import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, X, Package, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAdvancedSearchWithPagination, SearchFilters } from '@/hooks/useAdvancedSearchWithPagination';
import { useCategories } from '@/hooks/useCategories';
import ProductCardCompact from '@/components/ProductCardCompact';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import SearchPagination from '@/components/SearchPagination';
import { useTranslation } from '@/hooks/useTranslation';
import { useFuzzySearch } from '@/hooks/useFuzzySearch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductSearchProps {
  initialQuery?: string;
  categoryFilter?: string;
  onClose?: () => void;
}

const ProductSearch = ({ initialQuery = '', categoryFilter, onClose }: ProductSearchProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isPrime, setIsPrime] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  const { data: categories } = useCategories();
  const { 
    data: searchResults, 
    isLoading, 
    search,
    goToPage,
    currentPage,
    filters
  } = useAdvancedSearchWithPagination({
    query: initialQuery,
    categoryId: categoryFilter,
  });

  // Fuzzy search for suggestions when no results
  const { similarProducts } = useFuzzySearch(
    searchResults?.products?.length === 0 && searchQuery ? searchQuery : ''
  );

  const buildSearchFilters = (): SearchFilters => ({
    query: searchQuery || undefined,
    categoryId: selectedCategory || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
    brand: selectedBrand || undefined,
    color: selectedColor || undefined,
    isPrime: isPrime || undefined,
    isOnSale: isOnSale || undefined,
    minRating: minRating,
    sortBy: sortBy === 'relevance' ? undefined : sortBy as any,
    sortOrder: sortBy === 'price' ? 'asc' : 'desc',
  });

  const handleSearch = () => {
    search(buildSearchFilters());
  };

  // Trigger search on mount if initial query or category is provided
  useEffect(() => {
    if (initialQuery || categoryFilter) {
      handleSearch();
    }
  }, [initialQuery, categoryFilter, handleSearch]);

  const handleAutocompleteSearch = (query: string) => {
    setSearchQuery(query);
    search({
      ...buildSearchFilters(),
      query,
    });
  };

  const handleFilterChange = () => {
    handleSearch();
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 1000]);
    setSelectedBrand('');
    setSelectedColor('');
    setInStockOnly(false);
    setIsPrime(false);
    setIsOnSale(false);
    setMinRating(undefined);
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedCategory || selectedBrand || selectedColor || 
    inStockOnly || isPrime || isOnSale || minRating || 
    priceRange[0] > 0 || priceRange[1] < 1000;

  // Get unique brands and colors for filtering
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


      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Advanced Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
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
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
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
            </div>

            {/* Min Rating */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select 
                value={minRating?.toString() || ''} 
                onValueChange={(val) => setMinRating(val ? parseInt(val) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
            <Slider
              value={priceRange}
              onValueChange={(val) => setPriceRange(val as [number, number])}
              min={0}
              max={1000}
              step={10}
              className="w-full"
            />
          </div>

          {/* Availability Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inStock" 
                checked={inStockOnly} 
                onCheckedChange={(checked) => setInStockOnly(checked === true)} 
              />
              <Label htmlFor="inStock" className="flex items-center gap-1 cursor-pointer">
                <Package className="w-4 h-4" />
                In Stock Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPrime" 
                checked={isPrime} 
                onCheckedChange={(checked) => setIsPrime(checked === true)} 
              />
              <Label htmlFor="isPrime" className="flex items-center gap-1 cursor-pointer">
                <Zap className="w-4 h-4 text-orange-500" />
                Prime Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isOnSale" 
                checked={isOnSale} 
                onCheckedChange={(checked) => setIsOnSale(checked === true)} 
              />
              <Label htmlFor="isOnSale" className="flex items-center gap-1 cursor-pointer">
                <Star className="w-4 h-4 text-red-500" />
                On Sale
              </Label>
            </div>
          </div>

          <Button onClick={handleFilterChange} className="w-full md:w-auto">
            Apply Filters
          </Button>
        </div>
      )}

      {/* Sort and View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(val) => { setSortBy(val); handleSearch(); }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="created_at">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-primary/10")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
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
            <p className="text-muted-foreground">
              {searchResults.totalCount} results found
            </p>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
              : 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }>
              {searchResults.products.map((product) => (
                <ProductCardCompact
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  rating={product.rating}
                  reviews={product.review_count}
                  imageUrl={product.images?.[0] || '/placeholder.svg'}
                  isPrime={product.is_prime}
                  brand={product.brand}
                  slug={product.slug}
                />
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
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">{t('search.noResults') || 'No results found'}</p>
            
            {/* Fuzzy Search Suggestions */}
            {similarProducts.length > 0 && (
              <div className="max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-3">Did you mean?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {similarProducts.slice(0, 5).map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutocompleteSearch(product.name)}
                      className="text-sm"
                    >
                      {product.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductSearch;
