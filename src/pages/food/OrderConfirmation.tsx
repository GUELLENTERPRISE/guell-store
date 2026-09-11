import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Package,
  Truck,
  ChefHat,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { FoodOrder } from '@/types/food';
import OrderRatingModal from '@/components/food/OrderRatingModal';
import { ORDER_STATUS_COLORS } from '@/utils/statusColors';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<FoodOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'>('pending');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // TODO: Replace with real Supabase fetch
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      
      // Mock API call - in real app, this would be your backend endpoint
      setTimeout(() => {
        const mockOrder: FoodOrder = {
          id: orderId || 'order-123',
          merchantId: 'merchant-1',
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
                merchantId: 'merchant-1',
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
            },
            {
              id: 'cart-item-2',
              foodItem: {
                id: 'margherita-pizza',
                name: 'Margherita Pizza',
                description: 'Fresh mozzarella, tomato sauce, and basil',
                price: 12.99,
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
                category: 'pizza',
                merchantId: 'merchant-2',
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
            street: 'Main Street',
            number: '123',
            reference: 'Apartment 4B',
            instructions: 'Ring doorbell, leave at front desk'
          },
          specialInstructions: 'Please deliver quickly, customer is hungry!',
          subtotal: 40.97,
          deliveryFee: 1.99,
          tax: 3.44,
          total: 46.40,
          status: orderStatus as any,
          createdAt: new Date(),
          estimatedDeliveryTime: '25-35 min'
        };
        
        setOrder(mockOrder);
        setIsLoading(false);
      }, 1500);
    };

    fetchOrder();
  }, [orderId]);

  // Simulate real-time status updates
  useEffect(() => {
    if (!order) return;

    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed'];
    const currentIndex = statusFlow.indexOf(orderStatus);
    
    if (currentIndex < statusFlow.length - 1) {
      const timer = setTimeout(() => {
        setOrderStatus(statusFlow[currentIndex + 1]);
      }, 8000); // Update status every 8 seconds for demo
      
      return () => clearTimeout(timer);
    }
  }, [orderStatus, order]);

  // Show rating modal when order is completed
  useEffect(() => {
    if (orderStatus === 'completed' && !hasRated) {
      // Show rating modal after a short delay
      const timer = setTimeout(() => {
        setShowRatingModal(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [orderStatus, hasRated]);

  const handleRatingSubmit = async (rating: {
    orderId: string;
    rating: number;
    comment: string;
    isRecommended: boolean;
  }) => {
    // Simulate API call to submit rating
    console.log('Submitting rating:', rating);
    setHasRated(true);
    setShowRatingModal(false);
  };

  const getStatusColor = (status: string) => {
    return ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'preparing': return <ChefHat className="w-5 h-5" />;
      case 'ready': return <Package className="w-5 h-5" />;
      case 'delivering': return <Truck className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Order not found</p>
          <Button onClick={() => navigate('/food')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Food
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Success Header */}
      <div className="text-center py-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Thank you for your order. We're preparing it with care.
        </p>
        <Badge className="bg-green-600 text-white text-lg px-6 py-2">
          Order #{orderId?.split('-')[1]}
        </Badge>
      </div>

      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
            <div className={`p-3 rounded-full ${getStatusColor(orderStatus)}`}>
              {getStatusIcon(orderStatus)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg capitalize">{orderStatus}</div>
              <div className="text-sm text-muted-foreground">
                {orderStatus === 'pending' && 'We received your order and are reviewing it'}
                {orderStatus === 'confirmed' && 'Your order has been confirmed by the restaurant'}
                {orderStatus === 'preparing' && 'The chef is preparing your delicious food'}
                {orderStatus === 'ready' && 'Your order is ready and waiting for delivery'}
                {orderStatus === 'delivering' && 'Your order is on its way to you'}
                {orderStatus === 'completed' && 'Your order has been delivered. Enjoy!'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {/* Status Progress */}
          <div className="mt-6 flex items-center justify-between">
            {['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed'].map((status, index) => {
              const isCompleted = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed']
                .indexOf(orderStatus) >= index;
              
              return (
                <div key={status} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xs mt-1 capitalize text-center">
                    {status === 'pending' && 'Order'}
                    {status === 'confirmed' && 'Confirm'}
                    {status === 'preparing' && 'Prepare'}
                    {status === 'ready' && 'Ready'}
                    {status === 'delivering' && 'Deliver'}
                    {status === 'completed' && 'Complete'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={item.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.foodItem.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.foodItem.price}
                      </div>
                      
                      {/* Modifiers */}
                      {item.selectedModifiers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.selectedModifiers.map((modifier) => (
                            <div key={modifier.id} className="text-sm text-muted-foreground flex justify-between">
                              <span>• {modifier.name}</span>
                              {modifier.price > 0 && (
                                <span>+${modifier.price.toFixed(2)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Special Instructions */}
                      {item.specialInstructions && (
                        <div className="mt-2 text-sm text-blue-600 italic">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${item.totalPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Delivery Address</div>
                  <div className="text-sm text-muted-foreground">
                    {order.deliveryAddress.street} {order.deliveryAddress.number}
                    {order.deliveryAddress.reference && `, ${order.deliveryAddress.reference}`}
                  </div>
                </div>
              </div>

              {order.deliveryAddress.instructions && (
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-800">Delivery Instructions</div>
                    <div className="text-sm text-orange-700">
                      {order.deliveryAddress.instructions}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Estimated Delivery</div>
                  <div className="text-sm text-muted-foreground">
                    {order.estimatedDeliveryTime}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Contact</div>
                  <div className="text-sm text-muted-foreground">
                    +1-555-0123
                  </div>
                </div>
              </div>
            </div>

            {order.specialInstructions && (
              <>
                <Separator />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="font-medium text-blue-800 mb-1">Order Notes</div>
                  <div className="text-sm text-blue-700">
                    {order.specialInstructions}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/food')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Button>
        <Button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </Button>
      </div>

      {/* Rating Modal */}
      <OrderRatingModal
        order={order}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default OrderConfirmation;
