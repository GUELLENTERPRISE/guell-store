import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Flame } from "lucide-react";

interface Promotion {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  cta: string;
  bgColor: string;
}

const PromotionalCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const promotions: Promotion[] = [
    {
      id: 1,
      title: "50% OFF Pizza",
      subtitle: "Limited time offer on all pizzas",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=400&fit=crop",
      badge: "HOT DEAL",
      cta: "Order Now",
      bgColor: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
      id: 2,
      title: "Free Delivery",
      subtitle: "On orders above $30",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
      badge: "SPECIAL",
      cta: "Order Now",
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      id: 3,
      title: "Lunch Special",
      subtitle: "25% off 11AM-3PM",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop",
      badge: "LIMITED",
      cta: "Order Now",
      bgColor: "bg-gradient-to-r from-blue-500 to-indigo-500"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, promotions.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full max-h-[250px] overflow-hidden rounded-xl">
      {/* Carousel Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            className={`min-w-full h-full relative ${promotion.bgColor}`}
          >
            {/* Background Image */}
            <img
              src={promotion.image}
              alt={promotion.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Overlay with dark gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center px-8 py-6">
              <div className="max-w-md">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-card text-foreground border-0 font-semibold text-xs">
                    {promotion.badge}
                  </Badge>
                  {promotion.badge === "HOT DEAL" && (
                    <Flame className="w-4 h-4 text-orange-400" />
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">
                  {promotion.title}
                </h2>
                
                <p className="text-white/90 text-lg mb-4">
                  {promotion.subtitle}
                </p>
                
                <Button 
                  className="backdrop-blur-md bg-card/20 border border-white/30 text-white font-semibold px-6 py-2 rounded-full hover:bg-card/30 transition-all duration-300 shadow-lg"
                  onClick={() => {}}
                >
                  {promotion.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card shadow-lg rounded-full"
        onClick={() => {
          prevSlide();
          setIsAutoPlaying(false);
        }}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card shadow-lg rounded-full"
        onClick={() => {
          nextSlide();
          setIsAutoPlaying(false);
        }}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {promotions.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-card w-8' 
                : 'bg-card/50 hover:bg-card/75'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/90 px-3 py-1 rounded-full">
        <Clock className="w-3 h-3 text-gray-700" />
        <span className="text-xs text-gray-700">Auto-playing</span>
      </div>
    </div>
  );
};

export default PromotionalCarousel;
