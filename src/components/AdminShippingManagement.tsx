import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Truck, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  isFree: boolean;
}

const AdminShippingManagement = () => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([
    { id: '1', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7 business days', isFree: false },
    { id: '2', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3 business days', isFree: false },
    { id: '3', name: 'Free Shipping', price: 0, estimatedDays: '7-10 business days', isFree: true },
  ]);

  const [editingOption, setEditingOption] = useState<ShippingOption | null>(null);
  const [newOption, setNewOption] = useState({
    name: '',
    price: 0,
    estimatedDays: '',
    isFree: false
  });

  const handleAddOption = () => {
    if (!newOption.name || !newOption.estimatedDays) {
      toast.error('Please fill in all required fields');
      return;
    }

    const option: ShippingOption = {
      id: Date.now().toString(),
      name: newOption.name,
      price: newOption.isFree ? 0 : newOption.price,
      estimatedDays: newOption.estimatedDays,
      isFree: newOption.isFree
    };

    setShippingOptions([...shippingOptions, option]);
    setNewOption({ name: '', price: 0, estimatedDays: '', isFree: false });
    toast.success('Shipping option added successfully');
  };

  const handleEditOption = (option: ShippingOption) => {
    setEditingOption(option);
  };

  const handleUpdateOption = () => {
    if (!editingOption) return;

    setShippingOptions(options =>
      options.map(opt =>
        opt.id === editingOption.id ? editingOption : opt
      )
    );
    setEditingOption(null);
    toast.success('Shipping option updated successfully');
  };

  const handleDeleteOption = (id: string) => {
    setShippingOptions(options => options.filter(opt => opt.id !== id));
    toast.success('Shipping option deleted successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Shipping Options Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Shipping Option */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add New Shipping Option</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Shipping Name *</Label>
                <Input
                  id="name"
                  value={newOption.name}
                  onChange={(e) => setNewOption({...newOption, name: e.target.value})}
                  placeholder="e.g., Next Day Delivery"
                />
              </div>
              
              <div>
                <Label htmlFor="days">Estimated Delivery *</Label>
                <Input
                  id="days"
                  value={newOption.estimatedDays}
                  onChange={(e) => setNewOption({...newOption, estimatedDays: e.target.value})}
                  placeholder="e.g., 1-2 business days"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newOption.isFree}
                  onCheckedChange={(checked) => setNewOption({...newOption, isFree: checked})}
                />
                <Label>Free Shipping</Label>
              </div>
              
              {!newOption.isFree && (
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newOption.price}
                    onChange={(e) => setNewOption({...newOption, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
            
            <Button onClick={handleAddOption} className="w-full">
              Add Shipping Option
            </Button>
          </div>

          {/* Existing Shipping Options */}
          <div className="space-y-4">
            <h3 className="font-semibold">Current Shipping Options</h3>
            
            {shippingOptions.map((option) => (
              <Card key={option.id}>
                <CardContent className="p-4">
                  {editingOption?.id === option.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Shipping Name</Label>
                          <Input
                            value={editingOption.name}
                            onChange={(e) => setEditingOption({...editingOption, name: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label>Estimated Delivery</Label>
                          <Input
                            value={editingOption.estimatedDays}
                            onChange={(e) => setEditingOption({...editingOption, estimatedDays: e.target.value})}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editingOption.isFree}
                            onCheckedChange={(checked) => setEditingOption({...editingOption, isFree: checked, price: checked ? 0 : editingOption.price})}
                          />
                          <Label>Free Shipping</Label>
                        </div>
                        
                        {!editingOption.isFree && (
                          <div>
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={editingOption.price}
                              onChange={(e) => setEditingOption({...editingOption, price: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button onClick={handleUpdateOption} size="sm">
                          Save Changes
                        </Button>
                        <Button onClick={() => setEditingOption(null)} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
                        <p className="text-sm font-semibold">
                          {option.isFree ? 'FREE' : `$${option.price.toFixed(2)}`}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditOption(option)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteOption(option.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShippingManagement;
