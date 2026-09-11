import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { SalesOverviewChart } from '@/components/seller/SalesOverviewChart';
import { OrdersManagement } from '@/components/seller/OrdersManagement';
import { InventoryTracker } from '@/components/seller/InventoryTracker';
import { TopProductsCard } from '@/components/seller/TopProductsCard';
import { RecentOrdersCard } from '@/components/seller/RecentOrdersCard';
import { formatCurrency } from '@/utils/currency';
import SEOHead from '@/components/SEOHead';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { data: products = [] } = useProducts();

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const lowStockProducts = products.filter(p => p.inventory <= 10).length;
  
  // Calculate this month's revenue
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthRevenue = orders
    .filter(o => new Date(o.created_at) >= thisMonth)
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Calculate last month's revenue for comparison
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);
  const lastMonthEnd = new Date();
  lastMonthEnd.setDate(0);
  const lastMonthRevenue = orders
    .filter(o => {
      const date = new Date(o.created_at);
      return date >= lastMonth && date <= lastMonthEnd;
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Dashboard de Vendedor - GÜELL"
        description="Panel de control para vendedores de GÜELL. Gestiona tus ventas, inventario, pedidos y analiza el rendimiento de tu negocio."
        keywords="vendedor, dashboard, ventas, inventario, pedidos, analytics, GÜELL"
        canonical={`${window.location.origin}/merchant/dashboard`}
      />
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Volver atrás">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                <p className="text-sm text-muted-foreground">Track your sales & inventory</p>
              </div>
            </div>
            <Button onClick={() => navigate('/admin')} variant="outline">
              Full Admin Panel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {Number(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                Active listings
              </p>
            </CardContent>
          </Card>

          <Card className={lowStockProducts > 0 ? 'border-orange-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${lowStockProducts > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lowStockProducts > 0 ? 'text-orange-500' : ''}`}>
                {lowStockProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <SalesOverviewChart orders={orders} />
              </div>
              <div>
                <TopProductsCard orders={orders} products={products} />
              </div>
            </div>
            <RecentOrdersCard orders={orders} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTracker />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SellerDashboard;
