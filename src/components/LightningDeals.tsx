import React, { useEffect, useState } from 'react';
import { useDeals } from '@/hooks/useDeals';
import ProductCard from '@/components/ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap } from 'lucide-react';

const LightningDeals: React.FC = () => {
  const { deals, calculateTimeRemaining, calculateDiscountedPrice } = useDeals('lightning');
  const [timers, setTimers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (deals.length === 0) return;
    
    const updateTimers = () => {
      const newTimers: Record<string, any> = {};
      deals.forEach((deal) => {
        newTimers[deal.id] = calculateTimeRemaining(deal.end_time);
      });
      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [deals, calculateTimeRemaining]);

  // Early return must be before any other logic
  if (deals.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5 text-yellow-500" />
          Lightning Deals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals
            .filter((deal) => {
              const timer = timers[deal.id];
              return !timer?.expired;
            })
            .map((deal) => {
              const timer = timers[deal.id];

              const claimedPercentage = deal.max_quantity
                ? (deal.claimed_quantity / deal.max_quantity) * 100
                : 0;

              const discountedPrice = calculateDiscountedPrice(
                deal.products.price,
                deal.discount_percentage
              );

            return (
              <div key={deal.id} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="destructive" className="flex items-center gap-1 bg-destructive text-destructive-foreground">
                    <Clock className="h-3 w-3" />
                    {timer?.hours || 0}h {timer?.minutes || 0}m
                  </Badge>
                </div>
                <ProductCard
                  id={deal.products.id}
                  title={deal.products.name}
                  price={discountedPrice}
                  originalPrice={deal.products.price}
                  rating={deal.products.rating || 0}
                  reviews={deal.products.review_count || 0}
                  imageUrl={deal.products.images?.[0] || '/placeholder.svg'}
                />
                {deal.max_quantity && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{deal.claimed_quantity} claimed</span>
                      <span>{deal.max_quantity - deal.claimed_quantity} left</span>
                    </div>
                    <Progress value={claimedPercentage} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LightningDeals;
