import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProductQuestion {
  id: string;
  product_id: string;
  user_id: string;
  question: string;
  created_at: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  product_answers?: ProductAnswer[];
}

export interface ProductAnswer {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_seller: boolean;
  helpful_count: number;
  created_at: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useProductQuestions = (productId: string) => {
  return useQuery({
    queryKey: ['product-questions', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_questions')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch answers separately for each question
      const questionsWithAnswers = await Promise.all(
        (data || []).map(async (question) => {
          const { data: answers } = await supabase
            .from('product_answers')
            .select('*')
            .eq('question_id', question.id)
            .order('created_at', { ascending: false });

          // Fetch user profiles for question and answers
          const { data: questionUserProfile } = await supabase
            .from('user_profiles')
            .select('full_name, avatar_url')
            .eq('id', question.user_id)
            .maybeSingle();

          const answersWithProfiles = await Promise.all(
            (answers || []).map(async (answer) => {
              const { data: answerUserProfile } = await supabase
                .from('user_profiles')
                .select('full_name, avatar_url')
                .eq('id', answer.user_id)
                .maybeSingle();

              return {
                ...answer,
                user_profiles: answerUserProfile || undefined,
              };
            })
          );

          return {
            ...question,
            user_profiles: questionUserProfile || undefined,
            product_answers: answersWithProfiles,
          };
        })
      );

      return questionsWithAnswers as ProductQuestion[];
    },
  });
};

export const useCreateQuestion = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, question }: { productId: string; question: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('product_questions')
        .insert({
          product_id: productId,
          user_id: user.id,
          question,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-questions', data.product_id] });
      toast.success('Question posted successfully!');
    },
    onError: () => {
      toast.error('Failed to post question');
    },
  });
};

export const useCreateAnswer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      answer, 
      productId 
    }: { 
      questionId: string; 
      answer: string; 
      productId: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('product_answers')
        .insert({
          question_id: questionId,
          user_id: user.id,
          answer,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, productId };
    },
    onSuccess: ({ productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
      toast.success('Answer posted successfully!');
    },
    onError: () => {
      toast.error('Failed to post answer');
    },
  });
};
