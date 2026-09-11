import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, CreditCard, AlertCircle, Check, Plus, Edit, Trash2 } from 'lucide-react';
import { FoodCheckoutData, DeliveryAddress } from '@/types/food';
import useFoodCart from '@/hooks/useFoodCart';
import useProfileSync, { UserProfile } from '@/hooks/useProfileSync';

interface FoodCheckoutFormProps {
  onSubmit: (data: FoodCheckoutData) => void;
  onCancel: () => void;
}

const FoodCheckoutForm: React.FC<FoodCheckoutFormProps> = ({ onSubmit, onCancel }) => {
  const { cart, getItemsByRestaurant } = useFoodCart();
  const { profile, getDefaultAddress, getAddressesForSection } = useProfileSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState('25-35 min');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserProfile['addresses'][0] | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<FoodCheckoutData>({
    defaultValues: {
      deliveryAddress: getDefaultAddress() || {
        street: '',
        number: '',
        reference: '',
        instructions: ''
      },
      specialInstructions: '',
      paymentMethod: 'credit-card'
    }
  });

  const watchedAddress = watch('deliveryAddress');
  const watchedInstructions = watch('specialInstructions');

  // Calculate delivery estimate based on restaurant
  useEffect(() => {
    if (watchedAddress.street && watchedAddress.number) {
      const firstItem = Object.values(itemsByRestaurant)?.[0];
      const restaurantDeliveryTime = firstItem?.foodItem?.deliveryTime;
      setDeliveryEstimate(restaurantDeliveryTime ?? '25-35 min');
    }
  }, [watchedAddress.street, watchedAddress.number, itemsByRestaurant]);

  const itemsByRestaurant = getItemsByRestaurant();

  const onFormSubmit = async (data: FoodCheckoutData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateDeliveryAddress = (address: DeliveryAddress): boolean => {
    return !!(address.street.trim() && address.number.trim());
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Street *</Label>
                  <Input
                    id="street"
                    placeholder="Main Street"
                    {...register('deliveryAddress.street', {
                      required: 'Street is required',
                      minLength: { value: 3, message: 'Street must be at least 3 characters' }
                    })}
                    className={errors.deliveryAddress?.street ? 'border-red-500' : ''}
                  />
                  {errors.deliveryAddress?.street && (
                    <p className="text-sm text-red-500 mt-1">{errors.deliveryAddress.street.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="number">Number *</Label>
                  <Input
                    id="number"
                    placeholder="123"
                    {...register('deliveryAddress.number', {
                      required: 'Number is required',
                      pattern: { value: /^[0-9]+[a-zA-Z]??$/, message: 'Invalid house number' }
                    })}
                    className={errors.deliveryAddress?.number ? 'border-red-500' : ''}
                  />
                  {errors.deliveryAddress?.number && (
                    <p className="text-sm text-red-500 mt-1">{errors.deliveryAddress.number.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input
                  id="reference"
                  placeholder="Apartment 4B, Floor 2, etc."
                  {...register('deliveryAddress.reference')}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Ring doorbell, leave at front desk, etc."
                  rows={2}
                  {...register('deliveryAddress.instructions')}
                />
              </div>

              {/* Address Validation Status */}
              <div className="flex items-center gap-2">
                {validateDeliveryAddress(watchedAddress) ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Delivery address is valid</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600">Street and number are required</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Notes to the Chef / Delivery Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requests for the chef or delivery instructions..."
                rows={3}
                {...register('specialInstructions')}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2">
                This will be shared with the restaurant and delivery partner
              </p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: 'credit-card', label: 'Credit Card', description: 'Visa, Mastercard, Amex' },
                  { id: 'debit-card', label: 'Debit Card', description: 'Visa, Mastercard' },
                  { id: 'cash', label: 'Cash on Delivery', description: 'Pay when you receive' }
                ].map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-background">
                    <input
                      type="radio"
                      id={method.id}
                      value={method.id}
                      {...register('paymentMethod', { required: 'Payment method is required' })}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.label}
                      </label>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500 mt-2">{errors.paymentMethod.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delivery Time */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Estimated delivery: {deliveryEstimate}</span>
              </div>

              <Separator />

              {/* Items by Restaurant */}
              {Object.entries(itemsByRestaurant).map(([restaurant, items]) => (
                <div key={restaurant} className="space-y-2">
                  <div className="font-medium text-sm">{restaurant}</div>
                  {items.map((item) => (
                    <div key={item.id} className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>{item.quantity}x {item.foodItem.name}</span>
                        <span>${item.totalPrice.toFixed(2)}</span>
                      </div>
                      {item.selectedModifiers.length > 0 && (
                        <div className="text-xs text-muted-foreground pl-4">
                          {item.selectedModifiers.map(modifier => (
                            <span key={modifier.id}>
                              {modifier.name}
                              {modifier.price > 0 && ` (+$${modifier.price.toFixed(2)})`}
                              {', '}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-xs text-muted-foreground pl-4 italic">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <Separator />

              {/* Price Breakdown */}
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
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit(onFormSubmit)}
                disabled={!isValid || isSubmitting || !validateDeliveryAddress(watchedAddress)}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {isSubmitting ? 'Processing...' : `Place Order - $${cart.total.toFixed(2)}`}
              </Button>

              {!isValid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fill in all required fields to complete your order.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FoodCheckoutForm;
