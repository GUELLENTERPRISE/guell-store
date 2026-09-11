import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Calendar,
  Shield,
  Smartphone,
  Building,
  Wallet,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital' | 'bank';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  addedDate: string;
  cardNumber?: string;
  cvv?: string;
  name?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const AccountSettingsPaymentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      addedDate: '2023-06-15',
      billingAddress: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      }
    },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false,
      addedDate: '2023-08-20'
    },
    {
      id: '3',
      type: 'digital',
      brand: 'PayPal',
      last4: '',
      expiryMonth: 0,
      expiryYear: 0,
      isDefault: false,
      addedDate: '2023-10-05'
    }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: 'card',
    brand: '',
    cardNumber: '',
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    cvv: '',
    name: '',
    isDefault: false
  });

  const cardBrands = ['Visa', 'Mastercard', 'American Express', 'Discover'];
  const digitalWallets = ['PayPal', 'Apple Pay', 'Google Pay', 'Amazon Pay'];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPaymentMethod = () => {
    if (!formData.cardNumber || !formData.name || !formData.cvv) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: formData.type as 'card' | 'digital' | 'bank',
      brand: formData.brand,
      last4: formData.cardNumber.slice(-4),
      expiryMonth: formData.expiryMonth as number,
      expiryYear: formData.expiryYear as number,
      isDefault: formData.isDefault as boolean,
      addedDate: new Date().toISOString().split('T')[0]
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    setFormData({
      type: 'card',
      brand: '',
      cardNumber: '',
      expiryMonth: 1,
      expiryYear: new Date().getFullYear(),
      cvv: '',
      name: '',
      isDefault: false
    });
    setIsAddDialogOpen(false);
    toast.success('Payment method added successfully!');
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData(method);
  };

  const handleUpdatePaymentMethod = () => {
    if (!editingMethod) return;
    
    setPaymentMethods(prev => prev.map(method => 
      method.id === editingMethod.id ? { ...formData, id: editingMethod.id } as PaymentMethod : method
    ));
    setEditingMethod(null);
    setFormData({
      type: 'card',
      brand: '',
      cardNumber: '',
      expiryMonth: 1,
      expiryYear: new Date().getFullYear(),
      cvv: '',
      name: '',
      isDefault: false
    });
    toast.success('Payment method updated successfully!');
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast.success('Payment method deleted successfully!');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    toast.success('Default payment method updated!');
  };

  const getCardIcon = (brand: string) => {
    const brandColors: { [key: string]: string } = {
      'Visa': 'bg-blue-600',
      'Mastercard': 'bg-red-600',
      'American Express': 'bg-blue-800',
      'Discover': 'bg-orange-600'
    };
    return brandColors[brand] || 'bg-gray-600';
  };

  const getDigitalIcon = (brand: string) => {
    const brandColors: { [key: string]: string } = {
      'PayPal': 'bg-blue-500',
      'Apple Pay': 'bg-black',
      'Google Pay': 'bg-card border',
      'Amazon Pay': 'bg-orange-500'
    };
    return brandColors[brand] || 'bg-background0';
  };

  const isExpired = (month: number, year: number) => {
    const now = new Date();
    const expiry = new Date(year, month - 1, 1);
    return expiry < now;
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
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
              <h1 className="text-2xl font-light text-foreground">Payment Methods</h1>
              <p className="text-sm text-muted-foreground">Manage your payment methods and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Add Payment Method */}
        <div className="mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-light">Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a new payment method to your account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'card' | 'digital' | 'bank') => handleInputChange('type', value)}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="digital">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Digital Wallet
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'card' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Card Brand</Label>
                      <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select card brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {cardBrands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        maxLength={19}
                        className="border-gray-200 focus:border-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth" className="text-sm font-medium">Expiry Month</Label>
                        <Select value={formData.expiryMonth?.toString()} onValueChange={(value) => handleInputChange('expiryMonth', parseInt(value))}>
                          <SelectTrigger className="border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <SelectItem key={month} value={month.toString()}>
                                {month.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryYear" className="text-sm font-medium">Expiry Year</Label>
                        <Select value={formData.expiryYear?.toString()} onValueChange={(value) => handleInputChange('expiryYear', parseInt(value))}>
                          <SelectTrigger className="border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          maxLength={4}
                          className="border-gray-200 focus:border-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Cardholder Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="border-gray-200 focus:border-gray-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.type === 'digital' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Digital Wallet</Label>
                    <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {digitalWallets.map(wallet => (
                          <SelectItem key={wallet} value={wallet}>{wallet}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isDefault" className="text-sm">Set as default payment method</Label>
                </div>

                <Button onClick={handleAddPaymentMethod} className="w-full bg-gray-900 text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={`border-gray-200 hover:shadow-sm transition-shadow ${method.isDefault ? 'ring-2 ring-gray-900' : ''}`}>
              {method.isDefault && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gray-900 text-white text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {method.type === 'card' ? (
                        <div className={`w-12 h-8 rounded ${getCardIcon(method.brand)} flex items-center justify-center`}>
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                      ) : method.type === 'digital' ? (
                        <div className={`w-12 h-8 rounded ${getDigitalIcon(method.brand)} flex items-center justify-center`}>
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                          <Building className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div>
                        <div className="font-medium text-foreground">{method.brand}</div>
                        {method.type === 'card' && (
                          <div className="text-sm text-muted-foreground">
                            ••••• {method.last4}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditPaymentMethod(method)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!method.isDefault && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete payment method ending in ${method.last4}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {method.type === 'card' && (
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}</span>
                        {isExpired(method.expiryMonth, method.expiryYear) && (
                          <Badge className="bg-red-600 text-white text-xs">Expired</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {method.billingAddress && (
                    <div className="text-sm text-muted-foreground border-t pt-3">
                      <div className="font-medium text-gray-700 mb-1">Billing Address</div>
                      <div>{method.billingAddress.street}</div>
                      <div>{method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.zip}</div>
                      <div>{method.billingAddress.country}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Secured by GÜELL</span>
                  </div>

                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      className="w-full border-gray-200 text-gray-700 hover:bg-background"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {paymentMethods.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-6">Add your first payment method to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsPaymentsPage;
