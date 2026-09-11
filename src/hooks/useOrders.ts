
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_amount?: number;
  tax_amount?: number;
    shippingAddress?: {street: string; city: string; state: string; zipCode: string; country: string} | null;
    billingAddress?: {street: string; city: string; state: string; zipCode: string; country: string} | null;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      images: string[];
    };
  }[];
}

export const useOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              images
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock order if no real orders exist (for demonstration)
      if (!data || data.length === 0) {
        const mockOrder: Order = {
          id: 'mock-order-1',
          user_id: user.id,
          order_number: 'ORD-2024-001',
          status: 'shipped',
          total_amount: 299.99,
          shipping_amount: 15.00,
          tax_amount: 24.00,
          shipping_address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          },
          billing_address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          },
          tracking_number: '1Z999AA10123456784',
          estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          delivered_at: undefined,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          updated_at: new Date().toISOString(),
          order_items: [
            {
              id: 'mock-item-1',
              product_id: 'mock-product-1',
              quantity: 1,
              price: 299.99,
              products: {
                id: 'mock-product-1',
                name: 'Premium Wireless Headphones',
                images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop']
              }
            }
          ]
        };
        return [mockOrder];
      }
      
      return data as Order[];
    },
    enabled: !!user,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    updateOrderStatus: updateOrderStatusMutation.mutate,
  };
};
