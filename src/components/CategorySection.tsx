import { Card, CardContent } from "@/components/ui/card";
import { useCategories } from "@/hooks/useCategories";
import { getStorageUrl } from "@/utils/storage";
import LoadingState from "./LoadingState";
import { ErrorState } from "./ErrorBoundary";

const CategorySection = () => {
  const { data: categories, isLoading, error, refetch } = useCategories();

  if (error) {
    return (
      <ErrorState 
        title="Failed to load categories"
        message="We couldn't load the product categories. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return <LoadingState type="categories" />;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Shop by Category</h2>
        <div className="text-center py-8 text-muted-foreground">
          No categories available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <h2 className="text-lg font-semibold mb-3 text-foreground">Shop by Category</h2>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 text-center">
              {category.image_path ? (
                <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2">
                  <img 
                    src={getStorageUrl('category-images', category.image_path)}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-white text-lg font-medium"
                  style={{ backgroundColor: category.background_color }}
                >
                  {category.name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-xs font-medium text-gray-700">{category.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
