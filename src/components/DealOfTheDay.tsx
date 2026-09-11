import React, { useEffect, useState } from 'react';
import { useDeals } from '@/hooks/useDeals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';
import { Clock, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DealOfTheDay: React.FC = () => {
  const { deals, calculateTimeRemaining, calculateDiscountedPrice } = useDeals('daily');
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<any>(null);

  const dailyDeal = deals[0];

  useEffect(() => {
    if (!dailyDeal) return;
    
    const updateTimer = () => {
      setTimeLeft(calculateTimeRemaining(dailyDeal.end_time));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [dailyDeal, calculateTimeRemaining]);

  // Early return must be before any other logic that depends on the deal
  if (!dailyDeal) return null;

  if (timeLeft?.expired) return null;

  const discountedPrice = calculateDiscountedPrice(
    dailyDeal.products.price,
    dailyDeal.discount_percentage
  );

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Flame className="h-5 w-5 text-destructive" />
            Deal of the Day
          </CardTitle>
          {timeLeft && (
            <Badge variant="destructive" className="flex items-center gap-1 bg-destructive text-destructive-foreground">
              <Clock className="h-3 w-3" />
              {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <img
            src={dailyDeal.products.images?.[0] || '/placeholder.svg'}
            alt={dailyDeal.products.name}
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-foreground">{dailyDeal.products.name}</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-destructive">
                {formatCurrency(discountedPrice)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(dailyDeal.products.price)}
              </span>
              <Badge className="bg-destructive text-destructive-foreground">
                -{dailyDeal.discount_percentage}%
              </Badge>
            </div>
            <Button
              onClick={() => navigate(`/store/product/${dailyDeal.product_id}`)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealOfTheDay;
