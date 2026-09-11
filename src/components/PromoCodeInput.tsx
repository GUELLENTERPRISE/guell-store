
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePromoCodes } from '@/hooks/usePromoCodes';
import { Check, Tag, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface PromoCodeInputProps {
  onPromoCodeApplied: (promoCode: any) => void;
  appliedPromoCode?: any;
}

const PromoCodeInput = ({ onPromoCodeApplied, appliedPromoCode }: PromoCodeInputProps) => {
  const [promoCode, setPromoCode] = useState('');
  const { validatePromoCode, isValidating } = usePromoCodes();
  const { t } = useTranslation();

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) return;

    validatePromoCode.mutate(promoCode.trim(), {
      onSuccess: (data) => {
        onPromoCodeApplied(data);
        setPromoCode('');
      },
    });
  };

  const handleRemovePromoCode = () => {
    onPromoCodeApplied(null);
  };

  if (appliedPromoCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-200 font-medium text-sm">
            {t('cart.promoCodeApplied', { code: appliedPromoCode.code })}
            {appliedPromoCode.discount_type === 'percentage' 
              ? ` ${appliedPromoCode.discount_value}% ${t('cart.off')}`
              : ` $${appliedPromoCode.discount_value} ${t('cart.off')}`
            }
          </span>
        </div>
        <button
          onClick={handleRemovePromoCode}
          className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
          aria-label={t('cart.removePromoCode')}
        >
          <X className="w-4 h-4 text-green-600 dark:text-green-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder={t('cart.enterPromoCode')}
            className="pl-10"
            maxLength={14}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyPromoCode();
              }
            }}
          />
        </div>
        <Button
          onClick={handleApplyPromoCode}
          disabled={!promoCode.trim() || isValidating}
          variant="outline"
        >
          {isValidating ? t('cart.applying') : t('cart.apply')}
        </Button>
      </div>
    </div>
  );
};

export default PromoCodeInput;
