import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  Phone, 
  User,
  CheckCircle,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react';
import { FoodOrder } from '@/types/food';

interface OrderDetailsModalProps {
  order: FoodOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivering': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivering': return <Truck className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['delivering'],
      'delivering': ['completed'],
      'completed': [],
      'cancelled': []
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order #{order.id.split('-')[1]} - Ticket View
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
              </div>
              <div>
                <div className="font-semibold capitalize">{order.status}</div>
                <div className="text-sm text-muted-foreground">
                  {order.createdAt.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {getNextStatusOptions(order.status).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating}
                  className="capitalize"
                >
                  Mark as {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Items</h3>
              
              {order.items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 bg-card">
                  {/* Item Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {index + 1}. {item.foodItem.name}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.foodItem.price}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${item.totalPrice.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        Base: ${(item.foodItem.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* MODIFIERS - HIGHLIGHTED SECTION */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="font-semibold text-sm text-yellow-800">
                          ⚠️ MODIFICATIONS
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {item.selectedModifiers.map((modifier) => (
                          <div 
                            key={modifier.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                              <span className={modifier.price > 0 ? 'font-medium text-yellow-900' : 'text-yellow-800'}>
                                {modifier.name}
                              </span>
                            </div>
                            {modifier.price > 0 && (
                              <span className="font-medium text-yellow-900">
                                +${modifier.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {item.specialInstructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-sm text-blue-800">
                          📝 SPECIAL INSTRUCTIONS
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 italic">
                        {item.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Delivery Information</h3>
              
              <div className="border rounded-lg p-4 bg-card">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
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
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-800">Delivery Instructions</div>
                        <div className="text-sm text-orange-700">
                          {order.deliveryAddress.instructions}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Estimated Delivery</div>
                      <div className="text-sm text-muted-foreground">
                        {order.estimatedDeliveryTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Special Instructions */}
              {order.specialInstructions && (
                <div className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="font-semibold text-sm text-orange-800">
                      📋 ORDER NOTES
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 italic">
                    {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border rounded-lg p-4 bg-background">
                <h4 className="font-semibold mb-3">Price Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
