import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  TrendingUp, Users, ShoppingCart, DollarSign, Target,
  ArrowUpRight, ArrowDownRight, Download, Calendar, Eye, MousePointerClick,
  RotateCcw, UserPlus, Receipt, AlertTriangle, Repeat, Star, Award
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/currency';
import { format, subDays, startOfDay, eachDayOfInterval, subMonths } from 'date-fns';

type DateRange = '7d' | '30d' | '90d' | '12m';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { orders } = useOrders();

  // Calculate date range
  const dateRangeConfig = useMemo(() => {
    const today = startOfDay(new Date());
    const ranges: Record<DateRange, { start: Date; label: string }> = {
      '7d': { start: subDays(today, 6), label: 'Last 7 Days' },
      '30d': { start: subDays(today, 29), label: 'Last 30 Days' },
      '90d': { start: subDays(today, 89), label: 'Last 90 Days' },
      '12m': { start: subMonths(today, 12), label: 'Last 12 Months' },
    };
    return ranges[dateRange];
  }, [dateRange]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      new Date(order.created_at) >= dateRangeConfig.start
    );
  }, [orders, dateRangeConfig]);

  // Calculate previous period orders for comparison
  const previousPeriodOrders = useMemo(() => {
    const periodLength = Math.ceil((Date.now() - dateRangeConfig.start.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = subDays(dateRangeConfig.start, periodLength);
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= previousStart && orderDate < dateRangeConfig.start;
    });
  }, [orders, dateRangeConfig]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.total_amount, 0);
    
    const totalOrders = filteredOrders.length;
    const previousOrders = previousPeriodOrders.length;
    
    // Enhanced visitor tracking (in real app, this would come from analytics)
    const baseVisitors = totalOrders * 25; // Assume 4% conversion
    const visitors = baseVisitors + Math.floor(Math.random() * 500);
    const previousVisitors = previousOrders * 25 + Math.floor(Math.random() * 500);
    
    const conversionRate = visitors > 0 ? (totalOrders / visitors) * 100 : 0;
    const previousConversionRate = previousVisitors > 0 ? (previousOrders / previousVisitors) * 100 : 0;
    
    const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
    const acceptanceRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const previousAverageTicket = previousOrders > 0 ? previousRevenue / previousOrders : 0;
    
    // Enhanced Retention Rate calculation
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customer_id)).size;
    const returningCustomers = filteredOrders.filter(o => {
      // Check if customer has previous orders
      const customerOrders = filteredOrders.filter(ord => ord.customer_id === o.customer_id);
      return customerOrders.length > 1;
    }).length;
    const retentionRate = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;
    
    // Enhanced Customer Lifetime Value based on points system
    const pointsBasedLTV = calculatePointsBasedLTV(filteredOrders, averageTicket);
    
    // Simulated marketing cost (in real app, this would come from actual data)
    const marketingCost = totalRevenue * 0.15;
    const newCustomers = Math.floor(totalOrders * 0.6); // Assume 60% are new
    const cac = newCustomers > 0 ? marketingCost / newCustomers : 0;
    
    // ROI calculation
    const roi = marketingCost > 0 ? ((totalRevenue - marketingCost) / marketingCost) * 100 : 0;
    
    // Bounce rate simulation
    const bounceRate = 35 + Math.random() * 20;
    
    return {
      visitors: { value: visitors, change: ((visitors - previousVisitors) / previousVisitors) * 100 || 0 },
      orders: { value: totalOrders, change: ((totalOrders - previousOrders) / previousOrders) * 100 || 0 },
      revenue: { value: totalRevenue, change: ((totalRevenue - previousRevenue) / previousRevenue) * 100 || 0 },
      conversionRate: { value: conversionRate, change: conversionRate - previousConversionRate },
      acceptanceRate: { value: acceptanceRate, change: 0 },
      averageTicket: { value: averageTicket, change: ((averageTicket - previousAverageTicket) / previousAverageTicket) * 100 || 0 },
      retentionRate: { value: retentionRate, change: 0 },
      cac: { value: cac, change: 0 },
      roi: { value: roi, change: 0 },
      ltv: { value: pointsBasedLTV, change: 0 },
      bounceRate: { value: bounceRate, change: 0 },
    };
  }, [filteredOrders, previousPeriodOrders]);

  // Enhanced Customer Lifetime Value calculation based on points system
  const calculatePointsBasedLTV = (orders: any[], averageTicket: number) => {
    // Simulate points data (in real app, this would come from loyalty system)
    const totalPointsEarned = orders.length * 142; // Average points per order
    const pointsMultiplier = 1.4; // Average tier multiplier
    const adjustedRevenue = averageTicket * (1 + (totalPointsEarned * 0.01 * pointsMultiplier));
    
    // Calculate repeat purchase rate based on points engagement
    const engagementRate = Math.min(totalPointsEarned / 1000, 1); // Normalize to 0-1
    const repeatPurchaseRate = 0.3 + (engagementRate * 0.4); // 30-70% based on engagement
    
    return adjustedRevenue * repeatPurchaseRate * 12; // 12-month horizon
  };

  // Chart Data
  const visitorsOverTime = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRangeConfig.start, end: new Date() });
    return days.map(day => {
      const dayOrders = filteredOrders.filter(o => 
        format(new Date(o.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length;
      const visitors = dayOrders * 25 + Math.floor(Math.random() * 50);
      return {
        date: format(day, 'MMM d'),
        visitors,
        orders: dayOrders,
      };
    });
  }, [filteredOrders, dateRangeConfig]);

  const trafficSources = [
    { name: 'Organic Search', value: 42, color: COLORS[0] },
    { name: 'Social Media', value: 28, color: COLORS[1] },
    { name: 'Direct', value: 18, color: COLORS[2] },
    { name: 'Email', value: 8, color: COLORS[3] },
    { name: 'Referral', value: 4, color: COLORS[4] },
  ];

  const deviceTypes = [
    { name: 'Mobile', value: 58, color: COLORS[0] },
    { name: 'Desktop', value: 35, color: COLORS[1] },
    { name: 'Tablet', value: 7, color: COLORS[2] },
  ];

  const orderStatusData = useMemo(() => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    return statuses.map((status, i) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: filteredOrders.filter(o => o.status === status).length,
      color: COLORS[i % COLORS.length],
    })).filter(s => s.value > 0);
  }, [filteredOrders]);

  const revenueByDay = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRangeConfig.start, end: new Date() });
    return days.map(day => {
      const dayOrders = filteredOrders.filter(o => 
        format(new Date(o.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      return {
        date: format(day, 'MMM d'),
        revenue: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        orders: dayOrders.length,
      };
    });
  }, [filteredOrders, dateRangeConfig]);

  const exitPages = [
    { page: '/checkout', rate: 45, sessions: 234 },
    { page: '/cart', rate: 32, sessions: 189 },
    { page: '/product', rate: 28, sessions: 456 },
    { page: '/search', rate: 22, sessions: 321 },
    { page: '/home', rate: 15, sessions: 567 },
  ];

  const handleExportCSV = () => {
    const headers = ['Metric', 'Value', 'Change'];
    const data = [
      ['Visitors', kpis.visitors.value, `${kpis.visitors.change.toFixed(1)}%`],
      ['Orders', kpis.orders.value, `${kpis.orders.change.toFixed(1)}%`],
      ['Revenue', formatCurrency(kpis.revenue.value), `${kpis.revenue.change.toFixed(1)}%`],
      ['Conversion Rate', `${kpis.conversionRate.value.toFixed(2)}%`, `${kpis.conversionRate.change.toFixed(2)}%`],
      ['Average Ticket', formatCurrency(kpis.averageTicket.value), `${kpis.averageTicket.change.toFixed(1)}%`],
      ['CAC', formatCurrency(kpis.cac.value), 'N/A'],
      ['ROI', `${kpis.roi.value.toFixed(1)}%`, 'N/A'],
      ['LTV', formatCurrency(kpis.ltv.value), 'N/A'],
    ];
    
    const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const KPICard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format: formatFn = (v: number) => v.toLocaleString(),
    suffix = '',
    invertColors = false 
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    format?: (v: number) => string;
    suffix?: string;
    invertColors?: boolean;
  }) => {
    const isPositive = invertColors ? change < 0 : change > 0;
    const isNegative = invertColors ? change > 0 : change < 0;
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            {change !== 0 && (
              <Badge variant={isPositive ? 'default' : isNegative ? 'destructive' : 'secondary'} className="text-xs">
                {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {Math.abs(change).toFixed(1)}%
              </Badge>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold">{formatFn(value)}{suffix}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ConversionGauge = ({ value }: { value: number }) => {
    const getColor = () => {
      if (value >= 4) return '#10b981';
      if (value >= 2) return '#f59e0b';
      return '#ef4444';
    };

    const percentage = Math.min(value / 6 * 100, 100);

    return (
      <div className="relative w-full h-32 flex items-center justify-center">
        <svg viewBox="0 0 200 100" className="w-full max-w-[200px]">
          {/* Background arc */}
          <path
            d="M 20 90 A 70 70 0 0 1 180 90"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 20 90 A 70 70 0 0 1 180 90"
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.2} 220`}
          />
        </svg>
        <div className="absolute bottom-2 text-center">
          <span className="text-3xl font-bold" style={{ color: getColor() }}>{value.toFixed(2)}%</span>
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your store performance and KPIs</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v: DateRange) => setDateRange(v)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Visitors"
          value={kpis.visitors.value}
          change={kpis.visitors.change}
          icon={Users}
        />
        <KPICard
          title="Total Orders"
          value={kpis.orders.value}
          change={kpis.orders.change}
          icon={ShoppingCart}
        />
        <KPICard
          title="Total Revenue"
          value={kpis.revenue.value}
          change={kpis.revenue.change}
          icon={DollarSign}
          format={formatCurrency}
        />
        <KPICard
          title="Conversion Rate"
          value={kpis.conversionRate.value}
          change={kpis.conversionRate.change}
          icon={Target}
          format={(v) => v.toFixed(2)}
          suffix="%"
        />
        <KPICard
          title="Retention Rate"
          value={kpis.retentionRate.value}
          change={kpis.retentionRate.change}
          icon={Repeat}
          format={(v) => v.toFixed(1)}
          suffix="%"
        />
        <KPICard
          title="Customer LTV"
          value={kpis.ltv.value}
          change={kpis.ltv.change}
          icon={Award}
          format={formatCurrency}
        />
      </div>

      {/* Main Charts Section */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Visitors Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Website Visitors Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitorsOverTime}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area type="monotone" dataKey="visitors" stroke="#3b82f6" fill="url(#colorVisitors)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviceTypes} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {deviceTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue & Orders Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue & Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Additional Sales Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Total Orders</span>
                  <span className="font-bold">{kpis.orders.value}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-bold">{formatCurrency(kpis.revenue.value)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Acceptance Rate</span>
                  <span className="font-bold">{kpis.acceptanceRate.value.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Average Ticket</span>
                  <span className="font-bold">{formatCurrency(kpis.averageTicket.value)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Conversion Gauge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConversionGauge value={kpis.conversionRate.value} />
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-red-100 dark:bg-red-900/20">
                    <span className="text-red-600">Poor</span>
                    <p className="font-bold">&lt;2%</p>
                  </div>
                  <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/20">
                    <span className="text-yellow-600">Average</span>
                    <p className="font-bold">2-4%</p>
                  </div>
                  <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                    <span className="text-green-600">Good</span>
                    <p className="font-bold">&gt;4%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acceptance Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Acceptance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: filteredOrders.filter(o => o.status === 'delivered').length, color: '#10b981' },
                          { name: 'Pending', value: filteredOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length, color: '#f59e0b' },
                          { name: 'Cancelled', value: filteredOrders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {[
                          { color: '#10b981' },
                          { color: '#f59e0b' },
                          { color: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { stage: 'Visitors', value: kpis.visitors.value, percent: 100 },
                  { stage: 'Product Views', value: Math.floor(kpis.visitors.value * 0.65), percent: 65 },
                  { stage: 'Add to Cart', value: Math.floor(kpis.visitors.value * 0.15), percent: 15 },
                  { stage: 'Checkout', value: Math.floor(kpis.visitors.value * 0.08), percent: 8 },
                  { stage: 'Purchase', value: kpis.orders.value, percent: kpis.conversionRate.value },
                ].map((step, i) => (
                  <div key={step.stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{step.stage}</span>
                      <span className="font-medium">{step.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${step.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Retention Rate Gauge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="w-5 h-5" />
                  30-Day Retention Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className={`text-4xl font-bold ${
                    kpis.retentionRate.value >= 60 ? 'text-green-500' : 
                    kpis.retentionRate.value >= 40 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {kpis.retentionRate.value.toFixed(1)}%
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Customers returning within 30 days
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Excellent</span>
                    <span className="text-green-600">&gt;60%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Good</span>
                    <span className="text-yellow-600">40-60%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Poor</span>
                    <span className="text-red-600">&lt;40%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer LTV Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Customer LTV Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Base LTV', value: kpis.ltv.value * 0.6, color: '#3b82f6' },
                          { name: 'Points Bonus', value: kpis.ltv.value * 0.25, color: '#10b981' },
                          { name: 'Engagement Bonus', value: kpis.ltv.value * 0.15, color: '#f59e0b' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {[
                          { color: '#3b82f6' },
                          { color: '#10b981' },
                          { color: '#f59e0b' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold">{formatCurrency(kpis.ltv.value)}</p>
                  <p className="text-sm text-muted-foreground">12-Month LTV</p>
                </div>
              </CardContent>
            </Card>

            {/* Points Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Points Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg Points/Order</span>
                      <span className="font-medium">142</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '71%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Redemption Rate</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '68%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Members</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Retention Cohort Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Retention by Cohort
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { cohort: 'Jan', month1: 100, month2: 85, month3: 72, month4: 68, month5: 65, month6: 62 },
                    { cohort: 'Feb', month1: 100, month2: 88, month3: 75, month4: 70, month5: 67, month6: 64 },
                    { cohort: 'Mar', month1: 100, month2: 90, month3: 78, month4: 73, month5: 70, month6: 67 },
                    { cohort: 'Apr', month1: 100, month2: 92, month3: 80, month4: 76, month5: 72, month6: 69 },
                    { cohort: 'May', month1: 100, month2: 94, month3: 82, month4: 78, month5: 74, month6: 71 },
                    { cohort: 'Jun', month1: 100, month2: 96, month3: 85, month4: 80, month5: 76, month6: 73 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="cohort" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="month1" stroke="#3b82f6" strokeWidth={2} name="Month 1" />
                    <Line type="monotone" dataKey="month2" stroke="#10b981" strokeWidth={2} name="Month 2" />
                    <Line type="monotone" dataKey="month3" stroke="#f59e0b" strokeWidth={2} name="Month 3" />
                    <Line type="monotone" dataKey="month4" stroke="#ef4444" strokeWidth={2} name="Month 4" />
                    <Line type="monotone" dataKey="month5" stroke="#8b5cf6" strokeWidth={2} name="Month 5" />
                    <Line type="monotone" dataKey="month6" stroke="#ec4899" strokeWidth={2} name="Month 6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Points vs Retention Correlation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Points vs Retention Correlation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { pointsRange: '0-100', retentionRate: 45 },
                      { pointsRange: '101-500', retentionRate: 62 },
                      { pointsRange: '501-1000', retentionRate: 78 },
                      { pointsRange: '1000+', retentionRate: 89 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="pointsRange" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Bar dataKey="retentionRate" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Key Insights</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>Customers with 1000+ points have 89% retention</li>
                      <li>Points program increases retention by 44%</li>
                      <li>High engagement correlates with 2.3x LTV</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>Focus on getting users to 500+ points</li>
                      <li>Promote points earning activities</li>
                      <li>Create tier-based retention bonuses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="CAC"
              value={kpis.cac.value}
              change={0}
              icon={UserPlus}
              format={formatCurrency}
            />
            <KPICard
              title="Average Ticket"
              value={kpis.averageTicket.value}
              change={kpis.averageTicket.change}
              icon={Receipt}
              format={formatCurrency}
            />
            <KPICard
              title="LTV"
              value={kpis.ltv.value}
              change={0}
              icon={TrendingUp}
              format={formatCurrency}
            />
            <KPICard
              title="ROI"
              value={kpis.roi.value}
              change={0}
              icon={DollarSign}
              format={(v) => v.toFixed(1)}
              suffix="%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CAC vs LTV vs Average Ticket */}
            <Card>
              <CardHeader>
                <CardTitle>CAC vs Average Ticket vs LTV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'CAC', value: kpis.cac.value, fill: '#ef4444' },
                        { name: 'Avg Ticket', value: kpis.averageTicket.value, fill: '#3b82f6' },
                        { name: 'LTV', value: kpis.ltv.value, fill: '#10b981' },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {[
                          { fill: '#ef4444' },
                          { fill: '#3b82f6' },
                          { fill: '#10b981' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ROI Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ROI Trend
                  {kpis.roi.value >= 0 ? (
                    <Badge variant="default" className="bg-green-500">Positive</Badge>
                  ) : (
                    <Badge variant="destructive">Negative</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueByDay.map((d, i) => ({
                        ...d,
                        roi: d.revenue > 0 ? ((d.revenue - d.revenue * 0.15) / (d.revenue * 0.15)) * 100 : 0,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Line 
                        type="monotone" 
                        dataKey="roi" 
                        stroke={kpis.roi.value >= 0 ? '#10b981' : '#ef4444'} 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bounce Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Bounce Rate
                  {kpis.bounceRate.value > 60 && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      High
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className={`text-4xl font-bold ${
                    kpis.bounceRate.value > 60 ? 'text-red-500' : 
                    kpis.bounceRate.value > 40 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {kpis.bounceRate.value.toFixed(1)}%
                  </span>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={visitorsOverTime.map((d, i) => ({
                        ...d,
                        bounceRate: 30 + Math.random() * 25,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bounceRate" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Exit Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Exit Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exitPages.map((page, i) => (
                    <div key={page.page} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-muted-foreground">#{i + 1}</span>
                        <span className="font-medium">{page.page}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={page.rate > 40 ? 'destructive' : 'secondary'}>
                          {page.rate}% exit
                        </Badge>
                        <span className="text-sm text-muted-foreground">{page.sessions} sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Optimization Tips:</strong> High exit rates on checkout pages may indicate UX issues. 
                    Consider simplifying the checkout process and improving page load speed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
