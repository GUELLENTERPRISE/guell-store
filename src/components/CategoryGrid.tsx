import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMarketingTiles } from "@/hooks/useMarketingTiles";
import { getStorageUrl } from "@/utils/storage";
import LoadingState from "./LoadingState";
import { ErrorState } from "./ErrorBoundary";

interface CategoryItem {
  titleKey: string;
  items: {
    nameKey: string;
    image: string;
  }[];
  linkTextKey: string;
  category?: string;
}

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { data: tiles, isLoading, error, refetch } = useMarketingTiles();

  const handleCategoryClick = () => {
    navigate(`/?tab=search`);
  };

  if (error) {
    return (
      <ErrorState 
        title="Failed to load marketing tiles"
        message="We couldn't load the marketing sections. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return <LoadingState type="categories" />;
  }

  if (!tiles || tiles.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-6">
      {tiles.map((tile) => (
        <Card key={tile.id} className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {tile.image_path ? (
              <div 
                className="w-full h-48 bg-cover bg-center relative cursor-pointer"
                style={{ 
                  backgroundImage: `url(${getStorageUrl('category-images', tile.image_path)})`,
                  backgroundColor: tile.background_color 
                }}
                onClick={handleCategoryClick}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{tile.title}</h3>
                  <p className="text-sm text-white/90">{tile.description}</p>
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-48 flex flex-col justify-center items-center cursor-pointer text-white p-4"
                style={{ backgroundColor: tile.background_color }}
                onClick={handleCategoryClick}
              >
                <div className="w-16 h-16 rounded-full bg-card/20 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold">{tile.title.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="text-lg font-semibold text-center mb-1">{tile.title}</h3>
                <p className="text-sm text-center text-white/90">{tile.description}</p>
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
      ))}
    </div>
  );
};

export default CategoryGrid;
