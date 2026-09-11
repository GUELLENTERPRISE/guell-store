import { Badge } from '@/components/ui/badge';
import { Tag, TrendingDown } from 'lucide-react';

interface PromotionalBadgeProps {
  currentPrice: number;
  previousPrice?: number;
  discount?: number;
  promo?: string;
  type?: 'sale' | 'discount' | 'promo' | 'trending';
}

const PromotionalBadge: React.FC<PromotionalBadgeProps> = ({
  currentPrice,
  previousPrice,
  discount,
  promo,
  type = 'sale'
}) => {
  // Calculate discount percentage if previous price is provided
  const discountPercentage = previousPrice 
    ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
    : discount || 0;

  // Don't show badge if discount is less than 5%
  if (discountPercentage < 5 && !promo) {
    return null;
  }

  const getBadgeConfig = () => {
    switch (type) {
      case 'sale':
        return {
          className: 'bg-red-500 text-white',
          icon: <Tag className="w-3 h-3 mr-1" />,
          text: discountPercentage > 0 ? `${discountPercentage}% OFF` : 'SALE'
        };
      case 'discount':
        return {
          className: 'bg-orange-500 text-white',
          icon: <TrendingDown className="w-3 h-3 mr-1" />,
          text: `${discountPercentage}% OFF`
        };
      case 'promo':
        return {
          className: 'bg-purple-500 text-white',
          icon: <Tag className="w-3 h-3 mr-1" />,
          text: promo || 'PROMO'
        };
      case 'trending':
        return {
          className: 'bg-green-500 text-white',
          icon: <TrendingDown className="w-3 h-3 mr-1" />,
          text: 'HOT DEAL'
        };
      default:
        return {
          className: 'bg-red-500 text-white',
          icon: <Tag className="w-3 h-3 mr-1" />,
          text: 'SALE'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div className="space-y-1">
      {/* Previous Price Display */}
      {previousPrice && previousPrice > currentPrice && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="line-through">${previousPrice.toFixed(2)}</span>
          <span className="text-xs text-green-600 font-medium">
            Save ${(previousPrice - currentPrice).toFixed(2)}
          </span>
        </div>
      )}

      {/* Promotional Badge */}
      <Badge className={config.className}>
        <div className="flex items-center">
          {config.icon}
          <span className="font-semibold text-xs">
            {config.text}
          </span>
        </div>
      </Badge>
    </div>
  );
};

export default PromotionalBadge;
