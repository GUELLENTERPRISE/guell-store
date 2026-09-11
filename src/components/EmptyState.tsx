
import React from 'react';
import { Package, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  type?: 'search' | 'cart' | 'products' | 'wishlist';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ 
  type = 'products', 
  title, 
  message, 
  actionLabel,
  onAction 
}: EmptyStateProps) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-12 h-12 text-muted-foreground" />;
      case 'cart':
        return <ShoppingCart className="w-12 h-12 text-muted-foreground" />;
      case 'wishlist':
        return <Package className="w-12 h-12 text-muted-foreground" />;
      default:
        return <Package className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          title: 'No results found',
          message: 'Try adjusting your search terms or filters to find what you\'re looking for.',
          actionLabel: 'Clear Filters'
        };
      case 'cart':
        return {
          title: 'Your cart is empty',
          message: 'Add some products to your cart to get started.',
          actionLabel: 'Start Shopping'
        };
      case 'wishlist':
        return {
          title: 'Your wishlist is empty',
          message: 'Save items you love to your wishlist for later.',
          actionLabel: 'Browse Products'
        };
      default:
        return {
          title: 'No products available',
          message: 'Check back later for new products.',
          actionLabel: 'Refresh'
        };
    }
  };

  const defaults = getDefaultContent();

  return (
    <Card className="mx-4">
      <CardContent className="p-8 text-center">
        <div className="mb-4">{getIcon()}</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title || defaults.title}
        </h3>
        <p className="text-muted-foreground mb-4">
          {message || defaults.message}
        </p>
        {onAction && (
          <Button onClick={onAction} variant="outline">
            {actionLabel || defaults.actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
