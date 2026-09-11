
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AudioUXProvider } from "@/utils/audio-ux";
import { UnifiedUserProvider } from "@/contexts/UnifiedUserContext";
const SplashPage = React.lazy(() => import("./pages/SplashPage"));
const StoreIndex = React.lazy(() => import("./pages/StoreIndex"));
const FoodIndex = React.lazy(() => import("./pages/FoodIndex"));
const FoodAdminDashboard = React.lazy(() => import("./pages/food/FoodAdminDashboard"));
const TableMenuPage = React.lazy(() => import("./pages/food/TableMenuPage"));
const KitchenPage = React.lazy(() => import("./pages/food/KitchenPage"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
import NotFound from "./pages/NotFound";
const ProductDetailsPage = React.lazy(() => import("./pages/ProductDetailsPage"));
const SubscriptionPage = React.lazy(() => import("./pages/SubscriptionPage"));
const SearchPage = React.lazy(() => import("./pages/SearchPage"));
const WishlistPage = React.lazy(() => import("./pages/WishlistPage"));
const CheckoutPage = React.lazy(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = React.lazy(() => import("./pages/CheckoutSuccessPage"));
const CheckoutCancelPage = React.lazy(() => import("./pages/CheckoutCancelPage"));
const OrdersPage = React.lazy(() => import("./pages/OrdersPage"));
const AdminDashboard = React.lazy(() => import("./components/AdminDashboard"));
const TermsAndConditionsPage = React.lazy(() => import("./pages/TermsAndConditionsPage"));
const HelpCenterPage = React.lazy(() => import("./pages/HelpCenterPage"));
const CustomerSupportPage = React.lazy(() => import("./pages/CustomerSupportPage"));
const ComparisonPage = React.lazy(() => import("./pages/ComparisonPage"));
const SellerDashboard = React.lazy(() => import("./pages/SellerDashboard"));
const AccountSettingsPage = React.lazy(() => import("./pages/AccountSettingsPage"));
const AccountSettingsAddressesPage = React.lazy(() => import("./pages/AccountSettingsAddressesPage"));
const AccountSettingsPaymentsPage = React.lazy(() => import("./pages/AccountSettingsPaymentsPage"));
const AccountSettingsNotificationsPage = React.lazy(() => import("./pages/AccountSettingsNotificationsPage"));
const AccountPage = React.lazy(() => import("./pages/AccountPage"));
const SellPage = React.lazy(() => import("./pages/SellPage"));
const TodaysDealsPage = React.lazy(() => import("./pages/TodaysDealsPage"));
const RegistryPage = React.lazy(() => import("./pages/RegistryPage"));
const AccountAddressesPage = React.lazy(() => import("./pages/AccountAddressesPage"));
const AccountPaymentPage = React.lazy(() => import("./pages/AccountPaymentPage"));
const AccountMembershipPage = React.lazy(() => import("./pages/AccountMembershipPage"));
const AccountNotificationsPage = React.lazy(() => import("./pages/AccountNotificationsPage"));
const AccountDashboard = React.lazy(() => import("./pages/account/AccountDashboard"));

// Create QueryClient outside of component to prevent re-creation on re-renders
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <AudioUXProvider>
              <UnifiedUserProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Skip navigation link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                         focus:z-50 focus:px-4 focus:py-2 focus:bg-card focus:text-black
                         focus:rounded-md focus:shadow-lg focus:outline-none"
            >
              Skip to main content
            </a>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            }>
              <Routes>
                {/* Splash Page - Root */}
                <Route path="/" element={<SplashPage />} />
                
                {/* Store Routes */}
                <Route path="/store" element={<StoreIndex />} />
                <Route path="/store/auth" element={<AuthPage />} />
                <Route path="/store/search" element={<SearchPage />} />
                <Route path="/store/product/:slug" element={<ProductDetailsPage />} />
                <Route path="/store/subscription" element={<SubscriptionPage />} />
                <Route path="/store/wishlist" element={<WishlistPage />} />
                <Route path="/store/checkout" element={<CheckoutPage />} />
                <Route path="/store/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/store/checkout/cancel" element={<CheckoutCancelPage />} />
                <Route path="/store/orders" element={<OrdersPage />} />
                <Route path="/store/admin" element={<AdminDashboard />} />
                <Route path="/store/seller" element={<SellerDashboard />} />
                <Route path="/store/terms" element={<TermsAndConditionsPage />} />
                <Route path="/store/help" element={<HelpCenterPage />} />
                <Route path="/store/support" element={<HelpCenterPage />} />
                <Route path="/store/support-center" element={<CustomerSupportPage />} />
                <Route path="/store/compare" element={<ComparisonPage />} />
                <Route path="/store/account" element={<AccountPage />} />
                <Route path="/store/account/settings" element={<AccountSettingsPage />} />
                <Route path="/store/account/addresses" element={<AccountSettingsAddressesPage />} />
                <Route path="/store/account/payments" element={<AccountSettingsPaymentsPage />} />
                <Route path="/store/account/notifications" element={<AccountSettingsNotificationsPage />} />
                <Route path="/store/sell" element={<SellPage />} />
                <Route path="/store/deals" element={<TodaysDealsPage />} />
                <Route path="/store/registry" element={<RegistryPage />} />
                
                {/* Food Routes */}
                <Route path="/food" element={<FoodIndex />} />
                <Route path="/food/admin" element={<FoodAdminDashboard />} />

                {/* TableFlow — in-table QR menu & kitchen KDS */}
                <Route path="/table" element={<TableMenuPage />} />
                <Route path="/kitchen" element={<KitchenPage />} />
                
                {/* Global Routes (accessible from both sections) */}
                <Route path="/account/dashboard" element={<AccountDashboard />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/terms" element={<TermsAndConditionsPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/support" element={<HelpCenterPage />} />
                <Route path="/support-center" element={<CustomerSupportPage />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </UnifiedUserProvider>
            </AudioUXProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
