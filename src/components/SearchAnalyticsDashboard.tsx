
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Search, Users, Clock } from 'lucide-react';

const SearchAnalyticsDashboard = () => {
  const { data: analytics } = useQuery({
    queryKey: ['search-analytics-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: popularSearches } = useQuery({
    queryKey: ['popular-searches-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_searches')
        .select('*')
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const totalSearches = analytics?.length || 0;
  const uniqueUsers = new Set(analytics?.map(a => a.user_id).filter(Boolean)).size;
  const avgSearchDuration = analytics?.reduce((acc, curr) => acc + (curr.search_duration_ms || 0), 0) / totalSearches || 0;
  const searchesWithResults = analytics?.filter(a => a.results_count > 0).length || 0;
  const successRate = totalSearches > 0 ? (searchesWithResults / totalSearches) * 100 : 0;

  // Prepare data for charts
  const dailySearches = analytics?.reduce((acc, curr) => {
    const date = new Date(curr.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const chartData = Object.entries(dailySearches)
    .slice(-7) // Last 7 days
    .map(([date, count]) => ({ date, searches: count }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Search Analytics Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSearches.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgSearchDuration)}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Search Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="searches" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Search Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularSearches?.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="search_query" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="search_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Popular Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Top Search Terms (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularSearches?.slice(0, 15).map((search, index) => (
              <div key={search.search_query} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">#{index + 1}</span>
                  <span className="font-medium">{search.search_query}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {search.search_count} searches
                  </Badge>
                  <Badge variant="outline">
                    {search.unique_users} users
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Avg {Math.round(Number(search.avg_results))} results
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchAnalyticsDashboard;
