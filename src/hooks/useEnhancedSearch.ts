
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSearchAnalytics } from './useSearchAnalytics';

export interface EnhancedSearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isPrime?: boolean;
  isOnSale?: boolean;
  brand?: string;
  color?: string;
  barcode?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

const RESULTS_PER_PAGE = 12;

export const useEnhancedSearch = (initialFilters: EnhancedSearchFilters = {}) => {
  const [filters, setFilters] = useState<EnhancedSearchFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(
    Object.keys(initialFilters).length > 0
  );
  
  const queryClient = useQueryClient();
  const { trackSearch, trackResultClick } = useSearchAnalytics();

  const queryResult = useQuery({
    queryKey: ['enhanced-search', filters, currentPage],
    queryFn: async () => {
      const startTime = Date.now();
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

      if (filters.barcode) {
        // Assuming we have a barcode field in products table or specifications
        query = query.or(
          `specifications->>'barcode'.eq.${filters.barcode},specifications->>'upc'.eq.${filters.barcode}`
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
      
      const searchDuration = Date.now() - startTime;
      
      // Track search analytics
      await trackSearch({
        searchQuery: filters.query || filters.barcode || '',
        categoryFilter: filters.categoryId,
        resultsCount: count || 0,
        filtersApplied: filters,
        searchDurationMs: searchDuration,
      });

      return {
        products: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / RESULTS_PER_PAGE),
        currentPage,
        resultsPerPage: RESULTS_PER_PAGE,
        searchDuration,
      };
    },
    enabled: isSearchActive,
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });

  const search = (newFilters: EnhancedSearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsSearchActive(true);
  };

  const searchByBarcode = (barcode: string) => {
    search({ ...filters, barcode, query: undefined });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleResultClick = (productId: string, position: number) => {
    const searchQuery = filters.query || filters.barcode || '';
    if (searchQuery) {
      trackResultClick({
        resultId: productId,
        position,
        searchQuery,
      });
    }
  };

  const prefetchNextPage = () => {
    if (queryResult.data && currentPage < queryResult.data.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['enhanced-search', filters, currentPage + 1],
        queryFn: async () => {
          // Same query logic but for next page
          const offset = currentPage * RESULTS_PER_PAGE;
          
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

          // Apply same filters...
          if (filters.query) {
            query = query.or(
              `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,brand.ilike.%${filters.query}%`
            );
          }

          if (filters.barcode) {
            query = query.or(
              `specifications->>'barcode'.eq.${filters.barcode},specifications->>'upc'.eq.${filters.barcode}`
            );
          }

          query = query.range(offset, offset + RESULTS_PER_PAGE - 1);

          const { data, error, count } = await query;
          if (error) throw error;
          
          return {
            products: data || [],
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / RESULTS_PER_PAGE),
            currentPage: currentPage + 1,
            resultsPerPage: RESULTS_PER_PAGE,
          };
        },
        gcTime: 5 * 60 * 1000,
      });
    }
  };

  return {
    ...queryResult,
    search,
    searchByBarcode,
    goToPage,
    handleResultClick,
    prefetchNextPage,
    filters,
    currentPage,
  };
};
