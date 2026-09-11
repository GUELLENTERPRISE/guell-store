import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle } from "lucide-react";
import { FoodOrder } from "@/types/food";

interface OrderRatingModalProps {
  order: FoodOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: {
    orderId: string;
    rating: number;
    comment: string;
    isRecommended: boolean;
  }) => void;
}

const OrderRatingModal: React.FC<OrderRatingModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        orderId: order!.id,
        rating,
        comment,
        isRecommended: rating === 5,
      });

      setRating(0);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const getStarColor = (starNumber: number) => {
    return starNumber <= rating
      ? "text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400"
      : "text-muted-foreground/40";
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Rate Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg bg-background p-4">
            <div className="mb-2 text-sm text-muted-foreground">
              Order #{order.id.split("-")[1]} • {order.items.length} items
            </div>
            <div className="font-medium text-foreground">
              {order.items.map((item) => item.foodItem.name).join(", ")}
            </div>
            <div className="text-sm text-muted-foreground">
              Delivered to {order.deliveryAddress.street}{" "}
              {order.deliveryAddress.number}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              How was your experience?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starNumber) => (
                <button
                  key={starNumber}
                  onClick={() => handleStarClick(starNumber)}
                  className="p-1 transition-transform hover:scale-110"
                  disabled={isSubmitting}
                  type="button"
                >
                  <Star
                    className={`h-8 w-8 cursor-pointer transition-colors ${getStarColor(
                      starNumber
                    )}`}
                    fill={starNumber <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-foreground">
                {rating === 0
                  ? "Click to rate"
                  : rating === 1
                  ? "Poor"
                  : rating === 2
                  ? "Fair"
                  : rating === 3
                  ? "Good"
                  : rating === 4
                  ? "Very Good"
                  : "Excellent"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Tell us more (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this order..."
              className="resize-none"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="text-right text-xs text-muted-foreground">
              {comment.length}/500 characters
            </div>
          </div>

          {rating === 5 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/30">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  You'll receive a "Recommended" badge!
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700 dark:text-green-200/80">
                Your 5-star rating helps other customers discover great
                restaurants.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Your feedback helps us improve and assists other customers. Ratings
            are public and help restaurants improve their service.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderRatingModal;