import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-modal';
import { OptimizedImage } from '@/utils/imageOptimization';
import LoadingState from '@/components/LoadingState';
import { 
  Heart, 
  ShoppingCart, 
  Utensils, 
  Star, 
  MapPin, 
  Clock,
  X,
  Plus
} from 'lucide-react';

export type FavoriteType = 'product' | 'food';

export interface FavoriteProduct {
  id: string;
  type: 'product';
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  addedAt: string;
}

export interface FavoriteFood {
  id: string;
  type: 'food';
  name: string;
  price: number;
  image: string;
  restaurant: string;
  restaurantImage: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  addedAt: string;
}

export type FavoriteItem = FavoriteProduct | FavoriteFood;

interface UnifiedFavoritesProps {
  favorites: FavoriteItem[];
  onRemoveFavorite?: (id: string, type: FavoriteType) => void;
  onAddToCart?: (item: FavoriteItem) => void;
  onOrderFood?: (item: FavoriteFood) => void;
  className?: string;
}

const UnifiedFavorites: React.FC<UnifiedFavoritesProps> = ({
  favorites,
  onRemoveFavorite,
  onAddToCart,
  onOrderFood,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'products' | 'food'>('all');

  // Remove fake loading delay - set isLoading to false directly
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filteredFavorites = favorites.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const getTypeIcon = (type: FavoriteType) => {
    return type === 'product' ? ShoppingCart : Utensils;
  };

  const getTypeBadge = (type: FavoriteType) => {
    const configs = {
      product: {
        label: 'Store',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      food: {
        label: 'Food',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      }
    };
    return configs[type];
  };

  const renderFavoriteItem = (item: FavoriteItem) => {
    const Icon = getTypeIcon(item.type);
    const badgeConfig = getTypeBadge(item.type);

    if (item.type === 'product') {
      const product = item as FavoriteProduct;
      
      return (
        <GlassmorphismCard key={item.id} className="group hover:shadow-lg transition-all duration-300">
          <div className="relative">
            {/* Image with loading skeleton */}
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              {isLoading ? (
                <LoadingState type="image" className="h-full" />
              ) : (
                <OptimizedImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
              
              {/* Type badge */}
              <div className="absolute top-3 left-3">
                <Badge className={`text-xs font-medium ${badgeConfig.className} border`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {badgeConfig.label}
                </Badge>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemoveFavorite?.(product.id, 'product')}
                className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>

              {/* Stock status */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge className="bg-red-500 text-white">Out of Stock</Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium ml-1">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              {/* Price and actions */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</div>
                <Button
                  size="sm"
                  onClick={() => onAddToCart?.(product)}
                  disabled={!product.inStock}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </GlassmorphismCard>
      );
    } else {
      const food = item as FavoriteFood;
      
      return (
        <GlassmorphismCard key={item.id} className="group hover:shadow-lg transition-all duration-300">
          <div className="relative">
            {/* Image with loading skeleton */}
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              {isLoading ? (
                <LoadingState type="image" className="h-full" />
              ) : (
                <OptimizedImage
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
              
              {/* Type badge */}
              <div className="absolute top-3 left-3">
                <Badge className={`text-xs font-medium ${badgeConfig.className} border`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {badgeConfig.label}
                </Badge>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemoveFavorite?.(food.id, 'food')}
                className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Restaurant info */}
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={food.restaurantImage} alt={food.restaurant} />
                  <AvatarFallback className="text-xs">
                    {food.restaurant.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{food.restaurant}</span>
              </div>

              <div>
                <h3 className="font-semibold text-foreground line-clamp-1">{food.name}</h3>
              </div>

              {/* Rating and delivery */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium ml-1">{food.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({food.reviews})</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  {food.deliveryTime}
                </div>
              </div>

              {/* Price and actions */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-foreground">${food.price.toFixed(2)}</div>
                  {food.deliveryFee > 0 && (
                    <div className="text-xs text-muted-foreground">${food.deliveryFee.toFixed(2)} delivery</div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => onOrderFood?.(food)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Utensils className="w-4 h-4 mr-1" />
                  Order Now
                </Button>
              </div>
            </div>
          </div>
        </GlassmorphismCard>
      );
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            My Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <LoadingState type="image" className="h-48 rounded-lg" />
                <div className="space-y-2">
                  <LoadingState type="text" className="h-4 w-3/4" />
                  <LoadingState type="text" className="h-3 w-1/2" />
                  <LoadingState type="text" className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            My Favorites
            <Badge variant="outline" className="ml-2">
              {favorites.length}
            </Badge>
          </CardTitle>
          
          {/* Filter buttons */}
          <div className="flex gap-2">
            {(['all', 'products', 'food'] as const).map(filterType => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="capitalize"
              >
                {filterType === 'products' ? 'Store' : filterType}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === 'all' ? 'No favorites yet' : `No ${filter} favorites`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'all' 
                ? 'Start adding your favorite products and dishes to see them here'
                : `Browse ${filter} to add items to your favorites`
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Store
              </Button>
              <Button variant="outline">
                <Utensils className="w-4 h-4 mr-2" />
                Order Food
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map(renderFavoriteItem)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedFavorites;
