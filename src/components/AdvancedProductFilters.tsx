import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  categories?: Array<{ id: string; name: string }>;
  brands?: string[];
}

export interface FilterState {
  priceRange: [number, number];
  minRating: number;
  isPrime: boolean;
  isOnSale: boolean;
  category?: string;
  brand?: string;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export const AdvancedProductFilters = ({ 
  onFiltersChange,
  categories = [],
  brands = []
}: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    minRating: 0,
    isPrime: false,
    isOnSale: false,
    sortBy: 'relevance',
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 1000],
      minRating: 0,
      isPrime: false,
      isOnSale: false,
      sortBy: 'relevance',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Clear All
        </Button>
      </div>

      {/* Sort By */}
      <div>
        <Label className="mb-2 block">Sort By</Label>
        <Select 
          value={filters.sortBy} 
          onValueChange={(value) => updateFilters({ sortBy: value as FilterState['sortBy'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Customer Rating</SelectItem>
            <SelectItem value="newest">Newest Arrivals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <Label className="mb-2 block">Category</Label>
          <Select 
            value={filters.category} 
            onValueChange={(value) => updateFilters({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <Label className="mb-2 block">Brand</Label>
          <Select 
            value={filters.brand} 
            onValueChange={(value) => updateFilters({ brand: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Range */}
      <div>
        <Label className="mb-2 block">
          Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </Label>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={filters.priceRange}
          onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
          className="mt-2"
        />
      </div>

      {/* Minimum Rating */}
      <div>
        <Label className="mb-3 block">Minimum Rating</Label>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => updateFilters({ minRating: rating })}
              className={`flex items-center gap-2 w-full p-2 rounded hover:bg-muted ${
                filters.minRating === rating ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prime Eligible */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="prime"
          checked={filters.isPrime}
          onCheckedChange={(checked) => updateFilters({ isPrime: checked as boolean })}
        />
        <Label htmlFor="prime" className="cursor-pointer">
          GÜELL+ Eligible
        </Label>
      </div>

      {/* On Sale */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sale"
          checked={filters.isOnSale}
          onCheckedChange={(checked) => updateFilters({ isOnSale: checked as boolean })}
        />
        <Label htmlFor="sale" className="cursor-pointer">
          On Sale
        </Label>
      </div>
    </Card>
  );
};
