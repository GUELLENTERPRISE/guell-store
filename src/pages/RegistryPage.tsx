import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Heart, Calendar, Users, Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RegistryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  priority: 'high' | 'medium' | 'low';
  purchased: boolean;
  purchaserName?: string;
  purchasedDate?: string;
}

const RegistryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Mock registry data
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([
    {
      id: '1',
      title: 'Wireless Headphones',
      description: 'Premium noise-cancelling headphones for music lovers',
      category: 'Electronics',
      price: 199.99,
      quantity: 1,
      priority: 'high',
      purchased: false
    },
    {
      id: '2',
      title: 'Coffee Maker',
      description: 'Programmable coffee maker with thermal carafe',
      category: 'Kitchen',
      price: 89.99,
      quantity: 1,
      priority: 'medium',
      purchased: true,
      purchaserName: 'John Doe',
      purchasedDate: '2024-01-15'
    }
  ]);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    quantity: '1',
    priority: 'medium' as 'high' | 'medium' | 'low',
    occasion: '',
    recipient: ''
  });

  const categories = [
    'Electronics', 'Kitchen', 'Home', 'Clothing', 'Books', 'Toys', 'Sports', 'Beauty'
  ];

  const occasions = [
    'Wedding', 'Baby Shower', 'Birthday', 'Housewarming', 'Graduation', 'Holiday', 'Anniversary', 'Other'
  ];

  const handleAddItem = () => {
    if (!user) {
      toast.error('Please sign in to create a registry');
      navigate('/auth');
      return;
    }

    if (!newItem.title || !newItem.category || !newItem.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: RegistryItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      category: newItem.category,
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity),
      priority: newItem.priority,
      purchased: false
    };

    setRegistryItems(prev => [...prev, item]);
    setNewItem({
      title: '',
      description: '',
      category: '',
      price: '',
      quantity: '1',
      priority: 'medium',
      occasion: '',
      recipient: ''
    });
    toast.success('Item added to registry!');
  };

  const filteredItems = registryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const purchasedValue = filteredItems.filter(item => item.purchased).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const remainingValue = totalValue - purchasedValue;

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Gift Registry</h1>
              <Gift className="w-8 h-8" />
            </div>
            <p className="text-xl mb-6">Create and manage your gift registries for any occasion</p>
            
            {/* Registry Stats */}
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">{filteredItems.length}</div>
                <div className="text-sm opacity-90">Total Items</div>
              </div>
              <div>
                <div className="text-3xl font-bold">${remainingValue.toFixed(2)}</div>
                <div className="text-sm opacity-90">Remaining Value</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{filteredItems.filter(item => item.purchased).length}</div>
                <div className="text-sm opacity-90">Purchased</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Registry</TabsTrigger>
            <TabsTrigger value="manage">Manage Registry</TabsTrigger>
            <TabsTrigger value="share">Share Registry</TabsTrigger>
          </TabsList>

          {/* Create Registry Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Item Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Registry Item
                  </CardTitle>
                  <CardDescription>
                    Add items you'd love to receive as gifts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Item Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter item name"
                        value={newItem.title}
                        onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the item and why you'd love it..."
                      rows={3}
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newItem.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewItem(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="occasion">Occasion</Label>
                      <Select value={newItem.occasion} onValueChange={(value) => setNewItem(prev => ({ ...prev, occasion: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasions.map(occasion => (
                            <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input
                        id="recipient"
                        placeholder="Who is this for?"
                        value={newItem.recipient}
                        onChange={(e) => setNewItem(prev => ({ ...prev, recipient: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Registry
                  </Button>
                </CardContent>
              </Card>

              {/* Registry Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Registry Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p><strong>Be Specific:</strong> Include exact models, colors, and sizes.</p>
                    <p><strong>Price Range:</strong> Add items at various price points for different budgets.</p>
                    <p><strong>Update Regularly:</strong> Keep your registry current with your latest preferences.</p>
                    <p><strong>Share Early:</strong> Give guests plenty of time to shop.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manage Registry Tab */}
          <TabsContent value="manage" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search registry items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Registry Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className={`${item.purchased ? 'opacity-75' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <Badge className={priorityColors[item.priority]}>
                        {item.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Qty: {item.quantity}</span>
                      {item.purchased ? (
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">Purchased</div>
                          <div className="text-xs text-muted-foreground">by {item.purchaserName}</div>
                        </div>
                      ) : (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Registry Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Registry Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">${totalValue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">${purchasedValue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Purchased Value</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">${remainingValue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Remaining Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share Registry Tab */}
          <TabsContent value="share" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Share Your Registry</CardTitle>
                  <CardDescription>
                    Share your registry with friends and family
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Registry Link</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={`${window.location.origin}/registry/${user?.id}`}
                        readOnly 
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Copy Link
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Share via Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registry Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Privacy Settings</Label>
                    <Select defaultValue="public">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can view</SelectItem>
                        <SelectItem value="private">Private - Only with link</SelectItem>
                        <SelectItem value="friends">Friends only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Shipping Address</Label>
                    <Input placeholder="Enter default shipping address" />
                  </div>

                  <div className="space-y-2">
                    <Label>Thank You Message</Label>
                    <Textarea 
                      placeholder="Personal message to thank gift givers..."
                      rows={3}
                    />
                  </div>

                  <Button className="w-full">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RegistryPage;
