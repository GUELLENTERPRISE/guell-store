import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Mail, 
  Package, 
  CreditCard, 
  Star, 
  Gift, 
  Settings,
  Check,
  ArrowRight,
  Clock,
  Tag,
  ShoppingBag,
  Heart,
  TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AccountSettingsNotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notificationSettings, setNotificationSettings] = useState({
    // Email Notifications
    stockAlerts: true,
    emailPromotions: true,
    orderStatusChanges: true,
    wishlistPriceDrops: true,
    wishlistBackInStock: true,
    newProductAlerts: false,
    reviewReminders: true,
    accountSecurity: true,
    
    // Push Notifications
    pushStockAlerts: true,
    pushOrderUpdates: true,
    pushWishlistAlerts: true,
    pushPromotions: false,
    
    // SMS Notifications
    smsOrderUpdates: false,
    smsSecurityAlerts: true,
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleSaveSettings = () => {
    // TODO: Save to backend
    toast.success('Notification preferences saved successfully!');
  };

  const notificationCategories = [
    {
      title: 'Shopping & Orders',
      description: 'Updates about your orders and shopping experience',
      icon: <ShoppingBag className="w-5 h-5 text-muted-foreground" />,
      settings: [
        { key: 'orderStatusChanges', label: 'Order Status Changes', description: 'Get notified when your order status changes' },
        { key: 'stockAlerts', label: 'Stock Alerts', description: 'Notify me when items are back in stock' },
        { key: 'wishlistPriceDrops', label: 'Wishlist Price Drops', description: 'Notify me when items on my wishlist drop in price' },
        { key: 'wishlistBackInStock', label: 'Wishlist Back in Stock', description: 'Notify when wishlist items become available' }
      ]
    },
    {
      title: 'Promotions & Deals',
      description: 'Special offers and promotional content',
      icon: <Tag className="w-5 h-5 text-muted-foreground" />,
      settings: [
        { key: 'emailPromotions', label: 'Email Promotions', description: 'Receive promotional emails and special offers' },
        { key: 'newProductAlerts', label: 'New Product Alerts', description: 'Get notified about new product launches' },
        { key: 'pushPromotions', label: 'Push Promotions', description: 'Receive promotional push notifications' }
      ]
    },
    {
      title: 'Account & Security',
      description: 'Important account and security notifications',
      icon: <Settings className="w-5 h-5 text-muted-foreground" />,
      settings: [
        { key: 'accountSecurity', label: 'Account Security', description: 'Security alerts and account changes' },
        { key: 'smsSecurityAlerts', label: 'SMS Security Alerts', description: 'Critical security alerts via SMS' },
        { key: 'reviewReminders', label: 'Review Reminders', description: 'Reminders to leave product reviews' }
      ]
    }
  ];

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/account')}
              className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-gray-100"
            >
              ← Back to Account
            </Button>
            <div>
              <h1 className="text-2xl font-light text-foreground dark:text-gray-100">Notifications</h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Manage your notification preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Notification Categories */}
        <div className="space-y-8">
          {notificationCategories.map((category, index) => (
            <Card key={index} className="border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light text-foreground dark:text-gray-100">{category.title}</CardTitle>
                    <CardDescription className="text-sm">{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-foreground dark:text-gray-100">{setting.label}</div>
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground">{setting.description}</div>
                    </div>
                    <Switch
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                      onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                      className="data-[state=checked]:bg-gray-900"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Special Feature Highlight */}
        <Card className="mt-8 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-foreground dark:text-gray-100 mb-2">Smart Price Tracking</h3>
                <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                  Enable "Wishlist Price Drops" to automatically get notified when items on your wishlist go on sale. 
                  This helps you save money and never miss a great deal on products you're watching.
                </p>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">
                    {notificationSettings.wishlistPriceDrops ? 'Active - Tracking 8 items' : 'Disabled - Enable to start saving'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            className="bg-gray-900 text-white hover:bg-gray-800 px-8"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsNotificationsPage;
