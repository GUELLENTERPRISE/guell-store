import { useState } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
}

export const FrequentlyBoughtTogether = ({ currentProduct }: FrequentlyBoughtTogetherProps) => {
  const { data: allProducts } = useProducts();
  const { addToCart, isAddingToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get related products from same category
  const relatedProducts = allProducts
    ?.filter(p => 
      p.id !== currentProduct.id && 
      p.category_id === currentProduct.category_id
    )
    .slice(0, 2) || [];

  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    currentProduct.id,
    ...relatedProducts.map(p => p.id)
  ]);

  // Early return must be before any logic that depends on relatedProducts
  if (relatedProducts.length === 0) return null;

  const toggleProduct = (productId: string) => {
    if (productId === currentProduct.id) return; // Don't allow deselecting main product
    
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const totalPrice = [currentProduct, ...relatedProducts]
    .filter(p => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const handleAddAllToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items');
      navigate('/auth');
      return;
    }

    selectedProducts.forEach(productId => {
      addToCart({ productId });
    });
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="font-semibold text-lg mb-4">Frequently bought together</h3>
      
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Current Product */}
        <div className="flex items-start gap-3 flex-1 min-w-[200px]">
          <Checkbox 
            checked={true}
            disabled={true}
            className="mt-1"
          />
          <div className="flex-1">
            <img 
              src={currentProduct.images[0] || '/placeholder.svg'} 
              alt={currentProduct.name}
              className="w-24 h-24 object-contain mb-2"
            />
            <p className="text-sm font-medium line-clamp-2">{currentProduct.name}</p>
            <p className="text-sm font-semibold">${currentProduct.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Plus signs and related products */}
        {relatedProducts.map((product, index) => (
          <div key={product.id} className="flex items-start gap-3 flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <Checkbox 
                checked={selectedProducts.includes(product.id)}
                onCheckedChange={() => toggleProduct(product.id)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <img 
                src={product.images[0] || '/placeholder.svg'} 
                alt={product.name}
                className="w-24 h-24 object-contain mb-2"
              />
              <p className="text-sm font-medium line-clamp-2">{product.name}</p>
              <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm">Total price for {selectedProducts.length} items:</span>
          <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
        </div>
        
        <Button 
          onClick={handleAddAllToCart}
          disabled={isAddingToCart || selectedProducts.length === 0}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-foreground"
        >
          {isAddingToCart ? 'Adding...' : `Add ${selectedProducts.length} to Cart`}
        </Button>
      </div>
    </Card>
  );
};
