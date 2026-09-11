import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Mail, 
  Package, 
  CreditCard, 
  Star, 
  Gift, 
  Settings,
  Check,
  X,
  ArrowRight,
  Clock,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'account' | 'wishlist' | 'price' | 'shipping' | 'review' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  actionText?: string;
  data?: any;
}

const AccountNotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #12345 has been delivered successfully. Thank you for shopping with GÜELL!',
      timestamp: '2024-03-15T14:30:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/orders/12345',
      actionText: 'View Order'
    },
    {
      id: '2',
      type: 'promotion',
      title: 'Flash Sale - 50% Off Electronics',
      message: 'Today only! Get 50% off all electronics including smartphones, laptops, and accessories. Limited time offer.',
      timestamp: '2024-03-15T10:00:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/deals',
      actionText: 'Shop Now'
    },
    {
      id: '3',
      type: 'account',
      title: 'GÜELL+ Membership Renewed',
      message: 'Your GÜELL+ Premium membership has been successfully renewed. Enjoy continued benefits including free shipping and exclusive deals.',
      timestamp: '2024-03-14T09:00:00Z',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'wishlist',
      title: 'Price Drop Alert',
      message: 'Good news! An item on your wishlist "Wireless Headphones" has dropped from $199.99 to $149.99. Limited stock at this price.',
      timestamp: '2024-03-14T16:45:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/wishlist',
      actionText: 'View Wishlist'
    },
    {
      id: '5',
      type: 'shipping',
      title: 'Package Shipped',
      message: 'Your order #12344 has been shipped and is on its way. Expected delivery: March 18-20, 2024.',
      timestamp: '2024-03-13T11:20:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/orders/12344',
      actionText: 'Track Package'
    },
    {
      id: '6',
      type: 'review',
      title: 'Review Request',
      message: 'How did we do? Share your experience with "Premium Coffee Maker" to help other customers make informed decisions.',
      timestamp: '2024-03-12T15:30:00Z',
      read: false,
      priority: 'low',
      actionUrl: '/orders/12343',
      actionText: 'Leave Review'
    },
    {
      id: '7',
      type: 'price',
      title: 'Price Alert Matched',
      message: 'The price of "Smart Watch" you\'re watching has dropped to $299.99, matching your alert price of $300 or less.',
      timestamp: '2024-03-12T08:15:00Z',
      read: true,
      priority: 'low'
    },
    {
      id: '8',
      type: 'system',
      title: 'System Maintenance',
      message: 'GÜELL platform will undergo scheduled maintenance on March 20, 2024 from 2:00 AM to 6:00 AM EST. Some features may be temporarily unavailable.',
      timestamp: '2024-03-11T20:00:00Z',
      read: false,
      priority: 'high'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: true,
    accountAlerts: true,
    priceAlerts: true,
    wishlistAlerts: true,
    reviewRequests: true
  });

  const getTypeIcon = (type: Notification['type']) => {
    const iconMap = {
      order: <Package className="w-5 h-5 text-blue-600" />,
      promotion: <Tag className="w-5 h-5 text-green-600" />,
      account: <Settings className="w-5 h-5 text-purple-600" />,
      wishlist: <Gift className="w-5 h-5 text-pink-600" />,
      price: <CreditCard className="w-5 h-5 text-orange-600" />,
      shipping: <Package className="w-5 h-5 text-teal-600" />,
      review: <Star className="w-5 h-5 text-yellow-600" />,
      system: <Bell className="w-5 h-5 text-muted-foreground" />
    };
    return iconMap[type] || <Bell className="w-5 h-5 text-muted-foreground" />;
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colorMap = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200',
      low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200'
    };
    return colorMap[priority] || 'bg-muted dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else {
      return 'Just now';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
    toast.success(`${setting} notifications ${value ? 'enabled' : 'disabled'}`);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'high') return notif.priority === 'high';
    return false;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/account')}
              className="text-white hover:bg-card/10 hover:text-foreground"
            >
              ← Back to Account
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bell className="w-8 h-8" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-600 text-white ml-3">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-blue-100">Manage your notifications and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="high">High Priority</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Notifications List */}
          <TabsContent value={activeTab} className="space-y-4">
            {activeTab !== 'settings' ? (
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-primary' : ''} dark:bg-gray-800 dark:border-gray-700`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon and Priority */}
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                              {getTypeIcon(notification.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimestamp(notification.timestamp)}
                                </div>
                                {!notification.read && (
                                  <Badge className="bg-blue-100 text-blue-800">New</Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {notification.actionUrl && (
                                <Button
                                  size="sm"
                                  onClick={() => navigate(notification.actionUrl)}
                                  className="flex items-center gap-1"
                                >
                                  {notification.actionText}
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              )}
                              
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={notification.read}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-8 text-center">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                      <p className="text-muted-foreground mb-4">
                        {activeTab === 'unread' && 'No unread notifications'}
                        {activeTab === 'high' && 'No high priority notifications'}
                        {activeTab === 'all' && 'No notifications yet'}
                      </p>
                      <Button onClick={() => navigate('/deals')}>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Browse Deals
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Bulk Actions */}
                {filteredNotifications.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark All as Read
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setNotifications([])}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Settings Tab */
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <h4 className="font-medium mb-3">Email Notifications</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'email', label: 'General Notifications', description: 'Receive general updates and announcements' },
                          { key: 'orderUpdates', label: 'Order Updates', description: 'Track your orders and deliveries' },
                          { key: 'promotions', label: 'Promotions & Deals', description: 'Get notified about sales and special offers' },
                          { key: 'accountAlerts', label: 'Account Alerts', description: 'Security and account changes' }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{setting.label}</div>
                              <div className="text-sm text-muted-foreground">{setting.description}</div>
                            </div>
                            <Switch
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="space-y-4">
                      <h4 className="font-medium mb-3">Push Notifications</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'push', label: 'Mobile Push', description: 'Receive notifications on your mobile device' },
                          { key: 'sms', label: 'SMS Alerts', description: 'Get text messages for important updates' }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{setting.label}</div>
                              <div className="text-sm text-muted-foreground">{setting.description}</div>
                            </div>
                            <Switch
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alert Types */}
                    <div className="space-y-4">
                      <h4 className="font-medium mb-3">Alert Types</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'priceAlerts', label: 'Price Alerts', description: 'Get notified when prices drop' },
                          { key: 'wishlistAlerts', label: 'Wishlist Updates', description: 'Price drops and availability changes' },
                          { key: 'reviewRequests', label: 'Review Requests', description: 'Ask for product reviews after purchase' }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{setting.label}</div>
                              <div className="text-sm text-muted-foreground">{setting.description}</div>
                            </div>
                            <Switch
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button onClick={() => toast.success('Notification preferences saved!')}>
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountNotificationsPage;
