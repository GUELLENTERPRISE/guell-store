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

const AccountSettingsAddressesPage = () => {
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

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Header */}
      <div className="bg-card dark:bg-gray-800 border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/account')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Account
            </Button>
            <div>
              <h1 className="text-2xl font-light text-foreground">Addresses</h1>
              <p className="text-sm text-muted-foreground">Manage your shipping and billing addresses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Add Address Button */}
        <div className="mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-light">Add New Address</DialogTitle>
                <DialogDescription>
                  Enter your address details below
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border-gray-200 focus:border-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-gray-200 focus:border-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="border-gray-200 focus:border-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="border-gray-200 focus:border-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-sm font-medium">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="10001"
                      value={formData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      className="border-gray-200 focus:border-gray-400"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isDefault" className="text-sm">Set as default shipping address</Label>
                </div>
                <Button onClick={handleAddAddress} className="w-full bg-gray-900 text-white hover:bg-gray-800">
                  Add Address
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className="border-gray-200 hover:shadow-sm transition-shadow">
              {address.isDefault && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gray-900 text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {address.type === 'shipping' ? (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <h3 className="font-medium text-foreground">{address.name}</h3>
                        <p className="text-sm text-muted-foreground">{address.type === 'shipping' ? 'Shipping' : 'Billing'}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditAddress(address)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!address.isDefault && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete address: ${address.street}, ${address.city}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-gray-700">{address.street}</span>
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
                      className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-background dark:hover:bg-gray-700"
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

        {addresses.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Addresses</h3>
              <p className="text-muted-foreground mb-6">Add your first address to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gray-900 text-white hover:bg-gray-800">
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

export default AccountSettingsAddressesPage;
