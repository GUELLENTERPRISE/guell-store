
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Settings, RefreshCw } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";

const SubscriptionStatus = () => {
  const { 
    subscription, 
    isLoading, 
    openCustomerPortal, 
    refreshSubscription,
    isOpeningPortal 
  } = useSubscription();
  const { t } = useTranslation();

  const handleOpenPortal = () => {
    openCustomerPortal();
  };

  const handleRefreshSubscription = () => {
    refreshSubscription();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription?.subscribed) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">{t('subscription.noActiveSubscription')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('subscription.subscribeToUnlock')}
            </p>
            <Button onClick={handleRefreshSubscription} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('subscription.checkStatus')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const subscriptionEnd = subscription.subscription_end 
    ? format(new Date(subscription.subscription_end), 'MMM dd, yyyy')
    : 'Unknown';

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <h3 className="font-bold">GÜELL+ {subscription.subscription_tier}</h3>
          </div>
          <Badge className="bg-green-500 text-white">
            {t('subscription.active')}
          </Badge>
        </div>
        
        <p className="text-sm opacity-90 mb-4">
          {t('subscription.renewsOn', { date: subscriptionEnd })}
        </p>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
            variant="secondary" 
            size="sm"
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isOpeningPortal ? t('subscription.opening') : t('subscription.manage')}
          </Button>
          <Button 
            onClick={handleRefreshSubscription}
            variant="outline" 
            size="sm"
            className="text-white border-white hover:bg-card/10 hover:text-blue-600"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
