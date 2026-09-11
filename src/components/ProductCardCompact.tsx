import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Package, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useHaptics } from "@/hooks/useHaptics";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, memo } from "react";
import { formatPrice } from "@/utils/currency";

interface ProductCardCompactProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  rating?: number | null;
  reviews?: number | null;
  imageUrl: string;
  isPrime?: boolean;
  brand?: string | null;
  slug?: string;
}

const ProductCardCompact = ({
  id,
  title,
  price,
  originalPrice,
  rating = 0,
  reviews = 0,
  imageUrl,
  isPrime = false,
  brand,
  slug,
}: ProductCardCompactProps) => {
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { lightTap } = useHaptics();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();
  const { data: storefrontSettings } = useStorefrontSettings();

  // Check if product is from verified store
  const verifiedStores = storefrontSettings?.verified_stores || [];
  const isVerifiedStore = brand 
    ? verifiedStores.some((store) => store.toLowerCase() === brand.toLowerCase())
    : false;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to save items");
      navigate("/auth");
      return;
    }

    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  const handleCardClick = () => {
    lightTap();
    navigate(`/store/product/${slug || id}`);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-card"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-muted">
          {imageLoading && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-1" />
                <span className="text-xs">No image</span>
              </div>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={title}
              className={`w-full h-full object-cover hover:scale-105 transition-transform duration-200 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          )}
          
          {/* Wishlist Button */}
          <button
            className={`absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors ${
              isInWishlist(id) ? "text-red-500" : "text-muted-foreground"
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(id) ? "fill-current" : ""}`} />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isVerifiedStore && (
              <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </Badge>
            )}
            {isPrime && (
              <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                GÜELL+
              </Badge>
            )}
            {originalPrice && originalPrice > price && (
              <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5">
                Sale
              </Badge>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3">
          {brand && (
            <p className="text-xs text-primary truncate mb-1">{brand}</p>
          )}
          
          <h3 className="font-medium text-sm line-clamp-2 mb-2 text-foreground leading-snug">
            {title}
          </h3>

          {/* Rating */}
          {typeof rating === 'number' && rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              {reviews && reviews > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({reviews.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(ProductCardCompact);
