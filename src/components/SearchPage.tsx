
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductSearch from '@/components/ProductSearch';
import TopHeader from '@/components/TopHeader';
import { useCart } from '@/hooks/useCart';
import BottomSheetFilters from '@/components/BottomSheetFilters';
import FloatingCartButton from '@/components/FloatingCartButton';

interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  ratings: number[];
  inStock: boolean;
  isPrime: boolean;
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const { cart } = useCart();
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    categories: [],
    brands: [],
    ratings: [],
    inStock: false,
    isPrime: false,
  });
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;

  return (
    <div className="min-h-screen bg-muted/30">
      <TopHeader cartCount={cart?.length || 0} />
      <div className="pt-16">
        <div className="p-4 md:hidden">
          <BottomSheetFilters 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        </div>
        <ProductSearch 
          initialQuery={query}
          categoryFilter={category}
        />
      </div>
      <FloatingCartButton />
    </div>
  );
};

export default SearchPage;
