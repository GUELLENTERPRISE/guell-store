
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isPrime?: boolean;
  isOnSale?: boolean;
  brand?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export const useAdvancedSearch = (initialFilters: SearchFilters = {}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isSearchActive, setIsSearchActive] = useState(
    Object.keys(initialFilters).length > 0
  );

  const queryResult = useQuery({
    queryKey: ['advanced-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            icon,
            color
          )
        `);

      // Text search
      if (filters.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      // Category filter
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      // Price range
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Rating filter
      if (filters.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      // Prime filter
      if (filters.isPrime) {
        query = query.eq('is_prime', true);
      }

      // Sale filter
      if (filters.isOnSale) {
        query = query.not('original_price', 'is', null);
      }

      // Brand filter
      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }

      // Sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: isSearchActive,
  });

  const search = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setIsSearchActive(true);
  };

  return {
    ...queryResult,
    search,
    filters,
  };
};
