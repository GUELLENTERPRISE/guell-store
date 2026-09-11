import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroBanners } from "@/hooks/useHeroBanners";
import { useProducts, useFeaturedProducts } from "@/hooks/useProducts";
import { getStorageUrl } from '@/utils/storage';

const HeroBanner = () => {
  const navigate = useNavigate();
  const { data: banners = [] } = useHeroBanners();
  const { data: allProducts = [] } = useProducts();
  const { data: featuredProducts = [] } = useFeaturedProducts();
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const currentBanner = banners[currentBannerIndex];
  
  // Get products for current banner
  const bannerProducts = currentBanner?.show_products
    ? currentBanner.product_ids?.length > 0
      ? allProducts.filter(p => currentBanner.product_ids.includes(p.id))
      : featuredProducts
    : [];

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => 
        prev === banners.length - 1 ? 0 : prev + 1
      );
      setCurrentProductIndex(0); // Reset product index when banner changes
    }, 8000); // Rotate banners every 8 seconds
    
    return () => clearInterval(interval);
  }, [banners.length]);

  // Auto-rotate products within banner
  useEffect(() => {
    if (!currentBanner?.show_products || bannerProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentProductIndex(prev => 
        prev === bannerProducts.length - 1 ? 0 : prev + 1
      );
    }, currentBanner.auto_rotate_interval || 4000);
    
    return () => clearInterval(interval);
  }, [currentBanner, bannerProducts.length]);

  const goToPreviousBanner = () => {
    setCurrentBannerIndex(prev => 
      prev === 0 ? banners.length - 1 : prev - 1
    );
    setCurrentProductIndex(0);
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex(prev => 
      prev === banners.length - 1 ? 0 : prev + 1
    );
    setCurrentProductIndex(0);
  };

  const goToPreviousProduct = () => {
    setCurrentProductIndex(prev => 
      prev === 0 ? bannerProducts.length - 1 : prev - 1
    );
  };

  const goToNextProduct = () => {
    setCurrentProductIndex(prev => 
      prev === bannerProducts.length - 1 ? 0 : prev + 1
    );
  };

  const handleButtonClick = () => {
    if (currentBanner?.button_link) {
      navigate(currentBanner.button_link);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/store/product/${productId}`);
  };

  // Fallback for when no banners exist
  if (banners.length === 0) {
    return (
      <div className="relative text-white overflow-hidden min-h-[320px]" style={{ backgroundColor: '#1aafff' }}>
        <div className="relative px-8 py-12 h-full">
          <div className="max-w-6xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
              <div className="text-left">
                <div className="flex items-center gap-4 mb-4">
                  <img src="/lovable-uploads/a049a212-1421-489b-aa8c-83da074e2508.png" alt="GÜELL" className="h-10" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                  Members-Only Deals
                </h1>
                <p className="text-xl lg:text-2xl mb-4 opacity-90">
                  Exclusive savings for Prime members
                </p>
                <Button 
                  onClick={() => navigate('/subscription')} 
                  className="bg-yellow-400 hover:bg-yellow-500 text-foreground font-bold px-8 py-3 text-lg rounded-full transform hover:scale-105 transition-all duration-200"
                >
                  Join Prime
                </Button>
              </div>
              <div className="w-80 h-64 hidden lg:block" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentProduct = bannerProducts[currentProductIndex];

  return (
    <div 
      className="relative text-white overflow-hidden group min-h-[320px] bg-blue-500 dark:bg-gray-900"
    >
      {/* Background image if set */}
      {currentBanner?.image_path && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${getStorageUrl('category-images', currentBanner.image_path)})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}
      
      <div className="relative px-8 py-12 h-full">
        <div className="max-w-6xl mx-auto h-full">
          {/* Always use the same grid layout - text left, product right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
            {/* Text Content - Always Left */}
            <div 
              className="text-left"
              style={{ color: currentBanner?.text_color || '#ffffff' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img src="/lovable-uploads/a049a212-1421-489b-aa8c-83da074e2508.png" alt="GÜELL" className="h-10" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                {currentBanner?.title}
              </h1>
              {currentBanner?.subtitle && (
                <p className="text-xl lg:text-2xl mb-4 opacity-90">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner?.description && (
                <p className="text-lg mb-6 opacity-80 max-w-md">
                  {currentBanner.description}
                </p>
              )}
              {currentBanner?.button_text && (
                <Button 
                  onClick={handleButtonClick} 
                  className="bg-yellow-400 hover:bg-yellow-500 text-foreground font-bold px-8 py-3 text-lg rounded-full transform hover:scale-105 transition-all duration-200"
                >
                  {currentBanner.button_text}
                </Button>
              )}
            </div>
            
            {/* Product Carousel - Always Right (only visible if products enabled) */}
            <div className="flex justify-center lg:justify-end">
              {currentBanner?.show_products && bannerProducts.length > 0 && currentProduct ? (
                <div className="relative group/products">
                  <div>
                    <div 
                      className="relative cursor-pointer transition-transform duration-300 hover:scale-105" 
                      onClick={() => handleProductClick(currentProduct.id)}
                    >
                      <img 
                        src={currentProduct.images?.[0] || '/placeholder.svg'} 
                        alt={currentProduct.name} 
                        className="w-80 h-64 object-cover rounded-lg" 
                      />
                      
                      {/* Product info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                        <h3 className="text-white mb-1 truncate text-left font-semibold text-lg">
                          {currentProduct.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 font-bold text-xl">
                            ${currentProduct.price.toFixed(2)}
                          </span>
                          {currentProduct.original_price && (
                            <span className="text-gray-300 line-through text-sm">
                              ${currentProduct.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Navigation arrows */}
                  {bannerProducts.length > 1 && (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/20 backdrop-blur-sm border-white/30 text-white hover:bg-card/10 opacity-0 group-hover/products:opacity-100 transition-opacity duration-300" 
                        onClick={(e) => { e.stopPropagation(); goToPreviousProduct(); }}
                        aria-label="Producto anterior en banner"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/20 backdrop-blur-sm border-white/30 text-white hover:bg-card/10 opacity-0 group-hover/products:opacity-100 transition-opacity duration-300" 
                        onClick={(e) => { e.stopPropagation(); goToNextProduct(); }}
                        aria-label="Siguiente producto en banner"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Product Dots indicator */}
                  {bannerProducts.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2" role="navigation" aria-label="Indicador de productos en banner">
                      {bannerProducts.map((_, index) => (
                        <button 
                          key={index} 
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentProductIndex 
                              ? 'bg-yellow-400 w-6' 
                              : 'bg-card/40 hover:bg-card/60'
                          }`} 
                          onClick={() => setCurrentProductIndex(index)}
                          aria-label={`Ir al producto ${index + 1} en banner`}
                          aria-current={index === currentProductIndex ? 'true' : 'false'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty placeholder to maintain layout when no products */
                <div className="w-80 h-64 hidden lg:block" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Navigation arrows */}
      {banners.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/20 backdrop-blur-sm border-white/30 text-white hover:bg-card/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" 
            onClick={goToPreviousBanner}
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/20 backdrop-blur-sm border-white/30 text-white hover:bg-card/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" 
            onClick={goToNextBanner}
            aria-label="Siguiente banner"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Banner Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10" role="navigation" aria-label="Indicador de banners">
          {banners.map((_, index) => (
            <button 
              key={index} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentBannerIndex 
                  ? 'bg-yellow-400 w-8' 
                  : 'bg-card/40 hover:bg-card/60'
              }`} 
              onClick={() => {
                setCurrentBannerIndex(index);
                setCurrentProductIndex(0);
              }}
              aria-label={`Ir al banner ${index + 1}`}
              aria-current={index === currentBannerIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
