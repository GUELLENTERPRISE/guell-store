import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAdminValidation } from '@/hooks/useAdminValidation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, 
  XCircle, Loader2, Info, Trash2 
} from 'lucide-react';

interface ParsedProduct {
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
  errors: string[];
  rowIndex: number;
}

const REQUIRED_COLUMNS = ['name', 'description', 'price', 'inventory'];
const OPTIONAL_COLUMNS = [
  'original_price', 'category_id', 'brand', 'color', 'fabric_type', 
  'origin', 'is_featured', 'is_prime', 'is_guell_plus', 'images',
  'image_alt_text', 'shipped_from', 'sold_by'
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

const validateProduct = (product: Record<string, string>, rowIndex: number): ParsedProduct => {
  const errors: string[] = [];

  if (!product.name?.trim()) errors.push('Name is required');
  if (!product.description?.trim()) errors.push('Description is required');
  
  const price = parseFloat(product.price);
  if (isNaN(price) || price < 0) errors.push('Price must be a valid positive number');
  
  const inventory = parseInt(product.inventory);
  if (isNaN(inventory) || inventory < 0) errors.push('Inventory must be a valid non-negative integer');

  const originalPrice = product.original_price ? parseFloat(product.original_price) : undefined;
  if (product.original_price && (isNaN(originalPrice!) || originalPrice! < 0)) {
    errors.push('Original price must be a valid positive number');
  }

  const parseBool = (val: string) => ['true', '1', 'yes'].includes(val?.toLowerCase?.() || '');

  return {
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
    errors,
    rowIndex,
  };
};

const BulkProductUpload = () => {
  const { data: isAdmin } = useAdminValidation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number } | null>(null);

  const validProducts = parsedProducts.filter(p => p.errors.length === 0);
  const invalidProducts = parsedProducts.filter(p => p.errors.length > 0);

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
        toast.error('CSV must have a header row and at least one data row');
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
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

      setParsedProducts(products);
      setUploadResults(null);
      toast.success(`Parsed ${products.length} products from CSV`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!isAdmin || validProducts.length === 0) return;

    setUploading(true);
    setProgress(0);
    let success = 0;
    let failed = 0;

    const batchSize = 20;
    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, i + batchSize).map(({ errors, rowIndex, ...product }) => product);

      const { error } = await supabase.from('products').insert(batch);

      if (error) {
        console.error('Batch insert error:', error);
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
      toast.success(`All ${success} products uploaded successfully!`);
      setParsedProducts([]);
    } else {
      toast.error(`${success} succeeded, ${failed} failed. Check console for details.`);
    }
  };

  const downloadTemplate = () => {
    const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];
    const exampleRow = [
      'Example Product', 'A great product description', '29.99', '100',
      '39.99', '', 'BrandName', 'Red', 'Cotton', 'USA',
      'false', 'true', 'false', 'https://example.com/img1.jpg|https://example.com/img2.jpg',
      'Front view of Example Product|Back view of Example Product',
      'Warehouse A', 'GÜELL'
    ];
    const csv = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeProduct = (rowIndex: number) => {
    setParsedProducts(prev => prev.filter(p => p.rowIndex !== rowIndex));
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How Bulk Upload Works</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>1. <strong>Download the template</strong> CSV file below to see the correct format.</p>
          <p>2. <strong>Fill in your products</strong> — each row is one product. Required columns: <code className="bg-muted px-1 rounded text-xs">name</code>, <code className="bg-muted px-1 rounded text-xs">description</code>, <code className="bg-muted px-1 rounded text-xs">price</code>, <code className="bg-muted px-1 rounded text-xs">inventory</code>.</p>
          <p>3. <strong>Upload the CSV</strong> — the system validates every row and shows errors before inserting.</p>
          <p>4. <strong>Review & confirm</strong> — only valid rows are uploaded. Fix errors and re-upload if needed.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tip: For multiple images, separate URLs with a pipe character (<code className="bg-muted px-1 rounded">|</code>). Boolean fields accept <code className="bg-muted px-1 rounded">true/false</code>, <code className="bg-muted px-1 rounded">1/0</code>, or <code className="bg-muted px-1 rounded">yes/no</code>.
          </p>
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Product Upload
          </CardTitle>
          <CardDescription>Upload a CSV file to add multiple products at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              Select CSV File
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
                Uploading products... {progress}%
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <Alert variant={uploadResults.failed > 0 ? 'destructive' : 'default'}>
              {uploadResults.failed > 0 ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertTitle>Upload Complete</AlertTitle>
              <AlertDescription>
                {uploadResults.success} products uploaded successfully
                {uploadResults.failed > 0 && `, ${uploadResults.failed} failed`}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Table */}
      {parsedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview ({parsedProducts.length} products)</CardTitle>
                <CardDescription className="flex gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {validProducts.length} valid
                  </span>
                  {invalidProducts.length > 0 && (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5 text-destructive" /> {invalidProducts.length} with errors
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setParsedProducts([])}>
                  <Trash2 className="h-4 w-4 mr-1" /> Clear
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || validProducts.length === 0}
                >
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload {validProducts.length} Products
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product) => (
                    <TableRow key={product.rowIndex} className={product.errors.length > 0 ? 'bg-destructive/5' : ''}>
                      <TableCell className="font-mono text-xs">{product.rowIndex}</TableCell>
                      <TableCell>
                        {product.errors.length > 0 ? (
                          <div className="space-y-1">
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {product.errors.length} error{product.errors.length > 1 ? 's' : ''}
                            </Badge>
                            <div className="text-xs text-destructive">
                              {product.errors.join('; ')}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Valid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.inventory}</TableCell>
                      <TableCell className="text-muted-foreground">{product.brand || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{product.images.length}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeProduct(product.rowIndex)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkProductUpload;
