import React, { useState, useMemo } from 'react';
import { Package, Utensils, Calendar, DollarSign, MapPin, Clock, Filter, Search, ChevronDown, Star, Truck, CheckCircle, XCircle, HeadphonesIcon } from 'lucide-react';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-modal';

interface UnifiedOrderHistoryProps {
  className?: string;
  maxVisible?: number;
  showFilters?: boolean;
}

const UnifiedOrderHistory: React.FC<UnifiedOrderHistoryProps> = ({
  className = '',
  maxVisible = 10,
  showFilters = true
}) => {
  const { state, actions } = useUnifiedUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...state.orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.metadata.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.metadata.storeMerchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.timestamps.createdAt).getTime() - new Date(a.timestamps.createdAt).getTime();
        case 'date-asc':
          return new Date(a.timestamps.createdAt).getTime() - new Date(b.timestamps.createdAt).getTime();
        case 'amount-desc':
          return b.totalAmount - a.totalAmount;
        case 'amount-asc':
          return a.totalAmount - b.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.timestamps.createdAt).getTime() - new Date(a.timestamps.createdAt).getTime();
      }
    });

    return filtered.slice(0, maxVisible);
  }, [state.orders, searchTerm, statusFilter, typeFilter, sortBy, maxVisible]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getOrderIcon = (type: string) => {
    return type === 'food' ? <Utensils className="w-4 h-4" /> : <Package className="w-4 h-4" />;
  };

  const getOrderTypeColor = (type: string) => {
    return type === 'food' 
      ? 'bg-orange-100 text-orange-800 border-orange-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing':
      case 'ready':
      case 'delivering':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-muted text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'delivering':
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Delivery';
      case 'delivering': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleSupportAccess = (order: any) => {
    // Open help center with order context
    const supportUrl = `/help?order=${order.id}&type=${order.type}&number=${order.orderNumber}`;
    window.open(supportUrl, '_blank');
  };

  const orderStats = useMemo(() => {
    const total = state.orders.length;
    const foodOrders = state.orders.filter(o => o.type === 'food').length;
    const storeOrders = state.orders.filter(o => o.type === 'store').length;
    const totalSpent = state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = state.orders.filter(o => 
      o.status === 'delivered' || o.status === 'completed'
    ).length;

    return { total, foodOrders, storeOrders, totalSpent, completedOrders };
  }, [state.orders]);

  if (state.orders.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-6">Start ordering from GÜELL Food or GÜELL Store to see your order history here.</p>
        <div className="flex gap-4 justify-center">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            <Utensils className="w-4 h-4 mr-2" />
            Order Food
          </Button>
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Shop Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <GlassmorphismCard className="text-center p-4">
          <div className="text-2xl font-bold text-foreground">{orderStats.total}</div>
          <div className="text-sm text-muted-foreground">Total Orders</div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="text-center p-4">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Utensils className="w-4 h-4 text-orange-600" />
            <div className="text-2xl font-bold text-foreground">{orderStats.foodOrders}</div>
          </div>
          <div className="text-sm text-muted-foreground">Food Orders</div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="text-center p-4">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Package className="w-4 h-4 text-blue-600" />
            <div className="text-2xl font-bold text-foreground">{orderStats.storeOrders}</div>
          </div>
          <div className="text-sm text-muted-foreground">Store Orders</div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="text-center p-4">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div className="text-2xl font-bold text-foreground">${orderStats.totalSpent.toFixed(2)}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Spent</div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="text-center p-4">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div className="text-2xl font-bold text-foreground">{orderStats.completedOrders}</div>
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </GlassmorphismCard>
      </div>

      {/* Filters */}
      {showFilters && (
        <GlassmorphismCard className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="food">Food Orders</SelectItem>
                <SelectItem value="store">Store Orders</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassmorphismCard>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <GlassmorphismCard key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Order Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-background transition-colors"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Order Type Icon */}
                    <div className={`p-2 rounded-lg ${getOrderTypeColor(order.type)}`}>
                      {getOrderIcon(order.type)}
                    </div>

                    {/* Order Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {order.orderNumber}
                        </h3>
                        
                        {/* Type Badge */}
                        <Badge className={getOrderTypeColor(order.type)}>
                          {order.type === 'food' ? 'Food' : 'Store'}
                        </Badge>
                        
                        {/* Status Badge */}
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.timestamps.createdAt)}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        
                        {order.metadata.restaurantName && (
                          <div className="flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {order.metadata.restaurantName}
                          </div>
                        )}
                        
                        {order.metadata.storeMerchant && (
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {order.metadata.storeMerchant}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <ChevronDown 
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedOrders.has(order.id) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrders.has(order.id) && (
                <div className="border-t border-gray-200 p-4 bg-background">
                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {item.image && (
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={item.image} alt={item.name} />
                              <AvatarFallback>
                                {getOrderIcon(order.type)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{item.name}</div>
                            {item.category && (
                              <div className="text-sm text-muted-foreground">{item.category}</div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium text-foreground">
                              ${item.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address (for food orders) */}
                  {order.deliveryAddress && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">Delivery Address</h4>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <div>
                          <div>{order.deliveryAddress.street}</div>
                          {order.deliveryAddress.apartment && (
                            <div>{order.deliveryAddress.apartment}</div>
                          )}
                          <div>
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground mb-2">Payment Method</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {order.paymentMethod.type === 'card' ? (
                        <>
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            {order.paymentMethod.cardInfo?.brand?.toUpperCase()} **** {order.paymentMethod.cardInfo?.last4}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                            <Package className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>{order.paymentMethod.type.replace('_', ' ').toUpperCase()}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {order.metadata.deliveryTime && (
                      <div>
                        <span className="font-medium text-foreground">Delivery Time: </span>
                        <span className="text-muted-foreground">{order.metadata.deliveryTime}</span>
                      </div>
                    )}
                    
                    {order.metadata.trackingNumber && (
                      <div>
                        <span className="font-medium text-foreground">Tracking: </span>
                        <span className="text-muted-foreground">{order.metadata.trackingNumber}</span>
                      </div>
                    )}
                    
                    {order.metadata.loyaltyPointsEarned && (
                      <div>
                        <span className="font-medium text-foreground">Points Earned: </span>
                        <span className="text-orange-600 font-semibold">
                          +{order.metadata.loyaltyPointsEarned}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Support Access */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">Need Help?</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSupportAccess(order)}
                        className="flex items-center gap-2"
                      >
                        <HeadphonesIcon className="w-4 h-4" />
                        Get Support
                      </Button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-foreground mb-2">Order Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-muted-foreground">
                          Order placed - {formatDate(order.timestamps.createdAt)}
                        </span>
                      </div>
                      
                      {order.timestamps.confirmedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-muted-foreground">
                            Confirmed - {formatDate(order.timestamps.confirmedAt)}
                          </span>
                        </div>
                      )}
                      
                      {order.timestamps.deliveredAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-muted-foreground">
                            {order.type === 'food' ? 'Delivered' : 'Completed'} - {formatDate(order.timestamps.deliveredAt)}
                          </span>
                        </div>
                      )}
                      
                      {order.timestamps.cancelledAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-muted-foreground">
                            Cancelled - {formatDate(order.timestamps.cancelledAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </GlassmorphismCard>
        ))}
      </div>

      {/* Load More */}
      {filteredOrders.length >= maxVisible && state.orders.length > maxVisible && (
        <div className="text-center">
          <Button variant="outline" onClick={() => actions.refreshOrders()}>
            Load More Orders
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnifiedOrderHistory;
