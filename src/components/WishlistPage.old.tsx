
import React, { useState } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import WishlistSharing from '@/components/WishlistSharing';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';
import VerificationTooltip from '@/components/VerificationTooltip';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { data: storefrontSettings } = useStorefrontSettings();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const verifiedStores = storefrontSettings?.verified_stores || [];

  const handleAddToCart = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    addToCart({ productId });
    // Remove from wishlist after adding to cart
    setTimeout(() => {
      removeFromWishlist(productId);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 500);
  };

  const handleAddAllToCart = () => {
    wishlist.forEach((item) => {
      handleAddToCart(item.product_id);
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold">Your Wishlist</h1>
          </div>
        </div>
        <div className="p-4 text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to view your wishlist</h2>
          <p className="text-muted-foreground mb-4">Save items you love for later</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold">Your Wishlist</h1>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold">Your Wishlist</h1>
          </div>
        </div>
        <div className="p-4 text-center">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-4">Save items you love for later</p>
          <Button onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold">Your Wishlist ({wishlist.length})</h1>
          </div>
          {wishlist.length > 0 && (
            <Button
              onClick={handleAddAllToCart}
              className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] text-white px-4 py-2"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <Plus className="w-3 h-3 mr-1" />
              Add all to cart
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence>
          {wishlist.map((item) => {
            const isVerifiedStore = item.products.brand
              ? verifiedStores.some((store) => store.toLowerCase() === item.products.brand?.toLowerCase())
              : false;
            
            return (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
              animate={{ 
                opacity: removingItems.has(item.product_id) ? 0 : 1,
                scale: removingItems.has(item.product_id) ? 0.9 : 1,
                transition: { duration: 0.3 }
              }}
            >
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => navigate(`/store/product/${item.products.slug || item.product_id}`)}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={item.products.images[0] || '/placeholder.svg'}
                        alt={item.products.name}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                      />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{item.products.name}</h3>
                        {item.products.brand && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {isVerifiedStore && (
                              <VerificationTooltip 
                                showTooltip={true}
                                size="sm"
                              />
                            )}
                            <span>{item.products.brand}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Star Rating */}
                      <div className="mt-1">
                        {renderStars(item.products.rating)}
                      </div>

                      {/* Price Section */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-foreground">
                            ${item.products.price.toFixed(2)}
                          </p>
                          {/* Price Drop Indicator - would need original_price from database */}
                          {item.products.original_price && item.products.price < item.products.original_price && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              <span>📉 Price dropped!</span>
                            </div>
                          )}
                        </div>
                        {item.products.original_price && item.products.price < item.products.original_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${item.products.original_price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Urgency Indicator */}
                      {item.products.inventory < 10 && item.products.inventory > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-red-600">
                            🔥 Few units remaining!
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 mt-3">
                        <Button
                          onClick={() => handleAddToCart(item.product_id)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={removingItems.has(item.product_id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {removingItems.has(item.product_id) ? 'Adding...' : 'Add to Cart'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => removeFromWishlist(item.product_id)}
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Share section moved to the bottom for better flow */}
        <WishlistSharing />
      </div>
    </div>
  );
};

export default WishlistPage;
