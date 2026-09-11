import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Flame, Timer, Star } from "lucide-react";

const FoodHeroBanner = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return "Good morning! Start your day with";
    if (hour < 14) return "Good afternoon! Time for";
    if (hour < 18) return "Good evening! Enjoy";
    return "Good evening! Craving";
  };

  const isRushHour = () => {
    const hour = currentTime.getHours();
    return (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20);
  };

  return (
    <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-32 h-32 bg-card rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-8 w-48 h-48 bg-card rounded-full blur-3xl"></div>
        <div className="absolute bottom-8 left-1/3 w-40 h-40 bg-card rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-8 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Time-based Greeting */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Flame className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">
                {getGreeting()} delicious food!
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
            <span className="text-white">GÜELL</span>
            <span className="text-yellow-300"> Food</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/95 mb-8 font-light">
            {isRushHour() ? "🔥 Rush Hour - Order Now!" : "Fresh meals, delivered fast!"}
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-card text-orange-600 hover:bg-muted font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Order Now
            </Button>
            
            <div className="flex items-center gap-3 text-white/90 bg-card/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Timer className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">30-45 min</div>
                <div className="text-sm">Average delivery</div>
              </div>
            </div>
          </div>

          {/* Special Offers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl mb-2">🍕</div>
              <h3 className="text-white font-semibold mb-1">Pizza Day</h3>
              <p className="text-white/80 text-sm">Buy 2 get 1 free</p>
            </div>
            
            <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl mb-2">🚚</div>
              <h3 className="text-white font-semibold mb-1">Free Delivery</h3>
              <p className="text-white/80 text-sm">On orders $30+</p>
            </div>
            
            <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="text-white font-semibold mb-1">4.8★ Rating</h3>
              <p className="text-white/80 text-sm">Customer love</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-12">
          <path 
            fill="white" 
            d="M0,64 C320,96 480,32 640,64 C800,96 960,32 1120,64 C1280,96 1440,32 L1440,120 L0,120 Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default FoodHeroBanner;
