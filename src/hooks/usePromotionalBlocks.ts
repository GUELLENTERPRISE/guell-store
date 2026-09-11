import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PromotionalBlock {
  id: string;
  title: string;
  subtitle: string;
  image_path?: string;
  background_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePromotionalBlocks = () => {
  return useQuery({
    queryKey: ['promotional-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_blocks')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('title');

      if (error) throw error;
      return data as PromotionalBlock[];
    },
  });
};