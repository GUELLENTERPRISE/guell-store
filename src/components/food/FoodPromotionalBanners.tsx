import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Percent, Truck } from "lucide-react";

interface Promotion {
  id: number;
  title: string;
  description: string;
  code: string;
  bgColor: string;
  icon: React.ReactNode;
  expiry?: string;
  isLimited?: boolean;
}

const FoodPromotionalBanners = () => {
  const [activePromo, setActivePromo] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const promotions: Promotion[] = [
    {
      id: 1,
      title: "🔥 Hot Deal",
      description: "50% off on selected items",
      code: "HOT50",
      bgColor: "bg-gradient-to-r from-red-600 to-orange-600",
      icon: <Flame className="w-6 h-6" />,
      expiry: "Today",
      isLimited: true
    },
    {
      id: 2,
      title: "🚚 Free Delivery",
      description: "On orders above $30",
      code: "FREE30",
      bgColor: "bg-gradient-to-r from-green-600 to-emerald-600",
      icon: <Truck className="w-6 h-6" />,
      isLimited: false
    },
    {
      id: 3,
      title: "⏰ Lunch Special",
      description: "25% off 11AM-3PM",
      code: "LUNCH25",
      bgColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
      icon: <Clock className="w-6 h-6" />,
      expiry: "3PM Today",
      isLimited: true
    }
  ];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m left`);
      } else {
        setTimeLeft("Ending soon");
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-foreground">Today's Best Deals</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <Card 
            key={promo.id} 
            className={`${promo.bgColor} text-white border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden`}
            onClick={() => setActivePromo(promo.id)}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-2 right-2 w-16 h-16 bg-card rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-card rounded-full blur-xl"></div>
            </div>

            <CardContent className="p-6 relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-card/20 p-2 rounded-lg">
                    {promo.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{promo.title}</h3>
                    {promo.expiry && (
                      <div className="flex items-center gap-1 text-sm text-white/80">
                        <Clock className="w-3 h-3" />
                        <span>{promo.expiry}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {promo.isLimited && (
                  <Badge className="bg-yellow-400 text-yellow-900 border-0 font-semibold text-xs">
                    LIMITED
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-white/95 text-sm mb-4 font-medium">
                {promo.description}
              </p>

              {/* Code Section */}
              <div className="bg-card/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/70 mb-1">Promo code:</p>
                    <p className="font-mono font-bold text-lg">{promo.code}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-card/20 hover:bg-card/30 text-white border-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(promo.code);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Active State */}
              {activePromo === promo.id && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Applied</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time-sensitive Banner */}
      <div className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-bold text-foreground">Flash Sale Ending Soon</h3>
              <p className="text-sm text-muted-foreground">All deals expire at midnight</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{timeLeft}</div>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPromotionalBanners;
