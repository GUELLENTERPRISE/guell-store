import { Home, ShoppingCart, User, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate, useLocation } from "react-router-dom";
import { useHaptics } from "@/hooks/useHaptics";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount?: number;
}

const BottomNavigation = ({
  activeTab,
  setActiveTab,
  cartCount = 0,
}: BottomNavigationProps) => {
  const { wishlist } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lightTap } = useHaptics();

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.startsWith("/store")) return "store";
    if (path.startsWith("/food")) return "food";
    return "splash";
  };

  const currentSection = getCurrentSection();
  const isFoodSection = currentSection === "food";

  const basePath =
    currentSection === "store"
      ? "/store"
      : currentSection === "food"
      ? "/food"
      : "/store";

  const navItems = [
    { id: "home", icon: Home, label: t("bottomNav.home"), path: basePath },
    {
      id: "cart",
      icon: ShoppingCart,
      label: t("bottomNav.cart"),
      path: `${basePath}?tab=cart`,
    },
    {
      id: "wishlist",
      icon: Heart,
      label: t("bottomNav.wishlist"),
      path: `${basePath}?tab=wishlist`,
    },
    {
      id: "orders",
      icon: Package,
      label: t("bottomNav.orders"),
      path: `${basePath}?tab=orders`,
    },
    {
      id: "account",
      icon: User,
      label: t("bottomNav.account"),
      path: `${basePath}?tab=account`,
    },
  ];

  const handleNavigation = (item: (typeof navItems)[0]) => {
    lightTap();
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <nav
      className={`safe-area-bottom fixed bottom-0 left-0 right-0 z-50 border-t px-2 py-1 ${
        isFoodSection
          ? "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-zinc-950"
          : "border-border bg-background"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`min-h-[44px] min-w-0 flex-col items-center p-2 transition-transform duration-200 ease-out hover:scale-110 active:scale-95 !bg-transparent hover:!bg-transparent ${
                isActive
                  ? isFoodSection
                    ? "text-orange-700 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-400"
                    : "text-primary hover:text-primary"
                  : isFoodSection
                  ? "text-orange-600 hover:text-orange-700 dark:text-orange-300/70 dark:hover:text-orange-300"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <item.icon
                  className={`h-5 w-5 ${item.id === "home" && isActive ? "animate-bounce" : ""}`}
                />

                {item.id === "cart" && cartCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-orange-500 p-0 text-xs text-white dark:bg-orange-400 dark:text-zinc-950">
                    {cartCount}
                  </Badge>
                )}

                {item.id === "wishlist" && wishlist.length > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white dark:bg-red-400 dark:text-zinc-950">
                    {wishlist.length}
                  </Badge>
                )}
              </div>

              <span className="mt-1 text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;