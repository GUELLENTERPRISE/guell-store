import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  image: string;
  color: string;
}

const CategoryCarousel = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const categories: Category[] = [
    { id: 1, name: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop", color: "bg-orange-100" },
    { id: 2, name: "Burgers", image: "https://images.unsplash.com/photo-1568901343476-25c52d4f15e9?w=200&h=200&fit=crop", color: "bg-red-100" },
    { id: 3, name: "Sushi", image: "https://images.unsplash.com/photo-1579584429530-5e0d0c4d5b7d?w=200&h=200&fit=crop", color: "bg-pink-100" },
    { id: 4, name: "Asian", image: "https://images.unsplash.com/photo-1563245372-f15324654270?w=200&h=200&fit=crop", color: "bg-yellow-100" },
    { id: 5, name: "Mexican", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop", color: "bg-green-100" },
    { id: 6, name: "Healthy", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop", color: "bg-emerald-100" },
    { id: 7, name: "Desserts", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&h=200&fit=crop", color: "bg-purple-100" },
    { id: 8, name: "Drinks", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop", color: "bg-blue-100" },
    { id: 9, name: "Italian", image: "https://images.unsplash.com/photo-1555399503-87dd5e32f71c?w=200&h=200&fit=crop", color: "bg-green-100" },
    { id: 10, name: "Indian", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop", color: "bg-orange-100" },
  ];

  const scrollLeft = () => {
    const container = document.getElementById('category-carousel');
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
      setScrollPosition(Math.max(0, scrollPosition - 200));
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('category-carousel');
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
      setScrollPosition(scrollPosition + 200);
    }
  };

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-md rounded-full"
        onClick={scrollLeft}
        disabled={scrollPosition === 0}
        aria-label="Desplazar categorías a la izquierda"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-md rounded-full"
        onClick={scrollRight}
        aria-label="Desplazar categorías a la derecha"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Category Carousel */}
      <div 
        id="category-carousel"
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            className="flex flex-col items-center gap-2 min-w-[100px] group cursor-pointer"
            onClick={() => {}}
          >
            <div className="relative">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-orange-400 transition-all duration-300 transform group-hover:scale-110 shadow-md group-hover:shadow-xl`}>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={() => {}}
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-foreground transition-colors duration-200">
              {category.name}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryCarousel;
