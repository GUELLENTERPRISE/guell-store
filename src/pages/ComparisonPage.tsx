import { useNavigate } from 'react-router-dom';
import { useProducts, Product } from '@/hooks/useProducts';
import { useProductComparison } from '@/components/ProductComparison';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, X, ShoppingCart, ArrowLeft, Check, Minus, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';

const ComparisonPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: products, isLoading } = useProducts();
  const { comparisonList, removeFromComparison, clearComparison } = useProductComparison();
  const { addToCart } = useCart();

  const comparedProducts = products?.filter(p => comparisonList.includes(p.id)) || [];

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    addToCart({ productId: product.id, quantity: 1 });
  };

  const getSpecValue = (product: Product, key: string): string => {
    const specs = product.specifications as Record<string, string> | null;
    return specs?.[key] || '-';
  };

  const getAllSpecKeys = (): string[] => {
    const keys = new Set<string>();
    comparedProducts.forEach(product => {
      const specs = product.specifications as Record<string, string> | null;
      if (specs) {
        Object.keys(specs).forEach(key => keys.add(key));
      }
    });
    return Array.from(keys);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (comparedProducts.length === 0) {
    return (
      <>
        <SEOHead
          title="Compare Products | GÜELL"
          description="Compare products side by side to make the best purchasing decision"
        />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Products to Compare</h2>
              <p className="text-muted-foreground mb-6">
                Add products to your comparison list to see them side by side.
              </p>
              <Button onClick={() => navigate('/search')}>
                Browse Products
              </Button>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const specKeys = getAllSpecKeys();

  return (
    <>
      <SEOHead
        title={`Compare ${comparedProducts.length} Products | GÜELL`}
        description="Compare products side by side to make the best purchasing decision"
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Compare Products ({comparedProducts.length})</h1>
            </div>
            <Button variant="outline" onClick={clearComparison}>
              Clear All
            </Button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Product Cards Row */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${comparedProducts.length}, 1fr)` }}>
                <div></div>
                {comparedProducts.map(product => (
                  <Card key={product.id} className="p-4 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeFromComparison(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-40 object-contain mb-4 cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                    <h3 
                      className="font-semibold text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    {product.is_guell_plus && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white mb-2">
                        GÜELL+
                      </Badge>
                    )}
                    <Button 
                      className="w-full mt-2" 
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </Card>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Price Row */}
              <ComparisonRow 
                label="Price" 
                products={comparedProducts}
                renderValue={(p) => (
                  <div>
                    <span className="text-xl font-bold text-primary">${p.price.toFixed(2)}</span>
                    {p.original_price && p.original_price > p.price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        ${p.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Rating Row */}
              <ComparisonRow 
                label="Rating" 
                products={comparedProducts}
                renderValue={(p) => (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{p.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({p.review_count || 0} reviews)
                    </span>
                  </div>
                )}
              />

              {/* Brand Row */}
              <ComparisonRow 
                label="Brand" 
                products={comparedProducts}
                renderValue={(p) => <span>{p.brand || '-'}</span>}
              />

              {/* Color Row */}
              <ComparisonRow 
                label="Color" 
                products={comparedProducts}
                renderValue={(p) => <span>{p.color || '-'}</span>}
              />

              {/* Availability Row */}
              <ComparisonRow 
                label="Availability" 
                products={comparedProducts}
                renderValue={(p) => (
                  <div className="flex items-center gap-2">
                    {p.inventory > 0 ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">In Stock ({p.inventory})</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Out of Stock</span>
                      </>
                    )}
                  </div>
                )}
              />

              {/* GÜELL+ Row */}
              <ComparisonRow 
                label="GÜELL+" 
                products={comparedProducts}
                renderValue={(p) => (
                  p.is_guell_plus ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Minus className="h-5 w-5 text-muted-foreground" />
                  )
                )}
              />

              {/* Description Row */}
              <ComparisonRow 
                label="Description" 
                products={comparedProducts}
                renderValue={(p) => (
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {p.description || 'No description available'}
                  </p>
                )}
              />

              {/* Specifications */}
              {specKeys.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <h2 className="text-lg font-semibold mb-4 pl-4">Specifications</h2>
                  {specKeys.map(key => (
                    <ComparisonRow 
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} 
                      products={comparedProducts}
                      renderValue={(p) => <span>{getSpecValue(p, key)}</span>}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ComparisonRowProps {
  label: string;
  products: Product[];
  renderValue: (product: Product) => React.ReactNode;
}

const ComparisonRow = ({ label, products, renderValue }: ComparisonRowProps) => (
  <div 
    className="grid gap-4 py-3 border-b border-border hover:bg-muted/50 transition-colors"
    style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
  >
    <div className="font-medium text-muted-foreground pl-4">{label}</div>
    {products.map(product => (
      <div key={product.id} className="px-4">
        {renderValue(product)}
      </div>
    ))}
  </div>
);

export default ComparisonPage;
