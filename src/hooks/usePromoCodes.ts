
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminValidation } from './useAdminValidation';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_used: boolean;
  used_by?: string;
  used_at?: string;
  created_at: string;
  expires_at?: string;
  max_uses: number;
  current_uses: number;
}

interface CreatePromoCodeData {
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  expires_at?: string;
}

const generatePromoCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) {
      result += '-';
    } else {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
};

export const usePromoCodes = () => {
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: isValidatingAdmin } = useAdminValidation();

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromoCode[];
    },
    enabled: !!isAdmin,
  });

  const createPromoCode = useMutation({
    mutationFn: async (promoData: CreatePromoCodeData) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Validate promo code data
      if (promoData.discount_type === 'percentage' && (promoData.discount_value < 0 || promoData.discount_value > 100)) {
        throw new Error('Percentage discount must be between 0 and 100');
      }
      
      if (promoData.discount_type === 'fixed' && promoData.discount_value < 0) {
        throw new Error('Fixed discount cannot be negative');
      }

      if (promoData.max_uses && promoData.max_uses < 1) {
        throw new Error('Max uses must be at least 1');
      }

      const code = generatePromoCode();
      const { data, error } = await supabase
        .from('promo_codes')
        .insert([{ ...promoData, code }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Promo code created successfully!');
    },
    onError: (error) => {
      console.error('Error creating promo code:', error);
      toast.error('Failed to create promo code');
    },
  });

  const validatePromoCode = useMutation({
    mutationFn: async (code: string) => {
      // Input sanitization
      const sanitizedCode = code.trim().toUpperCase();
      if (!/^[A-Z0-9-]+$/.test(sanitizedCode)) {
        throw new Error('Invalid promo code format');
      }

      const { data, error } = await supabase.rpc('validate_promo_code', {
        code_input: sanitizedCode
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Invalid or expired promo code');
      }
      return data[0] as PromoCode;
    },
    onError: (error) => {
      console.error('Error validating promo code:', error);
      toast.error('Invalid or expired promo code');
    },
  });

  return {
    promoCodes,
    isLoading: isLoading || isValidatingAdmin,
    createPromoCode,
    validatePromoCode,
    isCreating: createPromoCode.isPending,
    isValidating: validatePromoCode.isPending,
    isAdmin,
  };
};
