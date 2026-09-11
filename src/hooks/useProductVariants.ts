import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  options: string[];
}

export interface ProductVariantOption {
  id: string;
  product_id: string;
  sku?: string;
  variant_values: Record<string, string>;
  price_adjustment: number;
  inventory: number;
}

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data as ProductVariant[];
    },
  });
};

export const useProductVariantOptions = (productId: string) => {
  return useQuery({
    queryKey: ['product-variant-options', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variant_options')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data as ProductVariantOption[];
    },
  });
};
