import React, { useState, useEffect } from 'react';
import { MapPin, Home, Briefcase, Plus, Edit2, Trash2, Star, Navigation, Check } from 'lucide-react';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import GlassmorphismModal from '@/components/ui/glassmorphism-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ADDRESS_TYPE_COLORS } from '@/utils/statusColors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnifiedAddressManagerProps {
  onSelectAddress?: (address: any) => void;
  selectedAddressId?: string;
  showAddButton?: boolean;
  maxVisible?: number;
  className?: string;
}

const UnifiedAddressManager: React.FC<UnifiedAddressManagerProps> = ({
  onSelectAddress,
  selectedAddressId,
  showAddButton = true,
  maxVisible = 3,
  className = ''
}) => {
  const { state, actions } = useUnifiedUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    apartment: '',
    instructions: '',
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      type: 'home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      apartment: '',
      instructions: '',
      isDefault: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        await actions.updateAddress(editingAddress.id, formData);
        setShowEditModal(false);
        setEditingAddress(null);
      } else {
        await actions.addAddress(formData);
        setShowAddModal(false);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      apartment: address.apartment || '',
      instructions: address.instructions || '',
      isDefault: address.isDefault
    });
    setShowEditModal(true);
  };

  const handleDelete = async (addressId: string) => {
    setDeleteTargetId(addressId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    
    try {
      await actions.deleteAddress(deleteTargetId);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting address:', error);
      setDeleteTargetId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await actions.setDefaultAddress(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    return ADDRESS_TYPE_COLORS[type] || ADDRESS_TYPE_COLORS.other;
  };

  const visibleAddresses = state.addresses.slice(0, maxVisible);
  const hasMoreAddresses = state.addresses.length > maxVisible;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address List */}
      <div className="space-y-3">
        {visibleAddresses.map((address) => (
          <Card
            key={address.id}
            className={`
              cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedAddressId === address.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''}
              ${address.isDefault ? 'border-orange-200' : ''}
            `}
            onClick={() => onSelectAddress?.(address)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getAddressTypeColor(address.type)}`}>
                    {getAddressIcon(address.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground capitalize">
                        {address.type}
                      </h3>
                      {address.isDefault && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-1">
                      {address.street}
                      {address.apartment && `, ${address.apartment}`}
                    </p>
                    
                    <p className="text-muted-foreground text-sm mb-1">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    
                    <p className="text-muted-foreground text-sm mb-2">
                      {address.country}
                    </p>
                    
                    {address.instructions && (
                      <p className="text-muted-foreground text-xs italic">
                        Instructions: {address.instructions}
                      </p>
                    )}
                    
                    {address.coordinates && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Navigation className="w-3 h-3" />
                        <span>Location saved</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More Link */}
      {hasMoreAddresses && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {/* Navigate to full address management */}}
        >
          View all {state.addresses.length} addresses
        </Button>
      )}

      {/* Add Address Button */}
      {showAddButton && (
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      )}

      {/* Add Address Modal */}
      <GlassmorphismModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Address"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Address Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Home
                    </div>
                  </SelectItem>
                  <SelectItem value="work">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Work
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
              placeholder="123 Main St"
              required
            />
          </div>

          <div>
            <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
            <Input
              id="apartment"
              value={formData.apartment}
              onChange={(e) => setFormData(prev => ({ ...prev, apartment: e.target.value }))}
              placeholder="Apt 4B, Suite 200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Delivery Instructions (optional)</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Ring doorbell 3 times, leave at front door, etc."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="isDefault" className="text-sm">
              Set as default address
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Saving...' : 'Add Address'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </GlassmorphismModal>

      {/* Edit Address Modal */}
      <GlassmorphismModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAddress(null);
          resetForm();
        }}
        title="Edit Address"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Same form fields as Add Modal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-type">Address Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-street">Street Address</Label>
            <Input
              id="edit-street"
              value={formData.street}
              onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-apartment">Apartment, suite, etc.</Label>
            <Input
              id="edit-apartment"
              value={formData.apartment}
              onChange={(e) => setFormData(prev => ({ ...prev, apartment: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-state">State</Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-zipCode">ZIP Code</Label>
              <Input
                id="edit-zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-instructions">Delivery Instructions</Label>
            <Textarea
              id="edit-instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="edit-isDefault" className="text-sm">
              Set as default address
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Updating...' : 'Update Address'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingAddress(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </GlassmorphismModal>

      {/* Error Alert */}
      {state.error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The address will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Address Selector Component (for checkout)
export const AddressSelector: React.FC<{
  onAddressSelect: (address: any) => void;
  selectedAddressId?: string;
  className?: string;
}> = ({ onAddressSelect, selectedAddressId, className = '' }) => {
  const { state } = useUnifiedUser();

  if (state.addresses.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No addresses saved</h3>
        <p className="text-muted-foreground mb-4">Add a delivery address to get started</p>
        <UnifiedAddressManager showAddButton={true} maxVisible={0} />
      </div>
    );
  }

  return (
    <UnifiedAddressManager
      onSelectAddress={onAddressSelect}
      selectedAddressId={selectedAddressId}
      showAddButton={true}
      maxVisible={5}
      className={className}
    />
  );
};

export default UnifiedAddressManager;
