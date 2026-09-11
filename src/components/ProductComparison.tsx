import { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COMPARISON_STORAGE_KEY = 'product_comparison';

export const useProductComparison = () => {
  const [comparisonList, setComparisonList] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (stored) {
      setComparisonList(JSON.parse(stored));
    }
  }, []);

  const addToComparison = (productId: string) => {
    const updated = [...comparisonList, productId].slice(0, 4); // Max 4 products
    setComparisonList(updated);
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated));
  };

  const removeFromComparison = (productId: string) => {
    const updated = comparisonList.filter(id => id !== productId);
    setComparisonList(updated);
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated));
  };

  const isInComparison = (productId: string) => {
    return comparisonList.includes(productId);
  };

  const toggleComparison = (productId: string) => {
    if (isInComparison(productId)) {
      removeFromComparison(productId);
    } else {
      if (comparisonList.length >= 4) {
        return false; // Max reached
      }
      addToComparison(productId);
    }
    return true;
  };

  const clearComparison = () => {
    setComparisonList([]);
    localStorage.removeItem(COMPARISON_STORAGE_KEY);
  };

  return {
    comparisonList,
    addToComparison,
    removeFromComparison,
    isInComparison,
    toggleComparison,
    clearComparison,
  };
};

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
}

export const ProductComparison = ({ products, onClose }: ProductComparisonProps) => {
  const navigate = useNavigate();
  const { removeFromComparison } = useProductComparison();

  if (products.length === 0) {
    return null;
  }

  const attributes = [
    { key: 'price', label: 'Price', format: (p: Product) => `$${p.price.toFixed(2)}` },
    { key: 'rating', label: 'Rating', format: (p: Product) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{p.rating.toFixed(1)}</span>
      </div>
    )},
    { key: 'reviews', label: 'Reviews', format: (p: Product) => p.review_count },
    { key: 'brand', label: 'Brand', format: (p: Product) => p.brand },
    { key: 'inventory', label: 'In Stock', format: (p: Product) => p.inventory > 0 ? 'Yes' : 'No' },
    { key: 'prime', label: 'GÜELL+', format: (p: Product) => p.is_guell_plus ? 'Yes' : 'No' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Compare Products</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left w-32">Attribute</th>
                  {products.map(product => (
                    <th key={product.id} className="p-4 text-center min-w-[200px]">
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromComparison(product.id)}
                          className="ml-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <img 
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-32 h-32 object-contain mx-auto cursor-pointer"
                          onClick={() => navigate(`/store/product/${product.id}`)}
                        />
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map(attr => (
                  <tr key={attr.key} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{attr.label}</td>
                    {products.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {attr.format(product)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4"></td>
                  {products.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <Button
                        onClick={() => navigate(`/store/product/${product.id}`)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
