
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
  color?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

const RESULTS_PER_PAGE = 12;

export const useAdvancedSearchWithPagination = (initialFilters: SearchFilters = {}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(
    Object.keys(initialFilters).length > 0
  );

  const queryResult = useQuery({
    queryKey: ['advanced-search-paginated', filters, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * RESULTS_PER_PAGE;
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            icon,
            color
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,brand.ilike.%${filters.query}%`
        );
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters.isPrime) {
        query = query.eq('is_prime', true);
      }

      if (filters.isOnSale) {
        query = query.not('original_price', 'is', null);
      }

      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }

      if (filters.color) {
        query = query.eq('color', filters.color);
      }

      // Sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      query = query.range(offset, offset + RESULTS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        products: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / RESULTS_PER_PAGE),
        currentPage,
        resultsPerPage: RESULTS_PER_PAGE,
      };
    },
    enabled: isSearchActive,
  });

  const search = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsSearchActive(true);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    ...queryResult,
    search,
    goToPage,
    filters,
    currentPage,
  };
};
