
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, Frown } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useShippingMethods } from '@/hooks/useShippingMethods';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PromoCodeInput from './PromoCodeInput';
import SEOHead from './SEOHead';
import { Progress } from '@/components/ui/progress';
import { formatPrice } from '@/utils/currency';
import VerificationTooltip from '@/components/VerificationTooltip';

const CartPage = () => {
  const { user } = useAuth();
  const { cart, isLoading, updateQuantity, removeFromCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const { shippingMethods } = useShippingMethods();
  const { data: settings } = useStorefrontSettings();

  if (!user) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20">
        <SEOHead title="Sign In to View Cart - GÜELL" />
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">{t('cart.signInToView')}</h2>
        <p className="text-muted-foreground mb-4">{t('cart.cartWaiting')}</p>
        <Button onClick={() => navigate('/auth')} className="bg-foreground text-background hover:bg-foreground/90">
          {t('cart.signIn')}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SEOHead title="Loading Cart - GÜELL" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-24 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 py-4 border-b">
                <Skeleton className="w-20 h-20 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-48 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20">
        <SEOHead title="Empty Cart - GÜELL" />
        <Frown className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">{t('cart.yourCartIsEmpty')}</h2>
        <p className="text-muted-foreground mb-4">{t('cart.addItemsToStart')}</p>
        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] text-white px-10 py-4 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl">
          Browse Products
        </Button>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const promoDiscount = appliedPromoCode 
    ? appliedPromoCode.discount_type === 'percentage' 
      ? subtotal * (appliedPromoCode.discount_value / 100)
      : appliedPromoCode.discount_value
    : 0;
  const discountedSubtotal = subtotal - promoDiscount;

  const freeShippingThreshold = settings?.free_shipping_threshold || 100;
  let shippingCost = 0;
  let shippingDisplay: string;
  
  // Check if store is verified
  const verifiedStores = settings?.verified_stores || [];
  const isStoreVerified = (brand: string) => {
    return brand ? verifiedStores.some((store) => store.toLowerCase() === brand.toLowerCase()) : false;
  };
  if (shippingMethods.length === 0) {
    // no data yet; show placeholder and treat cost as zero for now
    shippingDisplay = t('cart.calculatedAtCheckout');
    shippingCost = 0;
  } else {
    const cheapestShipping = Math.min(...shippingMethods.map(m => m.base_cost));
    shippingCost = discountedSubtotal >= freeShippingThreshold ? 0 : cheapestShipping;
    shippingDisplay = shippingCost === 0 ? t('cart.free') : formatPrice(shippingCost);
  }

  const handlePromoCodeApplied = (promoCode: any) => {
    setAppliedPromoCode(promoCode);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`Shopping Cart (${cart.length}) - GÜELL`} />
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold text-foreground">{t('cart.shoppingCart')}</h1>
        <p className="text-muted-foreground mb-8">
          {cart.length} {cart.length === 1 ? t('cart.item') : t('cart.items')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-7">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-sm text-muted-foreground">
              <div className="col-span-6">{t('cart.article')}</div>
              <div className="col-span-3 text-center">{t('cart.quantity')}</div>
              <div className="col-span-2 text-right">{t('cart.total')}</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.id} className="py-6">
                  <div className="bg-card shadow-sm rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-6 flex items-center gap-4">
                        <img
                          src={item.products.images?.[0] || '/placeholder.svg'}
                          alt={item.products.name}
                          className="w-20 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => navigate(`/store/product/${item.products.slug || item.product_id}`)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              {item.products.brand || 'GÜELL'}
                            </p>
                            {isStoreVerified(item.products.brand || 'GÜELL') && (
                              <VerificationTooltip 
                                showTooltip={true}
                                size="sm"
                              />
                            )}
                          </div>
                          <h3 className="font-medium text-foreground line-clamp-2">
                            {item.products.name}
                          </h3>
                          <p className="text-sm text-foreground mt-1">
                            {formatPrice(item.products.price)}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-3 flex items-center justify-center gap-3">
                        <button
                          onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                          className="w-8 h-8 flex items-center justify-center bg-muted hover:bg-accent rounded-full transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                          className="w-8 h-8 flex items-center justify-center bg-muted hover:bg-accent rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="col-span-2 text-right font-medium text-foreground">
                        {formatPrice(item.products.price * item.quantity)}
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-4 bg-card rounded-xl border-2 border-border p-6 shadow-lg space-y-4">
              {settings?.cart_urgency_banner_text && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 text-center text-sm font-medium text-orange-800">
                  {settings.cart_urgency_banner_text}
                </div>
              )}

              <PromoCodeInput 
                onPromoCodeApplied={handlePromoCodeApplied}
                appliedPromoCode={appliedPromoCode}
              />

              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="font-medium text-foreground">{t('cart.total')}</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatPrice(discountedSubtotal + shippingCost)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t('cart.shipping')}</span>
                  <span className="text-muted-foreground">{shippingDisplay}</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 text-sm">
                    <span>{t('cart.promoDiscount')}:</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
              </div>

              <Button 
                  className="w-full py-4 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                onClick={() => navigate('/checkout', { state: { appliedPromoCode } })}
              >
                {t('cart.buyNow')}
              </Button>

              {/* Security Section */}
              <div className="text-center space-y-2">
                <div className="flex justify-center items-center space-x-4 text-sm font-medium text-foreground">
                  <span className="px-2 py-1 bg-muted rounded">Visa</span>
<span className="px-2 py-1 bg-muted rounded">Mastercard</span>
<span className="px-2 py-1 bg-muted rounded">Amex</span>
<span className="px-2 py-1 bg-muted rounded">PayPal</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Secure payment processed with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Shipping Progress Bar */}
      {discountedSubtotal < freeShippingThreshold && (
        <div className="bg-card rounded-lg p-4 mx-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Add {formatPrice(freeShippingThreshold - discountedSubtotal)} more for FREE shipping
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((discountedSubtotal / freeShippingThreshold) * 100)}%
            </span>
          </div>
          <Progress
            value={(discountedSubtotal / freeShippingThreshold) * 100}
            className="h-2 bg-muted"
          />
        </div>
      )}

      {/* Minimalist Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <button 
              onClick={() => navigate('/terms')} 
              className="hover:text-foreground hover:underline transition-colors"
            >
              Terms & Conditions
            </button>
            <span className="text-muted-foreground">|</span>
            <button 
              onClick={() => navigate('/privacy')} 
              className="hover:text-foreground hover:underline transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CartPage;
