
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInventoryCheck = () => {
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const { data: product, error } = await supabase
        .from('products')
        .select('inventory')
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      if (!product || product.inventory < quantity) {
        throw new Error(`Insufficient inventory. Available: ${product?.inventory || 0}, Requested: ${quantity}`);
      }

      return { available: true, inventory: product.inventory };
    },
  });
};

export const useInventoryReservation = () => {
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      // Check current inventory
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('inventory')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!product || product.inventory < quantity) {
        throw new Error('Insufficient inventory');
      }

      // Reserve inventory by reducing the count
      const { data, error } = await supabase
        .from('products')
        .update({ 
          inventory: product.inventory - quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('inventory', product.inventory) // Optimistic locking
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to reserve inventory - concurrent modification');

      return data;
    },
  });
};
