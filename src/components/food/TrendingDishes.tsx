import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock, Plus, Flame } from "lucide-react";
import { FoodItem } from "@/types/food";
import { getAllMerchants, generateFoodItems } from "@/data/merchantData";
import useFoodCart from "@/hooks/useFoodCart";

interface TrendingDish extends FoodItem {
  ratingCount: number;
  recentRatingAverage: number;
  trendScore: number;
  merchantName: string;
}

interface TrendingDishesProps {
  onAddToCart?: (item: FoodItem) => void;
}

const TrendingDishes: React.FC<TrendingDishesProps> = ({ onAddToCart }) => {
  const [trendingDishes, setTrendingDishes] = useState<TrendingDish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useFoodCart();

  useEffect(() => {
    const calculateTrendingDishes = async () => {
      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const merchants = getAllMerchants();
      const allDishes: TrendingDish[] = [];

      merchants.forEach((merchant) => {
        const dishes = generateFoodItems(merchant.id, "burgers");

        dishes.forEach((dish) => {
          const ratingCount = Math.floor(Math.random() * 200) + 50;
          const recentRatingAverage = 4.2 + Math.random() * 0.8;
          const trendScore = calculateTrendScore(recentRatingAverage, ratingCount);

          allDishes.push({
            ...dish,
            ratingCount,
            recentRatingAverage,
            trendScore,
            merchantName: merchant.businessName,
          });
        });
      });

      const sortedDishes = allDishes
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 8);

      setTrendingDishes(sortedDishes);
      setIsLoading(false);
    };

    calculateTrendingDishes();
  }, []);

  const calculateTrendScore = (rating: number, count: number): number => {
    const ratingWeight = 0.7;
    const countWeight = 0.3;

    const normalizedRating = rating / 5.0;
    const normalizedCount = Math.log(count + 1) / Math.log(300);

    return (normalizedRating * ratingWeight + normalizedCount * countWeight) * 100;
  };

  const handleAddToCart = (dish: TrendingDish) => {
    addItem(dish);
    onAddToCart?.(dish);
  };

  const getTrendLevel = (score: number): "hot" | "rising" | "steady" => {
    if (score >= 80) return "hot";
    if (score >= 60) return "rising";
    return "steady";
  };

  const getTrendColor = (level: string) => {
    switch (level) {
      case "hot":
        return "bg-red-500 text-white dark:bg-red-600";
      case "rising":
        return "bg-orange-500 text-white dark:bg-orange-600";
      case "steady":
        return "bg-blue-500 text-white dark:bg-blue-600";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getTrendIcon = (level: string) => {
    switch (level) {
      case "hot":
        return <Flame className="h-3 w-3" />;
      case "rising":
        return <TrendingUp className="h-3 w-3" />;
      case "steady":
        return <Star className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              Trending Dishes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 rounded-t-lg bg-muted"></div>
                <CardContent className="p-4">
                  <div className="mb-2 h-4 rounded bg-muted"></div>
                  <div className="mb-3 h-3 rounded bg-muted"></div>
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            Trending Dishes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on recent customer ratings and reviews
          </p>
        </div>

        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
          <Flame className="mr-1 h-3 w-3" />
          This Week&apos;s Favorites
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {trendingDishes.map((dish, index) => {
          const trendLevel = getTrendLevel(dish.trendScore);
          const isTop3 = index < 3;

          return (
            <Card
              key={dish.id}
              className="group relative transition-shadow duration-300 hover:shadow-lg"
            >
              {isTop3 && (
                <div className="absolute left-2 top-2 z-10">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400 dark:bg-gray-500"
                        : "bg-orange-600 dark:bg-orange-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
              )}

              <div className="absolute right-2 top-2 z-10">
                <Badge className={getTrendColor(trendLevel)}>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trendLevel)}
                    <span className="text-xs font-semibold">
                      {trendLevel === "hot"
                        ? "HOT"
                        : trendLevel === "rising"
                        ? "RISING"
                        : "STEADY"}
                    </span>
                  </div>
                </Badge>
              </div>

              <div className="relative">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="h-40 w-full rounded-t-lg object-cover"
                  loading="lazy"
                />

                {index === 0 && (
                  <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-black/50 to-transparent"></div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="mb-1 text-xs text-muted-foreground">
                  {dish.merchantName}
                </div>

                <h3 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  {dish.name}
                </h3>

                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {dish.description}
                </p>

                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">
                      {dish.recentRatingAverage.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({dish.ratingCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{dish.deliveryTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-foreground">
                      ${dish.price}
                    </span>
                    {dish.previousPrice && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        ${dish.previousPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(dish)}
                    className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Trend Score: {dish.trendScore.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-6 text-center dark:from-orange-950/30 dark:to-red-950/20">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-bold text-foreground">Join the Community</h3>
        </div>

        <p className="mb-4 text-foreground/80 dark:text-muted-foreground">
          Rate your favorite dishes to help others discover the best meals in
          town. Your reviews shape our trending rankings!
        </p>

        <div className="flex items-center justify-center gap-4 text-sm text-foreground/80 dark:text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <span>Top Rated</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            <span>Rising Fast</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span>Steady Favorite</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingDishes;