import { useState } from 'react';
import { Filter, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  ratings: number[];
  inStock: boolean;
  isPrime: boolean;
}

interface BottomSheetFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories?: string[];
  availableBrands?: string[];
  maxPrice?: number;
}

const BottomSheetFilters = ({
  filters,
  onFiltersChange,
  availableCategories = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'],
  availableBrands = ['Brand A', 'Brand B', 'Brand C', 'Brand D'],
  maxPrice = 1000,
}: BottomSheetFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < maxPrice,
    localFilters.categories.length > 0,
    localFilters.brands.length > 0,
    localFilters.ratings.length > 0,
    localFilters.inStock,
    localFilters.isPrime,
  ].filter(Boolean).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, maxPrice],
      categories: [],
      brands: [],
      ratings: [],
      inStock: false,
      isPrime: false,
    };
    setLocalFilters(defaultFilters);
  };

  const toggleCategory = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleBrand = (brand: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const toggleRating = (rating: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      ratings: prev.ratings.includes(rating)
        ? prev.ratings.filter((r) => r !== rating)
        : [...prev.ratings, rating],
    }));
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="relative md:hidden">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </DrawerTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset All
          </Button>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto space-y-6">
          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Price Range</h3>
            <Slider
              value={localFilters.priceRange}
              min={0}
              max={maxPrice}
              step={10}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${localFilters.priceRange[0]}</span>
              <span>${localFilters.priceRange[1]}</span>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={localFilters.categories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Brands</h3>
            <div className="space-y-2">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={localFilters.brands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Customer Rating</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={localFilters.ratings.includes(rating)}
                    onCheckedChange={() => toggleRating(rating)}
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="text-sm font-medium leading-none flex items-center gap-1"
                  >
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                    <span className="text-muted-foreground">& Up</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Quick Filters</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={localFilters.inStock}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, inStock: !!checked }))
                  }
                />
                <label htmlFor="inStock" className="text-sm font-medium">
                  In Stock Only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrime"
                  checked={localFilters.isPrime}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, isPrime: !!checked }))
                  }
                />
                <label htmlFor="isPrime" className="text-sm font-medium">
                  Prime Eligible
                </label>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="flex flex-row gap-2">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomSheetFilters;
