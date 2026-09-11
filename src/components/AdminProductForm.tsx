import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Loader2, Info, Truck, Plus, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  isFree: boolean;
}

const AdminProductForm = () => {
  const { data: categories } = useCategories();
  const { createProduct, uploadImage, isCreating, isUploading } = useAdminProducts();

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
    shipped_from: 'GÜELL Warehouse',
    sold_by: 'GÜELL Store',
    urgency_threshold: '',
    show_secure_payment_badge: true,
    show_satisfaction_badge: true,
    show_fast_shipping_badge: true,
  });

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);

  // Shipping options management
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

  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImageFiles(prev => [...prev, ...files]);
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedVideoFiles(prev => [...prev, ...files]);
  };

  const removeImageFile = (index: number) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideoFile = (index: number) => {
    setSelectedVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadPromises = selectedImageFiles.map(file => uploadImage.mutateAsync(file));
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      setSelectedImageFiles([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const uploadVideos = async () => {
    const uploadPromises = selectedVideoFiles.map(file => uploadImage.mutateAsync(file));
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setVideos(prev => [...prev, ...uploadedUrls]);
      setSelectedVideoFiles([]);
    } catch (error) {
      console.error('Error uploading videos:', error);
      throw error;
    }
  };

  const handleAddShippingOption = () => {
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

  const handleEditShippingOption = (option: ShippingOption) => {
    setEditingOption(option);
  };

  const handleUpdateShippingOption = () => {
    if (!editingOption) return;

    setShippingOptions(options =>
      options.map(opt =>
        opt.id === editingOption.id ? editingOption : opt
      )
    );
    setEditingOption(null);
    toast.success('Shipping option updated successfully');
  };

  const handleDeleteShippingOption = (id: string) => {
    setShippingOptions(options => options.filter(opt => opt.id !== id));
    toast.success('Shipping option deleted successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mandatory shipping option
    if (!selectedShippingOption) {
      toast.error('Please select a shipping option');
      return;
    }
    
    try {
      // Upload images and videos first if there are any
      if (selectedImageFiles.length > 0) {
        await uploadImages();
      }
      
      if (selectedVideoFiles.length > 0) {
        await uploadVideos();
      }

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
        shipped_from: formData.shipped_from || undefined,
        sold_by: formData.sold_by || undefined,
        urgency_threshold: formData.urgency_threshold ? parseInt(formData.urgency_threshold) : undefined,
        show_secure_payment_badge: formData.show_secure_payment_badge,
        show_satisfaction_badge: formData.show_satisfaction_badge,
        show_fast_shipping_badge: formData.show_fast_shipping_badge,
      };

      await createProduct.mutateAsync(productData);
      
      // Reset form
      setFormData({
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
        shipped_from: 'GÜELL Warehouse',
        sold_by: 'GÜELL Store',
        urgency_threshold: '',
        show_secure_payment_badge: true,
        show_satisfaction_badge: true,
        show_fast_shipping_badge: true,
      });
      setImages([]);
      setVideos([]);
      setSelectedImageFiles([]);
      setSelectedVideoFiles([]);
      setSelectedShippingOption('');
      
      toast.success('Product created successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please check all fields and try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="original_price">Original Price ($)</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => handleInputChange('inventory', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CRO / Urgency & Trust Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-lg p-4">
              <div>
                <Label htmlFor="urgency_threshold">Low-stock threshold</Label>
                <Input
                  id="urgency_threshold"
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
                    id="secure-badge"
                    checked={formData.show_secure_payment_badge}
                    onCheckedChange={(checked) => handleInputChange('show_secure_payment_badge', checked)}
                  />
                  <Label htmlFor="secure-badge" className="text-sm">Secure SSL Payment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="satisfaction-badge"
                    checked={formData.show_satisfaction_badge}
                    onCheckedChange={(checked) => handleInputChange('show_satisfaction_badge', checked)}
                  />
                  <Label htmlFor="satisfaction-badge" className="text-sm">Satisfaction Guarantee</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fast-shipping-badge"
                    checked={formData.show_fast_shipping_badge}
                    onCheckedChange={(checked) => handleInputChange('show_fast_shipping_badge', checked)}
                  />
                  <Label htmlFor="fast-shipping-badge" className="text-sm">Fast Shipping</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipped_from">Shipped From</Label>
                <Input
                  id="shipped_from"
                  value={formData.shipped_from}
                  onChange={(e) => handleInputChange('shipped_from', e.target.value)}
                  placeholder="e.g., GÜELL Warehouse, New York"
                />
              </div>
              <div>
                <Label htmlFor="sold_by">Sold By</Label>
                <Input
                  id="sold_by"
                  value={formData.sold_by}
                  onChange={(e) => handleInputChange('sold_by', e.target.value)}
                  placeholder="e.g., GÜELL Store"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Red, Blue, Black, etc."
                />
              </div>
              <div>
                <Label htmlFor="fabric_type">Fabric Type</Label>
                <Input
                  id="fabric_type"
                  value={formData.fabric_type}
                  onChange={(e) => handleInputChange('fabric_type', e.target.value)}
                  placeholder="Cotton, Polyester, etc."
                />
              </div>
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="Made in USA, China, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="monthly_sold_count">Monthly Sold Count</Label>
              <Input
                id="monthly_sold_count"
                type="number"
                value={formData.monthly_sold_count}
                onChange={(e) => handleInputChange('monthly_sold_count', e.target.value)}
                placeholder="Number sold in past month"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
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
              <Label htmlFor="recommended_uses">Recommended Uses (comma-separated)</Label>
              <Textarea
                id="recommended_uses"
                value={formData.recommended_uses}
                onChange={(e) => handleInputChange('recommended_uses', e.target.value)}
                placeholder="Gaming, Streaming, Recording, etc."
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="specifications">Specifications (JSON)</Label>
                <Info className="w-4 h-4 text-blue-500" />
              </div>
              <Alert className="mb-2">
                <AlertDescription>
                  Enter specifications as JSON format. Example: {JSON.stringify({"Weight": "1.5 kg", "Dimensions": "20x15x5 cm", "Material": "Aluminum"})}
                </AlertDescription>
              </Alert>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) => handleInputChange('specifications', e.target.value)}
                placeholder={JSON.stringify({"Weight": "1.5 kg", "Dimensions": "20x15x5 cm", "Material": "Aluminum"})}
                rows={3}
              />
            </div>

            {/* Shipping Options - Mandatory Selection */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-500" />
                <Label className="text-base font-semibold">Shipping Option *</Label>
              </div>
              <p className="text-sm text-muted-foreground">Select a shipping option for this product (required)</p>
              
              <div className="grid gap-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedShippingOption === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedShippingOption(option.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShippingOption === option.id}
                        onChange={() => setSelectedShippingOption(option.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{option.name}</h4>
                          <span className="font-semibold text-blue-600">
                            {option.isFree ? 'FREE' : `$${option.price.toFixed(2)}`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Manage Shipping Options */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add New Shipping Option</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping-name">Shipping Name *</Label>
                    <Input
                      id="shipping-name"
                      value={newOption.name}
                      onChange={(e) => setNewOption({...newOption, name: e.target.value})}
                      placeholder="e.g., Next Day Delivery"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="shipping-days">Estimated Delivery *</Label>
                    <Input
                      id="shipping-days"
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
                      <Label htmlFor="shipping-price">Price ($)</Label>
                      <Input
                        id="shipping-price"
                        type="number"
                        value={newOption.price}
                        onChange={(e) => setNewOption({...newOption, price: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAddShippingOption} 
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shipping Option
                </Button>

                {/* Current Shipping Options Management */}
                {shippingOptions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Manage Existing Options:</h5>
                    {shippingOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        {editingOption?.id === option.id ? (
                          <div className="flex-1 grid grid-cols-3 gap-2">
                             <Input
                               value={editingOption.name}
                               onChange={(e) => setEditingOption({...editingOption, name: e.target.value})}
                             />
                             <Input
                               value={editingOption.estimatedDays}
                               onChange={(e) => setEditingOption({...editingOption, estimatedDays: e.target.value})}
                             />
                            <div className="flex items-center space-x-2">
                              <Button onClick={handleUpdateShippingOption} size="sm">Save</Button>
                              <Button onClick={() => setEditingOption(null)} variant="outline" size="sm">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span>{option.name} - {option.estimatedDays} - {option.isFree ? 'FREE' : `$${option.price}`}</span>
                            <div className="flex space-x-1">
                              <Button
                                onClick={() => handleEditShippingOption(option)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteShippingOption(option.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="prime"
                  checked={formData.is_prime}
                  onCheckedChange={(checked) => handleInputChange('is_prime', checked)}
                />
                <Label htmlFor="prime">GÜELL Choice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="guell-plus"
                  checked={formData.is_guell_plus}
                  onCheckedChange={(checked) => handleInputChange('is_guell_plus', checked)}
                />
                <Label htmlFor="guell-plus">GÜELL +</Label>
              </div>
            </div>

            {/* Product Images */}
            <div>
              <Label>Product Images (JPEG, PNG, WebP, SVG)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleImageFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload images (SVG supported for vectorized images)</p>
                    <p className="text-xs text-muted-foreground">Max 10MB per image</p>
                  </div>
                </label>
              </div>

              {selectedImageFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Selected Image Files:</p>
                    <Button
                      type="button"
                      onClick={uploadImages}
                      disabled={isUploading}
                      size="sm"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Upload Images'
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedImageFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImageFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Uploaded Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Videos */}
            <div>
              <Label>Product Videos (MP4, WebM)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload product videos</p>
                    <p className="text-xs text-muted-foreground">Max 50MB per video</p>
                  </div>
                </label>
              </div>

              {selectedVideoFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Selected Video Files:</p>
                    <Button
                      type="button"
                      onClick={uploadVideos}
                      disabled={isUploading}
                      size="sm"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Upload Videos'
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedVideoFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVideoFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Uploaded Videos:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {videos.map((url, index) => (
                      <div key={index} className="relative">
                        <video
                          src={url}
                          className="w-full h-32 object-cover rounded"
                          controls
                          preload="metadata"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeVideo(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating Product...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductForm;
