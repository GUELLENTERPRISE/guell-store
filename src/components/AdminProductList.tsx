import { useState, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Loader2, Trash2, Plus, X, Image, Video, GripVertical } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const AdminProductList = () => {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { updateProduct, isUpdating, uploadFile, isUploading } = useAdminProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverImageIndex(index);
  };

  const handleImageDragLeave = () => {
    setDragOverImageIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) {
      setDraggedImageIndex(null);
      setDragOverImageIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedImageIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    setImages(newImages);
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    inventory: '',
    brand: '',
    color: '',
    fabric_type: '',
    origin: '',
    is_featured: false,
    is_prime: false,
    is_guell_plus: false,
    specifications: '',
    recommended_uses: '',
    monthly_sold_count: '',
    urgency_threshold: '',
    show_secure_payment_badge: true,
    show_satisfaction_badge: true,
    show_fast_shipping_badge: true,
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImages(product.images || []);
    setVideos(product.videos || []);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      inventory: product.inventory.toString(),
      brand: product.brand || '',
      color: product.color || '',
      fabric_type: product.fabric_type || '',
      origin: product.origin || '',
      is_featured: product.is_featured || false,
      is_prime: product.is_prime || false,
      is_guell_plus: product.is_guell_plus || false,
      specifications: product.specifications ? JSON.stringify(product.specifications) : '',
      recommended_uses: product.recommended_uses?.join(', ') || '',
      monthly_sold_count: product.monthly_sold_count?.toString() || '',
      urgency_threshold: product.urgency_threshold?.toString() || '',
      show_secure_payment_badge: product.show_secure_payment_badge ?? true,
      show_satisfaction_badge: product.show_satisfaction_badge ?? true,
      show_fast_shipping_badge: product.show_fast_shipping_badge ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile.mutateAsync(file);
        setImages(prev => [...prev, url]);
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile.mutateAsync(file);
        setVideos(prev => [...prev, url]);
        toast.success('Video uploaded successfully');
      } catch (error) {
        console.error('Error uploading video:', error);
      }
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsDeletingProduct(productId);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setIsDeletingProduct(null);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let specifications = {};
      if (formData.specifications) {
        try {
          specifications = JSON.parse(formData.specifications);
        } catch (error) {
          console.error('Invalid specifications JSON:', error);
          toast.error('Invalid JSON format in specifications');
          return;
        }
      }

      const productData = {
        id: editingProduct.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        category_id: formData.category_id,
        inventory: parseInt(formData.inventory),
        brand: formData.brand || undefined,
        color: formData.color || undefined,
        fabric_type: formData.fabric_type || undefined,
        origin: formData.origin || undefined,
        is_featured: formData.is_featured,
        is_prime: formData.is_prime,
        is_guell_plus: formData.is_guell_plus,
        images: images,
        videos: videos.length > 0 ? videos : undefined,
        specifications,
        recommended_uses: formData.recommended_uses ? formData.recommended_uses.split(',').map(use => use.trim()) : undefined,
        monthly_sold_count: formData.monthly_sold_count ? parseInt(formData.monthly_sold_count) : undefined,
        urgency_threshold: formData.urgency_threshold ? parseInt(formData.urgency_threshold) : undefined,
        show_secure_payment_badge: formData.show_secure_payment_badge,
        show_satisfaction_badge: formData.show_satisfaction_badge,
        show_fast_shipping_badge: formData.show_fast_shipping_badge,
      };

      await updateProduct.mutateAsync(productData);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Existing Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products?.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">${product.price}</p>
                <p className="text-xs text-muted-foreground">Stock: {product.inventory}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleEdit(product)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(product.id)}
                  variant="destructive"
                  size="sm"
                  disabled={isDeletingProduct === product.id}
                >
                  {isDeletingProduct === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-brand">Brand</Label>
                  <Input
                    id="edit-brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-original-price">Original Price ($)</Label>
                  <Input
                    id="edit-original-price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-inventory">Inventory</Label>
                  <Input
                    id="edit-inventory"
                    type="number"
                    value={formData.inventory}
                    onChange={(e) => handleInputChange('inventory', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-color">Color</Label>
                  <Input
                    id="edit-color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fabric-type">Fabric Type</Label>
                  <Input
                    id="edit-fabric-type"
                    value={formData.fabric_type}
                    onChange={(e) => handleInputChange('fabric_type', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-origin">Origin</Label>
                  <Input
                    id="edit-origin"
                    value={formData.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-monthly-sold">Monthly Sold Count</Label>
                <Input
                  id="edit-monthly-sold"
                  type="number"
                  value={formData.monthly_sold_count}
                  onChange={(e) => handleInputChange('monthly_sold_count', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit-recommended-uses">Recommended Uses (comma-separated)</Label>
                <Textarea
                  id="edit-recommended-uses"
                  value={formData.recommended_uses}
                  onChange={(e) => handleInputChange('recommended_uses', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-specifications">Specifications (JSON)</Label>
                <Textarea
                  id="edit-specifications"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange('specifications', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Images Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Product Images
                </Label>
                <p className="text-xs text-muted-foreground">Drag images to reorder</p>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleImageDragStart(index)}
                      onDragOver={(e) => handleImageDragOver(e, index)}
                      onDragLeave={handleImageDragLeave}
                      onDrop={(e) => handleImageDrop(e, index)}
                      onDragEnd={handleImageDragEnd}
                      className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                        draggedImageIndex === index ? 'opacity-50 scale-95' : ''
                      } ${dragOverImageIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      <div className="absolute top-1 left-1 bg-background/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <GripVertical className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <div className="absolute bottom-1 left-1 bg-background/80 text-xs px-1 rounded">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-20 border-2 border-dashed rounded flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span className="text-xs">Add</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Videos Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Product Videos
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {videos.map((vid, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={vid}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-20 border-2 border-dashed rounded flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span className="text-xs">Add</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                  <Label htmlFor="edit-featured">Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-prime"
                    checked={formData.is_prime}
                    onCheckedChange={(checked) => handleInputChange('is_prime', checked)}
                  />
                  <Label htmlFor="edit-prime">GÜELL Choice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-guell-plus"
                    checked={formData.is_guell_plus}
                    onCheckedChange={(checked) => handleInputChange('is_guell_plus', checked)}
                  />
                  <Label htmlFor="edit-guell-plus">GÜELL +</Label>
                </div>
              </div>

              {/* CRO / Urgency & Trust Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-lg p-4">
                <div>
                  <Label htmlFor="edit-urgency-threshold">Low-stock threshold</Label>
                  <Input
                    id="edit-urgency-threshold"
                    type="number"
                    min={0}
                    value={formData.urgency_threshold}
                    onChange={(e) => handleInputChange('urgency_threshold', e.target.value)}
                    placeholder="e.g. 15"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Below this inventory, the storefront will show the “Hurry, only X left” message. Leave blank to use the global default.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Trust badges shown on this product</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-secure-badge"
                      checked={formData.show_secure_payment_badge}
                      onCheckedChange={(checked) => handleInputChange('show_secure_payment_badge', checked)}
                    />
                    <Label htmlFor="edit-secure-badge" className="text-sm">Secure SSL Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-satisfaction-badge"
                      checked={formData.show_satisfaction_badge}
                      onCheckedChange={(checked) => handleInputChange('show_satisfaction_badge', checked)}
                    />
                    <Label htmlFor="edit-satisfaction-badge" className="text-sm">Satisfaction Guarantee</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-fast-shipping-badge"
                      checked={formData.show_fast_shipping_badge}
                      onCheckedChange={(checked) => handleInputChange('show_fast_shipping_badge', checked)}
                    />
                    <Label htmlFor="edit-fast-shipping-badge" className="text-sm">Fast Shipping</Label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating Product...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminProductList;
