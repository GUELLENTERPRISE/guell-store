import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, Gift, Truck, Star, Calendar, Target, Award, Zap } from 'lucide-react';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import { useLoyaltySystem } from '@/hooks/useLoyaltySystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-modal';

interface SavingsImpactDashboardProps {
  className?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const SavingsImpactDashboard: React.FC<SavingsImpactDashboardProps> = ({
  className = '',
  timeRange = 'month'
}) => {
  const { state } = useUnifiedUser();
  const { points, tier } = useLoyaltySystem();
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Calculate savings and impact metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    const days = ranges[selectedTimeRange];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Filter orders within time range
    const filteredOrders = state.orders.filter(order => 
      order.timestamps.createdAt >= startDate && 
      (order.status === 'delivered' || order.status === 'completed')
    );

    // Calculate points earned
    const pointsEarned = filteredOrders.reduce((total, order) => 
      total + (order.metadata.loyaltyPointsEarned || 0), 0
    );

    // Calculate money saved through loyalty benefits
    const basePointsValue = 0.01; // $0.01 per point
    const pointsValue = pointsEarned * basePointsValue;
    
    // Calculate tier bonus savings
    const tierBonusMultiplier = {
      bronze: 1.05,
      silver: 1.10,
      gold: 1.15,
      platinum: 1.20
    }[tier?.name?.toLowerCase() || 'bronze'];

    const tierBonus = pointsValue * (tierBonusMultiplier - 1);

    // Calculate free shipping savings
    const foodOrders = filteredOrders.filter(o => o.type === 'food');
    const storeOrders = filteredOrders.filter(o => o.type === 'store');
    const avgDeliveryFee = 4.99;
    const avgShippingFee = 7.99;
    const freeShippingSavings = (foodOrders.length * avgDeliveryFee) + (storeOrders.length * avgShippingFee);

    // Calculate exclusive offers savings
    const exclusiveOffersSavings = pointsEarned * 0.02; // 2% of points value

    // Total savings
    const totalSavings = tierBonus + freeShippingSavings + exclusiveOffersSavings;

    // Calculate active benefits utilization
    const tierBenefits = {
      bronze: 3,
      silver: 5,
      gold: 7,
      platinum: 10
    }[tier?.name?.toLowerCase() || 'bronze'];

    const utilizedBenefits = Math.min(tierBenefits, Math.floor(pointsEarned / 100));

    // Calculate ROI
    const totalSpent = filteredOrders.reduce((total, order) => total + order.totalAmount, 0);
    const roi = totalSpent > 0 ? (totalSavings / totalSpent) * 100 : 0;

    return {
      totalPointsEarned: pointsEarned,
      moneySaved: totalSavings,
      tierBonus,
      freeShippingSavings,
      exclusiveOffersSavings,
      activeBenefits: utilizedBenefits,
      totalBenefits: tierBenefits,
      ordersCount: filteredOrders.length,
      totalSpent,
      roi,
      avgOrderValue: filteredOrders.length > 0 ? totalSpent / filteredOrders.length : 0
    };
  }, [state.orders, selectedTimeRange, points, tier]);

  // Time range options
  const timeRanges = [
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
    { value: 'quarter', label: 'Last 90 days' },
    { value: 'year', label: 'Last year' }
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-600', label: `+${change.toFixed(1)}%` };
    } else if (change < 0) {
      return { icon: TrendingUp, color: 'text-red-600', label: `${change.toFixed(1)}%` };
    }
    return { icon: TrendingUp, color: 'text-muted-foreground', label: '0%' };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Savings & Impact</h2>
          <p className="text-muted-foreground">Track your loyalty benefits and savings</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedTimeRange(range.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedTimeRange === range.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-muted text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points Earned */}
        <GlassmorphismCard className="text-center p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            
            <div className="text-3xl font-bold text-foreground mb-1">
              {metrics.totalPointsEarned.toLocaleString()}
            </div>
            
            <div className="text-sm text-muted-foreground">Points Earned</div>
            
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+12% vs last period</span>
            </div>
          </div>
          
          {/* Shimmer Effect */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s infinite'
            }}
          />
        </GlassmorphismCard>

        {/* Money Saved */}
        <GlassmorphismCard className="text-center p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(metrics.moneySaved)}
            </div>
            
            <div className="text-sm text-muted-foreground">Total Saved</div>
            
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+18% vs last period</span>
            </div>
          </div>
          
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s infinite'
            }}
          />
        </GlassmorphismCard>

        {/* Active Benefits */}
        <GlassmorphismCard className="text-center p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            
            <div className="text-3xl font-bold text-foreground mb-1">
              {metrics.activeBenefits}/{metrics.totalBenefits}
            </div>
            
            <div className="text-sm text-muted-foreground">Active Benefits</div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(metrics.activeBenefits / metrics.totalBenefits) * 100}%` }}
              />
            </div>
          </div>
          
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(147, 51, 234, 0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s infinite'
            }}
          />
        </GlassmorphismCard>

        {/* ROI */}
        <GlassmorphismCard className="text-center p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="text-3xl font-bold text-foreground mb-1">
              {metrics.roi.toFixed(1)}%
            </div>
            
            <div className="text-sm text-muted-foreground">ROI</div>
            
            <div className="flex items-center justify-center gap-1 mt-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600">Excellent</span>
            </div>
          </div>
          
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s infinite'
            }}
          />
        </GlassmorphismCard>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Savings Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Tier Bonus</span>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCurrency(metrics.tierBonus)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Free Shipping</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {formatCurrency(metrics.freeShippingSavings)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Exclusive Offers</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(metrics.exclusiveOffersSavings)}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Savings</span>
                  <span className="font-bold text-lg text-green-600">
                    {formatCurrency(metrics.moneySaved)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {metrics.ordersCount}
                </div>
                <div className="text-sm text-muted-foreground">Orders</div>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(metrics.avgOrderValue)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Order</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(metrics.totalSpent)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Points Value</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(metrics.totalPointsEarned * 0.01)}
                </span>
              </div>
            </div>
            
            {/* Benefits Utilization */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Benefits Utilization</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((metrics.activeBenefits / metrics.totalBenefits) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.activeBenefits / metrics.totalBenefits) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SavingsImpactDashboard;
