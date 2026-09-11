
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProductReviews from "@/components/ProductReviews";
import RelatedProducts from "@/components/RelatedProducts";
import { ProductQuestionsSection } from "@/components/ProductQuestionsSection";
import { Product } from "@/hooks/useProducts";
import { useTranslation } from "@/hooks/useTranslation";

interface ProductDetailsTabsProps {
  product: Product;
}

const ProductDetailsTabs = ({ product }: ProductDetailsTabsProps) => {
  const { t } = useTranslation();
  
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details">{t('product.details') || 'Details'}</TabsTrigger>
        <TabsTrigger value="specifications">{t('product.specifications')}</TabsTrigger>
        <TabsTrigger value="reviews">{t('product.reviews')}</TabsTrigger>
        <TabsTrigger value="questions">Q&A</TabsTrigger>
      </TabsList>
      
      {/* Description / Details accordion-style tab */}
      <TabsContent value="details" className="mt-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t('product.description') || 'Description'}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description || t('product.noDescription')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('product.returnPolicy') || 'Return Policy'}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {t('product.defaultReturnPolicy') || '30-day return window for unused items in original packaging unless otherwise stated on the product page.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Technical specifications tab */}
      <TabsContent value="specifications" className="mt-4">
        <Card>
          <CardContent className="p-4">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t('product.noSpecifications')}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reviews" className="mt-4">
        <ProductReviews 
          productId={product.id}
          averageRating={product.rating || 0}
          totalReviews={product.review_count || 0}
        />
      </TabsContent>

      <TabsContent value="questions" className="mt-4">
        <ProductQuestionsSection productId={product.id} />
      </TabsContent>

      {/* Recommended products carousel (kept for cross-sell) */}
      <div className="mt-8">
        <Card>
          <CardContent className="p-4">
            <RelatedProducts product={product} />
          </CardContent>
        </Card>
      </div>
    </Tabs>
  );
};

export default ProductDetailsTabs;
