
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/hooks/useProducts';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice } from '@/utils/currency';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface RelatedProductsProps {
  product: Product;
}

const RelatedProducts = ({ product }: RelatedProductsProps) => {
  const { data: products } = useProducts();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Recommended products based on same category_id
  const relatedProducts = products?.filter(p => 
    p.id !== product.id && 
    p.category_id === product.category_id
  ).slice(0, 12) || [];

  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('product.noRelatedProducts')}</p>
      </div>
    );
  }

  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set([...prev, productId]));
  };

  const handleProductClick = (productId: string) => {
    navigate(`/store/product/${productId}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('product.recommendedProducts') || 'Recommended Products'}</h3>
      
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {relatedProducts.map((relatedProduct) => (
            <CarouselItem key={relatedProduct.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
              <Card 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-gray-200"
                onClick={() => handleProductClick(relatedProduct.id)}
              >
                <CardContent className="p-3">
                  {/* Product Image */}
                  <div className="relative w-full aspect-square mb-3 bg-background rounded-md overflow-hidden">
                    {imageErrors.has(relatedProduct.id) ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded"></div>
                          <span className="text-xs">No image</span>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={relatedProduct.images?.[0] || '/placeholder.svg'} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                        onError={() => handleImageError(relatedProduct.id)}
                      />
                    )}
                  </div>

                  {/* Product Name */}
                  <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-2 leading-tight min-h-[2.5rem]">
                    {relatedProduct.name}
                  </h4>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-foreground">
                      {formatPrice(relatedProduct.price)}
                    </div>
                    {relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(relatedProduct.original_price)}
                      </div>
                    )}
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

export default RelatedProducts;
