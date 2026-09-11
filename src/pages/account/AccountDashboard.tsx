import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { User, Package, Utensils, Settings, CreditCard, MapPin, History, Trophy, Bell, Shield, Heart, Gift, HeadphonesIcon, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-modal';
import UnifiedProfileManager from '@/components/profile/UnifiedProfileManager';
import UnifiedAddressManager from '@/components/address/UnifiedAddressManager';
import UnifiedPaymentManager from '@/components/payment/UnifiedPaymentManager';
import UnifiedOrderHistory from '@/components/orders/UnifiedOrderHistory';
import MembershipCard from '@/components/account/GüELLMembershipCard';
import UnifiedFavorites, { FavoriteItem } from '@/components/account/UnifiedFavorites';
import SEOHead from '@/components/SEOHead';

const AccountDashboard: React.FC = () => {
  const { user } = useAuth();
  const { state } = useUnifiedUser();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get current tab from URL hash or query param
  const getCurrentTab = useCallback(() => {
    const hash = location.hash.slice(1);
    const params = new URLSearchParams(location.search);
    return hash || params.get('tab') || 'overview';
  }, [location]);

  // Initialize activeTab from URL
  useEffect(() => {
    const currentTab = getCurrentTab();
    setActiveTab(currentTab);
  }, [getCurrentTab]);
  
  // If user is not authenticated, redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'orders', label: 'Order History', icon: History },
    { id: 'loyalty', label: 'GÜELL Club', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'support', label: 'Customer Service', icon: HeadphonesIcon },
    { id: 'settings', label: 'Settings', icon: Globe }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    const url = new URL(window.location.href);
    
    // Check if we're in a tab-based context (like FoodIndex)
    if (url.searchParams.has('tab')) {
      // We're in a tab-based context, update the tab parameter
      url.searchParams.set('tab', tabId);
      url.hash = '';
    } else {
      // We're in direct route context, use hash-based navigation
      url.hash = tabId;
      url.searchParams.delete('tab');
    }
    
    window.history.pushState({}, '', url.toString());
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <UnifiedProfileManager />;
      case 'addresses':
        return <UnifiedAddressManager />;
      case 'payment':
        return <UnifiedPaymentManager />;
      case 'orders':
        return <UnifiedOrderHistory />;
      case 'loyalty':
        return <LoyaltyTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'support':
        return <CustomerServiceTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <SEOHead 
        title="Mi Cuenta - Dashboard - GÜELL"
        description="Gestiona tu perfil, pedidos, direcciones y métodos de pago en GÜELL. Accede a tu dashboard personalizado para una experiencia de compra optimizada."
        keywords="mi cuenta, dashboard, perfil, pedidos, direcciones, pagos, GÜELL"
        canonical={`${window.location.origin}/account/dashboard`}
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {state.profile?.firstName || 'User'}!</h1>
              <p className="text-orange-100">Manage your GÜELL profile and preferences</p>
            </div>
            
            {state.profile && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">{state.profile.firstName} {state.profile.lastName}</p>
                  <p className="text-orange-100 text-sm">{state.profile.email}</p>
                </div>
                <Avatar className="w-16 h-16 border-4 border-orange-400">
                  <AvatarImage src={state.profile.avatar} alt={state.profile.firstName} />
                  <AvatarFallback className="bg-card dark:bg-gray-800 text-orange-600 dark:text-orange-400 text-xl font-bold">
                    {getInitials(state.profile.firstName, state.profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  className="bg-card/20 border-white/30 text-white hover:bg-card/30 backdrop-blur-sm"
                  onClick={() => {
                    // Handle sign out logic
                  }}
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'border-orange-500 text-orange-600 dark:border-orange-400 dark:text-orange-400' 
                      : 'border-transparent text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC = () => {
  const { state } = useUnifiedUser();
  
  const stats = {
    totalOrders: state.orders.length,
    foodOrders: state.orders.filter(o => o.type === 'food').length,
    storeOrders: state.orders.filter(o => o.type === 'store').length,
    totalSpent: state.orders.reduce((sum, order) => sum + order.totalAmount, 0),
    addresses: state.addresses.length,
    paymentMethods: state.paymentMethods.length,
    wishlistItems: 0
  };

  const recentOrders = state.orders.slice(0, 3);
  const defaultAddress = state.addresses.find(addr => addr.isDefault);
  const defaultPayment = state.paymentMethods.find(pm => pm.isDefault);

  // Mock data for membership card and favorites
  const mockMembershipData = {
    userName: `${state.profile?.firstName} ${state.profile?.lastName}`,
    points: 2850,
    currentTier: 'silver' as const,
    nextTierPoints: 5000
  };

  const mockFavorites: FavoriteItem[] = [
    {
      id: '1',
      type: 'product',
      name: 'Premium GÜELL Hoodie',
      price: 89.99,
      image: '/placeholder-hoodie.jpg',
      category: 'Clothing',
      rating: 4.8,
      reviews: 124,
      inStock: true,
      addedAt: '2024-01-15'
    },
    {
      id: '2',
      type: 'food',
      name: 'Signature Burger Deluxe',
      price: 24.99,
      image: '/placeholder-burger.jpg',
      restaurant: 'GÜELL Kitchen',
      restaurantImage: '/placeholder-restaurant.jpg',
      rating: 4.9,
      reviews: 89,
      deliveryTime: '25-35 min',
      deliveryFee: 2.99,
      addedAt: '2024-01-14'
    },
    {
      id: '3',
      type: 'product',
      name: 'GÜELL Sport Cap',
      price: 34.99,
      image: '/placeholder-cap.jpg',
      category: 'Accessories',
      rating: 4.6,
      reviews: 67,
      inStock: true,
      addedAt: '2024-01-13'
    }
  ];

  const handleRemoveFavorite = (id: string, type: 'product' | 'food') => {
    // Remove favorite item
  };

  const handleAddToCart = (item: FavoriteItem) => {
    // Add item to cart
  };

  const handleOrderFood = (item: any) => {
    // Order food item
  };

  const handleTabChange = (tab: string) => {
    // Handle tab change - TODO: implement tab navigation
  };

  return (
    <div className="space-y-8">
      {/* GÜELL Membership Card */}
      <MembershipCard {...mockMembershipData} className="max-w-2xl mx-auto" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassmorphismCard className="text-center p-6">
          <div className="relative">
            <Package className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center p-0">
              {stats.totalOrders}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground dark:text-gray-100">{stats.totalOrders}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">Orders</div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="text-center p-6">
          <div className="relative">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center p-0">
              {stats.addresses}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground dark:text-gray-100">{stats.addresses}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">Addresses</div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="text-center p-6">
          <div className="relative">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center p-0">
              {stats.wishlistItems}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground dark:text-gray-100">{stats.wishlistItems}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">Wishlist</div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="text-center p-6">
          <div className="relative">
            <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center p-0">
              {stats.paymentMethods}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground dark:text-gray-100">{stats.paymentMethods}</div>
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">Payment Methods</div>
        </GlassmorphismCard>
      </div>

      {/* Unified Favorites Section */}
      <UnifiedFavorites
        favorites={mockFavorites}
        onRemoveFavorite={handleRemoveFavorite}
        onAddToCart={handleAddToCart}
        onOrderFood={handleOrderFood}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative">
          {/* Default indicator for One-Click Checkout */}
          {defaultAddress && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium">
                ✓ Default for Checkout
              </Badge>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Default Address
              {defaultAddress && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {defaultAddress ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Ready for Quick Checkout</span>
                  </div>
                  <p className="font-medium">{defaultAddress.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange('addresses')}>
                  Manage Addresses
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">Set default address for quick checkout</p>
                <Button size="sm" className="w-full" onClick={() => handleTabChange('addresses')}>
                  Add Address
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative">
          {/* Default indicator for One-Click Checkout */}
          {defaultPayment && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium">
                ✓ Default for Checkout
              </Badge>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Default Payment
              {defaultPayment && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {defaultPayment ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Ready for Quick Checkout</span>
                  </div>
                  <p className="font-medium">
                    {defaultPayment.type === 'card' 
                      ? `${defaultPayment.cardInfo?.brand?.toUpperCase()} **** ${defaultPayment.cardInfo?.last4}`
                      : defaultPayment.type.replace('_', ' ').toUpperCase()
                    }
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange('payment')}>
                  Manage Payments
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">Set default payment for quick checkout</p>
                <Button size="sm" className="w-full" onClick={() => handleTabChange('payment')}>
                  Add Payment Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 bg-background rounded">
                    <div className="flex items-center gap-2">
                      {order.type === 'food' ? (
                        <Utensils className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Package className="w-4 h-4 text-blue-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">${order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <Badge className={order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange('orders')}>
                  View All Orders
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button size="sm" className="w-full">
                  Start Ordering
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col hover:bg-orange-50 hover:border-orange-300 transition-colors"
              onClick={() => window.location.href = '/food'}
            >
              <Utensils className="w-6 h-6 mb-2" />
              Order Food
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => window.location.href = '/store'}
            >
              <Package className="w-6 h-6 mb-2" />
              Shop Store
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col hover:bg-orange-50 hover:border-orange-300 transition-colors"
              onClick={() => handleTabChange('loyalty')}
            >
              <Trophy className="w-6 h-6 mb-2" />
              GÜELL Club
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col hover:bg-purple-50 hover:border-purple-300 transition-colors"
              // Handle send gift action
            >
              <Gift className="w-6 h-6 mb-2" />
              Send Gift
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loyalty Tab Component
const LoyaltyTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            GÜELL Club Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Silver Member</h3>
            <p className="text-muted-foreground mb-4">You have 2,850 points</p>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div className="bg-orange-500 h-4 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">2,150 points to Gold level</p>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600">
              View Rewards
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Order updates and promotions</p>
              </div>
              <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-card rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Delivery updates via text</p>
              </div>
              <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-card rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Browser notifications</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-card rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Security Tab Component
const SecurityTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Not enabled</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">Login History</p>
                <p className="text-sm text-muted-foreground">View recent login activity</p>
              </div>
              <Button variant="outline">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Customer Service Tab Component
const CustomerServiceTab: React.FC = () => {
  const { state } = useUnifiedUser();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5" />
            Customer Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* User Context Card */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Your Account Information</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Name:</strong> {state.profile?.firstName} {state.profile?.lastName}</p>
                <p><strong>Email:</strong> {state.profile?.email}</p>
                <p><strong>Customer ID:</strong> {state.profile?.id}</p>
                <p><strong>Member Since:</strong> {new Date(state.profile?.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Quick Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Live Chat</h4>
                <p className="text-sm text-muted-foreground mb-3">Chat with our support team instantly</p>
                <Button className="w-full">Start Chat</Button>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground mb-3">Get help via email within 24 hours</p>
                <Button variant="outline" className="w-full">Send Email</Button>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Phone Support</h4>
                <p className="text-sm text-muted-foreground mb-3">Call us: 1-800-GÜELL</p>
                <Button variant="outline" className="w-full">Call Now</Button>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Help Center</h4>
                <p className="text-sm text-muted-foreground mb-3">Browse our FAQ and guides</p>
                <Button variant="outline" className="w-full">Visit Help Center</Button>
              </Card>
            </div>
            
            {/* Recent Orders Context */}
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-semibold mb-2">Recent Orders for Reference</h4>
              <div className="space-y-2">
                {state.orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span>{order.orderNumber}</span>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC = () => {
  const { state } = useUnifiedUser();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Language Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold">Language & Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Region</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Currency Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold">Currency & Pricing</h3>
              <div>
                <label className="text-sm font-medium">Display Currency</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>USD ($)</option>
                  <option>EUR (¢)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold">Privacy & Data</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                  </div>
                  <select className="p-2 border rounded-md">
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Sharing</p>
                    <p className="text-sm text-muted-foreground">Share anonymous usage data</p>
                  </div>
                  <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-card rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Management */}
            <div className="space-y-4">
              <h3 className="font-semibold">Account Management</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDashboard;
