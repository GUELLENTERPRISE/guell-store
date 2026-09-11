import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  button_text: string;
  button_link: string;
  image_path: string | null;
  background_color: string;
  text_color: string;
  show_products: boolean;
  product_ids: string[];
  display_order: number;
  is_active: boolean;
  auto_rotate_interval: number;
  created_at: string;
  updated_at: string;
}

export const useHeroBanners = () => {
  return useQuery({
    queryKey: ['hero-banners'],
    queryFn: async () => {
      console.log('🎯 Fetching hero banners from Supabase...');
      try {
        const { data, error } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('❌ Error fetching hero banners:', error);
          throw error;
        }
        
        console.log('✅ Hero banners fetched successfully:', data?.length || 0, 'banners');
        return data as HeroBanner[];
      } catch (err) {
        console.error('❌ Unexpected error fetching hero banners:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useAllHeroBanners = () => {
  return useQuery({
    queryKey: ['all-hero-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HeroBanner[];
    },
  });
};
