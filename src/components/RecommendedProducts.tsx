import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/utils/currency";
import LoadingState from "./LoadingState";
import { ErrorState } from "./ErrorBoundary";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const RecommendedProducts = () => {
  const { data: products, isLoading, error, refetch } = useProducts();
  const navigate = useNavigate();

  const handleProductClick = (productId: string) => {
    navigate(`/store/product/${productId}`);
  };

  if (error) {
    return (
      <ErrorState 
        title="Failed to load recommended products"
        message="We couldn't load the recommended products. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return <LoadingState type="products" />;
  }

  if (!products || products.length === 0) {
    return null;
  }

  // Get featured products (first 8 products)
  const recommendedProducts = products.slice(0, 8);

  return (
    <div className="py-8 px-4 bg-background">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Recommended for you</h2>
        <p className="text-muted-foreground">Products you might like based on popular choices</p>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {recommendedProducts.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
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
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-muted-foreground text-4xl">📦</span>
                      </div>
                    )}
                    {product.inventory && product.inventory < 10 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-foreground">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-3"
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default RecommendedProducts;