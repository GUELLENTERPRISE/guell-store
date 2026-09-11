import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/utils/currency";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/LoadingState";

interface ProductRowProps {
  title: string;
  subtitle?: string;
  maxProducts?: number;
  filter?: 'featured' | 'prime' | 'sale' | 'all';
}

const ProductRow = ({ title, subtitle, maxProducts = 6, filter = 'all' }: ProductRowProps) => {
  const { data: products, isLoading, error } = useProducts();
  const navigate = useNavigate();

  const handleProductClick = (productId: string) => {
    navigate(`/store/product/${productId}`);
  };

  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="px-4 py-6">
        <LoadingState type="products" message="Loading products..." />
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  // Filter products based on the filter prop
  let filteredProducts = products;
  switch (filter) {
    case 'featured':
      filteredProducts = products.filter(p => p.is_featured);
      break;
    case 'prime':
      filteredProducts = products.filter(p => p.is_prime);
      break;
    case 'sale':
      filteredProducts = products.filter(p => p.original_price && p.original_price > p.price);
      break;
    default:
      filteredProducts = products;
  }

  const displayProducts = filteredProducts.slice(0, maxProducts);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-6 bg-background">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayProducts.map((product) => (
          <Card 
            key={product.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-card border-border"
            onClick={() => handleProductClick(product.id)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
                
                {product.inventory < 10 && (
                  <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                    Low Stock
                  </Badge>
                )}
                
                {product.is_prime && (
                  <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                    Prime
                  </Badge>
                )}
              </div>
              
              <div className="p-3 space-y-2">
                <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product.id);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ProductRow;