import { useState } from 'react';
import { usePromotionalBlocks, PromotionalBlock } from '@/hooks/usePromotionalBlocks';
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

const AdminPromotionalBlocks = () => {
  const { data: blocks, isLoading, refetch } = usePromotionalBlocks();
  const [editingBlock, setEditingBlock] = useState<PromotionalBlock | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_path: '',
    background_color: '#10b981',
    display_order: 0,
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBlock) {
        const { error } = await supabase
          .from('promotional_blocks')
          .update(formData)
          .eq('id', editingBlock.id);
        
        if (error) throw error;
        toast.success('Promotional block updated successfully');
        setEditingBlock(null);
      } else {
        const { error } = await supabase
          .from('promotional_blocks')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Promotional block created successfully');
        setIsAddDialogOpen(false);
      }
      
      refetch();
      resetForm();
    } catch (error) {
      toast.error('Failed to save promotional block');
      console.error('Error saving promotional block:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional block?')) return;
    
    try {
      const { error } = await supabase
        .from('promotional_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Promotional block deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete promotional block');
      console.error('Error deleting promotional block:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_path: '',
      background_color: '#10b981',
      display_order: 0,
      is_active: true
    });
  };

  const startEdit = (block: PromotionalBlock) => {
    setEditingBlock(block);
    setFormData({
      title: block.title,
      subtitle: block.subtitle || '',
      image_path: block.image_path || '',
      background_color: block.background_color,
      display_order: block.display_order,
      is_active: block.is_active
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Promotional Blocks Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Promotional Block
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Promotional Block</DialogTitle>
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
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
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
        {blocks?.map((block) => (
          <Card key={block.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center space-x-3">
                    {block.image_path ? (
                      <img 
                        src={getStorageUrl('category-images', block.image_path)} 
                        alt={block.title} 
                        className="w-8 h-8 rounded object-cover" 
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: block.background_color }}
                      >
                        {block.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{block.title}</h3>
                      <p className="text-sm text-muted-foreground">{block.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={block.is_active ? "default" : "secondary"}>
                    {block.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Order: {block.display_order}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => startEdit(block)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Promotional Block</DialogTitle>
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
                          <Label htmlFor="edit-subtitle">Subtitle</Label>
                          <Textarea
                            id="edit-subtitle"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
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
                          <Button type="button" variant="outline" onClick={() => setEditingBlock(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(block.id)}
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

export default AdminPromotionalBlocks;