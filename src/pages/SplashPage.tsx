import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Utensils } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const SplashPage = () => {
  const navigate = useNavigate();

  const handleStoreClick = useCallback(() => {
    navigate('/store');
  }, [navigate]);

  const handleFoodClick = useCallback(() => {
    navigate('/food');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      <SEOHead 
        title="GÜELL - Tu Super App de Delivery y Tienda Online"
        description="GÜELL - Tu Super App de Delivery y Tienda Online. Descubre productos premium, moda, electrónica y comida con envío rápido y excelente servicio al cliente."
        keywords="delivery, tienda online, ecommerce, compras online, moda, electrónica, comida a domicilio, GÜELL"
        canonical={`${window.location.origin}/`}
      />
      
      {/* Logo and Branding */}
      <div className="text-center mb-12">
        <img 
          src="/lovable-uploads/a049a212-1421-489b-aa8c-83da074e2508.png" 
          alt="GÜELL Store — return to homepage" 
          className="h-16 mx-auto mb-4"
          loading="eager"
          width="64"
          height="64"
          decoding="async"
        />
        <h1 className="text-4xl font-bold text-foreground mb-2">GÜELL - Tu Super App de Delivery y Tienda Online</h1>
        <p className="text-lg text-muted-foreground">Choose your experience</p>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Store Card */}
        <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={handleStoreClick}>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
              <ShoppingCart className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Store</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Discover curated products with GÜELL's signature quality. Enjoy exclusive deals,
              premium selections, and secure shopping with our trusted marketplace.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleStoreClick();
              }}
            >
              Shop Now
            </Button>
          </CardContent>
        </Card>

        {/* Food Card */}
        <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={handleFoodClick}>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
              <Utensils className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Food</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Experience GÜELL Food's curated restaurant selection. Customize your meals,
              add special instructions, and enjoy premium delivery from trusted local partners.
            </p>
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleFoodClick();
              }}
            >
              Order Food
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Switch between Store and Food anytime using the toggle in the navigation</p>
      </div>
    </div>
  );
};

export default SplashPage;
