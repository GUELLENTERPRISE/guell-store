import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import ProfilePictureUpload from './ProfilePictureUpload';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Gamepad2, 
  Shirt, 
  Home, 
  Car, 
  Gift,
  User,
  Globe,
  Flag,
  LogIn,
  LogOut,
  HelpCircle
} from 'lucide-react';

const AppSidebar = ({ onClose }: { onClose: () => void }) => {
  const { user, signOut } = useAuth();
  const { currentLanguage, currentLocation } = useLanguage();
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const deviceCategories = [
    { title: t('categories.laptops'), icon: Laptop, path: '/search?category=laptops' },
    { title: t('categories.headphones'), icon: Headphones, path: '/search?category=headphones' },
    { title: t('categories.gaming'), icon: Gamepad2, path: '/search?category=gaming' },
  ];

  const shopByDepartment = [
    { title: t('categories.electronics'), icon: Smartphone, path: '/search?category=electronics' },
    { title: t('categories.fashion'), icon: Shirt, path: '/search?category=fashion' },
    { title: t('categories.home'), icon: Home, path: '/search?category=home' },
    { title: t('categories.automotive'), icon: Car, path: '/search?category=automotive' },
    { title: t('categories.gifts'), icon: Gift, path: '/registry' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLocationUpdate = () => {
    // Navigate to a location/language settings page or open a modal
    // Navigate to unified account dashboard
    handleNavigation('/account/dashboard');
  };

  const handleLanguageChange = () => {
    // Navigate to language settings or open a modal
    // Navigate to unified account dashboard
    handleNavigation('/account/dashboard');
  };

  const getGreeting = () => {
    if (user && profile?.full_name) {
      return profile.full_name;
    }
    return t('auth.signIn');
  };

  return (
    <div className="w-full bg-card max-h-96 overflow-y-auto">
      {/* User Info Section */}
      <div className="p-4 bg-gray-800 text-white">
        <div className="flex items-center space-x-3">
          <ProfilePictureUpload size="md" />
          <div>
            <div className="font-medium">
              {getGreeting()}
            </div>
          </div>
        </div>
      </div>

      {/* Devices Section */}
      <div className="p-4">
        <div className="text-sm font-semibold text-muted-foreground mb-2">{t('categories.laptops')} & More</div>
        <div className="space-y-1">
          {deviceCategories.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span>{item.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Shop by Department */}
      <div className="p-4 border-t">
        <div className="text-sm font-semibold text-muted-foreground mb-2">{t('header.shopByDepartment')}</div>
        <div className="space-y-1">
          {shopByDepartment.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span>{item.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Help & Settings */}
      <div className="p-4 border-t">
        <div className="text-sm font-semibold text-muted-foreground mb-2">{t('account.helpSettings')}</div>
        <div className="space-y-1">
          {user && (
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handleNavigation('/account/dashboard')}
            >
              <User className="h-4 w-4 mr-2" />
              <span>{t('account.yourAccount')}</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left"
            onClick={handleLanguageChange}
          >
            <Globe className="h-4 w-4 mr-2" />
            <span>{t('header.language')}: {currentLanguage.name}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left"
            onClick={handleLocationUpdate}
          >
            <Flag className="h-4 w-4 mr-2" />
            <span>{t('header.country')}: {currentLocation.country} {currentLocation.language.flag}</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={() => handleNavigation('/help')}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            <span>{t('header.customerService')}</span>
          </Button>
          
          {user ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>{t('account.signOut')}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handleNavigation('/auth')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              <span>{t('auth.signIn')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
