import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BrandSection {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  button_text: string;
  image_path?: string;
  background_color: string;
  search_category?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBrandSections = () => {
  return useQuery({
    queryKey: ['brand-sections'],
    queryFn: async () => {
      console.log('Fetching brand sections...');
      try {
        const { data, error } = await supabase
          .from('brand_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('title');

        if (error) {
          console.error('Error fetching brand sections:', error);
          throw error;
        }
        
        console.log('Brand sections fetched successfully:', data);
        return data as BrandSection[];
      } catch (err) {
        console.error('Unexpected error fetching brand sections:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};