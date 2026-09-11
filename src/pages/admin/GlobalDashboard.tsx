import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package, 
  Star,
  Crown,
  Shield,
  BarChart3,
  Store,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface GlobalStats {
  totalDailySales: number;
  activeOrders: number;
  totalMerchants: number;
  totalCustomers: number;
  platformRevenue: number;
  merchantRevenue: number;
  commissionRate: number;
  topSellers: Array<{
    merchantId: string;
    businessName: string;
    sales: number;
    orders: number;
    rating: number;
  }>;
  salesByHour: Array<{
    hour: string;
    sales: number;
    orders: number;
  }>;
}

const GlobalDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = async () => {
      // In real app, this would check for GÜELL owner credentials
      const isOwner = localStorage.getItem('isGuellOwner') === 'true';
      
      if (!isOwner) {
        // Redirect to login or show access denied
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      await fetchGlobalStats();
    };

    checkAuth();
  }, [selectedTimeRange]);

  const fetchGlobalStats = async () => {
    setIsLoading(true);
    
    // Mock API call - in real app, this would fetch from backend
    setTimeout(() => {
      const mockStats: GlobalStats = {
        totalDailySales: 15420.50,
        activeOrders: 47,
        totalMerchants: 12,
        totalCustomers: 892,
        platformRevenue: 1542.05, // 10% commission
        merchantRevenue: 13878.45,
        commissionRate: 10,
        topSellers: [
          {
            merchantId: 'merchant-1',
            businessName: 'Burger Palace',
            sales: 3240.00,
            orders: 28,
            rating: 4.6
          },
          {
            merchantId: 'merchant-2',
            businessName: 'Pizza Palace',
            sales: 2890.50,
            orders: 22,
            rating: 4.8
          },
          {
            merchantId: 'merchant-3',
            businessName: 'Sushi Express',
            sales: 2650.00,
            orders: 18,
            rating: 4.9
          },
          {
            merchantId: 'merchant-4',
            businessName: 'Thai Kitchen',
            sales: 1980.75,
            orders: 15,
            rating: 4.7
          },
          {
            merchantId: 'merchant-5',
            businessName: 'Taco Fiesta',
            sales: 1659.25,
            orders: 12,
            rating: 4.5
          }
        ],
        salesByHour: [
          { hour: '11:00', sales: 1200, orders: 8 },
          { hour: '12:00', sales: 2450, orders: 12 },
          { hour: '13:00', sales: 2100, orders: 10 },
          { hour: '14:00', sales: 1890, orders: 9 },
          { hour: '15:00', sales: 2200, orders: 11 },
          { hour: '16:00', sales: 1950, orders: 8 },
          { hour: '17:00', sales: 1680, orders: 7 },
          { hour: '18:00', sales: 1420, orders: 6 },
          { hour: '19:00', sales: 1100, orders: 5 },
          { hour: '20:00', sales: 890, orders: 4 }
        ]
      };

      setStats(mockStats);
      setIsLoading(false);
    }, 1500);
  };

  const handleLogin = () => {
    // Simulate owner login
    localStorage.setItem('isGuellOwner', 'true');
    setIsAuthenticated(true);
    fetchGlobalStats();
  };

  const handleLogout = () => {
    localStorage.removeItem('isGuellOwner');
    setIsAuthenticated(false);
    setStats(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">GÜELL Admin</h1>
          <p className="text-muted-foreground mb-6">
            Secure access required for global management
          </p>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="admin@guell.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="••••••••••"
                  />
                </div>
                
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Access Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">GÜELL Global Dashboard</h1>
            <p className="text-sm text-muted-foreground">Owner View - Complete Platform Overview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Owner Access
            </Badge>
          </div>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <Button variant="outline" onClick={handleLogout}>
            <Shield className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Daily Sales</p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats.totalDailySales.toLocaleString()}
                </p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +12.5% from yesterday
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeOrders}
                </p>
                <div className="flex items-center text-sm text-orange-600 mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  Processing now
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Merchants</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalMerchants}
                </p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <Store className="w-4 h-4 mr-1" />
                  2 new this week
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.platformRevenue.toLocaleString()}
                </p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  {stats.commissionRate}% commission
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellers.map((seller, index) => (
                <div key={seller.merchantId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{seller.businessName}</div>
                      <div className="text-sm text-muted-foreground">
                        {seller.orders} orders • {seller.rating} ⭐
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${seller.sales.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      ${((seller.sales * stats.commissionRate) / 100).toFixed(2)} commission
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commission Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Commission Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${stats.platformRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Platform Profit</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${stats.merchantRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Merchant Net</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Sales Volume</span>
                <span className="font-medium">
                  ${stats.totalDailySales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Commission Rate</span>
                <span className="font-medium">{stats.commissionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Commission</span>
                <span className="font-medium text-green-600">
                  ${stats.platformRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Merchant Net Revenue</span>
                <span className="font-medium text-blue-600">
                  ${stats.merchantRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Hour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Sales by Hour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.salesByHour.map((hour) => {
              const maxSales = Math.max(...stats.salesByHour.map(h => h.sales));
              const height = (hour.sales / maxSales) * 100;
              
              return (
                <div key={hour.hour} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-orange-500 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-muted-foreground mt-2">{hour.hour}</div>
                  <div className="text-xs font-medium">${hour.sales}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalDashboard;
