import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BrandSectionProps {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  imageUrl?: string;
  searchCategory?: string;
}

const BrandSection = ({ 
  title, 
  subtitle, 
  description, 
  buttonText, 
  imageUrl,
  searchCategory 
}: BrandSectionProps) => {
  const navigate = useNavigate();

  const handleBrandClick = () => {
    const params = new URLSearchParams();
    params.set('tab', 'search');
    if (searchCategory) {
      params.set('category', searchCategory);
    }
    navigate(`/?${params.toString()}`);
  };

  return (
    <section className="px-4 py-6">
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 dark:bg-gray-900 dark:border-gray-700"
        onClick={handleBrandClick}
      >
        <CardContent className="p-0">
        <div className="relative h-48 md:h-64 flex items-center justify-center text-white bg-primary dark:bg-primary/80">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="text-center space-y-4 px-6">
                <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
                <h3 className="text-xl md:text-2xl font-semibold opacity-90">{subtitle}</h3>
                <p className="text-sm md:text-base opacity-80 max-w-md mx-auto">
                  {description}
                </p>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrandClick();
                  }}
                >
                  {buttonText}
                </Button>
              </div>
            )}
            
            {imageUrl && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center space-y-4 px-6">
                  <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
                  <h3 className="text-xl md:text-2xl font-semibold opacity-90">{subtitle}</h3>
                  <p className="text-sm md:text-base opacity-80 max-w-md mx-auto">
                    {description}
                  </p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrandClick();
                    }}
                  >
                    {buttonText}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default BrandSection;