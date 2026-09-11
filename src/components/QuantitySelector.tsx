import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useHaptics } from '@/hooks/useHaptics';

interface QuantitySelectorProps {
  maxQuantity: number;
  initialQuantity?: number;
  onQuantityChange: (quantity: number) => void;
}

export const QuantitySelector = ({ 
  maxQuantity, 
  initialQuantity = 1,
  onQuantityChange 
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const { lightTap, errorFeedback } = useHaptics();

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      lightTap();
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    } else {
      errorFeedback();
      toast.error('Maximum quantity reached');
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      lightTap();
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleInputChange = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) {
      setQuantity(1);
      onQuantityChange(1);
    } else if (num > maxQuantity) {
      setQuantity(maxQuantity);
      onQuantityChange(maxQuantity);
      toast.error(`Only ${maxQuantity} items available`);
    } else {
      setQuantity(num);
      onQuantityChange(num);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        disabled={quantity <= 1}
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        min="1"
        max={maxQuantity}
        value={quantity}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-16 text-center h-8"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {maxQuantity} available
      </span>
    </div>
  );
};
