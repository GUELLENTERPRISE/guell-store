
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

export interface CreateReviewData {
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure proper typing
      return (data || []).map(review => ({
        ...review,
        user_profiles: review.user_profiles && typeof review.user_profiles === 'object' && !Array.isArray(review.user_profiles)
          ? review.user_profiles 
          : null
      })) as Review[];
    },
  });
};

export const useCreateReview = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      if (!user) throw new Error('Must be logged in to create review');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      console.error('Error creating review:', error);
      toast.error('Failed to submit review');
    },
  });
};
