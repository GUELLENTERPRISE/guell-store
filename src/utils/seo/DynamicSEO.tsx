import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Merchant, FoodItem } from '@/types/food';

interface DynamicSEOProps {
  type: 'home' | 'restaurant' | 'food-item' | 'category' | 'store-product' | 'store-category';
  data?: {
    merchant?: Merchant;
    foodItem?: FoodItem;
    productName?: string;
    categoryName?: string;
    location?: string;
  };
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

const DynamicSEO: React.FC<DynamicSEOProps> = ({ 
  type, 
  data, 
  customTitle, 
  customDescription, 
  customImage 
}) => {
  const generateSEOData = () => {
    const baseUrl = 'https://guell.com';
    const defaultImage = `${baseUrl}/images/guell-default-og.jpg`;
    
    switch (type) {
      case 'home':
        return {
          title: 'GÜELL - Delivery de Comida Local | Los Mejores Restaurantes',
          description: 'Descubre los mejores restaurantes locales con entrega rápida. Menú variado, pedidos fáciles, sabor garantizado. Ordena ahora y recibe en minutos.',
          image: defaultImage,
          url: baseUrl,
          keywords: 'delivery comida, restaurantes locales, comida a domicilio, pedidos online, guell',
          structuredData: generateHomeStructuredData()
        };
        
      case 'restaurant': {
        if (!data?.merchant) return getDefaultSEO();
        
        const merchant = data.merchant;
        return {
          title: `${merchant.businessName} - Delivery en ${merchant.address.city} | GÜELL`,
          description: `Ordena de ${merchant.businessName} en ${merchant.address.city}. Especialidad en ${merchant.cuisineType.join(', ')}. Entrega en ${merchant.deliveryTime}. Calificación: ${merchant.rating} estrellas.`,
          image: merchant.banner || merchant.logo || defaultImage,
          url: `${baseUrl}/food/restaurant/${merchant.id}`,
          keywords: `${merchant.businessName}, delivery ${merchant.address.city}, ${merchant.cuisineType.join(', ')}, comida a domicilio, guell`,
          structuredData: generateRestaurantStructuredData(merchant)
        };
      }
        
      case 'food-item': {
        if (!data?.foodItem || !data?.merchant) return getDefaultSEO();
        
        const item = data.foodItem;
        const restaurant = data.merchant;
        return {
          title: `${item.name} - ${restaurant.businessName} | GÜELL`,
          description: `Disfruta ${item.name} de ${restaurant.businessName}. ${item.description}. Precio: $${item.price}. Entrega en ${restaurant.deliveryTime}.`,
          image: item.image || defaultImage,
          url: `${baseUrl}/food/item/${item.id}`,
          keywords: `${item.name}, ${restaurant.businessName}, ${item.category}, delivery comida, guell`,
          structuredData: generateFoodItemStructuredData(item, restaurant)
        };
      }
        
      case 'category': {
        const categoryName = data?.categoryName || 'Comida';
        const location = data?.location || 'tu ciudad';
        return {
          title: `${categoryName} - Delivery en ${location} | GÜELL`,
          description: `Encuentra los mejores restaurantes de ${categoryName} en ${location}. Variedad de platos, entrega rápida, precios competitivos.`,
          image: defaultImage,
          url: `${baseUrl}/food/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
          keywords: `${categoryName}, delivery ${location}, restaurantes ${categoryName}, comida a domicilio, guell`,
          structuredData: generateCategoryStructuredData(categoryName, location)
        };
      }
        
      case 'store-product': {
        const productName = data?.productName || 'Producto';
        return {
          title: `${productName} - Tienda GÜELL`,
          description: `Compra ${productName} en la tienda GÜELL. Productos de calidad, envío rápido, garantía de satisfacción.`,
          image: customImage || defaultImage,
          url: `${baseUrl}/store/product/${productName.toLowerCase().replace(/\s+/g, '-')}`,
          keywords: `${productName}, tienda online, guell store, productos, compra online`,
          structuredData: generateStoreProductStructuredData(productName)
        };
      }
        
      case 'store-category': {
        const storeCategoryName = data?.categoryName || 'Productos';
        return {
          title: `${storeCategoryName} - Tienda GÜELL`,
          description: `Explora nuestra selección de ${storeCategoryName}. Productos de calidad, precios competitivos, envío rápido.`,
          image: defaultImage,
          url: `${baseUrl}/store/category/${storeCategoryName.toLowerCase().replace(/\s+/g, '-')}`,
          keywords: `${storeCategoryName}, tienda online, guell store, productos, compra online`,
          structuredData: generateStoreCategoryStructuredData(storeCategoryName)
        };
      }
        
      default:
        return getDefaultSEO();
    }
  };

  const getDefaultSEO = () => ({
    title: 'GÜELL - Marketplace de Comida y Productos',
    description: 'Descubre los mejores restaurantes locales y productos. Delivery rápido, pedidos fáciles, calidad garantizada.',
    image: 'https://guell.com/images/guell-default-og.jpg',
    url: 'https://guell.com',
    keywords: 'guell, delivery, comida, tienda, marketplace, pedidos online',
    structuredData: {}
  });

  const generateHomeStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GÜELL',
    url: 'https://guell.com',
    description: 'Marketplace de comida y productos con delivery rápido',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://guell.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'GÜELL',
      url: 'https://guell.com',
      logo: 'https://guell.com/images/guell-logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: merchant.phone ?? '',
        contactType: 'customer service',
        availableLanguage: ['es', 'en']
      }
    }
  });

  const generateRestaurantStructuredData = (merchant: Merchant) => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: merchant.businessName,
    image: merchant.banner || merchant.logo,
    url: `https://guell.com/food/restaurant/${merchant.id}`,
    telephone: merchant.phone ?? '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${merchant.address.street} ${merchant.address.number}`,
      addressLocality: merchant.address.city,
      addressRegion: merchant.address.state,
      postalCode: merchant.address.zip,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: merchant.address.coordinates?.lat,
      longitude: merchant.address.coordinates?.lng
    },
    rating: {
      '@type': 'AggregateRating',
      ratingValue: merchant.rating,
      reviewCount: merchant.reviewCount ?? 0
    },
    servesCuisine: merchant.cuisineType,
    priceRange: '$$$',
    openingHours: generateOpeningHours(merchant.hours),
    deliveryRadius: {
      '@type': 'QuantitativeValue',
      value: merchant.deliveryRadius,
      unitCode: 'MILES'
    },
    sameAs: [
      `https://facebook.com/guell`,
      `https://instagram.com/guell`,
      `https://twitter.com/guell`
    ]
  });

  const generateFoodItemStructuredData = (item: FoodItem, merchant: Merchant) => ({
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    image: item.image,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'USD',
      availability: item.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    nutrition: {
      '@type': 'NutritionInformation',
      allergens: item.allergens || []
    },
    restaurant: {
      '@type': 'Restaurant',
      name: merchant.businessName,
      url: `https://guell.com/food/restaurant/${merchant.id}`
    },
    category: item.category
  });

  const generateCategoryStructuredData = (categoryName: string, location: string) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} en ${location}`,
    description: `Restaurantes de ${categoryName} en ${location}`,
    url: `https://guell.com/food/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 10,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: `Mejor ${categoryName} en ${location}`
        }
      ]
    }
  });

  const generateStoreProductStructuredData = (productName: string) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: `Producto de calidad disponible en GÜELL Store`,
    brand: {
      '@type': 'Brand',
      name: 'GÜELL'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    }
  });

  const generateStoreCategoryStructuredData = (categoryName: string) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} - GÜELL Store`,
    description: `Productos de ${categoryName} disponibles en GÜELL Store`,
    url: `https://guell.com/store/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 20,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: `Mejor ${categoryName}`
        }
      ]
    }
  });

  const generateOpeningHours = (hours: any) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const openingHours = [];
    
    days.forEach(day => {
      if (hours[day] && hours[day].open && hours[day].close) {
        openingHours.push(`${day.substring(0, 2).toUpperCase()} ${hours[day].open}-${hours[day].close}`);
      }
    });
    
    return openingHours.length > 0 ? openingHours : 'Mo-Su 11:00-22:00';
  };

  const seoData = generateSEOData();
  const finalTitle = customTitle || seoData.title;
  const finalDescription = customDescription || seoData.description;
  const finalImage = customImage || seoData.image;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={seoData.keywords} />
      <link rel="canonical" href={seoData.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seoData.url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:site_name" content="GÜELL" />
      <meta property="og:locale" content="es_ES" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seoData.url} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:creator" content="@guell" />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="GÜELL" />
      <meta name="language" content="es" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>

      {/* Additional Meta Tags for Local SEO */}
      {type === 'restaurant' && data?.merchant && (
        <>
          <meta name="geo.position" content={`${data.merchant.address.coordinates?.lat},${data.merchant.address.coordinates?.lng}`} />
          <meta name="geo.placename" content={data.merchant.address.city} />
          <meta name="geo.region" content={`${data.merchant.address.state}-${data.merchant.address.zip}`} />
          <meta name="ICBM" content={`${data.merchant.address.coordinates?.lat},${data.merchant.address.coordinates?.lng}`} />
        </>
      )}

      {/* App Links */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="GÜELL" />
      <meta name="application-name" content="GÜELL" />
      <meta name="msapplication-TileColor" content="#ea580c" />
      <meta name="theme-color" content="#ea580c" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
    </Helmet>
  );
};

export default DynamicSEO;
