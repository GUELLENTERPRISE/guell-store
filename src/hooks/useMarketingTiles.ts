import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketingTile {
  id: string;
  title: string;
  description: string;
  image_path?: string;
  background_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMarketingTiles = () => {
  return useQuery({
    queryKey: ['marketing-tiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_tiles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('title');

      if (error) throw error;
      return data as MarketingTile[];
    },
  });
};