import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from './useProducts';

export const useBrowsingHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['browsing-history', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('browsing_history')
        .select(`
          *,
          products (
            *,
            categories (
              name,
              icon,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data.map(item => item.products).filter(Boolean) as Product[];
    },
  });
};

export const useTrackProductView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('browsing_history')
        .upsert({
          user_id: user.id,
          product_id: productId,
          viewed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browsing-history'] });
    },
  });
};
