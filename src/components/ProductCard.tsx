
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Loader2, Package, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useHaptics } from "@/hooks/useHaptics";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, memo } from "react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number | string;
  originalPrice?: number | string;
  rating: number;
  reviews: number;
  imageUrl: string;
  isPrime?: boolean;
  className?: string;
  brand?: string;
  specifications?: string[];
  deliveryDate?: string;
  slug?: string;
}

const ProductCard = ({ 
  id,
  title, 
  price, 
  originalPrice, 
  rating, 
  reviews, 
  imageUrl, 
  isPrime = false,
  className = "",
  brand = "",
  specifications = [],
  deliveryDate = "Jul 3 - 9",
  slug,
}: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart, isAddingToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { lightTap } = useHaptics();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { data: storefrontSettings } = useStorefrontSettings();

  // Check if product is from verified store
  const verifiedStores = storefrontSettings?.verified_stores || [];
  const isVerifiedStore = brand 
    ? verifiedStores.some((store) => store.toLowerCase() === brand.toLowerCase())
    : false;
  const [showCurrentPrice, setShowCurrentPrice] = useState(false);

  // Price anchoring animation - show original price first, then current price with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCurrentPrice(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/auth');
      return;
    }
    
    addToCart({ productId: id });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save items');
      navigate('/auth');
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

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numericOriginalPrice = originalPrice ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice) : undefined;

  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-gray-200 ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative flex-shrink-0 w-32 h-32">
            {imageLoading && (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            )}
            {imageError ? (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">No image</span>
                </div>
              </div>
            ) : (
              <img 
                src={imageUrl} 
                alt={title}
                className={`w-full h-full object-contain ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                loading="lazy"
              />
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className={`absolute top-1 right-1 p-1 bg-card/80 hover:bg-card/90 w-6 h-6 ${
                isInWishlist(id) ? 'text-red-500' : 'text-muted-foreground'
              }`}
              onClick={handleWishlistToggle}
            >
              <Heart className={`w-3 h-3 ${isInWishlist(id) ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Brand */}
            {brand && (
              <div className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer mb-1">
                <p>{brand}</p>
                {isVerifiedStore && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
            )}
            
            {/* Title */}
            <h3 className="font-normal text-sm text-foreground mb-2 line-clamp-2 leading-relaxed">
              {title}
            </h3>

            {/* Specifications */}
            {specifications.length > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                {specifications.join(" • ")}
              </div>
            )}

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                {reviews.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.floor(Math.random() * 500) + 100}+ bought in past month
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              {/* Current Price with Animation */}
              <span className={`text-xl font-normal text-foreground transition-all duration-500 ease-out ${
                showCurrentPrice ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-1'
              }`}>
                <span className="text-sm align-super">$</span>
                {isNaN(numericPrice) ? '0' : Math.floor(numericPrice)}
                <span className="text-sm align-super">
                  {String((numericPrice % 1).toFixed(2)).slice(1)}
                </span>
              </span>

              {/* Original Price (shown immediately as anchor) */}
              {numericOriginalPrice && (
                <span className={`text-sm text-muted-foreground line-through transition-opacity duration-300 ${
                  showCurrentPrice ? 'opacity-100' : 'opacity-60'
                }`}>
                  List: ${numericOriginalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Delivery Info */}
            <div className="text-xs text-muted-foreground mb-3">
              ${(numericPrice * 0.1).toFixed(2)} delivery {deliveryDate}
            </div>

            {/* Badges and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPrime && (
                  <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                    GÜELL+
                  </Badge>
                )}
                {numericOriginalPrice && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                    Sale
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="bg-yellow-400 hover:bg-yellow-500 text-foreground font-medium text-xs px-4 py-1 h-7"
              >
                {isAddingToCart ? (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add to cart'
                )}
              </Button>
            </div>

            {/* Additional Options */}
            <div className="mt-2">
              <p className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                More Buying Choices
              </p>
              <p className="text-xs text-muted-foreground">
                ${(numericPrice * 0.9).toFixed(2)} ({Math.floor(Math.random() * 10) + 1} new offers)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(ProductCard);
