import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHaptics } from '@/hooks/useHaptics';

const FloatingCartButton = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const isMobile = useIsMobile();
  const { mediumTap } = useHaptics();

  const itemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  ) || 0;

  // Early return must be before any other logic that depends on rendering
  if (!isMobile || itemCount === 0) return null;

  return (
    <Button
      onClick={() => {
        mediumTap();
        navigate('/?tab=cart');
      }}
      className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 animate-fade-in"
      size="icon"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <Badge 
          className="absolute -top-3 -right-3 h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-destructive"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      </div>
      
      {/* Price tooltip on hover */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        ${totalPrice.toFixed(2)}
      </div>
    </Button>
  );
};

export default FloatingCartButton;
