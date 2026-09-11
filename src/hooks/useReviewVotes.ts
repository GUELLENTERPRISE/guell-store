import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useReviewVote = (reviewId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['review-vote', reviewId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

export const useToggleReviewVote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, hasVoted }: { reviewId: string; hasVoted: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      if (hasVoted) {
        const { error } = await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review-vote', variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
    },
    onError: () => {
      toast.error('Failed to vote');
    },
  });
};
