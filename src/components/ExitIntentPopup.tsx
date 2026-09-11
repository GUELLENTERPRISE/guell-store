import React, { useEffect, useState } from 'react';
import { X, Gift, Clock, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';
import { useTranslation } from '@/hooks/useTranslation';

interface ExitIntentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: () => void;
}

const ExitIntentPopup = ({ isOpen, onClose, onAction }: ExitIntentPopupProps) => {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useStorefrontSettings();

  const handleAction = () => {
    onAction?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Gift className="w-6 h-6 text-orange-500" />
                {settings?.exit_intent_title || "Wait! Don't Leave Yet"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <Percent className="w-16 h-16 mx-auto text-orange-500 mb-2" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {settings?.exit_intent_offer || "Special Offer Just For You!"}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {settings?.exit_intent_message ||
                      "Get 10% off your next purchase with code EXIT10. Plus, enjoy free shipping on orders over $50!"}
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-orange-800 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Limited Time Offer</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAction}
                    className="flex-1 bg-orange-500 text-white font-semibold py-3"
                  >
                    {settings?.exit_intent_button_text || "Claim My Discount"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 py-3"
                  >
                    No Thanks
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;