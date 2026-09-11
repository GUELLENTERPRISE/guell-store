import { useState, useEffect, useCallback } from 'react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number; // percentage or fixed amount
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  applicableTo: 'all' | 'food' | 'store' | 'specific_merchant';
  applicableMerchantIds?: string[];
  expiresAt: Date;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  description: string;
}

interface CouponValidationResult {
  isValid: boolean;
  discount: number;
  message: string;
  coupon?: Coupon;
}

const useCouponSystem = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock coupon data - in real app, this would come from backend
  useEffect(() => {
    const mockCoupons: Coupon[] = [
      {
        id: 'coupon-1',
        code: 'WELCOME20',
        type: 'percentage',
        value: 20,
        minPurchaseAmount: 25,
        maxDiscountAmount: 10,
        applicableTo: 'all',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        usageLimit: 1000,
        usageCount: 245,
        description: '20% off your first order (max $10 discount)'
      },
      {
        id: 'coupon-2',
        code: 'FREEDelivery',
        type: 'free_delivery',
        value: 0,
        minPurchaseAmount: 15,
        applicableTo: 'food',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
        usageLimit: 500,
        usageCount: 123,
        description: 'Free delivery on orders over $15'
      },
      {
        id: 'coupon-3',
        code: 'BURGER10',
        type: 'fixed',
        value: 10,
        minPurchaseAmount: 30,
        applicableTo: 'specific_merchant',
        applicableMerchantIds: ['merchant-1', 'merchant-2'], // Burger restaurants
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        isActive: true,
        usageLimit: 200,
        usageCount: 67,
        description: '$10 off burger orders over $30'
      },
      {
        id: 'coupon-4',
        code: 'EXPIRED',
        type: 'percentage',
        value: 15,
        minPurchaseAmount: 20,
        applicableTo: 'all',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
        isActive: true,
        usageLimit: 100,
        usageCount: 85,
        description: 'Expired coupon for testing'
      }
    ];
    
    setCoupons(mockCoupons);
  }, []);

  const validateCoupon = useCallback((
    code: string,
    cartTotal: number,
    merchantId?: string,
    section: 'food' | 'store' = 'food'
  ): CouponValidationResult => {
    // Find coupon by code (case insensitive)
    const coupon = coupons.find(c => 
      c.code.toLowerCase() === code.toLowerCase() && c.isActive
    );

    if (!coupon) {
      return {
        isValid: false,
        discount: 0,
        message: 'Invalid coupon code'
      };
    }

    // Check if expired
    if (new Date() > coupon.expiresAt) {
      return {
        isValid: false,
        discount: 0,
        message: 'Coupon has expired'
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discount: 0,
        message: 'Coupon usage limit reached'
      };
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      return {
        isValid: false,
        discount: 0,
        message: `Minimum purchase of $${coupon.minPurchaseAmount} required`
      };
    }

    // Check section applicability
    if (coupon.applicableTo !== 'all' && coupon.applicableTo !== section) {
      return {
        isValid: false,
        discount: 0,
        message: `Coupon not applicable to ${section} orders`
      };
    }

    // Check merchant applicability
    if (coupon.applicableTo === 'specific_merchant' && merchantId) {
      if (!coupon.applicableMerchantIds?.includes(merchantId)) {
        return {
          isValid: false,
          discount: 0,
          message: 'Coupon not applicable to this restaurant'
        };
      }
    }

    // Calculate discount
    let discount = 0;
    
    switch (coupon.type) {
      case 'percentage':
        discount = (cartTotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
        break;
      case 'fixed':
        discount = Math.min(coupon.value, cartTotal);
        break;
      case 'free_delivery':
        discount = 2.99; // Standard delivery fee
        break;
    }

    return {
      isValid: true,
      discount,
      message: coupon.description,
      coupon
    };
  }, [coupons]);

  const applyCoupon = useCallback((
    code: string,
    cartTotal: number,
    merchantId?: string,
    section: 'food' | 'store' = 'food'
  ) => {
    setIsLoading(true);
    
    try {
      const result = validateCoupon(code, cartTotal, merchantId, section);
      
      if (result.isValid && result.coupon) {
        setAppliedCoupon(result.coupon);
        
        // Increment usage count (in real app, this would be API call)
        setCoupons(prev => prev.map(c => 
          c.id === result.coupon!.id 
            ? { ...c, usageCount: c.usageCount + 1 }
            : c
        ));
        
        return {
          success: true,
          discount: result.discount,
          message: result.message
        };
      } else {
        return {
          success: false,
          discount: 0,
          message: result.message
        };
      }
    } finally {
      setIsLoading(false);
    }
  }, [validateCoupon]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const getAvailableCoupons = useCallback((section: 'food' | 'store' = 'food') => {
    return coupons.filter(coupon => 
      coupon.isActive && 
      new Date() <= coupon.expiresAt &&
      (coupon.applicableTo === 'all' || coupon.applicableTo === section)
    );
  }, [coupons]);

  const getCouponDisplayInfo = useCallback((coupon: Coupon) => {
    const isPercentage = coupon.type === 'percentage';
    const isFixed = coupon.type === 'fixed';
    const isFreeDelivery = coupon.type === 'free_delivery';
    
    let displayText = '';
    if (isPercentage) {
      displayText = `${coupon.value}% OFF`;
      if (coupon.maxDiscountAmount) {
        displayText += ` (max $${coupon.maxDiscountAmount})`;
      }
    } else if (isFixed) {
      displayText = `$${coupon.value} OFF`;
    } else if (isFreeDelivery) {
      displayText = 'FREE DELIVERY';
    }
    
    return {
      displayText,
      description: coupon.description,
      minPurchase: `Min. $${coupon.minPurchaseAmount}`,
      expiry: `Expires ${coupon.expiresAt.toLocaleDateString()}`,
      usageLeft: coupon.usageLimit 
        ? `${coupon.usageLimit - coupon.usageCount} left`
        : 'Unlimited'
    };
  }, []);

  return {
    coupons,
    appliedCoupon,
    isLoading,
    validateCoupon,
    applyCoupon,
    removeCoupon,
    getAvailableCoupons,
    getCouponDisplayInfo
  };
};

export default useCouponSystem;
export type { Coupon, CouponValidationResult };
