
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const getSubscriptionDisplayName = (tier: string | null) => {
  switch (tier) {
    case 'guell_plus_basic':
      return 'GÜELL+ Basic Membership';
    case 'guell_plus_premium':
      return 'GÜELL+ Premium Membership';
    default:
      return 'No Active Membership';
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      return data as SubscriptionData;
    },
    enabled: !!user,
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async ({ priceId, tier }: { priceId: string; tier: string }) => {
      if (!user) throw new Error('Must be logged in to subscribe');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, tier }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout process');
    },
  });

  const customerPortalMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to access portal');

      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('Error accessing customer portal:', error);
      toast.error('Failed to access customer portal');
    },
  });

  const refreshSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
  };

  return {
    subscription: subscriptionQuery.data,
    isLoading: subscriptionQuery.isLoading,
    createCheckout: createCheckoutMutation.mutate,
    openCustomerPortal: customerPortalMutation.mutate,
    refreshSubscription,
    isCreatingCheckout: createCheckoutMutation.isPending,
    isOpeningPortal: customerPortalMutation.isPending,
  };
};
