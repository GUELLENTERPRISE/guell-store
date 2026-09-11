import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Clock, 
  MapPin, 
  Tag, 
  ArrowRight, 
  Utensils, 
  ShoppingBag,
  Percent,
  Gift
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { FoodItem } from '@/types/food';
import { getAllMerchants, generateFoodItems } from '@/data/merchantData';

interface CrossRecommendation {
  id: string;
  type: 'food_to_store' | 'store_to_food';
  title: string;
  description: string;
  item?: FoodItem;
  coupon?: {
    code: string;
    discount: number;
    expiresAt: Date;
  };
  imageUrl: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  deliveryTime?: string;
  merchant?: string;
  urgency?: 'high' | 'medium' | 'low';
}

const CrossRecommendations: React.FC = () => {
  const location = useLocation();
  const [recommendations, setRecommendations] = useState<CrossRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const path = location.pathname;
      let newRecommendations: CrossRecommendation[] = [];

      // Store cart recommendations
      if (path.includes('/store/cart')) {
        const merchants = getAllMerchants();
        const foodItems = merchants.slice(0, 3).flatMap(merchant => 
          generateFoodItems(merchant.id, 'burgers').slice(0, 2)
        );

        newRecommendations = foodItems.map((item, index) => ({
          id: `food-rec-${index}`,
          type: 'store_to_food',
          title: '¿Tienes hambre?',
          description: 'Obtén 10% de descuento en GÜELL Food en tu compra de hoy',
          item,
          coupon: {
            code: 'STORE10FOOD',
            discount: 10,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          },
          imageUrl: item.image,
          price: item.price,
          originalPrice: item.previousPrice,
          rating: item.rating,
          deliveryTime: item.deliveryTime,
          merchant: merchants.find(m => m.id === item.merchantId)?.businessName,
          urgency: index === 0 ? 'high' : 'medium'
        }));
      }

      // Food checkout recommendations
      if (path.includes('/food/checkout')) {
        newRecommendations = [
          {
            id: 'store-rec-1',
            type: 'food_to_store',
            title: 'Oferta Exclusiva',
            description: 'Cupón de un solo uso para GÜELL Store - 15% de descuento',
            coupon: {
              code: 'FOOD15STORE',
              discount: 15,
              expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
            },
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
            urgency: 'high'
          },
          {
            id: 'store-rec-2',
            type: 'food_to_store',
            title: 'Accesorios para tu Cocina',
            description: 'Descubre productos perfectos para complementar tu comida',
            imageUrl: 'https://images.unsplash.com/photo-1556909114-4e1a0c0b5a0c?w=400&h=300&fit=crop',
            urgency: 'medium'
          }
        ];
      }

      // Filter out dismissed recommendations
      const activeRecommendations = newRecommendations.filter(
        rec => !dismissedRecommendations.has(rec.id)
      );

      setRecommendations(activeRecommendations);
      setIsLoading(false);
    };

    generateRecommendations();
  }, [location.pathname, dismissedRecommendations]);

  const handleDismiss = (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
  };

  const handleAction = (recommendation: CrossRecommendation) => {
    if (recommendation.coupon) {
      // Apply coupon logic
      // Apply coupon logic
      
      // Show success message
      const successMessage = `¡Cupón ${recommendation.coupon.code} aplicado! ${recommendation.coupon.discount}% de descuento`;
      
      // Store coupon in localStorage for checkout
      localStorage.setItem('appliedCoupon', JSON.stringify(recommendation.coupon));
      
      // Navigate to appropriate section
      if (recommendation.type === 'store_to_food') {
        window.location.href = '/food';
      } else if (recommendation.type === 'food_to_store') {
        window.location.href = '/store';
      }
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-orange-200 bg-orange-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-background';
    }
  };

  const getUrgencyBadgeColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  if (recommendations.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card 
          key={recommendation.id} 
          className={`border-2 ${getUrgencyColor(recommendation.urgency)} hover:shadow-lg transition-all duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {recommendation.type === 'store_to_food' ? (
                  <Utensils className="w-5 h-5 text-orange-600" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{recommendation.title}</h3>
                  {recommendation.urgency && (
                    <Badge className={getUrgencyBadgeColor(recommendation.urgency)}>
                      {recommendation.urgency === 'high' ? 'Oferta Limitada' :
                       recommendation.urgency === 'medium' ? 'Popular' : 'Sugerencia'}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(recommendation.id)}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Image */}
              <div className="md:col-span-1">
                <img
                  src={recommendation.imageUrl}
                  alt={recommendation.title}
                  className="w-full h-24 object-cover rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="md:col-span-3">
                <p className="text-gray-700 mb-3">{recommendation.description}</p>
                
                {recommendation.item && (
                  <div className="bg-card rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{recommendation.item.name}</h4>
                        <p className="text-sm text-muted-foreground">{recommendation.merchant}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{recommendation.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{recommendation.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground">
                            ${recommendation.price?.toFixed(2)}
                          </span>
                          {recommendation.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${recommendation.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coupon Info */}
                {recommendation.coupon && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-semibold text-purple-900">
                            Cupón: {recommendation.coupon.code}
                          </div>
                          <div className="text-sm text-purple-700">
                            {recommendation.coupon.discount}% de descuento
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-purple-600">
                          Expira: {recommendation.coupon.expiresAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleAction(recommendation)}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                  >
                    {recommendation.type === 'store_to_food' ? (
                      <>
                        <Utensils className="w-4 h-4 mr-2" />
                        Ver en GÜELL Food
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Ir a GÜELL Store
                      </>
                    )}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleDismiss(recommendation.id)}
                    className="text-muted-foreground hover:text-gray-800"
                  >
                    No gracias
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Analytics Tracking */}
      <div className="text-xs text-muted-foreground text-center">
        <span>Recomendaciones personalizadas basadas en tu navegación</span>
      </div>
    </div>
  );
};

// Hook for cross-selling analytics
export const useCrossSellingAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    impressions: 0,
    clicks: 0,
    conversions: 0,
    dismissed: 0
  });

  const trackImpression = (recommendationId: string) => {
    setAnalytics(prev => ({ ...prev, impressions: prev.impressions + 1 }));
    
    // Send to analytics service
    // Track impression for analytics
  };

  const trackClick = (recommendationId: string) => {
    setAnalytics(prev => ({ ...prev, clicks: prev.clicks + 1 }));
    
    // Send to analytics service
    // Track click for analytics
  };

  const trackConversion = (recommendationId: string, type: string) => {
    setAnalytics(prev => ({ ...prev, conversions: prev.conversions + 1 }));
    
    // Send to analytics service
    // Track conversion for analytics
  };

  const trackDismissal = (recommendationId: string) => {
    setAnalytics(prev => ({ ...prev, dismissed: prev.dismissed + 1 }));
    
    // Send to analytics service
    // Track dismissal for analytics
  };

  const getCTR = () => {
    return analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0;
  };

  const getConversionRate = () => {
    return analytics.clicks > 0 ? (analytics.conversions / analytics.clicks) * 100 : 0;
  };

  return {
    analytics,
    trackImpression,
    trackClick,
    trackConversion,
    trackDismissal,
    getCTR,
    getConversionRate
  };
};

export default CrossRecommendations;
