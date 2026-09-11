
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { useProductReviews } from "@/hooks/useReviews";
import ReviewCard from "./ReviewCard";
import CreateReviewForm from "./CreateReviewForm";

interface ProductReviewsProps {
  productId: string;
  averageRating?: number;
  totalReviews?: number;
}

const ProductReviews = ({ productId, averageRating = 0, totalReviews = 0 }: ProductReviewsProps) => {
  const { data: reviews, isLoading } = useProductReviews(productId);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const ratingDistribution = reviews?.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(averageRating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm w-6">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-4 w-full"
            variant="outline"
          >
            {showCreateForm ? 'Cancel' : 'Write a Review'}
          </Button>
        </CardContent>
      </Card>

      {/* Create Review Form */}
      {showCreateForm && (
        <CreateReviewForm 
          productId={productId}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}

      {/* Reviews List / Testimonials */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Testimonials ({reviews?.length || 0})
        </h3>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No testimonials yet. Be the first to share your experience!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
