
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePromoCodes } from '@/hooks/usePromoCodes';
import { Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';

const PromoCodeManagement = () => {
  const { promoCodes, createPromoCode, isCreating } = usePromoCodes();
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountValue || parseFloat(discountValue) <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    createPromoCode.mutate({
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_uses: parseInt(maxUses) || 1,
    });

    setDiscountValue('');
    setMaxUses('1');
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Promo Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Discount Type</Label>
              <RadioGroup
                value={discountType}
                onValueChange={(value) => setDiscountType(value as 'percentage' | 'fixed')}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label htmlFor="percentage">Percentage (%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed Amount ($)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="discount-value">
                Discount Value {discountType === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                id="discount-value"
                type="number"
                step={discountType === 'percentage' ? '1' : '0.01'}
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 10.00'}
                required
              />
            </div>

            <div>
              <Label htmlFor="max-uses">Maximum Uses</Label>
              <Input
                id="max-uses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="1"
              />
            </div>

            <Button type="submit" disabled={isCreating} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Generating...' : 'Generate Promo Code'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {promoCodes?.map((promo) => (
              <div key={promo.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono font-bold text-lg">{promo.code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(promo.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {promo.discount_type === 'percentage' 
                      ? `${promo.discount_value}% off` 
                      : `$${promo.discount_value} off`
                    } • Used {promo.current_uses}/{promo.max_uses} times
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs ${
                    promo.current_uses >= promo.max_uses 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {promo.current_uses >= promo.max_uses ? 'Used Up' : 'Active'}
                  </div>
                </div>
              </div>
            ))}
            {(!promoCodes || promoCodes.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No promo codes generated yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoCodeManagement;
