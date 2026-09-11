import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { formatCurrency } from '@/utils/currency';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
}

interface SalesOverviewChartProps {
  orders: Order[];
}

export const SalesOverviewChart = ({ orders }: SalesOverviewChartProps) => {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 29);
    
    // Create array of last 30 days
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    
    // Group orders by day
    const salesByDay = new Map<string, number>();
    orders.forEach(order => {
      const orderDate = format(new Date(order.created_at), 'yyyy-MM-dd');
      const current = salesByDay.get(orderDate) || 0;
      salesByDay.set(orderDate, current + order.total_amount);
    });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const displayDate = format(day, 'MMM d');
      return {
        date: displayDate,
        revenue: salesByDay.get(dateKey) || 0,
      };
    });
  }, [orders]);

  const totalRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sales Overview (Last 30 Days)</span>
          <span className="text-lg font-normal text-muted-foreground">
            Total: {formatCurrency(totalRevenue)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
