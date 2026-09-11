
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  base_cost: number;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active: boolean;
  created_at: string;
}

export const useShippingMethods = () => {
  const shippingMethodsQuery = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('base_cost');

      if (error) throw error;
      return data as ShippingMethod[];
    },
  });

  return {
    shippingMethods: shippingMethodsQuery.data || [],
    isLoading: shippingMethodsQuery.isLoading,
  };
};
