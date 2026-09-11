
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSuggestion {
  id: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
  slug?: string;
}

export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);

  const { data: products } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('products')
        .select('id, name, brand, price, images, slug')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(8);

      if (error) throw error;

      return data as ProductSuggestion[];
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    if (products) {
      // Extract unique text suggestions for backward compatibility
      const textSuggestions = new Set<string>();
      products.forEach(product => {
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          textSuggestions.add(product.name);
        }
        if (product.brand && product.brand.toLowerCase().includes(query.toLowerCase())) {
          textSuggestions.add(product.brand);
        }
      });

      setSuggestions(Array.from(textSuggestions).slice(0, 5));
      setProductSuggestions(products.slice(0, 8));
    } else {
      setSuggestions([]);
      setProductSuggestions([]);
    }
  }, [products, query]);

  return {
    textSuggestions: suggestions,
    productSuggestions
  };
};
