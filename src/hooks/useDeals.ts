import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Deal {
  id: string;
  product_id: string;
  deal_type: 'daily' | 'lightning';
  discount_percentage: number;
  start_time: string;
  end_time: string;
  max_quantity: number | null;
  claimed_quantity: number;
  is_active: boolean;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    rating: number;
    review_count: number;
  };
}

export const useDeals = (dealType?: 'daily' | 'lightning') => {
  const dealsQuery = useQuery({
    queryKey: ['deals', dealType],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select(`
          *,
          products (
            id,
            name,
            price,
            images,
            rating,
            review_count
          )
        `)
        .eq('is_active', true)
        .lte('start_time', new Date().toISOString())
        .gte('end_time', new Date().toISOString());

      if (dealType) {
        query = query.eq('deal_type', dealType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Deal[];
    },
    refetchInterval: 60000, // Refetch every minute for active deals
  });

  const calculateTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return { expired: true, hours: 0, minutes: 0, seconds: 0 };

    return {
      expired: false,
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  };

  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number) => {
    return originalPrice * (1 - discountPercentage / 100);
  };

  return {
    deals: dealsQuery.data || [],
    isLoading: dealsQuery.isLoading,
    calculateTimeRemaining,
    calculateDiscountedPrice,
  };
};
