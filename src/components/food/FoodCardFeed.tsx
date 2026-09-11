import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { FoodItem } from "@/types/food";
import { getAllMerchants, generateFoodItems } from "@/data/merchantData";
import FoodItemModal from "./FoodItemModal";
import PromotionalBadge from "./PromotionalBadge";
import useFoodCart from "@/hooks/useFoodCart";

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface FoodSection {
  id: number;
  title: string;
  items: FoodItem[];
}

interface FoodCardFeedProps {
  selectedMerchants: string[];
}

interface FoodCardProps {
  item: FoodItem;
  merchantName: string;
  isInCart: boolean;
  quantity: number;
  onAdd: () => void;
}

// ─── FoodCard (fuera de FoodCardFeed) ─────────────────────────────────────────

const FoodCard: React.FC<FoodCardProps> = ({
  item,
  merchantName,
  isInCart,
  quantity,
  onAdd,
}) => {
  return (
    <Card className="min-w-[280px] bg-card shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border-0">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-40 object-cover rounded-t-xl"
            loading="lazy"
          />
          {item.promo && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white border-0 text-xs font-semibold">
              {item.promo}
            </Badge>
          )}
          {isInCart && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0 text-xs font-semibold">
              {quantity} in cart
            </Badge>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-1 font-semibold text-foreground">{item.name}</h3>
          <p className="mb-3 text-sm text-muted-foreground">{merchantName}</p>

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium">{item.rating}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{item.deliveryTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <PromotionalBadge
                currentPrice={item.price}
                previousPrice={item.previousPrice}
                discount={item.discount}
                promo={item.promo}
                type={item.previousPrice ? "sale" : "promo"}
              />
              <span className="text-lg font-bold text-foreground">
                ${item.price}
              </span>
            </div>
            <Button
              size="sm"
              onClick={onAdd}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── FoodCardFeed ──────────────────────────────────────────────────────────────

const FoodCardFeed: React.FC<FoodCardFeedProps> = ({ selectedMerchants }) => {
  const [scrollPositions, setScrollPositions] = useState<Record<number, number>>({});
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const { isItemInCart, getItemQuantity } = useFoodCart();

  const merchants = useMemo(() => getAllMerchants(), []);

  const merchantMap = useMemo(
    () =>
      Object.fromEntries(
        merchants.map((merchant) => [merchant.id, merchant])
      ) as Record<string, (typeof merchants)[number]>,
    [merchants]
  );


  const filteredFoodItems = useMemo(() => {
    if (selectedMerchants.length === 0) {
      return merchants.flatMap((merchant) =>
        generateFoodItems(merchant.id, "menu").slice(0, 2)
      );
    }

    return selectedMerchants.flatMap((merchantId) => {
      if (!merchantMap[merchantId]) return [];

      return generateFoodItems(merchantId, "menu");
    });
  }, [selectedMerchants, merchants, merchantMap]);

  const sections: FoodSection[] = useMemo(
    () => [
      {
        id: 1,
        title: "Trending Now",
        items: filteredFoodItems.slice(0, 5),
      },
      {
        id: 2,
        title: "Near You",
        items: filteredFoodItems.slice(5, 10),
      },
      {
        id: 3,
        title: "Top Rated",
        items: filteredFoodItems
          .filter((item) => item.rating >= 4.7)
          .slice(0, 5),
      },
    ],
    [filteredFoodItems]
  );

  const scrollSection = (sectionId: number, direction: "left" | "right") => {
    const container = document.getElementById(`section-${sectionId}`);
    if (container) {
      const scrollAmount = 320;
      const newScrollPosition =
        direction === "left"
          ? Math.max(0, (scrollPositions[sectionId] || 0) - scrollAmount)
          : (scrollPositions[sectionId] || 0) + scrollAmount;

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      setScrollPositions((prev) => ({
        ...prev,
        [sectionId]: newScrollPosition,
      }));
    }
  };

  return (
    <>
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-bold text-foreground">
                {section.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 disabled:opacity-50 disabled:pointer-events-none"
                disabled
              >
                View all
              </Button>
            </div>

            <div className="relative">
              {/* Left Scroll Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-card shadow-md rounded-full"
                onClick={() => scrollSection(section.id, "left")}
                disabled={(scrollPositions[section.id] || 0) === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Right Scroll Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-card shadow-md rounded-full"
                onClick={() => scrollSection(section.id, "right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Food Cards Container */}
              <div
                id={`section-${section.id}`}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8"
              >
                {section.items.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    merchantName={
                      merchantMap[item.merchantId]?.businessName ||
                      "Restaurant"
                    }
                    isInCart={isItemInCart(item, [])}
                    quantity={getItemQuantity(item, [])}
                    onAdd={() => setSelectedFoodItem(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Food Item Modal */}
      {selectedFoodItem && (
        <FoodItemModal
          foodItem={selectedFoodItem}
          isOpen={!!selectedFoodItem}
          onClose={() => setSelectedFoodItem(null)}
        />
      )}
    </>
  );
};

export default FoodCardFeed;