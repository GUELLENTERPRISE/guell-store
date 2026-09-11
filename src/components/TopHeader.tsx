import { Menu, ShoppingCart, Utensils, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import ProfilePictureUpload from "./ProfilePictureUpload";
import AppSidebar from "./AppSidebar";
import EnhancedSearchBar from "./EnhancedSearchBar";
import LocationSelector from "./LocationSelector";
import DeliveryAddressSelector from "./food/DeliveryAddressSelector";
import { ThemeToggle } from '@/components/ui/ThemeToggle';
interface TopHeaderProps {
  cartCount?: number;
}
const TopHeader = ({
  cartCount = 0
}: TopHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    t,
    currentLanguage
  } = useTranslation();
  const {
    user
  } = useAuth();
  const {
    profile
  } = useUserProfile();

  // Detect current section
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.startsWith('/store')) return 'store';
    if (path.startsWith('/food')) return 'food';
    return 'splash';
  };

  const currentSection = getCurrentSection();
  const isStoreSection = currentSection === 'store';
  const isFoodSection = currentSection === 'food';
  const isSplashPage = currentSection === 'splash';

  // Show welcome back toast when user logs in
  const welcomeShownRef = useRef(false);
  
  useEffect(() => {
    if (user && profile?.full_name && !welcomeShownRef.current) {
      toast.success(t('auth.welcomeBack'));
      welcomeShownRef.current = true;
    }
  }, [user, profile, t]);

  const activeTab = searchParams.get('tab') || 'home';
  const isCartPage = activeTab === 'cart';

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const basePath = isStoreSection ? '/store' : isFoodSection ? '/food' : '/store';
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', 'search');
      newSearchParams.set('q', query);
      navigate(`${basePath}?${newSearchParams.toString()}`);
    }
  };

  const handleCartClick = () => {
    const basePath = isStoreSection ? '/store' : isFoodSection ? '/food' : '/store';
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', 'cart');
    navigate(`${basePath}?${newSearchParams.toString()}`);
  };
  const handleAccountClick = () => {
    navigate('/account/dashboard');
  };
  const handleOrdersClick = () => {
    const basePath = isStoreSection ? '/store' : isFoodSection ? '/food' : '/store';
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', 'orders');
    navigate(`${basePath}?${newSearchParams.toString()}`);
  };
  const handleTodaysDealsClick = () => {
    const basePath = isStoreSection ? '/store' : isFoodSection ? '/food' : '/store';
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', 'search');
    newSearchParams.set('category', 'deals');
    navigate(`${basePath}?${newSearchParams.toString()}`);
  };
  const handleCustomerServiceClick = () => {
    navigate('/help');
  };
  const handleRegistryClick = () => {
    navigate('/registry');
  };
  const handleSellClick = () => {
    navigate('/sell');
  };
  const handleAllCategoriesClick = () => {
    // This will trigger the sidebar toggle
  };

  const handleSectionSwitch = () => {
    if (isStoreSection) {
      navigate('/food');
    } else if (isFoodSection) {
      navigate('/store');
    } else {
      navigate('/store');
    }
  };

  const getGreeting = () => {
    if (user && profile?.full_name) {
      return t('header.helloUser', {
        name: profile.full_name
      });
    }
    return t('header.hello');
  };

  const getSectionSwitchText = () => {
    if (isStoreSection) return 'Switch to GÜELL Food';
    if (isFoodSection) return 'Switch to GÜELL Store';
    return null;
  };

  const getSectionSwitchIcon = () => {
    if (isStoreSection) return Utensils;
    if (isFoodSection) return ShoppingCart;
    return null;
  };

  return <header className="bg-gray-900 text-white shadow-lg" role="banner">
      {/* Top row - responsive */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-gray-600 gap-2 sm:px-4">
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/a049a212-1421-489b-aa8c-83da074e2508.png" alt="GÜELL – Home" className="h-7 sm:h-8 cursor-pointer" onClick={() => navigate('/')} loading="eager" width="96" height="32" />
          </div>
          {isFoodSection ? (
            <div className="hidden sm:block">
              <DeliveryAddressSelector />
            </div>
          ) : (
            <div className="hidden sm:block">
              <LocationSelector />
            </div>
          )}
        </div>
        
        <div className="flex-1 max-w-2xl mx-2 sm:mx-6 order-last sm:order-none w-full sm:w-auto">
          <EnhancedSearchBar 
            onSearch={handleSearch}
            placeholder={t('header.searchPlaceholder')}
          />
        </div>

        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Section Switcher Button */}
          {!isSplashPage && getSectionSwitchText() && (
            <Button 
              variant="ghost" 
              className={`text-white !bg-transparent hover:!bg-transparent hover:text-white p-2 flex items-center justify-center min-h-[44px] min-w-[44px] ${
                isStoreSection ? 'hover:bg-orange-600/20' : 'hover:bg-blue-600/20'
              }`} 
              onClick={handleSectionSwitch}
              title={getSectionSwitchText()}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </Button>
          )}
          
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span>{currentLanguage?.code.toUpperCase()}</span>
          </div>
          {!isFoodSection && (
            <>
              <div className="hidden md:flex text-sm hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer items-center space-x-2 min-h-[44px] rounded-md" onClick={handleAccountClick}>
                <ProfilePictureUpload size="sm" />
                <div>
                  <div className="text-xs">{getGreeting()}</div>
                  <div className="font-bold flex items-center">
                    {t('header.accountLists')}
                  </div>
                </div>
              </div>
              <div className="hidden md:block text-sm hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px]" onClick={handleOrdersClick}>
                <div className="text-xs">{t('header.returns')}</div>
                <div className="font-bold">{t('header.orders')}</div>
              </div>
            </>
          )}
                    <ThemeToggle />
          <Button variant="ghost" className="text-white !bg-transparent hover:!bg-transparent hover:text-white p-1 relative flex items-center min-h-[44px] min-w-[44px]" onClick={handleCartClick} aria-label={`Cart with ${cartCount} items`}>
            <ShoppingCart className="w-6 h-6" />
            <span className="font-bold ml-1 hidden sm:inline">{t('header.cart')}</span>
            {cartCount > 0 && <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                {cartCount}
              </Badge>}
          </Button>
        </div>
      </div>
      
      {/* Navigation row - hidden on cart page */}
      {!isCartPage && (
        <nav className={`px-3 sm:px-4 py-2 overflow-x-auto ${
          isFoodSection ? 'bg-orange-800' : 'bg-gray-800'
        }`} role="navigation" aria-label="Main categories">
          <div className="flex items-center space-x-4 sm:space-x-6 text-sm whitespace-nowrap">
            {isStoreSection ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-gray-700 flex items-center p-2 min-h-[44px]">
                      <Menu className="w-4 h-4 mr-2" />
                      {t('header.all')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-card border border-gray-200 shadow-xl rounded-lg p-0 z-[100]" align="start" sideOffset={5}>
                    <AppSidebar onClose={() => {}} />
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md" onClick={handleTodaysDealsClick}>
                  {t('header.todaysDeals')}
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md" onClick={handleCustomerServiceClick}>
                  {t('header.customerService')}
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md hidden sm:flex" onClick={handleRegistryClick}>
                  {t('header.registry')}
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md hidden sm:flex" onClick={handleSellClick}>
                  {t('header.sell')}
                </span>
              </>
            ) : isFoodSection ? (
              <>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md">
                  Pizza
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md">
                  Burgers
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md">
                  Sushi
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md">
                  Asian
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md hidden sm:flex">
                  Mexican
                </span>
                <span className="hover:scale-105 active:scale-95 transition-all duration-200 ease-out p-1 cursor-pointer min-h-[44px] flex items-center rounded-md hidden sm:flex">
                  Healthy
                </span>
              </>
            ) : null}
          </div>
        </nav>
      )}
    </header>;
};
export default TopHeader;