import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePromotionalBlocks } from "@/hooks/usePromotionalBlocks";
import LoadingState from "./LoadingState";
import { ErrorState } from "./ErrorBoundary";
import { getStorageUrl } from '@/utils/storage';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const SecondaryCategories = () => {
  const navigate = useNavigate();
  const { data: blocks, isLoading, error, refetch } = usePromotionalBlocks();

  const handleCategoryClick = () => {
    navigate(`/?tab=search`);
  };

  if (error) {
    return (
      <ErrorState 
        title="Failed to load promotional sections"
        message="We couldn't load the promotional sections. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return <LoadingState type="categories" />;
  }

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="bg-background py-6">
      <div className="px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Featured Categories</h2>
          <p className="text-muted-foreground">Discover our top product categories</p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {blocks.map((block) => (
              <CarouselItem key={block.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="bg-card shadow-sm h-full">
                  <CardContent className="p-0">
                    {block.image_path ? (
                      <div 
                        className="w-full h-48 bg-cover bg-center relative cursor-pointer"
                        style={{ 
                          backgroundImage: `url(${getStorageUrl('category-images', block.image_path)})`,
                          backgroundColor: block.background_color 
                        }}
                        onClick={handleCategoryClick}
                      >
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
                          <h3 className="text-lg font-semibold text-white mb-1">{block.title}</h3>
                          <p className="text-sm text-white/90">{block.subtitle}</p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-48 flex flex-col justify-center items-center cursor-pointer text-white p-4"
                        style={{ backgroundColor: block.background_color }}
                        onClick={handleCategoryClick}
                      >
                        <div className="w-16 h-16 rounded-full bg-card/20 flex items-center justify-center mb-3">
                          <span className="text-2xl font-bold">{block.title.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-1">{block.title}</h3>
                        <p className="text-sm text-center text-white/90">{block.subtitle}</p>
                      </div>
                    )}
                    <div className="p-4 bg-card">
                      <Button 
                        variant="link" 
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal w-full justify-start"
                        onClick={handleCategoryClick}
                      >
                        Shop Now →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default SecondaryCategories;
