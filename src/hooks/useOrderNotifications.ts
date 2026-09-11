import { useState, useEffect, useCallback, useRef } from 'react';
import { FoodOrder } from '@/types/food';

interface UseOrderNotificationsProps {
  merchantId: string;
  onNewOrder?: (order: FoodOrder) => void;
  onOrderUpdate?: (orderId: string, status: string) => void;
}

const useOrderNotifications = ({ 
  merchantId, 
  onNewOrder, 
  onOrderUpdate 
}: UseOrderNotificationsProps) => {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as AudioContext).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800 Hz tone
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    audioRef.current = {
      play: createNotificationSound
    } as any;
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  // Simulate API call to fetch orders
  const fetchOrders = useCallback(async (): Promise<FoodOrder[]> => {
    // Mock API call - in real app, this would be your backend endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock orders data
        const mockOrders: FoodOrder[] = [
          {
            id: 'order-1',
            merchantId,
            items: [
              {
                id: 'cart-item-1',
                foodItem: {
                  id: 'classic-burger',
                  name: 'Classic Burger',
                  description: 'Juicy beef patty with lettuce, tomato, onion, and pickles',
                  price: 10.99,
                  image: 'https://images.unsplash.com/photo-1568901343476-25c52d4f15e9?w=300&h=200&fit=crop',
                  category: 'burgers',
                  merchantId,
                  rating: 4.6,
                  deliveryTime: '20-30 min',
                  deliveryPrice: '$1.99',
                  modifierGroups: [],
                  promo: '20% OFF',
                  isActive: true,
                  inventory: 50,
                  allergens: ['gluten', 'dairy']
                },
                quantity: 2,
                selectedModifiers: [
                  { id: 'extra-cheese', name: 'Extra Cheese', price: 1.50, type: 'addon' },
                  { id: 'no-onion', name: 'No Onion', price: 0, type: 'modifier' }
                ],
                selectedOptions: {},
                specialInstructions: 'Extra well done, please',
                totalPrice: 25.98
              }
            ],
            deliveryAddress: {
              street: 'Main Street',
              number: '123',
              reference: 'Apartment 4B',
              instructions: 'Ring doorbell, leave at front desk'
            },
            specialInstructions: 'Please deliver quickly, customer is hungry!',
            subtotal: 25.98,
            deliveryFee: 1.99,
            tax: 2.24,
            total: 30.21,
            status: 'pending',
            createdAt: new Date(),
            estimatedDeliveryTime: '25-35 min'
          },
          {
            id: 'order-2',
            merchantId,
            items: [
              {
                id: 'cart-item-2',
                foodItem: {
                  id: 'margherita-pizza',
                  name: 'Margherita Pizza',
                  description: 'Fresh mozzarella, tomato sauce, and basil',
                  price: 12.99,
                  image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
                  category: 'pizza',
                  merchantId,
                  rating: 4.8,
                  deliveryTime: '25-35 min',
                  deliveryPrice: '$2.99',
                  modifierGroups: [],
                  promo: 'FREE DELIVERY',
                  isActive: true,
                  inventory: 30,
                  allergens: ['gluten']
                },
                quantity: 1,
                selectedModifiers: [
                  { id: 'extra-cheese-pizza', name: 'Extra Cheese', price: 2.00, type: 'addon' }
                ],
                selectedOptions: {},
                specialInstructions: '',
                totalPrice: 14.99
              }
            ],
            deliveryAddress: {
              street: 'Oak Avenue',
              number: '456',
              reference: '',
              instructions: ''
            },
            specialInstructions: '',
            subtotal: 14.99,
            deliveryFee: 0, // Free delivery
            tax: 1.20,
            total: 16.19,
            status: 'confirmed',
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
            estimatedDeliveryTime: '30-40 min'
          }
        ];
        resolve(mockOrders);
      }, 1000);
    });
  }, [merchantId]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    // Simulate API call to update order status
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: status as OrderStatus }
            : order
        ));
        
        onOrderUpdate?.(orderId, status);
        resolve(true);
      }, 500);
    });
  }, [onOrderUpdate]);

  // Start polling for new orders
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const newOrders = await fetchOrders();
        const previousOrderIds = new Set(orders.map(o => o.id));
        
        // Check for new orders
        const newOrdersOnly = newOrders.filter(order => !previousOrderIds.has(order.id));
        
        if (newOrdersOnly.length > 0) {
          // Play notification sound for new orders
          playNotificationSound();
          
          // Notify about new orders
          newOrdersOnly.forEach(order => {
            onNewOrder?.(order);
          });
        }
        
        setOrders(newOrders);
        setLastPoll(new Date());
        setIsConnected(true);
      } catch (error) {
        console.error('Error polling for orders:', error);
        setIsConnected(false);
      }
    }, 5000); // Poll every 5 seconds
  }, [fetchOrders, orders, onNewOrder, playNotificationSound]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Start polling when component mounts
  useEffect(() => {
    if (merchantId) {
      startPolling();
      
      // Initial fetch
      fetchOrders().then(initialOrders => {
        setOrders(initialOrders);
        setIsConnected(true);
      });
    }

    return () => {
      stopPolling();
    };
  }, [merchantId, startPolling, stopPolling, fetchOrders]);

  // Manual refresh
  const refreshOrders = useCallback(async () => {
    const newOrders = await fetchOrders();
    setOrders(newOrders);
    setLastPoll(new Date());
  }, [fetchOrders]);

  return {
    orders,
    isConnected,
    lastPoll,
    updateOrderStatus,
    refreshOrders,
    startPolling,
    stopPolling
  };
};

export default useOrderNotifications;
