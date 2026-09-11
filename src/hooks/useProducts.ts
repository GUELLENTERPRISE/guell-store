
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: string;
  inventory: number;
  images: string[];
  videos?: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_prime: boolean;
  is_guell_plus: boolean;
  brand: string;
  color?: string;
  fabric_type?: string;
  origin?: string;
  specifications?: any;
  recommended_uses?: string[];
  monthly_sold_count?: number;
  image_alt_text?: string[];
  slug?: string;
  // CRO-related, per-product presentation controls
  urgency_threshold?: number;
  show_secure_payment_badge?: boolean;
  show_satisfaction_badge?: boolean;
  show_fast_shipping_badge?: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    icon: string;
    color: string;
  };
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('🔍 Fetching products from Supabase...');
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name,
              icon,
              color
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching products:', error);
          throw error;
        }
        
        console.log('✅ Products fetched successfully:', data?.length || 0, 'products');
        return data as Product[];
      } catch (err) {
        console.error('❌ Unexpected error fetching products:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      console.log('🌟 Fetching featured products from Supabase...');
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name,
              icon,
              color
            )
          `)
          .eq('is_featured', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching featured products:', error);
          throw error;
        }
        
        console.log('✅ Featured products fetched successfully:', data?.length || 0, 'products');
        return data as Product[];
      } catch (err) {
        console.error('❌ Unexpected error fetching featured products:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
