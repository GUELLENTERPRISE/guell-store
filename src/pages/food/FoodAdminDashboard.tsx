import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Utensils, 
  TrendingUp, 
  DollarSign, 
  Star,
  ChefHat,
  Eye
} from "lucide-react";

interface FoodStats {
  totalOrders: number;
  activeRestaurants: number;
  totalRevenue: number;
  averageRating: number;
  deliveryTime: string;
  popularItems: Array<{ name: string; orders: number }>;
}

const FoodAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<FoodStats>({
    totalOrders: 1247,
    activeRestaurants: 28,
    totalRevenue: 45678,
    averageRating: 4.8,
    deliveryTime: "32 min",
    popularItems: [
      { name: "Margherita Pizza", orders: 342 },
      { name: "Classic Burger", orders: 298 },
      { name: "California Roll", orders: 187 },
      { name: "Pad Thai", orders: 156 }
    ]
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 3),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 50)
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: string; 
    color: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-600" />
              GÜELL Food Admin
            </h1>
            <p className="text-muted-foreground">Manage your restaurant empire</p>
          </div>
          <Button 
            onClick={() => navigate('/food')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            View Food Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              icon={Utensils}
              trend="+12.5%"
              color="bg-orange-600"
            />
            <StatCard
              title="Active Restaurants"
              value={stats.activeRestaurants}
              icon={ChefHat}
              trend="+2 this week"
              color="bg-green-600"
            />
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend="+18.2%"
              color="bg-blue-600"
            />
            <StatCard
              title="Avg Rating"
              value={stats.averageRating.toFixed(1)}
              icon={Star}
              trend="+0.3"
              color="bg-yellow-600"
            />
          </div>

          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Popular Menu Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-foreground">{index + 1}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                      {item.orders} orders
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Management Tab */}
        <TabsContent value="banners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Banner Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Main Title</label>
                  <input
                    type="text"
                    defaultValue="GÜELL Food"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input
                    type="text"
                    defaultValue="Delicious meals, delivered fast!"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Primary CTA Text</label>
                  <input
                    type="text"
                    defaultValue="Order Now"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Text</label>
                  <input
                    type="text"
                    defaultValue="Free delivery on orders $30+"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Background Gradient</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Orange to Red</option>
                    <option>Blue to Purple</option>
                    <option>Green to Teal</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <Button className="bg-orange-600 hover:bg-orange-700">Save Banner Changes</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/food', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Live Site
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Management Tab */}
        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Best Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { id: 1, title: "🔥 Hot Deal", description: "50% off on selected items", code: "HOT50" },
                  { id: 2, title: "🚚 Free Delivery", description: "On orders above $30", code: "FREE30" },
                  { id: 3, title: "⏰ Lunch Special", description: "25% off 11AM-3PM", code: "LUNCH25" }
                ].map((deal) => (
                  <div key={deal.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Deal Title</label>
                        <input
                          type="text"
                          defaultValue={deal.title}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Promo Code</label>
                        <input
                          type="text"
                          defaultValue={deal.code}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <input
                          type="text"
                          defaultValue={deal.description}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <select className="w-full p-2 border rounded-lg">
                          <option>Red to Orange</option>
                          <option>Green to Emerald</option>
                          <option>Blue to Indigo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Time</label>
                        <input
                          type="text"
                          defaultValue="Today"
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <Button className="bg-orange-600 hover:bg-orange-700">Save Deal Changes</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/food', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Live Site
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flash Sale Management */}
          <Card>
            <CardHeader>
              <CardTitle>Flash Sale Ending Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Flash Sale Title</label>
                  <input
                    type="text"
                    defaultValue="Flash Sale Ending Soon"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    defaultValue="All deals expire at midnight"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <Button className="bg-orange-600 hover:bg-orange-700">Save Flash Sale Settings</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/food', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Live Site
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Management Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Food Categories Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Pizza', icon: '🍕', color: 'Orange' },
                    { name: 'Burgers', icon: '🍔', color: 'Red' },
                    { name: 'Sushi', icon: '🍱', color: 'Pink' },
                    { name: 'Asian', icon: '🥢', color: 'Yellow' },
                    { name: 'Mexican', icon: '🌮', color: 'Green' },
                    { name: 'Healthy', icon: '🥗', color: 'Emerald' },
                    { name: 'Desserts', icon: '🍰', color: 'Purple' },
                    { name: 'Drinks', icon: '🥤', color: 'Blue' }
                  ].map((category) => (
                    <div key={category.name} className="border rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Category Name</label>
                          <input
                            type="text"
                            defaultValue={category.name}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Icon</label>
                          <input
                            type="text"
                            defaultValue={category.icon}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Color Theme</label>
                          <select className="w-full p-2 border rounded text-sm">
                            <option selected={category.color === 'Orange'}>Orange</option>
                            <option selected={category.color === 'Red'}>Red</option>
                            <option selected={category.color === 'Pink'}>Pink</option>
                            <option selected={category.color === 'Yellow'}>Yellow</option>
                            <option selected={category.color === 'Green'}>Green</option>
                            <option selected={category.color === 'Emerald'}>Emerald</option>
                            <option selected={category.color === 'Purple'}>Purple</option>
                            <option selected={category.color === 'Blue'}>Blue</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <div className="flex gap-4">
                  <Button className="bg-orange-600 hover:bg-orange-700">Save Categories</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/food', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Live Site
                  </Button>
                </div>
                  <Button variant="outline">Add New Category</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Featured Restaurants Management */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Featured Restaurants</h3>
                  <div className="space-y-4">
                    {[
                      { id: 1, name: "Burger Palace", cuisine: "American", rating: 4.5, featured: true },
                      { id: 2, name: "Pizza Heaven", cuisine: "Italian", rating: 4.7, featured: true },
                      { id: 3, name: "Sushi Express", cuisine: "Japanese", rating: 4.8, featured: false }
                    ].map((restaurant) => (
                      <div key={restaurant.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                            <input
                              type="text"
                              defaultValue={restaurant.name}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Cuisine Type</label>
                            <input
                              type="text"
                              defaultValue={restaurant.cuisine}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              defaultValue={restaurant.rating}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Promo Text</label>
                            <input
                              type="text"
                              placeholder="e.g., 20% OFF Burgers"
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Delivery Time</label>
                            <input
                              type="text"
                              placeholder="e.g., 25-35 min"
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              defaultChecked={restaurant.featured}
                              className="w-4 h-4"
                            />
                            <label className="text-sm font-medium">Featured on Homepage</label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurant Management */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Restaurant Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Pending Approvals</h3>
                        <p className="text-sm text-muted-foreground">3 restaurants waiting</p>
                      </div>
                      <Button variant="outline" className="text-orange-600 border-orange-600">
                        Review
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Performance Issues</h3>
                        <p className="text-sm text-muted-foreground">2 restaurants flagged</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-600">
                        Investigate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex gap-4">
                  <Button className="bg-orange-600 hover:bg-orange-700">Save Restaurant Changes</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/food', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Live Site
                  </Button>
                </div>
                  <Button variant="outline">Add New Restaurant</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, customer: "John Doe", restaurant: "Pizza Heaven", status: "delivered", time: "2 min ago" },
                  { id: 2, customer: "Jane Smith", restaurant: "Burger Palace", status: "preparing", time: "5 min ago" },
                  { id: 3, customer: "Bob Johnson", restaurant: "Sushi Express", status: "delivering", time: "8 min ago" },
                  { id: 4, customer: "Alice Brown", restaurant: "Taco Fiesta", status: "pending", time: "12 min ago" }
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{order.customer}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{order.restaurant}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                          order.status === 'delivering' ? 'bg-orange-100 text-orange-600' :
                          'bg-muted text-muted-foreground'
                        }>
                          {order.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{order.time}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Time</span>
                    <span className="font-semibold">{stats.deliveryTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">On-Time Rate</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Customer Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">4.8</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Today's Revenue</span>
                    <span className="font-semibold text-green-600">+$1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-semibold text-green-600">+$8,567</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-semibold text-green-600">+$45,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Order Value</span>
                    <span className="font-semibold">$36.60</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodAdminDashboard;
