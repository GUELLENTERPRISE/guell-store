
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  CreditCard, 
  Shield, 
  Bell, 
  Globe, 
  HelpCircle, 
  ChevronRight,
  Star,
  Package,
  Crown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import SubscriptionStatus from "./SubscriptionStatus";
import { useTranslation } from "@/hooks/useTranslation";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { useUserProfile } from "@/hooks/useUserProfile";

const AccountPage = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  

  const menuItems = [
    { icon: User, title: t('account.yourAccount'), subtitle: t('account.managePersonalInfo'), action: () => navigate('/account/settings') },
    { icon: Package, title: t('account.yourOrders'), subtitle: t('account.trackReturn'), action: () => navigate('/orders') },
    { icon: MapPin, title: t('account.yourAddresses'), subtitle: t('account.editAddresses') },
    { icon: CreditCard, title: t('account.paymentMethods'), subtitle: t('account.managePayment') },
    { icon: Crown, title: t('account.membership'), subtitle: t('account.manageSubscription'), action: () => navigate('/subscription') },
    { icon: Shield, title: t('account.loginSecurity'), subtitle: t('account.passwordSecurity'), action: () => navigate('/account/settings') },
    { icon: Bell, title: t('account.notifications'), subtitle: t('account.manageNotifications') },
    { icon: Globe, title: t('account.languageRegion'), subtitle: t('account.changeLanguage') },
    { icon: HelpCircle, title: t('account.customerService'), subtitle: t('account.getHelp'), action: () => navigate('/help') },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <ProfilePictureUpload size="lg" showUploadButton={true} />
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              {subscription?.subscribed && (
                <Badge className="mt-1 bg-blue-600/80 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  GÜELL+ {subscription.subscription_tier}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium text-sm">{t('account.yourOrders')}</p>
            <p className="text-xs text-muted-foreground">{t('account.trackReturn')}</p>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/subscription')}
        >
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium text-sm">GÜELL+</p>
            <p className="text-xs text-muted-foreground">{t('account.manageSubscription')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={item.action}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sign Out */}
      <Card>
        <CardContent className="p-4">
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="w-full text-red-400 border-red-400 hover:bg-red-900/20"
          >
            {t('account.signOut')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
