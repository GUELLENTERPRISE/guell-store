
import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import TopHeader from "@/components/TopHeader";
import SEOHead from "@/components/SEOHead";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import SecondaryCategories from "@/components/SecondaryCategories";
import RecommendedProducts from "@/components/RecommendedProducts";
import { RecentlyViewedProducts } from "@/components/RecentlyViewedProducts";
import ProductRow from "@/components/ProductRow";
import BrandSection from "@/components/BrandSection";
import CartPage from "@/components/CartPage";
import DealOfTheDay from "@/components/DealOfTheDay";
import LightningDeals from "@/components/LightningDeals";
import AccountPage from "@/pages/AccountPage";
import AccountSettingsAddressesPage from "@/pages/AccountSettingsAddressesPage";
import AccountSettingsPaymentsPage from "@/pages/AccountSettingsPaymentsPage";
import AccountSettingsNotificationsPage from "@/pages/AccountSettingsNotificationsPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
import AccountProfilePage from "@/pages/AccountProfilePage";
import AccountSecurityPage from "@/pages/AccountSecurityPage";
import OrdersPage from "@/components/OrdersPage";
import WishlistPage from "@/components/WishlistPage";
import ProductSearch from "@/components/ProductSearch";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingState from "@/components/LoadingState";
import { useBrandSections } from "@/hooks/useBrandSections";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import PullToRefresh from "@/components/PullToRefresh";
import CustomerTestimonials from "@/components/CustomerTestimonials";
import HomepageFAQ from "@/components/HomepageFAQ";
import NewsletterCTA from "@/components/NewsletterCTA";
import GuaranteeBanner from "@/components/GuaranteeBanner";
import FloatingCartButton from "@/components/FloatingCartButton";
import FloatingComparisonBar from "@/components/FloatingComparisonBar";
import { useQueryClient } from "@tanstack/react-query";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";

const Index = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  const { user, loading: authLoading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const { data: brandSections = [] } = useBrandSections();
  const queryClient = useQueryClient();
  const { data: settings } = useStorefrontSettings();
  const { showPopup, closePopup } = useExitIntent({
    enabled: settings?.exit_intent_enabled ?? true,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, [queryClient]);

  // Redirect to auth if user tries to access protected tabs without being logged in
  useEffect(() => {
    if (!authLoading && !user && (activeTab === "cart" || activeTab === "account" || activeTab === "orders" || activeTab === "wishlist")) {
      navigate('/auth');
    }
  }, [activeTab, user, authLoading, navigate]);

  const cartCount = cart?.length || 0;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "search": {
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || undefined;
        return <ProductSearch initialQuery={query} categoryFilter={category} />;
      }
      case "cart":
        return <CartPage />;
      case "account":
        return <AccountPage />;
      case "account-profile":
        return <AccountProfilePage />;
      case "account-security":
        return <AccountSecurityPage />;
      case "account-addresses":
        return <AccountSettingsAddressesPage />;
      case "account-payments":
        return <AccountSettingsPaymentsPage />;
      case "account-notifications":
        return <AccountSettingsNotificationsPage />;
      case "account-settings":
        return <AccountSettingsPage />;
      case "orders":
        return <OrdersPage />;
      case "wishlist":
        return <WishlistPage />;
      default:
        return (
          <PullToRefresh onRefresh={handleRefresh}>
            <div className="space-y-0">
              <SEOHead />
              <HeroBanner />
              <SecondaryCategories />
              <TrustBadges />
              <div className="p-4">
                <DealOfTheDay />
              </div>
              <LightningDeals />
              <ProductRow 
                title="Trending Now" 
                subtitle="Popular products our customers love"
                maxProducts={6}
                filter="featured"
              />
              {brandSections.map((section, index) => (
                <div key={section.id}>
                  <BrandSection
                    title={section.title}
                    subtitle={section.subtitle || ""}
                    description={section.description || ""}
                    buttonText={section.button_text}
                    backgroundColor={section.background_color}
                    searchCategory={section.search_category}
                    imageUrl={section.image_path}
                  />
                  {index === 0 && (
                    <ProductRow 
                      title="Best Sellers" 
                      subtitle="Customer favorites this month"
                      maxProducts={6}
                      filter="all"
                    />
                  )}
                  {index === 1 && (
                    <ProductRow 
                      title="Prime Exclusive" 
                      subtitle="Special deals for Prime members"
                      maxProducts={6}
                      filter="prime"
                    />
                  )}
                </div>
              ))}
              <CategoryGrid />
              <RecentlyViewedProducts />
              <RecommendedProducts />
              <CustomerTestimonials />
              <GuaranteeBanner />
              <HomepageFAQ />
              <NewsletterCTA />
              <Footer />
            </div>
          </PullToRefresh>
        );
    }
  };

  if (authLoading) {
    return <LoadingState type="page" message="Loading your account..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <TopHeader cartCount={cartCount} />
      
      <main className="flex-1 pb-20 overflow-y-auto" role="main">
        {renderActiveTab()}
      </main>

      <FloatingComparisonBar />
      <FloatingCartButton />

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        isOpen={showPopup}
        onClose={closePopup}
        onAction={() => {
          // Navigate to a special offer page or apply discount
          navigate('/?tab=search&promo=exit10');
        }}
      />

      <BottomNavigation activeTab={activeTab} setActiveTab={(tab) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', tab);
        navigate(`/?${newSearchParams.toString()}`);
      }} cartCount={cartCount} />
    </div>
  );
};

export default Index;
