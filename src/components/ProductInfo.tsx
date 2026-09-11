
import { useMemo, useState } from "react";
import { Star, ChevronDown, ChevronUp, Info, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/hooks/useProducts";
import { useTranslation } from "@/hooks/useTranslation";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import VerificationTooltip from '@/components/VerificationTooltip';

interface ProductInfoProps {
  product: Product;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [showAllUses, setShowAllUses] = useState(false);
  const { t } = useTranslation();
  const { data: storefrontSettings } = useStorefrontSettings();

  const descriptionPoints = useMemo(() => {
    if (!product.description) return [];
    return product.description
      .split(/[.\n]/)
      .map(point => point.trim())
      .filter(point => point.length > 0);
  }, [product.description]);
  
  // Calculate discount percentage
  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const displayedUses = showAllUses 
    ? product.recommended_uses || []
    : (product.recommended_uses || []).slice(0, 3);

  const verifiedStores = storefrontSettings?.verified_stores || [];
  const isVerifiedStore = product.brand
    ? verifiedStores.some((store) => store.toLowerCase() === product.brand?.toLowerCase())
    : false;


  return (
    <div className="space-y-4">
      {/* Brand */}
      <div className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm flex items-center gap-1">
        {t('product.visitStore', { brand: product.brand || product.name.split(' ')[0] })}
        {isVerifiedStore && (
          <VerificationTooltip 
            showTooltip={true}
            size="md"
          />
        )}
      </div>

      {/* Product title */}
      <h1 className="text-3xl font-bold text-foreground leading-snug tracking-wide">
        {product.name}
      </h1>

      {/* Rating and reviews */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <span className="text-foreground text-sm font-semibold">
            {product.rating ? product.rating.toFixed(1) : '0.0'}
          </span>
          <div className="flex items-center ml-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || 0) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-200'
                }`} 
              />
            ))}
          </div>
        </div>
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
          {product.review_count || 0} {t('product.ratings')}
        </span>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-2">
        {product.is_prime && (
          <Badge className="bg-blue-600 text-white">{t('product.guellChoice')}</Badge>
        )}
        <span className="text-sm text-muted-foreground">
          {product.monthly_sold_count || 0} {t('product.boughtInPastMonth')}
        </span>
      </div>

      {/* Price section - directly under title for strong hierarchy */}
      <div className="border-t border-b py-4">
        <div className="space-y-1 leading-relaxed">
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-3xl font-bold text-emerald-700">
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                Save {discountPercentage}%
              </span>
            )}
          </div>
          {product.original_price && discountPercentage > 0 && (
            <div className="text-xs text-muted-foreground">
              You save ${(product.original_price - product.price).toFixed(2)} today.
            </div>
          )}
        </div>
      </div>

      {/* Product specifications */}
      <div className="space-y-2 leading-relaxed">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Recommended Uses */}
          {product.recommended_uses && product.recommended_uses.length > 0 && (
            <div className="col-span-2">
              <span className="font-medium">Recommended Uses For Product:</span>
              <div className="text-muted-foreground mt-1">
                {displayedUses.map((use, index) => (
                  <div key={index} className="mb-1">• {use}</div>
                ))}
              </div>
              {product.recommended_uses.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllUses(!showAllUses)}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm"
                >
                  {showAllUses ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      See less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      See more
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
          
          <div>
            <span className="font-medium">{t('product.brand')}:</span>
            <div className="text-muted-foreground">{product.brand || product.name.split(' ')[0]}</div>
          </div>
        </div>
        
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span>
                <div className="text-muted-foreground">{String(value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* About this item */}
      <div className="border-t pt-4 mt-6">
        <h3 className="font-medium text-lg mb-3">{t('product.aboutThisItem')}</h3>
        <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
          {descriptionPoints.length > 0 ? (
            <ul className="space-y-2">
              {descriptionPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">No product information available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
