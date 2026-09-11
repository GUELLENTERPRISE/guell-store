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
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  Check,
  Plus,
  Edit,
  ChevronDown
} from 'lucide-react';
import { FoodCheckoutData, DeliveryAddress } from '@/types/food';
import useFoodCart from '@/hooks/useFoodCart';
import useProfileSync, { UserProfile } from '@/hooks/useProfileSync';
import useCouponSystem from '@/hooks/useCouponSystem';

interface FoodCheckoutFormMobileProps {
  onSubmit: (data: FoodCheckoutData) => void;
  onCancel: () => void;
}

const FoodCheckoutFormMobile: React.FC<FoodCheckoutFormMobileProps> = ({ onSubmit, onCancel }) => {
  const { cart, getItemsByRestaurant } = useFoodCart();
  const { profile, getDefaultAddress, getAddressesForSection } = useProfileSync();
  const { validateCoupon, applyCoupon, removeCoupon, appliedCoupon, getCouponDisplayInfo } = useCouponSystem();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState('25-35 min');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

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
  const watchedPaymentMethod = watch('paymentMethod');

  useEffect(() => {
    // Set default address if available
    const defaultAddr = getDefaultAddress();
    if (defaultAddr && !selectedAddress) {
      setSelectedAddress(defaultAddr);
      setValue('deliveryAddress', defaultAddr);
    }
  }, [profile, getDefaultAddress, selectedAddress, setValue]);

  const itemsByRestaurant = getItemsByRestaurant();

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponError('');
    
    try {
      const result = await applyCoupon(couponCode, cart.total, undefined, 'food');
      
      if (result.success) {
        setCouponCode('');
        setCouponError('');
      } else {
        setCouponError(result.message);
      }
    } catch (error) {
      setCouponError('Failed to apply coupon');
    }
  };

  const handleAddressSelect = (address: UserProfile['addresses'][0]) => {
    const deliveryAddress: DeliveryAddress = {
      street: address.street,
      number: address.number,
      reference: address.reference || '',
      instructions: address.instructions || ''
    };
    
    setSelectedAddress(deliveryAddress);
    setValue('deliveryAddress', deliveryAddress);
    setShowSavedAddresses(false);
  };

  const onFormSubmit = async (data: FoodCheckoutData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with real Supabase order insert
      onSubmit(data);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    let total = cart.total;
    if (appliedCoupon) {
      const validation = validateCoupon(appliedCoupon.code, cart.total, undefined, 'food');
      if (validation.isValid) {
        total -= validation.discount;
      }
    }
    return Math.max(0, total);
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your cart is empty. Add some items before checkout.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Complete your order details
        </p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {itemsByRestaurant.map((restaurant) => (
              <div key={restaurant.merchantId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-sm">{restaurant.merchantName}</span>
                </div>
                {restaurant.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm pl-4">
                    <span>{item.quantity}× {item.foodItem.name}</span>
                    <span>${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${cart.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>-${getCouponDisplayInfo(appliedCoupon).displayText}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saved Addresses */}
          {getAddressesForSection('food').length > 0 && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                className="w-full justify-between h-12"
              >
                <span>Select Saved Address</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSavedAddresses ? 'rotate-180' : ''}`} />
              </Button>
              
              {showSavedAddresses && (
                <div className="space-y-2">
                  {getAddressesForSection('food').map((address) => (
                    <Button
                      key={address.id}
                      variant={selectedAddress?.street === address.street ? "default" : "outline"}
                      onClick={() => handleAddressSelect(address)}
                      className="w-full justify-start h-auto p-3"
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          {address.street} {address.number}
                        </div>
                        {address.reference && (
                          <div className="text-sm text-muted-foreground">{address.reference}</div>
                        )}
                        {address.isDefault && (
                          <Badge variant="secondary" className="mt-1">Default</Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Address Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                {...register('deliveryAddress.street', { required: 'Street address is required' })}
                placeholder="123 Main Street"
                className="h-12"
              />
              {errors.deliveryAddress?.street && (
                <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress.street.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="number">Apartment/Suite Number</Label>
              <Input
                id="number"
                {...register('deliveryAddress.number')}
                placeholder="Apt 4B"
                className="h-12"
              />
            </div>
            
            <div>
              <Label htmlFor="reference">Landmark/Reference</Label>
              <Input
                id="reference"
                {...register('deliveryAddress.reference')}
                placeholder="Near the big oak tree"
                className="h-12"
              />
            </div>
            
            <div>
              <Label htmlFor="instructions">Delivery Instructions</Label>
              <Textarea
                id="instructions"
                {...register('deliveryAddress.instructions')}
                placeholder="Ring doorbell, leave at front desk"
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Promo Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appliedCoupon ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-800">
                    {appliedCoupon.code}
                  </div>
                  <div className="text-sm text-green-600">
                    {getCouponDisplayInfo(appliedCoupon).displayText}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 h-12"
              />
              <Button
                onClick={handleCouponApply}
                className="bg-orange-600 hover:bg-orange-700 px-6"
              >
                Apply
              </Button>
            </div>
          )}
          
          {couponError && (
            <p className="text-red-500 text-sm">{couponError}</p>
          )}
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('specialInstructions')}
            placeholder="Any special requests for your order?"
            className="min-h-[80px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['credit-card', 'debit-card', 'cash'].map((method) => (
              <Button
                key={method}
                variant={watchedPaymentMethod === method ? "default" : "outline"}
                onClick={() => setValue('paymentMethod', method as any)}
                className="w-full justify-start h-12"
              >
                {method === 'credit-card' && 'Credit Card'}
                {method === 'debit-card' && 'Debit Card'}
                {method === 'cash' && 'Cash on Delivery'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit(onFormSubmit)}
        disabled={!isValid || isSubmitting}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 h-14 text-lg"
      >
        {isSubmitting ? 'Processing...' : `Place Order - $${calculateTotal().toFixed(2)}`}
      </Button>

      {/* Cancel Button */}
      <Button
        variant="outline"
        onClick={onCancel}
        className="w-full py-4 h-14"
      >
        Cancel Order
      </Button>
    </div>
  );
};

export default FoodCheckoutFormMobile;
