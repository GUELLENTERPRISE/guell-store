import { useNavigate } from 'react-router-dom';
import { useProductComparison } from '@/components/ProductComparison';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { X, Scale, ChevronRight } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

const FloatingComparisonBar = () => {
  const navigate = useNavigate();
  const { lightTap, mediumTap } = useHaptics();
  const { comparisonList, removeFromComparison, clearComparison } = useProductComparison();
  const { data: products } = useProducts();

  const comparedProducts = products?.filter(p => comparisonList.includes(p.id)) || [];

  if (comparedProducts.length === 0) {
    return null;
  }

  const handleCompare = () => {
    mediumTap();
    navigate('/compare');
  };

  const handleRemove = (productId: string) => {
    lightTap();
    removeFromComparison(productId);
  };

  const handleClear = () => {
    lightTap();
    clearComparison();
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:bottom-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-lg p-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Scale className="h-5 w-5" />
            <span className="font-medium text-sm hidden sm:inline">Compare</span>
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {comparedProducts.map(product => (
              <div 
                key={product.id} 
                className="relative flex-shrink-0 group"
              >
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-12 h-12 object-contain rounded-lg border border-border bg-background"
                />
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
              <div 
                key={`empty-${i}`}
                className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex-shrink-0"
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              className="text-muted-foreground"
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={handleCompare}
              disabled={comparedProducts.length < 2}
            >
              Compare ({comparedProducts.length})
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingComparisonBar;
