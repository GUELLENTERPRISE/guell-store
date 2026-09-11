
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  image_url?: string;
  image_path?: string;
  background_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('📁 Fetching categories from Supabase...');
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('name');

        if (error) {
          console.error('❌ Error fetching categories:', error);
          throw error;
        }
        
        console.log('✅ Categories fetched successfully:', data?.length || 0, 'categories');
        return data as Category[];
      } catch (err) {
        console.error('❌ Unexpected error fetching categories:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
