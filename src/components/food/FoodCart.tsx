import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Minus, Plus, X, Edit2, Check } from 'lucide-react';
import { FoodCartItem, FoodModifier } from '@/types/food';
import useFoodCart from '@/hooks/useFoodCart';

interface FoodCartProps {
  onCheckout?: () => void;
}

const FoodCart: React.FC<FoodCartProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, updateModifiers, updateSpecialInstructions, getItemsByRestaurant } = useFoodCart();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [tempInstructions, setTempInstructions] = useState<{ [key: string]: string }>({});

  const itemsByRestaurant = getItemsByRestaurant();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
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
    const currentInstructions = tempInstructions[item.id] ?? item.specialInstructions ?? '';

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{item.foodItem.name}</h4>
              <p className="text-sm text-muted-foreground">{item.foodItem.restaurant}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Modifiers */}
          {item.selectedModifiers.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {item.selectedModifiers.map((modifier) => (
                  <Badge
                    key={modifier.id}
                    variant={modifier.price > 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {formatModifierPrice(modifier)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="mb-3">
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor={`instructions-${item.id}`} className="text-sm font-medium">
                  Special Instructions
                </Label>
                <Textarea
                  id={`instructions-${item.id}`}
                  value={currentInstructions}
                  onChange={(e) => handleInstructionsChange(item.id, e.target.value)}
                  placeholder="Add any special requests..."
                  className="text-sm resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveInstructions(item.id)}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelEditing(item.id)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {item.specialInstructions ? (
                  <div className="text-sm text-muted-foreground italic">
                    Note: {item.specialInstructions}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item.id);
                      setTempInstructions(prev => ({ ...prev, [item.id]: item.specialInstructions || '' }));
                    }}
                    className="text-xs text-muted-foreground hover:text-gray-700 p-0 h-auto"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Add special instructions
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Quantity and Price */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-medium w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">${item.totalPrice.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                ${((item.foodItem.price + item.selectedModifiers.reduce((sum, m) => sum + m.price, 0)) * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">Your cart is empty</div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Cart</h2>
        <Badge variant="secondary" className="bg-orange-100 text-orange-600">
          {cart.totalItems} items
        </Badge>
      </div>

      {/* Cart Items by Restaurant */}
      {Object.entries(itemsByRestaurant).map(([restaurant, items]) => (
        <div key={restaurant} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{restaurant}</h3>
            <Badge variant="outline" className="text-xs">
              {items.length} items
            </Badge>
          </div>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
      ))}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>${cart.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={onCheckout}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            Proceed to Checkout
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodCart;
