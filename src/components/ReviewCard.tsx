
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp } from "lucide-react";
import { Review } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";
import { useReviewVote, useToggleReviewVote } from "@/hooks/useReviewVotes";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const { user } = useAuth();
  const { data: userVote } = useReviewVote(review.id);
  const toggleVote = useToggleReviewVote();
  const userName = review.user_profiles?.full_name || 'Anonymous User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleVoteClick = () => {
    if (!user) return;
    toggleVote.mutate({ reviewId: review.id, hasVoted: !!userVote });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.user_profiles?.avatar_url} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm">{userName}</span>
              {review.verified_purchase && (
                <Badge variant="secondary" className="text-xs">
                  Verified Purchase
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < review.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            </div>
            
            {review.title && (
              <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
            )}
            
            {review.comment && (
              <p className="text-gray-700 text-sm mb-3">{review.comment}</p>
            )}
            
            {review.images && review.images.length > 0 && (
              <div className="flex space-x-2 mb-3">
                {review.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`Review image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoteClick}
                disabled={!user || toggleVote.isPending}
                className={`text-sm ${userVote ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <ThumbsUp className={`w-4 h-4 mr-1 ${userVote ? 'fill-current' : ''}`} />
                Helpful ({review.helpful_count})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
