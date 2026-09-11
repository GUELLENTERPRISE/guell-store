import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Building, 
  Check,
  X,
  Star,
  Package,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import VerificationTooltip from '@/components/VerificationTooltip';

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
  isVerified?: boolean;
  brand?: string;
}

const AccountAddressesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'shipping',
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true,
      isVerified: true,
      brand: 'GÜELL Verified'
    },
    {
      id: '2',
      type: 'shipping',
      name: 'Jane Doe',
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      isDefault: false
    },
    {
      id: '3',
      type: 'billing',
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true
    }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'shipping',
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    isDefault: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAddress = () => {
    if (!formData.name || !formData.street || !formData.city || !formData.zip) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      type: formData.type as 'shipping' | 'billing',
      name: formData.name,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      country: formData.country,
      phone: formData.phone,
      isDefault: formData.isDefault as boolean
    };

    setAddresses(prev => [...prev, newAddress]);
    setFormData({
      type: 'shipping',
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      phone: '',
      isDefault: false
    });
    setIsAddDialogOpen(false);
    toast.success('Address added successfully!');
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;
    
    setAddresses(prev => prev.map(addr => 
      addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } as Address : addr
    ));
    setEditingAddress(null);
    setFormData({
      type: 'shipping',
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      phone: '',
      isDefault: false
    });
    toast.success('Address updated successfully!');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    toast.success('Address deleted successfully!');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    toast.success('Default address updated!');
  };

  const filteredAddresses = addresses.filter(addr => addr.type === (formData.type || 'shipping'));

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/account')}
              className="text-white hover:bg-card/10 hover:text-foreground dark:hover:text-gray-100"
            >
              ← Back to Account
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Your Addresses</h1>
              <p className="text-blue-100">Manage your shipping and billing addresses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Address Type Tabs */}
        <div className="mb-6">
          <Select value={formData.type} onValueChange={(value: 'shipping' | 'billing') => handleInputChange('type', value)}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shipping">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Shipping Addresses
                </div>
              </SelectItem>
              <SelectItem value="billing">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Billing Addresses
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Address Button */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>
                  Enter your address details below
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      placeholder="10001"
                      value={formData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isDefault">Set as default address</Label>
                </div>
                <Button onClick={handleAddAddress} className="w-full">
                  Add Address
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAddresses.map((address) => (
            <Card key={address.id} className="relative">
              {address.isDefault && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {address.type === 'shipping' ? (
                        <Package className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-semibold">{address.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!address.isDefault && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{address.street}</span>
                      {address.isVerified && (
                        <VerificationTooltip 
                          showTooltip={true}
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </div>
                    <div className="text-muted-foreground">
                      {address.country}
                    </div>
                    <div className="text-muted-foreground">
                      {address.phone}
                    </div>
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="w-full mt-3"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAddresses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Addresses Found</h3>
              <p className="text-muted-foreground mb-4">Add your first address to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccountAddressesPage;
