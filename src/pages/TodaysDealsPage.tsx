import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap, Percent, Timer, ArrowRight, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Skeleton } from '@/components/ui/skeleton';
import VerificationTooltip from '@/components/VerificationTooltip';

const TodaysDealsPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { data: products, isLoading } = useProducts();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Mock deals data - in real app, this would come from API
  const deals = products?.filter(product => {
    // Simulate deals by checking if product has discount or special flag
    return product.original_price && product.original_price > product.price;
  }).slice(0, 12) || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: typeof timeLeft) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleAddToCart = (productId: string) => {
    addToCart({ productId });
  };

  const handleAddToWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      // removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Today's Deals</h1>
            <p className="text-muted-foreground">Loading amazing deals...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Today's Deals</h1>
              <Zap className="w-8 h-8" />
            </div>
            <p className="text-xl mb-6">Limited-time offers you don't want to miss!</p>
            
            {/* Countdown Timer */}
            <div className="inline-flex items-center gap-4 bg-card/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-mono font-bold">Ends in: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Deal Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { name: 'Flash Deals', count: 24, icon: Zap },
            { name: 'Clearance', count: 45, icon: Percent },
            { name: 'Limited Time', count: 18, icon: Timer },
            { name: 'Best Sellers', count: 32, icon: Star }
          ].map((category, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <category.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} deals</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map((product) => {
            const discount = product.original_price ? calculateDiscount(product.original_price, product.price) : 0;
            const inWishlist = isInWishlist(product.id);
            
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Deal Badge */}
                {discount > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-red-600 text-white">
                      -{discount}%
                    </Badge>
                  </div>
                )}

                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.images[0] || '/placeholder.svg'}
                    alt={product.imagealttext || product.name || 'Product image'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width="400"
                    height="192"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <CardContent className="p-4">
                  {/* Product Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Brand with Verification */}
                    {product.brand && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{product.brand}</span>
                        <VerificationTooltip 
                          showTooltip={true}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-muted-foreground">({product.review_count || 0})</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Progress */}
                  {product.inventory < 20 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Stock remaining</span>
                        <span>{product.inventory} left</span>
                      </div>
                      <Progress value={(product.inventory / 20) * 100} className="h-2" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      className="flex-1"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => handleAddToWishlist(product.id)}
                      variant="outline"
                      size="sm"
                      className={inWishlist ? 'text-red-600 border-red-600' : ''}
                    >
                      {inWishlist ? '♥' : '♡'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View More */}
        {deals.length > 0 && (
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/search?sort=discount')}
              size="lg"
              className="flex items-center gap-2"
            >
              View All Deals
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysDealsPage;
