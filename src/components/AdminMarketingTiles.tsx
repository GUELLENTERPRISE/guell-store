import { useState } from 'react';
import { useMarketingTiles, MarketingTile } from '@/hooks/useMarketingTiles';
import { getStorageUrl } from '@/utils/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Plus, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingState from './LoadingState';
import ImageUpload from './ImageUpload';
import ColorPicker from './ColorPicker';

const AdminMarketingTiles = () => {
  const { data: tiles, isLoading, refetch } = useMarketingTiles();
  const [editingTile, setEditingTile] = useState<MarketingTile | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_path: '',
    background_color: '#3b82f6',
    display_order: 0,
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTile) {
        const { error } = await supabase
          .from('marketing_tiles')
          .update(formData)
          .eq('id', editingTile.id);
        
        if (error) throw error;
        toast.success('Marketing tile updated successfully');
        setEditingTile(null);
      } else {
        const { error } = await supabase
          .from('marketing_tiles')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Marketing tile created successfully');
        setIsAddDialogOpen(false);
      }
      
      refetch();
      resetForm();
    } catch (error) {
      toast.error('Failed to save marketing tile');
      console.error('Error saving marketing tile:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this marketing tile?')) return;
    
    try {
      const { error } = await supabase
        .from('marketing_tiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Marketing tile deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete marketing tile');
      console.error('Error deleting marketing tile:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_path: '',
      background_color: '#3b82f6',
      display_order: 0,
      is_active: true
    });
  };

  const startEdit = (tile: MarketingTile) => {
    setEditingTile(tile);
    setFormData({
      title: tile.title,
      description: tile.description || '',
      image_path: tile.image_path || '',
      background_color: tile.background_color,
      display_order: tile.display_order,
      is_active: tile.is_active
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Marketing Tiles Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Marketing Tile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Marketing Tile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <ImageUpload
                bucket="category-images"
                path={formData.image_path}
                onUpload={(path) => setFormData({ ...formData, image_path: path })}
                onRemove={() => setFormData({ ...formData, image_path: '' })}
              />
              <ColorPicker
                value={formData.background_color}
                onChange={(color) => setFormData({ ...formData, background_color: color })}
                label="Background Color"
              />
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">Create</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tiles?.map((tile) => (
          <Card key={tile.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center space-x-3">
                    {tile.image_path ? (
                      <img 
                        src={getStorageUrl('category-images', tile.image_path)} 
                        alt={tile.title} 
                        className="w-8 h-8 rounded object-cover" 
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: tile.background_color }}
                      >
                        {tile.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{tile.title}</h3>
                      <p className="text-sm text-muted-foreground">{tile.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={tile.is_active ? "default" : "secondary"}>
                    {tile.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Order: {tile.display_order}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => startEdit(tile)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Marketing Tile</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="edit-title">Title</Label>
                          <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                        <ImageUpload
                          bucket="category-images"
                          path={formData.image_path}
                          onUpload={(path) => setFormData({ ...formData, image_path: path })}
                          onRemove={() => setFormData({ ...formData, image_path: '' })}
                        />
                        <ColorPicker
                          value={formData.background_color}
                          onChange={(color) => setFormData({ ...formData, background_color: color })}
                          label="Background Color"
                        />
                        <div>
                          <Label htmlFor="edit-display_order">Display Order</Label>
                          <Input
                            id="edit-display_order"
                            type="number"
                            value={formData.display_order}
                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-1">Update</Button>
                          <Button type="button" variant="outline" onClick={() => setEditingTile(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(tile.id)}
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
    </div>
  );
};

export default AdminMarketingTiles;