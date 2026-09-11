
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CheckCircle, RotateCcw, Star, ArrowLeft, RefreshCw, HeadphonesIcon, ShoppingBag } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";
import ProductCard from "@/components/ProductCard";

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, isLoading } = useOrders();
  const { data: products } = useProducts();

  if (!user) {
    navigate('/store/auth');
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'processing':
      case 'paid':
        return <Package className="w-5 h-5 text-orange-400" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return "bg-green-900/30 text-green-400";
      case 'shipped':
      case 'in_transit':
        return "bg-blue-900/30 text-blue-400";
      case 'processing':
      case 'paid':
        return "bg-orange-900/30 text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
      case 'paid':
        return 'Processing';
      case 'shipped':
      case 'in_transit':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      default:
        return status.replace('_', ' ').split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
  };

  const getShippingStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
      case 'paid':
        return 'Preparing your order';
      case 'shipped':
      case 'in_transit':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Processing';
    }
  };

  const handleTrackOrder = (trackingNumber: string) => {
    if (trackingNumber) {
      window.open(`https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`, '_blank');
    } else {
      toast.error('Tracking number not available');
    }
  };

  const handleBuyAgain = (productPath: string) => {
  navigate(`/store/product/${productPath}`);
};

  const getPopularProducts = () => {
    if (!products) return [];
    return products
      .filter(p => p.monthly_sold_count && p.monthly_sold_count > 0)
      .sort((a, b) => (b.monthly_sold_count || 0) - (a.monthly_sold_count || 0))
      .slice(0, 4);
  };

  if (isLoading) {
    return <LoadingState type="page" message="Loading your orders..." />;
  }

  const recentOrders = orders.filter(order => 
    !['cancelled', 'returned'].includes(order.status.toLowerCase())
  );
  const returnedOrders = orders.filter(order => 
    order.status.toLowerCase() === 'returned'
  );
  const cancelledOrders = orders.filter(order => 
    order.status.toLowerCase() === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/store')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Your Orders</h1>
        </div>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent ({recentOrders.length})</TabsTrigger>
            <TabsTrigger value="returns">Returns ({returnedOrders.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                <Button onClick={() => navigate('/store')}>
                  Start Shopping
                </Button>
                
                {/* Products You Might Like Section */}
                <div className="mt-12">
                  <h4 className="text-xl font-semibold mb-6 text-center">Products You Might Like</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getPopularProducts().map((product) => (
                      <ProductCard 
                        key={product.id} 
                        id={product.id}
                        title={product.name}
                        price={product.price}
                        originalPrice={product.original_price ?? undefined}
                        rating={product.rating ?? 0}
                        reviews={product.review_count ?? 0}
                        imageUrl={product.images?.[0] || '/placeholder.svg'}
                        isPrime={product.is_prime ?? false}
                        brand={product.brand ?? undefined}
                        slug={product.slug ?? undefined}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order {order.order_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusDisplay(order.status)}</span>
                      </Badge>
                    </div>
                    
                    {/* Enhanced Order Status Information */}
                    <div className="mt-3 p-3 bg-background rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Shipping Status</p>
                          <p className="text-sm text-muted-foreground">{getShippingStatus(order.status)}</p>
                        </div>
                        <div className="text-right">
                          {order.status === "shipped" && order.estimated_delivery && (
                            <>
                              <p className="text-sm font-medium text-foreground">Est. Delivery</p>
                              <p className="text-sm text-blue-600">
                                {new Date(order.estimated_delivery).toLocaleDateString()}
                              </p>
                            </>
                          )}
                          {order.status === "delivered" && order.delivered_at && (
                            <>
                              <p className="text-sm font-medium text-foreground">Delivered</p>
                              <p className="text-sm text-green-600">
                                {new Date(order.delivered_at).toLocaleDateString()}
                              </p>
                            </>
                          )}
                          {["processing", "paid"].includes(order.status) && (
                            <>
                              <p className="text-sm font-medium text-foreground">Shipped</p>
                              <p className="text-sm text-muted-foreground">Processing order</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <button
                          onClick={() => navigate(`/store/product/${item.products.slug || item.products.id}`)}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <img 
                            src={item.products.images?.[0] || '/placeholder.svg'} 
                            alt={item.products.name}
                            className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:border-blue-300 transition-colors"
                          />
                        </button>
                        <div className="flex-1">
                          <button
                            onClick={() => navigate(`/store/product/${item.products.slug || item.products.id}`)}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <p className="font-medium text-foreground hover:underline">{item.products.name}</p>
                          </button>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="font-medium text-lg">Total: ${order.total_amount.toFixed(2)}</p>
                        {order.tracking_number && (
                          <p className="text-sm text-muted-foreground">
                            Tracking: {order.tracking_number}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {/* Track Order Button - Always visible for shipped/delivered orders */}
                        {["shipped", "in_transit", "delivered"].includes(order.status) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTrackOrder(order.tracking_number || '')}
                            className="hover:bg-blue-900/20 hover:border-blue-700"
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Track Order
                          </Button>
                        )}
                        
                        {/* Buy Again Button - For delivered orders */}
                        {order.status === "delivered" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBuyAgain(order.order_items[0]?.products.slug || order.order_items[0]?.products.id || '')}
                            className="hover:bg-green-900/20 hover:border-green-700"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Buy Again
                          </Button>
                        )}
                        
                        {/* Review and Return Buttons - For delivered orders */}
                        {order.status === "delivered" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Star className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Return
                            </Button>
                          </>
                        )}
                        
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="returns" className="space-y-4">
            {returnedOrders.length === 0 ? (
              <div className="text-center py-8">
                <RotateCcw className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No returns yet</h3>
                <p className="text-muted-foreground">Your returned items will appear here</p>
              </div>
            ) : (
              returnedOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order {order.order_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Returned on {order.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge className="bg-purple-900/30 text-purple-400">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Returned
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <button
                          onClick={() => navigate(`/store/product/${item.products.slug || item.products.id}`)}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <img 
                            src={item.products.images?.[0] || '/placeholder.svg'} 
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:border-blue-300 transition-colors"
                          />
                        </button>
                        <div className="flex-1">
                          <button
                            onClick={() => navigate(`/store/product/${item.products.slug || item.products.id}`)}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <p className="font-medium text-foreground hover:underline">{item.products.name}</p>
                          </button>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t">
                      <p className="font-medium">Total: ${order.total_amount.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-4">
            {cancelledOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No cancelled orders</h3>
                <p className="text-muted-foreground">Your cancelled orders will appear here</p>
              </div>
            ) : (
              cancelledOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order {order.order_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Cancelled on {order.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge className="bg-red-900/30 text-red-400">
                        Cancelled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <button
                          onClick={() => navigate(`/store/product/${item.products.slug || item.products.id}`)}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <img 
                            src={item.products.images?.[0] || '/placeholder.svg'} 
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:border-blue-300 transition-colors"
                          />
                        </button>
                        <div className="flex-1">
                          <button
                            onClick={() => navigate(`/store/product/${item.products.slug || item.products.id}`)}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <p className="font-medium text-foreground hover:underline">{item.products.name}</p>
                          </button>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t">
                      <p className="font-medium">Total: ${order.total_amount.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
        
        {/* Help Center Section */}
        <div className="mt-12 p-6 bg-background rounded-lg text-center">
          <div className="flex items-center justify-center mb-3">
            <HeadphonesIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Need Help?</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Having trouble with an order? Contact GÜELL Support
          </p>
          <Button 
            onClick={() => navigate('/store/help')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
