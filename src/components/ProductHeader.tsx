
import { ArrowLeft, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductHeaderProps {
  productName: string;
  onBack: () => void;
  onShare: () => void;
  onWishlistToggle: () => void;
  isInWishlist: boolean;
}

const ProductHeader = ({ 
  productName, 
  onBack, 
  onShare, 
  onWishlistToggle, 
  isInWishlist 
}: ProductHeaderProps) => {
  return (
    <div className="bg-card border-b p-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-semibold truncate">{productName}</h1>
        <div className="ml-auto flex space-x-2">
          <Button variant="ghost" size="sm" onClick={onShare}>
            <Share className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onWishlistToggle}
            className={isInWishlist ? "text-red-500" : ""}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
