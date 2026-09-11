
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { X } from 'lucide-react';

interface AddressFormProps {
  address?: Address;
  onClose: () => void;
  onSave: () => void;
}

const AddressForm = ({ address, onClose, onSave }: AddressFormProps) => {
  const { addAddress, updateAddress, isAddingAddress, isUpdatingAddress } = useAddresses();
  
  const [formData, setFormData] = useState({
    type: address?.type || 'both' as 'shipping' | 'billing' | 'both',
    first_name: address?.first_name || '',
    last_name: address?.last_name || '',
    company: address?.company || '',
    street_line_1: address?.street_line_1 || '',
    street_line_2: address?.street_line_2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postal_code: address?.postal_code || '',
    country: address?.country || 'US',
    phone: address?.phone || '',
    is_default: address?.is_default || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (address) {
      updateAddress({ id: address.id, ...formData });
    } else {
      addAddress(formData);
    }
    
    onSave();
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = isAddingAddress || isUpdatingAddress;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Address Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping Only</SelectItem>
                  <SelectItem value="billing">Billing Only</SelectItem>
                  <SelectItem value="both">Shipping & Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="street_line_1">Street Address</Label>
              <Input
                id="street_line_1"
                value={formData.street_line_1}
                onChange={(e) => handleChange('street_line_1', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="street_line_2">Apartment, suite, etc. (Optional)</Label>
              <Input
                id="street_line_2"
                value={formData.street_line_2}
                onChange={(e) => handleChange('street_line_2', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">ZIP Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => handleChange('is_default', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_default">Set as default address</Label>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressForm;
