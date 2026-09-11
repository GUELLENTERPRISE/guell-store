import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, MapPin, Clock, Star } from "lucide-react";
import { Merchant } from "@/types/food";
import { getAllMerchants } from "@/data/merchantData";

interface RestaurantFilterProps {
  selectedMerchants: string[];
  onMerchantChange: (merchantIds: string[]) => void;
  onClearFilters: () => void;
}

const RestaurantFilter: React.FC<RestaurantFilterProps> = ({
  selectedMerchants,
  onMerchantChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const merchants = getAllMerchants();

  const handleMerchantToggle = (merchantId: string) => {
    const newSelection = selectedMerchants.includes(merchantId)
      ? selectedMerchants.filter((id) => id !== merchantId)
      : [...selectedMerchants, merchantId];

    onMerchantChange(newSelection);
  };

  const clearAllFilters = () => {
    onMerchantChange([]);
    onClearFilters();
  };

  const getSelectedCount = () => selectedMerchants.length;
  const getTotalCount = () => merchants.length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        <span>Filter by Restaurant</span>
        {getSelectedCount() > 0 && (
          <Badge variant="secondary" className="ml-2">
            {getSelectedCount()}
          </Badge>
        )}
      </Button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Select Restaurants
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={getSelectedCount() === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>

          <Separator />

          {/* Restaurant List */}
          <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
            {merchants.map((merchant) => {
              const isSelected = selectedMerchants.includes(merchant.id);

              return (
                <div
                  key={merchant.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/30"
                      : "border-border hover:border-border/80 hover:bg-accent"
                  }`}
                  onClick={() => handleMerchantToggle(merchant.id)}
                >
                  {/* Restaurant Logo */}
                  <img
                    src={merchant.logo}
                    alt={merchant.businessName}
                    className="h-12 w-12 rounded-lg object-cover"
                  />

                  {/* Restaurant Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="truncate font-medium text-foreground">
                        {merchant.businessName}
                      </h4>
                      {merchant.verified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                        <span>{merchant.rating}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{merchant.deliveryTime}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{merchant.deliveryRadius} mi</span>
                      </div>
                    </div>

                    {/* Cuisine Types */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {merchant.cuisineType.map((cuisine) => (
                        <Badge
                          key={cuisine}
                          variant="outline"
                          className="text-xs"
                        >
                          {cuisine}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Delivery: ${merchant.deliveryFee.toFixed(2)}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-orange-500 bg-orange-500 dark:border-orange-400 dark:bg-orange-400"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white dark:bg-zinc-900" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">
              {getSelectedCount()} of {getTotalCount()} selected
            </span>
            <Button size="sm" onClick={() => setIsOpen(false)} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default RestaurantFilter;