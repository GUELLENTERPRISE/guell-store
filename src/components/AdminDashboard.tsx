
import React, { Suspense, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Package, Users, ShoppingCart, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/currency';
import LoadingState from './LoadingState';
import ErrorBoundary from './ErrorBoundary';

// Lazy loaded admin components for code splitting
const AdminProductForm = React.lazy(() => import('./AdminProductForm'));
const AdminProductList = React.lazy(() => import('./AdminProductList'));
const AdminOrdersManagement = React.lazy(() => import('./AdminOrdersManagement'));
const PromoCodeManagement = React.lazy(() => import('./PromoCodeManagement'));
const AdminStorefrontSettings = React.lazy(() => import('./AdminStorefrontSettings'));
const AdminCategoryManagement = React.lazy(() => import('./AdminCategoryManagement'));
const AdminMarketingTiles = React.lazy(() => import('./AdminMarketingTiles'));
const AdminPromotionalBlocks = React.lazy(() => import('./AdminPromotionalBlocks'));
const AdminBrandSections = React.lazy(() => import('./AdminBrandSections'));
const AdminHeroBanners = React.lazy(() => import('./AdminHeroBanners'));
const AdminTermsManagement = React.lazy(() => import('./AdminTermsManagement'));
const HybridProductUpload = React.lazy(() => import('./HybridProductUpload'));
const SalesOverviewChart = React.lazy(() => import('./seller/SalesOverviewChart').then(module => ({ default: module.SalesOverviewChart })));
const TopProductsCard = React.lazy(() => import('./seller/TopProductsCard').then(module => ({ default: module.TopProductsCard })));
const RecentOrdersCard = React.lazy(() => import('./seller/RecentOrdersCard').then(module => ({ default: module.RecentOrdersCard })));
const InventoryTracker = React.lazy(() => import('./seller/InventoryTracker').then(module => ({ default: module.InventoryTracker })));
const AnalyticsDashboard = React.lazy(() => import('./admin/AnalyticsDashboard'));

const AdminDashboard = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { data: products = [] } = useProducts();
  
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsResult, categoriesResult, ordersResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
      ]);

      return {
        products: productsResult.count || 0,
        categories: categoriesResult.count || 0,
        orders: ordersResult.count || 0,
      };
    },
    enabled: userProfile?.is_admin,
  });

  // Seller analytics calculations with memoization
  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
    [orders]
  );

  const pendingOrders = useMemo(
    () => orders.filter(order => order.status === 'pending' || order.status === 'processing').length,
    [orders]
  );

  const lowStockProducts = useMemo(
    () => products.filter(product => product.inventory < 10).length,
    [products]
  );

  if (isLoading) {
    return <LoadingState type="page" message="Checking admin permissions..." />;
  }

  if (!userProfile?.is_admin) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have admin permissions to access this page.</p>
        <p className="text-sm text-muted-foreground">
          Contact your administrator to request admin access.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats?.products || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{stats?.categories || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
          <TabsTrigger value="products">Product Management</TabsTrigger>
          <TabsTrigger value="edit-products">Edit Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState type="page" message="Loading analytics..." />}>
              <AnalyticsDashboard />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="seller" className="mt-6 space-y-6">
          {/* Seller Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold">{lowStockProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<LoadingState type="page" message="Loading sales chart..." />}>
              <ErrorBoundary>
                <SalesOverviewChart orders={orders} />
              </ErrorBoundary>
            </Suspense>
            <Suspense fallback={<LoadingState type="page" message="Loading top products..." />}>
              <ErrorBoundary>
                <TopProductsCard orders={orders} products={products} />
              </ErrorBoundary>
            </Suspense>
          </div>

          {/* Recent Orders & Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<LoadingState type="page" message="Loading recent orders..." />}>
              <ErrorBoundary>
                <RecentOrdersCard orders={orders} />
              </ErrorBoundary>
            </Suspense>
            <Suspense fallback={<LoadingState type="page" message="Loading inventory tracker..." />}>
              <ErrorBoundary>
                <InventoryTracker />
              </ErrorBoundary>
            </Suspense>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState type="page" message="Loading product upload..." />}>
              <HybridProductUpload />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="edit-products" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState type="page" message="Loading product list..." />}>
              <AdminProductList />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState type="page" message="Loading orders management..." />}>
              <AdminOrdersManagement />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="hero">Hero Banners</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="marketing">Marketing Tiles</TabsTrigger>
              <TabsTrigger value="promo">Promotional Blocks</TabsTrigger>
              <TabsTrigger value="brand">Brand Sections</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hero">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState type="page" message="Loading hero banners..." />}>
                  <AdminHeroBanners />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
            
            <TabsContent value="categories">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState type="page" message="Loading categories..." />}>
                  <AdminCategoryManagement />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
            
            <TabsContent value="marketing">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState type="page" message="Loading marketing tiles..." />}>
                  <AdminMarketingTiles />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
            
            <TabsContent value="promo">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState type="page" message="Loading promotional blocks..." />}>
                  <AdminPromotionalBlocks />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
            
            <TabsContent value="brand">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState type="page" message="Loading brand sections..." />}>
                  <AdminBrandSections />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="promo-codes" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState type="page" message="Loading promo codes..." />}>
              <PromoCodeManagement />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState type="page" message="Loading settings..." />}>
              <AdminStorefrontSettings />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="terms" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState type="page" message="Loading terms management..." />}>
              <AdminTermsManagement />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
