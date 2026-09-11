import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAdminValidation } from '@/hooks/useAdminValidation';
import { useCategories } from '@/hooks/useCategories';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, 
  XCircle, Loader2, Info, Trash2, Edit3, Eye, Save, UploadCloud,
  Plus, Palette, Image as ImageIcon, Truck
} from 'lucide-react';
import ColorPalette from './ColorPalette';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  isFree: boolean;
}

interface StagingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id?: string;
  inventory: number;
  brand?: string;
  color?: string;
  fabric_type?: string;
  origin?: string;
  is_featured: boolean;
  is_prime: boolean;
  is_guell_plus: boolean;
  images: string[];
  image_alt_text: string[];
  shipped_from?: string;
  sold_by?: string;
  specifications?: string;
  recommended_uses?: string;
  monthly_sold_count?: number;
  urgency_threshold?: number;
  show_secure_payment_badge?: boolean;
  show_satisfaction_badge?: boolean;
  show_fast_shipping_badge?: boolean;
  shipping_options?: ShippingOption[];
  selected_shipping_option?: string;
  errors: string[];
  rowIndex: number;
  missingFields: string[];
  isFromCSV: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  inventory: string;
  brand: string;
  color: string;
  fabric_type: string;
  origin: string;
  is_featured: boolean;
  is_prime: boolean;
  is_guell_plus: boolean;
  specifications: string;
  recommended_uses: string;
  monthly_sold_count: string;
  shipped_from: string;
  sold_by: string;
  urgency_threshold: string;
  show_secure_payment_badge: boolean;
  show_satisfaction_badge: boolean;
  show_fast_shipping_badge: boolean;
  shipping_options: ShippingOption[];
  selected_shipping_option: string;
}

const REQUIRED_FIELDS = ['name', 'description', 'price', 'inventory'];
const OPTIONAL_FIELDS = [
  'original_price', 'category_id', 'brand', 'color', 'fabric_type', 
  'origin', 'is_featured', 'is_prime', 'is_guell_plus', 'images',
  'image_alt_text', 'shipped_from', 'sold_by', 'specifications',
  'recommended_uses', 'monthly_sold_count', 'urgency_threshold',
  'show_secure_payment_badge', 'show_satisfaction_badge', 'show_fast_shipping_badge'
];

const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(current.trim());
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some(cell => cell !== '')) rows.push(row);
  return rows;
};

const validateProduct = (product: Record<string, string>, rowIndex: number): StagingProduct => {
  const errors: string[] = [];
  const missingFields: string[] = [];

  if (!product.name?.trim()) {
    errors.push('Name is required');
    missingFields.push('name');
  }
  if (!product.description?.trim()) {
    errors.push('Description is required');
    missingFields.push('description');
  }
  
  const price = parseFloat(product.price);
  if (isNaN(price) || price < 0) {
    errors.push('Price must be a valid positive number');
    missingFields.push('price');
  }
  
  const inventory = parseInt(product.inventory);
  if (isNaN(inventory) || inventory < 0) {
    errors.push('Inventory must be a valid non-negative integer');
    missingFields.push('inventory');
  }

  const originalPrice = product.original_price ? parseFloat(product.original_price) : undefined;
  if (product.original_price && (isNaN(originalPrice!) || originalPrice! < 0)) {
    errors.push('Original price must be a valid positive number');
  }

  const parseBool = (val: string) => ['true', '1', 'yes'].includes(val?.toLowerCase?.() || '');

  const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
  const csvFields = Object.keys(product).map(k => k.toLowerCase());
  
  // Find missing optional fields
  OPTIONAL_FIELDS.forEach(field => {
    if (!csvFields.includes(field.toLowerCase()) || !product[field]?.trim()) {
      missingFields.push(field);
    }
  });

  // Default shipping options for new products
  const defaultShippingOptions: ShippingOption[] = [
    { id: '1', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7 business days', isFree: false },
    { id: '2', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3 business days', isFree: false },
    { id: '3', name: 'Free Shipping', price: 0, estimatedDays: '7-10 business days', isFree: true },
  ];

  return {
    id: `staging-${Date.now()}-${rowIndex}`,
    name: product.name?.trim() || '',
    description: product.description?.trim() || '',
    price: isNaN(price) ? 0 : price,
    original_price: originalPrice,
    category_id: product.category_id?.trim() || undefined,
    inventory: isNaN(inventory) ? 0 : inventory,
    brand: product.brand?.trim() || undefined,
    color: product.color?.trim() || undefined,
    fabric_type: product.fabric_type?.trim() || undefined,
    origin: product.origin?.trim() || undefined,
    is_featured: parseBool(product.is_featured),
    is_prime: parseBool(product.is_prime),
    is_guell_plus: parseBool(product.is_guell_plus),
    images: product.images ? product.images.split('|').map(s => s.trim()).filter(Boolean) : [],
    image_alt_text: product.image_alt_text ? product.image_alt_text.split('|').map(s => s.trim()).filter(Boolean) : [],
    shipped_from: product.shipped_from?.trim() || undefined,
    sold_by: product.sold_by?.trim() || undefined,
    specifications: product.specifications?.trim() || undefined,
    recommended_uses: product.recommended_uses?.trim() || undefined,
    monthly_sold_count: product.monthly_sold_count ? parseInt(product.monthly_sold_count) : undefined,
    urgency_threshold: product.urgency_threshold ? parseInt(product.urgency_threshold) : undefined,
    show_secure_payment_badge: product.show_secure_payment_badge ? parseBool(product.show_secure_payment_badge) : undefined,
    show_satisfaction_badge: product.show_satisfaction_badge ? parseBool(product.show_satisfaction_badge) : undefined,
    show_fast_shipping_badge: product.show_fast_shipping_badge ? parseBool(product.show_fast_shipping_badge) : undefined,
    shipping_options: defaultShippingOptions,
    selected_shipping_option: '',
    errors,
    rowIndex,
    missingFields,
    isFromCSV: true,
  };
};

const HybridProductUpload: React.FC = () => {
  const { data: isAdmin } = useAdminValidation();
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stagingProducts, setStagingProducts] = useState<StagingProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number } | null>(null);
  const [editingProduct, setEditingProduct] = useState<StagingProduct | null>(null);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const validProducts = stagingProducts.filter(p => p.errors.length === 0);
  const invalidProducts = stagingProducts.filter(p => p.errors.length > 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);

      if (rows.length < 2) {
        // Error handled silently - TODO: add proper error reporting
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const missing = REQUIRED_FIELDS.filter(c => !headers.includes(c));
      if (missing.length > 0) {
        toast.error(`Missing required columns: ${missing.join(', ')}`);
        return;
      }

      const products = rows.slice(1).map((row, idx) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        return validateProduct(obj, idx + 2);
      });

      setStagingProducts(prev => [...prev, ...products]);
      setUploadResults(null);
      toast.success(`Parsed ${products.length} products from CSV for staging`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualAdd = (formData: ProductFormData) => {
    const { shipping_options, ...rest } = formData;
    const product: Record<string, string> = {
      ...rest,
      is_featured: formData.is_featured.toString(),
      is_prime: formData.is_prime.toString(),
      is_guell_plus: formData.is_guell_plus.toString(),
      show_secure_payment_badge: formData.show_secure_payment_badge.toString(),
      show_satisfaction_badge: formData.show_satisfaction_badge.toString(),
      show_fast_shipping_badge: formData.show_fast_shipping_badge.toString(),
    };

    const stagingProduct: StagingProduct = {
      ...validateProduct(product, stagingProducts.length + 1),
      id: `manual-${Date.now()}`,
      isFromCSV: false,
      missingFields: [],
    };

    setStagingProducts(prev => [...prev, stagingProduct]);
    setShowManualForm(false);
    toast.success('Product added to staging');
  };

  const handleEditProduct = (product: StagingProduct) => {
    setEditingProduct(product);
    setShowAdvancedModal(true);
  };

  const handleSaveProduct = (updatedProduct: StagingProduct) => {
    setStagingProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    setShowAdvancedModal(false);
    setEditingProduct(null);
    toast.success('Product updated in staging');
  };

  const handlePublish = async () => {
    if (!isAdmin || validProducts.length === 0) return;

    setUploading(true);
    setProgress(0);
    let success = 0;
    let failed = 0;

    const batchSize = 20;
    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, i + batchSize).map(({ 
        id, errors, rowIndex, missingFields, isFromCSV, shipping_options, selected_shipping_option, urgency_threshold, ...product 
      }) => ({
        ...product,
        recommended_uses: product.recommended_uses ? product.recommended_uses.split('|').map(s => s.trim()) : undefined,
      }));

      const { error } = await supabase.from('products').insert(batch);

      if (error) {
        // Error handled silently - TODO: add proper error reporting
        failed += batch.length;
      } else {
        success += batch.length;
      }

      setProgress(Math.round(((i + batch.length) / validProducts.length) * 100));
    }

    setUploadResults({ success, failed });
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['featured-products'] });

    if (failed === 0) {
      toast.success(`All ${success} products published successfully!`);
      setStagingProducts([]);
    } else {
      toast.error(`${success} succeeded, ${failed} failed. Check console for details.`);
    }
  };

  const downloadTemplate = () => {
    const headers = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
    const exampleRow = [
      'Example Product', 'A great product description', '29.99', '100',
      '39.99', '', 'BrandName', 'Red', 'Cotton', 'USA',
      'false', 'true', 'false', 'https://example.com/img1.jpg|https://example.com/img2.jpg',
      'Front view|Back view', 'Warehouse A', 'GÜELL', 'Premium specs', 'Daily use',
      '50', '10', 'true', 'true', 'true'
    ];
    const csv = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hybrid_product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeProduct = (productId: string) => {
    setStagingProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearStaging = () => {
    setStagingProducts([]);
    setUploadResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Hybrid Product Management System</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>1. <strong>CSV Upload</strong> - Import products with missing fields highlighted in yellow</p>
          <p>2. <strong>Manual Entry</strong> - Add products individually with full control</p>
          <p>3. <strong>Staging Interface</strong> - Review and edit all products before publishing</p>
          <p>4. <strong>Advanced Controls</strong> - Click any product to access features not available in CSV</p>
          <p>5. <strong>Publish All</strong> - Bulk publish all validated products from staging</p>
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" />
            Product Management
          </CardTitle>
          <CardDescription>Import via CSV or add manually, then stage for review</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowManualForm(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing products... {progress}%
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <Alert variant={uploadResults.failed > 0 ? 'destructive' : 'default'}>
              {uploadResults.failed > 0 ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertTitle>Publishing Complete</AlertTitle>
              <AlertDescription>
                {uploadResults.success} products published successfully
                {uploadResults.failed > 0 && `, ${uploadResults.failed} failed`}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Staging Table */}
      {stagingProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Staging Area ({stagingProducts.length} products)</CardTitle>
                <CardDescription className="flex gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {validProducts.length} ready
                  </span>
                  {invalidProducts.length > 0 && (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5 text-destructive" /> {invalidProducts.length} need attention
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearStaging}>
                  <Trash2 className="h-4 w-4 mr-1" /> Clear All
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={uploading || validProducts.length === 0}
                  className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00]"
                >
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                  Publish {validProducts.length} Products
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Missing Fields</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagingProducts.map((product) => (
                    <TableRow key={product.id} className={product.errors.length > 0 ? 'bg-destructive/5' : ''}>
                      <TableCell className="font-mono text-xs">
                        {product.isFromCSV ? `CSV-${product.rowIndex}` : `MAN-${product.rowIndex}`}
                      </TableCell>
                      <TableCell>
                        {product.errors.length > 0 ? (
                          <div className="space-y-1">
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {product.errors.length} error{product.errors.length > 1 ? 's' : ''}
                            </Badge>
                            <div className="text-xs text-destructive max-w-[200px] truncate">
                              {product.errors.join('; ')}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.inventory}</TableCell>
                      <TableCell>
                        {product.missingFields.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.missingFields.slice(0, 3).map(field => (
                              <Badge key={field} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                {field}
                              </Badge>
                            ))}
                            {product.missingFields.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{product.missingFields.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isFromCSV ? "outline" : "default"} className="text-xs">
                          {product.isFromCSV ? 'CSV' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditProduct(product)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Edit Modal */}
      <Dialog open={showAdvancedModal} onOpenChange={setShowAdvancedModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Product Editor</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <AdvancedProductEditor 
              product={editingProduct} 
              categories={categories || []}
              onSave={handleSaveProduct}
              onCancel={() => setShowAdvancedModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Add Form */}
      <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product Manually</DialogTitle>
          </DialogHeader>
          <ManualProductForm 
            categories={categories || []}
            onSave={handleManualAdd}
            onCancel={() => setShowManualForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Advanced Product Editor Component
const AdvancedProductEditor: React.FC<{
  product: StagingProduct;
  categories: any[];
  onSave: (product: StagingProduct) => void;
  onCancel: () => void;
}> = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    original_price: product.original_price?.toString() || '',
    category_id: product.category_id || '',
    inventory: product.inventory.toString(),
    brand: product.brand || '',
    color: product.color || '',
    fabric_type: product.fabric_type || '',
    origin: product.origin || '',
    is_featured: product.is_featured,
    is_prime: product.is_prime,
    is_guell_plus: product.is_guell_plus,
    specifications: product.specifications || '',
    recommended_uses: product.recommended_uses || '',
    monthly_sold_count: product.monthly_sold_count?.toString() || '',
    shipped_from: product.shipped_from || '',
    sold_by: product.sold_by || '',
    urgency_threshold: product.urgency_threshold?.toString() || '',
    show_secure_payment_badge: product.show_secure_payment_badge || false,
    show_satisfaction_badge: product.show_satisfaction_badge || false,
    show_fast_shipping_badge: product.show_fast_shipping_badge || false,
    shipping_options: product.shipping_options || [
      { id: '1', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7 business days', isFree: false },
      { id: '2', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3 business days', isFree: false },
      { id: '3', name: 'Free Shipping', price: 0, estimatedDays: '7-10 business days', isFree: true },
    ],
    selected_shipping_option: product.selected_shipping_option || '',
  });

  const handleSave = () => {
    const updatedProduct: StagingProduct = {
      ...product,
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
      inventory: parseInt(formData.inventory) || 0,
      monthly_sold_count: formData.monthly_sold_count ? parseInt(formData.monthly_sold_count) : undefined,
      urgency_threshold: formData.urgency_threshold ? parseInt(formData.urgency_threshold) : undefined,
    };
    onSave(updatedProduct);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="original_price">Original Price</Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="inventory">Inventory *</Label>
            <Input
              id="inventory"
              type="number"
              value={formData.inventory}
              onChange={(e) => setFormData(prev => ({ ...prev, inventory: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Enter brand name"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Color</Label>
            <div className="space-y-2">
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="Enter color name or hex code"
              />
              <ColorPalette
                selectedColor={formData.color}
                onColorSelect={(color) => setFormData(prev => ({ ...prev, color }))}
                title="Quick Color Selection"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fabric_type">Fabric Type</Label>
            <Input
              id="fabric_type"
              value={formData.fabric_type}
              onChange={(e) => setFormData(prev => ({ ...prev, fabric_type: e.target.value }))}
              placeholder="Enter fabric type"
            />
          </div>

          <div>
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
              placeholder="Enter origin"
            />
          </div>

          <div>
            <Label htmlFor="shipped_from">Shipped From</Label>
            <Input
              id="shipped_from"
              value={formData.shipped_from}
              onChange={(e) => setFormData(prev => ({ ...prev, shipped_from: e.target.value }))}
              placeholder="Enter shipping location"
            />
          </div>

          <div>
            <Label htmlFor="sold_by">Sold By</Label>
            <Input
              id="sold_by"
              value={formData.sold_by}
              onChange={(e) => setFormData(prev => ({ ...prev, sold_by: e.target.value }))}
              placeholder="Enter seller"
            />
          </div>

          <div>
            <Label htmlFor="monthly_sold_count">Monthly Sold Count</Label>
            <Input
              id="monthly_sold_count"
              type="number"
              value={formData.monthly_sold_count}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_sold_count: e.target.value }))}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter product description"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="specifications">Specifications</Label>
        <Textarea
          id="specifications"
          value={formData.specifications}
          onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
          placeholder="Enter product specifications"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="recommended_uses">Recommended Uses</Label>
        <Textarea
          id="recommended_uses"
          value={formData.recommended_uses}
          onChange={(e) => setFormData(prev => ({ ...prev, recommended_uses: e.target.value }))}
          placeholder="Enter recommended uses"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Features & Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
            />
            <Label htmlFor="is_featured">Featured Product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_prime"
              checked={formData.is_prime}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_prime: checked }))}
            />
            <Label htmlFor="is_prime">Prime Eligible</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_guell_plus"
              checked={formData.is_guell_plus}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_guell_plus: checked }))}
            />
            <Label htmlFor="is_guell_plus">GÜELL Plus</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_secure_payment_badge"
              checked={formData.show_secure_payment_badge}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_secure_payment_badge: checked }))}
            />
            <Label htmlFor="show_secure_payment_badge">Secure Payment Badge</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_satisfaction_badge"
              checked={formData.show_satisfaction_badge}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_satisfaction_badge: checked }))}
            />
            <Label htmlFor="show_satisfaction_badge">Satisfaction Badge</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_fast_shipping_badge"
              checked={formData.show_fast_shipping_badge}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_fast_shipping_badge: checked }))}
            />
            <Label htmlFor="show_fast_shipping_badge">Fast Shipping Badge</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="urgency_threshold">Urgency Threshold</Label>
        <Input
          id="urgency_threshold"
          type="number"
          value={formData.urgency_threshold}
          onChange={(e) => setFormData(prev => ({ ...prev, urgency_threshold: e.target.value }))}
          placeholder="Low stock threshold (e.g., 10)"
        />
      </div>

      {/* Shipping Options */}
      <div className="space-y-4 border rounded-lg p-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-500" />
          Shipping Configuration
        </h3>
        
        <div className="space-y-3">
          <Label className="text-base font-medium">Available Shipping Options</Label>
          <p className="text-sm text-muted-foreground">Configure shipping options for this product</p>
          
          <div className="grid gap-3">
            {formData.shipping_options.map((option, index) => (
              <div
                key={option.id}
                className={`border rounded-lg p-3 ${
                  formData.selected_shipping_option === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping-advanced"
                        value={option.id}
                        checked={formData.selected_shipping_option === option.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, selected_shipping_option: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={option.name}
                          onChange={(e) => {
                            const updatedOptions = [...formData.shipping_options];
                            updatedOptions[index] = { ...updatedOptions[index], name: e.target.value };
                            setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                          }}
                          placeholder="Shipping option name"
                          className="mb-1"
                        />
                        <Input
                          type="text"
                          value={option.estimatedDays}
                          onChange={(e) => {
                            const updatedOptions = [...formData.shipping_options];
                            updatedOptions[index] = { ...updatedOptions[index], estimatedDays: e.target.value };
                            setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                          }}
                          placeholder="Estimated delivery time"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={option.isFree}
                        onCheckedChange={(checked) => {
                          const updatedOptions = [...formData.shipping_options];
                          updatedOptions[index] = { ...updatedOptions[index], isFree: checked, price: checked ? 0 : updatedOptions[index].price };
                          setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                        }}
                      />
                      <span className="text-xs">Free</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {!option.isFree && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={option.price}
                          onChange={(e) => {
                            const updatedOptions = [...formData.shipping_options];
                            updatedOptions[index] = { ...updatedOptions[index], price: parseFloat(e.target.value) || 0 };
                            setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                          }}
                          placeholder="0.00"
                          className="w-24 text-right"
                        />
                      </div>
                    )}
                    {option.isFree && (
                      <span className="text-green-600 font-medium">FREE</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00]">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

// Manual Product Form Component
const ManualProductForm: React.FC<{
  categories: any[];
  onSave: (formData: ProductFormData) => void;
  onCancel: () => void;
}> = ({ categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
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
    shipping_options: [
      { id: '1', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7 business days', isFree: false },
      { id: '2', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3 business days', isFree: false },
      { id: '3', name: 'Free Shipping', price: 0, estimatedDays: '7-10 business days', isFree: true },
    ],
    selected_shipping_option: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="manual-name">Product Name *</Label>
            <Input
              id="manual-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="manual-price">Price *</Label>
            <Input
              id="manual-price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="manual-original_price">Original Price</Label>
            <Input
              id="manual-original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="manual-inventory">Inventory *</Label>
            <Input
              id="manual-inventory"
              type="number"
              value={formData.inventory}
              onChange={(e) => setFormData(prev => ({ ...prev, inventory: e.target.value }))}
              placeholder="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="manual-category">Category</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="manual-brand">Brand</Label>
            <Input
              id="manual-brand"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Enter brand name"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Color</Label>
            <div className="space-y-2">
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="Enter color name or hex code"
              />
              <ColorPalette
                selectedColor={formData.color}
                onColorSelect={(color) => setFormData(prev => ({ ...prev, color }))}
                title="Quick Color Selection"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="manual-fabric_type">Fabric Type</Label>
            <Input
              id="manual-fabric_type"
              value={formData.fabric_type}
              onChange={(e) => setFormData(prev => ({ ...prev, fabric_type: e.target.value }))}
              placeholder="Enter fabric type"
            />
          </div>

          <div>
            <Label htmlFor="manual-origin">Origin</Label>
            <Input
              id="manual-origin"
              value={formData.origin}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
              placeholder="Enter origin"
            />
          </div>

          <div>
            <Label htmlFor="manual-shipped_from">Shipped From</Label>
            <Input
              id="manual-shipped_from"
              value={formData.shipped_from}
              onChange={(e) => setFormData(prev => ({ ...prev, shipped_from: e.target.value }))}
              placeholder="Enter shipping location"
            />
          </div>

          <div>
            <Label htmlFor="manual-sold_by">Sold By</Label>
            <Input
              id="manual-sold_by"
              value={formData.sold_by}
              onChange={(e) => setFormData(prev => ({ ...prev, sold_by: e.target.value }))}
              placeholder="Enter seller"
            />
          </div>

          <div>
            <Label htmlFor="manual-monthly_sold_count">Monthly Sold Count</Label>
            <Input
              id="manual-monthly_sold_count"
              type="number"
              value={formData.monthly_sold_count}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_sold_count: e.target.value }))}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="manual-description">Description *</Label>
        <Textarea
          id="manual-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter product description"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="manual-specifications">Specifications</Label>
        <Textarea
          id="manual-specifications"
          value={formData.specifications}
          onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
          placeholder="Enter product specifications"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="manual-recommended_uses">Recommended Uses</Label>
        <Textarea
          id="manual-recommended_uses"
          value={formData.recommended_uses}
          onChange={(e) => setFormData(prev => ({ ...prev, recommended_uses: e.target.value }))}
          placeholder="Enter recommended uses"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Features & Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="manual-is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
            />
            <Label htmlFor="manual-is_featured">Featured Product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="manual-is_prime"
              checked={formData.is_prime}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_prime: checked }))}
            />
            <Label htmlFor="manual-is_prime">Prime Eligible</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="manual-is_guell_plus"
              checked={formData.is_guell_plus}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_guell_plus: checked }))}
            />
            <Label htmlFor="manual-is_guell_plus">GÜELL Plus</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="manual-show_secure_payment_badge"
              checked={formData.show_secure_payment_badge}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_secure_payment_badge: checked }))}
            />
            <Label htmlFor="manual-show_secure_payment_badge">Secure Payment Badge</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="manual-show_satisfaction_badge"
              checked={formData.show_satisfaction_badge}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_satisfaction_badge: checked }))}
            />
            <Label htmlFor="manual-show_satisfaction_badge">Satisfaction Badge</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="manual-show_fast_shipping_badge"
              checked={formData.show_fast_shipping_badge}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_fast_shipping_badge: checked }))}
            />
            <Label htmlFor="manual-show_fast_shipping_badge">Fast Shipping Badge</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="manual-urgency_threshold">Urgency Threshold</Label>
        <Input
          id="manual-urgency_threshold"
          type="number"
          value={formData.urgency_threshold}
          onChange={(e) => setFormData(prev => ({ ...prev, urgency_threshold: e.target.value }))}
          placeholder="Low stock threshold (e.g., 10)"
        />
      </div>

      {/* Shipping Options */}
      <div className="space-y-4 border rounded-lg p-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-500" />
          Shipping Configuration
        </h3>
        
        <div className="space-y-3">
          <Label className="text-base font-medium">Available Shipping Options</Label>
          <p className="text-sm text-muted-foreground">Configure shipping options for this product</p>
          
          <div className="grid gap-3">
            {formData.shipping_options.map((option, index) => (
              <div
                key={option.id}
                className={`border rounded-lg p-3 ${
                  formData.selected_shipping_option === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping-manual"
                        value={option.id}
                        checked={formData.selected_shipping_option === option.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, selected_shipping_option: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={option.name}
                          onChange={(e) => {
                            const updatedOptions = [...formData.shipping_options];
                            updatedOptions[index] = { ...updatedOptions[index], name: e.target.value };
                            setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                          }}
                          placeholder="Shipping option name"
                          className="mb-1"
                        />
                        <Input
                          type="text"
                          value={option.estimatedDays}
                          onChange={(e) => {
                            const updatedOptions = [...formData.shipping_options];
                            updatedOptions[index] = { ...updatedOptions[index], estimatedDays: e.target.value };
                            setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                          }}
                          placeholder="Estimated delivery time"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={option.isFree}
                        onCheckedChange={(checked) => {
                          const updatedOptions = [...formData.shipping_options];
                          updatedOptions[index] = { ...updatedOptions[index], isFree: checked, price: checked ? 0 : updatedOptions[index].price };
                          setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                        }}
                      />
                      <span className="text-xs">Free</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {!option.isFree && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={option.price}
                          onChange={(e) => {
                            const updatedOptions = [...formData.shipping_options];
                            updatedOptions[index] = { ...updatedOptions[index], price: parseFloat(e.target.value) || 0 };
                            setFormData(prev => ({ ...prev, shipping_options: updatedOptions }));
                          }}
                          placeholder="0.00"
                          className="w-24 text-right"
                        />
                      </div>
                    )}
                    {option.isFree && (
                      <span className="text-green-600 font-medium">FREE</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00]">
          <Plus className="h-4 w-4 mr-2" />
          Add to Staging
        </Button>
      </div>
    </form>
  );
};

export default HybridProductUpload;
