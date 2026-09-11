import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useTranslation } from "@/hooks/useTranslation";
const ProductCarousel = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const {
    data: featuredProducts
  } = useFeaturedProducts();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    if (!featuredProducts || featuredProducts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredProducts]);
  const goToPrevious = () => {
    if (!featuredProducts) return;
    setCurrentIndex(currentIndex === 0 ? featuredProducts.length - 1 : currentIndex - 1);
  };
  const goToNext = () => {
    if (!featuredProducts) return;
    setCurrentIndex(currentIndex === featuredProducts.length - 1 ? 0 : currentIndex + 1);
  };
  const handleProductClick = (productId: string) => {
    navigate(`/store/product/${productId}`);
  };
  if (!featuredProducts || featuredProducts.length === 0) {
    return <div className="relative">
        <div className="bg-card/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl">
          <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="animate-pulse mb-2">⭐</div>
              <span>{t('product.loading')}</span>
            </div>
          </div>
        </div>
      </div>;
  }
  const currentProduct = featuredProducts[currentIndex];
  return <div className="relative group mx-0 bg-transparent px-0 py-0">
      <div className="p-8 backdrop-blur-sm border border-white/20 shadow-2xl my-0 bg-[F8F8F8] mx-0 py-[4px] px-[4px] rounded-xl bg-slate-400">
        <div className="relative cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => handleProductClick(currentProduct.id)}>
          <img src={currentProduct.images[0] || '/placeholder.svg'} alt={currentProduct.name} className="w-full max-w-md h-64 object-cover rounded-lg" />
          
          {/* Product info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
            <h3 className="text-white mb-1 truncate text-left py-0 px-0 mx-0 my-0 font-semibold text-lg">
              {currentProduct.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-bold text-xl">
                ${currentProduct.price.toFixed(2)}
              </span>
              {currentProduct.original_price && <span className="text-gray-300 line-through text-sm">
                  ${currentProduct.original_price.toFixed(2)}
                </span>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {featuredProducts.length > 1 && <>
          <Button variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/20 backdrop-blur-sm border-white/30 text-white hover:bg-card/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={goToPrevious} aria-label="Producto anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/20 backdrop-blur-sm border-white/30 text-white hover:bg-card/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={goToNext} aria-label="Siguiente producto">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>}

      {/* Dots indicator */}
      {featuredProducts.length > 1 && <div className="flex justify-center mt-4 space-x-2" role="navigation" aria-label="Indicador de productos">
          {featuredProducts.map((_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-yellow-400 w-6' : 'bg-card/40 hover:bg-card/60'}`} onClick={() => setCurrentIndex(index)} aria-label={`Ir al producto ${index + 1}`} aria-current={index === currentIndex ? 'true' : 'false'} />)}
        </div>}

      {/* Decorative elements */}
      
      
    </div>;
};
export default ProductCarousel;