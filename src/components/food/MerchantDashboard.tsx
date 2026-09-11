import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Clock, 
  TrendingUp, 
  Package, 
  AlertCircle,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Volume2
} from 'lucide-react';
import { Merchant, FoodOrder, FoodItem } from '@/types/food';
import { getMerchantById } from '@/data/merchantData';
import useOrderNotifications from '@/hooks/useOrderNotifications';
import OrderDetailsModal from './OrderDetailsModal';

interface MerchantDashboardProps {
  merchantId: string;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ merchantId }) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);

  // Use real-time order notifications
  const {
    orders: activeOrders,
    isConnected,
    lastPoll,
    updateOrderStatus,
    refreshOrders
  } = useOrderNotifications({
    merchantId,
    onNewOrder: (order) => {
      // New order received - TODO: integrate with notification system
    },
    onOrderUpdate: (orderId, status) => {
      // Order updated - TODO: integrate with notification system
    }
  });

  // Calculate today's stats
  const todayStats = {
    totalOrders: activeOrders.length,
    revenue: activeOrders.reduce((sum, order) => sum + order.total, 0),
    avgOrderValue: activeOrders.length > 0 
      ? activeOrders.reduce((sum, order) => sum + order.total, 0) / activeOrders.length 
      : 0
  };

  useEffect(() => {
    const merchantData = getMerchantById(merchantId);
    setMerchant(merchantData || null);
  }, [merchantId]);

  const handleOrderClick = (order: FoodOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
  };

  const handleToggleMenuItem = (itemId: string) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, isActive: !item.isActive }
          : item
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'delivering': return <TrendingUp className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!merchant) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">Merchant not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img
            src={merchant.logo}
            alt={merchant.businessName}
            className="w-12 h-12 rounded-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{merchant.businessName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge className={merchant.verified ? "bg-green-100 text-green-800" : "bg-muted text-gray-800"}>
                {merchant.verified ? 'Verified' : 'Unverified'}
              </Badge>
              <span>{merchant.cuisineType.join(', ')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <Button variant="outline" className="flex items-center gap-2" onClick={refreshOrders}>
            <Bell className="w-4 h-4" />
            Refresh
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Orders */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Today's Orders
                <Badge variant="secondary">{activeOrders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders for today
                  </div>
                ) : (
                  activeOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-background transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Order #{order.id.split('-')[1]}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.createdAt.toLocaleTimeString()}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Items: {order.items.length}</span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Delivery: {order.deliveryAddress.street} {order.deliveryAddress.number}
                        {order.deliveryAddress.reference && `, ${order.deliveryAddress.reference}`}
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Est. delivery: {order.estimatedDeliveryTime}</span>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{todayStats.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${todayStats.revenue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${todayStats.avgOrderValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Avg Order</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Menu Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Active Items</h3>
                  <span className="text-sm text-muted-foreground">
                    {menuItems.filter(item => item.isActive).length} of {menuItems.length}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">${item.price}</div>
                        <div className="text-xs text-muted-foreground">
                          Stock: {item.inventory} | {item.allergens?.join(', ') || 'None'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-muted text-gray-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleToggleMenuItem(item.id)}
                          disabled={item.inventory === 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default MerchantDashboard;
