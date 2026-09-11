import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SubscriptionOrder {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  next_delivery_date: string;
  is_active: boolean;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export const useSubscriptionOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('subscription_orders')
        .select(`
          *,
          products (
            id,
            name,
            price,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('next_delivery_date', { ascending: true });

      if (error) throw error;
      return data as SubscriptionOrder[];
    },
    enabled: !!user,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (params: {
      product_id: string;
      quantity: number;
      frequency: 'weekly' | 'biweekly' | 'monthly';
    }) => {
      if (!user) throw new Error('Must be logged in');

      const nextDeliveryDate = new Date();
      switch (params.frequency) {
        case 'weekly':
          nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 14);
          break;
        case 'monthly':
          nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);
          break;
      }

      const { data, error } = await supabase
        .from('subscription_orders')
        .insert({
          user_id: user.id,
          product_id: params.product_id,
          quantity: params.quantity,
          frequency: params.frequency,
          next_delivery_date: nextDeliveryDate.toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
      toast.success('Subscription created! Save 5% on every delivery.');
    },
    onError: (error) => {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (params: {
      id: string;
      is_active?: boolean;
      frequency?: 'weekly' | 'biweekly' | 'monthly';
      quantity?: number;
    }) => {
      const { data, error } = await supabase
        .from('subscription_orders')
        .update(params)
        .eq('id', params.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
      toast.success('Subscription updated');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscription_orders')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
      toast.success('Subscription cancelled');
    },
  });

  return {
    subscriptions: subscriptionsQuery.data || [],
    isLoading: subscriptionsQuery.isLoading,
    createSubscription: createSubscriptionMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
  };
};
