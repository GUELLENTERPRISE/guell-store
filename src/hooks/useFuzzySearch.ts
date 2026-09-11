import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Simple Levenshtein distance for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Calculate similarity score (0-1, higher is better)
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Check for substring match first (high priority)
  if (s2.includes(s1) || s1.includes(s2)) {
    return 0.9;
  }
  
  // Check for word match
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1.length > 2 && w2.includes(w1)) {
        return 0.8;
      }
    }
  }
  
  // Levenshtein-based similarity
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength > 0 ? 1 - distance / maxLength : 0;
};

export const useFuzzySearch = (query: string) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['fuzzy-search-products', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      // Fetch products for fuzzy matching
      const { data, error } = await supabase
        .from('products')
        .select('id, name, brand')
        .limit(100);

      if (error) throw error;
      
      // Calculate similarity scores and sort
      const scored = (data || []).map(product => ({
        ...product,
        score: Math.max(
          calculateSimilarity(query, product.name),
          product.brand ? calculateSimilarity(query, product.brand) * 0.8 : 0
        )
      }));
      
      // Filter products with reasonable similarity
      return scored
        .filter(p => p.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(({ score, ...product }) => product);
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  return {
    similarProducts: products || [],
    isLoading,
  };
};
