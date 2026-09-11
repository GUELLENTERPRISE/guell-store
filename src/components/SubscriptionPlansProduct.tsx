import React from 'react';
import { useSubscriptionOrders } from '@/hooks/useSubscriptionOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';

interface SubscriptionPlansProps {
  productId: string;
  productPrice: number;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ productId, productPrice }) => {
  const { createSubscription } = useSubscriptionOrders();

  const plans = [
    { frequency: 'weekly' as const, label: 'Weekly', discount: 5 },
    { frequency: 'biweekly' as const, label: 'Every 2 Weeks', discount: 5 },
    { frequency: 'monthly' as const, label: 'Monthly', discount: 5 },
  ];

  const handleSubscribe = (frequency: 'weekly' | 'biweekly' | 'monthly') => {
    createSubscription({
      product_id: productId,
      quantity: 1,
      frequency,
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Subscribe & Save</CardTitle>
        <CardDescription className="text-muted-foreground">
          Save 5% on regular deliveries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {plans.map((plan) => (
          <div key={plan.frequency} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors">
            <div className="flex-1">
              <p className="font-medium text-foreground">{plan.label}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(productPrice * (1 - plan.discount / 100))} / delivery
                <Badge variant="secondary" className="ml-2 bg-secondary text-secondary-foreground">
                  Save {plan.discount}%
                </Badge>
              </p>
            </div>
            <Button
              onClick={() => handleSubscribe(plan.frequency)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Subscribe
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlans;
