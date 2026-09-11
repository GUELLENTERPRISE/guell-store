import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import ProductCardCompact from './ProductCardCompact';
import { Eye } from 'lucide-react';

export const RecentlyViewedProducts = () => {
  const { data: recentProducts, isLoading } = useBrowsingHistory();

  if (isLoading || !recentProducts || recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recentProducts.slice(0, 5).map((product) => (
          <ProductCardCompact 
            key={product.id}
            id={product.id}
            title={product.name}
            price={product.price}
            originalPrice={product.original_price}
            rating={product.rating}
            reviews={product.review_count}
            imageUrl={product.images?.[0] || '/placeholder.svg'}
            isPrime={product.is_guell_plus}
            brand={product.brand}
            slug={product.slug}
          />
        ))}
      </div>
    </section>
  );
};
