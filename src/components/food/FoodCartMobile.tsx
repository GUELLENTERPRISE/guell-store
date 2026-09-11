import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, X, Edit2, Check, ShoppingBag } from 'lucide-react';
import { FoodCartItem, FoodModifier } from '@/types/food';
import useFoodCart from '@/hooks/useFoodCart';

interface FoodCartMobileProps {
  onCheckout?: () => void;
}

const FoodCartMobile: React.FC<FoodCartMobileProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, updateSpecialInstructions, getItemsByRestaurant } = useFoodCart();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [tempInstructions, setTempInstructions] = useState<{ [key: string]: string }>({});

  const itemsByRestaurant = getItemsByRestaurant();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleInstructionsChange = (itemId: string, instructions: string) => {
    setTempInstructions(prev => ({ ...prev, [itemId]: instructions }));
  };

  const saveInstructions = (itemId: string) => {
    updateSpecialInstructions(itemId, tempInstructions[itemId] || '');
    setEditingItem(null);
  };

  const cancelEditing = (itemId: string) => {
    const item = cart.items.find(i => i.id === itemId);
    if (item) {
      setTempInstructions(prev => ({ ...prev, [itemId]: item.specialInstructions || '' }));
    }
    setEditingItem(null);
  };

  const formatModifierPrice = (modifier: FoodModifier) => {
    if (modifier.price === 0) return modifier.name;
    return `${modifier.name} (+$${modifier.price.toFixed(2)})`;
  };

  const CartItem: React.FC<{ item: FoodCartItem }> = ({ item }) => {
    const isEditing = editingItem === item.id;

    return (
      <div className="bg-card rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Item Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-base leading-tight">
              {item.foodItem.name}
            </h4>
            <div className="text-sm text-muted-foreground mt-1">
              ${item.foodItem.price.toFixed(2)} each
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modifiers */}
        {item.selectedModifiers.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-yellow-800 mb-2">
              MODIFICATIONS
            </div>
            <div className="space-y-1">
              {item.selectedModifiers.map((modifier) => (
                <div key={modifier.id} className="text-sm text-yellow-700">
                  {formatModifierPrice(modifier)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={tempInstructions[item.id] || ''}
                onChange={(e) => handleInstructionsChange(item.id, e.target.value)}
                placeholder="Add special instructions..."
                className="min-h-[80px] text-sm resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => saveInstructions(item.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-10"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => cancelEditing(item.id)}
                  className="px-4 py-2 h-10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {item.specialInstructions ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-800 mb-1">
                    SPECIAL INSTRUCTIONS
                  </div>
                  <div className="text-sm text-blue-700">
                    {item.specialInstructions}
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(item.id)}
                  className="text-blue-600 hover:text-blue-700 border-blue-200 px-4 py-2 h-10"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Add Instructions
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
              className="h-8 w-8 p-0 hover:bg-gray-200"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <span className="font-semibold text-foreground min-w-[2rem] text-center">
              {item.quantity}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg text-foreground">
              ${item.totalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              ${item.foodItem.price.toFixed(2)} × {item.quantity}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-muted-foreground">
              Add some delicious items to get started!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Cart ({cart.items.length})
        </h2>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          {cart.items.length} items
        </Badge>
      </div>

      {/* Cart Items by Restaurant */}
      <div className="space-y-6">
        {itemsByRestaurant.map((restaurant) => (
          <div key={restaurant.merchantId} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <h3 className="font-semibold text-foreground">{restaurant.merchantName}</h3>
            </div>
            
            <div className="space-y-3">
              {restaurant.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            
            <Separator />
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>${cart.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${cart.tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 h-14 text-lg"
      >
        Proceed to Checkout
      </Button>

      {/* Continue Shopping */}
      <Button
        variant="outline"
        className="w-full py-4 h-14"
      >
        Continue Shopping
      </Button>
    </div>
  );
};

export default FoodCartMobile;
