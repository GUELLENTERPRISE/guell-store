
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
  type?: string;
  product?: {
    name: string;
    description?: string;
    price: number;
    original_price?: number;
    brand?: string;
    inventory: number;
    images?: string[];
    image_alt_text?: string[];
    rating?: number;
    review_count?: number;
    slug?: string;
  };
}

const SEOHead = ({
  title = 'GÜELL - Premium E-commerce Store',
  description = 'Discover premium products at GÜELL. Quality fashion, electronics, and more with fast shipping and excellent customer service.',
  keywords = 'ecommerce, online shopping, premium products, fashion, electronics',
  image = '/lovable-uploads/5b8befac-98b9-4eca-81c7-5d4bdcbac1b2.png',
  url = window.location.href,
  canonical = window.location.href,
  type = 'website',
  product,
}: SEOHeadProps) => {
  // Structured data for products
  const getStructuredData = () => {
    if (type === 'product' && product) {
      const availability = product.inventory > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock';

      const structuredData: Record<string, any> = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "description": product.description || '',
        "image": product.images?.[0] || image,
        "url": url,
        "brand": {
          "@type": "Brand",
          "name": product.brand || 'GÜELL'
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "USD",
          "availability": availability,
          "seller": {
            "@type": "Organization",
            "name": "GÜELL"
          }
        }
      };

      if (product.original_price && product.original_price > product.price) {
        structuredData.offers["highPrice"] = product.original_price;
      }

      if (product.rating && product.review_count && product.review_count > 0) {
        structuredData["aggregateRating"] = {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.review_count
        };
      }

      return structuredData;
    } else {
      // Website-level structured data
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "GÜELL",
        "url": window.location.origin
      };
    }
  };

  // Dynamic OpenGraph availability for products
  const ogAvailability = type === 'product' && product
    ? (product.inventory > 0 ? 'instock' : 'outofstock')
    : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
      <meta property="og:site_name" content="GÜELL ✓" />
      {ogAvailability && <meta property="og:availability" content={ogAvailability} />}
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData())}
      </script>
    </Helmet>
  );
};

export default SEOHead;
