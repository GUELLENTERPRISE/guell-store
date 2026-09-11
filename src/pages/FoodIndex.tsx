import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import BottomNavigation from "@/components/BottomNavigation";
import TopHeader from "@/components/TopHeader";
import SEOHead from "@/components/SEOHead";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";

import useFoodCart from "@/hooks/useFoodCart";
import FoodCart from "@/components/food/FoodCart";
import { useAuth } from "@/contexts/AuthContext";

import AccountDashboard from "@/pages/account/AccountDashboard";

import PromotionalCarousel from "@/components/food/PromotionalCarousel";
import CategoryCarousel from "@/components/food/CategoryCarousel";
import FoodTestimonials from "@/components/food/FoodTestimonials";
import RestaurantFilter from "@/components/food/RestaurantFilter";
import TrendingDishes from "@/components/food/TrendingDishes";
import FoodCardFeed from "@/components/food/FoodCardFeed";
import FoodTrustBadges from "@/components/food/FoodTrustBadges";
import ChefStory from "@/components/food/ChefStory";
import FoodFooter from "@/components/food/FoodFooter";

import { getAllMerchants, getMerchantById } from "@/data/merchantData";

type FoodTab = "home" | "search" | "cart" | "orders" | "wishlist" | "account";

const VALID_TABS: FoodTab[] = [
  "home",
  "search",
  "cart",
  "orders",
  "wishlist",
  "account",
];

const EmptyTabState = ({
  title,
  description,
  primaryLabel,
  onPrimaryAction,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
}) => {
  return (
    <section className="px-4 py-10 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-start rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          GÜELL Food
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>

        <div className="mt-6">
          <Button onClick={onPrimaryAction}>{primaryLabel}</Button>
        </div>
      </div>
    </section>
  );
};

const FoodHome = ({
  selectedMerchants,
  onMerchantChange,
  onClearFilters,
  featuredMerchant,
}: {
  selectedMerchants: string[];
  onMerchantChange: (merchantIds: string[]) => void;
  onClearFilters: () => void;
  featuredMerchant: ReturnType<typeof getMerchantById> | null;
}) => {
  return (
    <>
      <SEOHead
        title="GÜELL Food - Restaurant Delivery"
        description="Order from your favorite restaurants with custom modifiers and fast delivery"
      />

      <div className="bg-background">
        <section className="px-4 pt-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <PromotionalCarousel />
          </div>
        </section>

        <section className="px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <CategoryCarousel />
          </div>
        </section>

        <section className="px-4 py-2 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <RestaurantFilter
              selectedMerchants={selectedMerchants}
              onMerchantChange={onMerchantChange}
              onClearFilters={onClearFilters}
            />
          </div>
        </section>

        <section className="px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TrendingDishes />
          </div>
        </section>

        <section className="px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FoodCardFeed selectedMerchants={selectedMerchants} />
          </div>
        </section>

        <section className="px-4 py-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FoodTrustBadges />
          </div>
        </section>

        {featuredMerchant && (
          <section className="px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <ChefStory merchant={featuredMerchant} />
            </div>
          </section>
        )}

        <section className="px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FoodTestimonials />
          </div>
        </section>

        <FoodFooter />
      </div>
    </>
  );
};

const FoodIndex = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { loading: authLoading } = useAuth();
  const { cart } = useFoodCart();

  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);

  const allMerchants = getAllMerchants();

  const featuredMerchant =
    (selectedMerchants.length > 0
      ? getMerchantById(selectedMerchants[0])
      : allMerchants[0]) || null;

  const cartCount = cart.totalItems || 0;

  const activeTab = useMemo<FoodTab>(() => {
    const tab = searchParams.get("tab") as FoodTab | null;
    return tab && VALID_TABS.includes(tab) ? tab : "home";
  }, [searchParams]);

  const setActiveTab = (tab: string) => {
    const nextTab: FoodTab = VALID_TABS.includes(tab as FoodTab)
      ? (tab as FoodTab)
      : "home";

    const nextParams = new URLSearchParams(searchParams);

    if (nextTab === "home") {
      nextParams.delete("tab");
      navigate(
        nextParams.toString() ? `/food?${nextParams.toString()}` : "/food"
      );
      return;
    }

    nextParams.set("tab", nextTab);
    navigate(`/food?${nextParams.toString()}`);
  };

  const goHome = () => setActiveTab("home");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "search":
        return (
          <EmptyTabState
            title="Busca restaurantes y platos"
            description="La experiencia de búsqueda todavía no está al nivel de la home. Por ahora, te conviene volver al inicio para explorar categorías, tendencias y recomendaciones."
            primaryLabel="Volver al inicio"
            onPrimaryAction={goHome}
          />
        );

      case "cart":
        return (
          <section className="px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <FoodCart onCheckout={() => { }} />
            </div>
          </section>
        );

      case "orders":
        return (
          <EmptyTabState
            title="Tus pedidos"
            description="La sección de pedidos necesita una vista más robusta con estados, detalle y seguimiento. De momento, la home es la parte más sólida de Food."
            primaryLabel="Ir a Food Home"
            onPrimaryAction={goHome}
          />
        );

      case "wishlist":
        return (
          <EmptyTabState
            title="Tus favoritos"
            description="Aquí debería vivir tu colección de restaurantes o platos guardados. Esta sección todavía necesita integrarse con una lógica real de favoritos."
            primaryLabel="Descubrir platos"
            onPrimaryAction={goHome}
          />
        );

      case "account":
        return <AccountDashboard />;

      case "home":
      default:
        return (
          <FoodHome
            selectedMerchants={selectedMerchants}
            onMerchantChange={setSelectedMerchants}
            onClearFilters={() => setSelectedMerchants([])}
            featuredMerchant={featuredMerchant}
          />
        );
    }
  };

  if (authLoading) {
    return <LoadingState type="page" message="Loading your food experience..." />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TopHeader cartCount={cartCount} />

      <main className="flex-1 overflow-y-auto pb-20" role="main">
        {renderActiveTab()}
      </main>

      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
      />
    </div>
  );
};

export default FoodIndex;