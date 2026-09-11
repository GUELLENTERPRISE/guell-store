import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  location: string | null;
  notes: string | null;
  created_at: string;
}

export const useOrderTracking = (orderId: string) => {
  const { user } = useAuth();

  const trackingQuery = useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OrderStatusHistory[];
    },
    enabled: !!user && !!orderId,
  });

  const getStatusIcon = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': '📦',
      'processing': '⚙️',
      'shipped': '🚚',
      'in_transit': '✈️',
      'out_for_delivery': '🚛',
      'delivered': '✅',
      'cancelled': '❌',
    };
    return statusMap[status] || '📋';
  };

  return {
    tracking: trackingQuery.data || [],
    isLoading: trackingQuery.isLoading,
    getStatusIcon,
  };
};
