import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface Order {
  id: string;
  order_items?: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  images?: string[];
  monthly_sold_count?: number;
}

interface TopProductsCardProps {
  orders: Order[];
  products: Product[];
}

export const TopProductsCard = ({ orders, products }: TopProductsCardProps) => {
  const topProducts = useMemo(() => {
    // Count sales by product
    const salesByProduct = new Map<string, { quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        const current = salesByProduct.get(item.product_id) || { quantity: 0, revenue: 0 };
        salesByProduct.set(item.product_id, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.price * item.quantity),
        });
      });
    });

    // Merge with product data and sort
    return products
      .map(product => ({
        ...product,
        sales: salesByProduct.get(product.id) || { quantity: product.monthly_sold_count || 0, revenue: 0 },
      }))
      .sort((a, b) => b.sales.quantity - a.sales.quantity)
      .slice(0, 5);
  }, [orders, products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sales data yet
            </p>
          ) : (
            topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      N/A
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sales.quantity} sold
                  </p>
                </div>
                {product.sales.revenue > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {formatCurrency(product.sales.revenue)}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
