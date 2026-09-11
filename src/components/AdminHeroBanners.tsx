import { useState } from 'react';
import { useAllHeroBanners, HeroBanner } from '@/hooks/useHeroBanners';
import { useProducts } from '@/hooks/useProducts';
import { getStorageUrl } from '@/utils/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Plus, Trash2, GripVertical, Image, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingState from './LoadingState';
import ImageUpload from './ImageUpload';
import ColorPicker from './ColorPicker';

const AdminHeroBanners = () => {
  const { data: banners, isLoading, refetch } = useAllHeroBanners();
  const { data: products = [] } = useProducts();
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    button_text: 'Shop Now',
    button_link: '/search',
    image_path: '',
    background_color: '#1aafff',
    text_color: '#ffffff',
    show_products: true,
    product_ids: [] as string[],
    display_order: 0,
    is_active: true,
    auto_rotate_interval: 4000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        image_path: formData.image_path || null,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('hero_banners')
          .update(dataToSubmit)
          .eq('id', editingBanner.id);
        
        if (error) throw error;
        toast.success('Hero banner updated successfully');
        setEditingBanner(null);
      } else {
        const { error } = await supabase
          .from('hero_banners')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast.success('Hero banner created successfully');
        setIsAddDialogOpen(false);
      }
      
      refetch();
      resetForm();
    } catch (error) {
      toast.error('Failed to save hero banner');
      console.error('Error saving hero banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;
    
    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Hero banner deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete hero banner');
      console.error('Error deleting hero banner:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      button_text: 'Shop Now',
      button_link: '/search',
      image_path: '',
      background_color: '#1aafff',
      text_color: '#ffffff',
      show_products: true,
      product_ids: [],
      display_order: 0,
      is_active: true,
      auto_rotate_interval: 4000
    });
  };

  const startEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      button_text: banner.button_text,
      button_link: banner.button_link,
      image_path: banner.image_path || '',
      background_color: banner.background_color,
      text_color: banner.text_color,
      show_products: banner.show_products,
      product_ids: banner.product_ids || [],
      display_order: banner.display_order,
      is_active: banner.is_active,
      auto_rotate_interval: banner.auto_rotate_interval
    });
  };

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId]
    }));
  };

  const BannerForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${isEdit ? 'edit-' : ''}title`}>Title *</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}title`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Members-Only Deals"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${isEdit ? 'edit-' : ''}subtitle`}>Subtitle</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}subtitle`}
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Exclusive savings"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor={`${isEdit ? 'edit-' : ''}description`}>Description</Label>
        <Textarea
          id={`${isEdit ? 'edit-' : ''}description`}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional longer description..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${isEdit ? 'edit-' : ''}button_text`}>Button Text</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}button_text`}
            value={formData.button_text}
            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
            placeholder="Shop Now"
          />
        </div>
        <div>
          <Label htmlFor={`${isEdit ? 'edit-' : ''}button_link`}>Button Link</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}button_link`}
            value={formData.button_link}
            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
            placeholder="/search"
          />
        </div>
      </div>

      <ImageUpload
        bucket="category-images"
        path={formData.image_path}
        onUpload={(path) => setFormData({ ...formData, image_path: path })}
        onRemove={() => setFormData({ ...formData, image_path: '' })}
      />

      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          value={formData.background_color}
          onChange={(color) => setFormData({ ...formData, background_color: color })}
          label="Background Color"
        />
        <ColorPicker
          value={formData.text_color}
          onChange={(color) => setFormData({ ...formData, text_color: color })}
          label="Text Color"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${isEdit ? 'edit-' : ''}display_order`}>Display Order</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}display_order`}
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor={`${isEdit ? 'edit-' : ''}auto_rotate`}>Product Rotation (ms)</Label>
          <Select
            value={formData.auto_rotate_interval.toString()}
            onValueChange={(value) => setFormData({ ...formData, auto_rotate_interval: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2000">2 seconds</SelectItem>
              <SelectItem value="3000">3 seconds</SelectItem>
              <SelectItem value="4000">4 seconds</SelectItem>
              <SelectItem value="5000">5 seconds</SelectItem>
              <SelectItem value="6000">6 seconds</SelectItem>
              <SelectItem value="8000">8 seconds</SelectItem>
              <SelectItem value="10000">10 seconds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.show_products}
            onCheckedChange={(checked) => setFormData({ ...formData, show_products: checked })}
          />
          <Label>Show Products</Label>
        </div>
      </div>

      {formData.show_products && (
        <div>
          <Label className="mb-2 block">Select Products (leave empty for featured products)</Label>
          <ScrollArea className="h-48 border rounded-md p-2">
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.product_ids.includes(product.id)}
                    onCheckedChange={() => toggleProductSelection(product.id)}
                  />
                  <div className="flex items-center space-x-2">
                    {product.images?.[0] && (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span className="text-sm">{product.name}</span>
                    <span className="text-xs text-muted-foreground">${product.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {formData.product_ids.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {formData.product_ids.length} product(s) selected
            </p>
          )}
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1">
          {isEdit ? 'Update' : 'Create'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setEditingBanner(null);
            } else {
              setIsAddDialogOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Banner Management</h2>
          <p className="text-muted-foreground">Manage the rotating banners displayed on the homepage header</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Hero Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Hero Banner</DialogTitle>
            </DialogHeader>
            <BannerForm />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - controlled separately */}
        <Dialog open={!!editingBanner} onOpenChange={(open) => !open && setEditingBanner(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Hero Banner</DialogTitle>
            </DialogHeader>
            <BannerForm isEdit />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {banners?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hero banners yet. Add your first banner to customize the homepage header.</p>
            </CardContent>
          </Card>
        )}
        
        {banners?.map((banner) => (
          <Card key={banner.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div 
                    className="w-16 h-12 rounded flex items-center justify-center text-xs font-medium"
                    style={{ 
                      backgroundColor: banner.background_color,
                      color: banner.text_color
                    }}
                  >
                    {banner.image_path ? (
                      <img 
                        src={getStorageUrl('category-images', banner.image_path)}
                        alt={banner.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      'Preview'
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {banner.show_products && (
                        <Badge variant="outline" className="text-xs">
                          <Package className="w-3 h-3 mr-1" />
                          {banner.product_ids?.length > 0 
                            ? `${banner.product_ids.length} products` 
                            : 'Featured products'}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {banner.auto_rotate_interval / 1000}s rotation
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={banner.is_active ? "default" : "secondary"}>
                    {banner.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Order: {banner.display_order}</span>
                  <Button variant="outline" size="sm" onClick={() => startEdit(banner)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(banner.id)}
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

export default AdminHeroBanners;
