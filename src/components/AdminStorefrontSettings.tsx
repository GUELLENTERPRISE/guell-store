import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';

const CART_PAYMENT_ICON_OPTIONS = [
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'amex', label: 'American Express' },
  { id: 'applepay', label: 'Apple Pay' },
  { id: 'googlepay', label: 'Google Pay' },
] as const;

const AdminStorefrontSettings = () => {
  const { data: settings, isLoading, refetch } = useStorefrontSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    primary_cta_color: '#FF8C00',
    primary_cta_label: 'Add to Cart',
    low_stock_threshold_default: 15,
    enable_urgency_messaging: true,
    show_secure_payment_badge_default: true,
    show_satisfaction_badge_default: true,
    show_fast_shipping_badge_default: true,
    payment_methods: 'Visa, Mastercard, PayPal',
    cart_payment_icons: ['visa', 'mastercard', 'paypal', 'amex', 'applepay', 'googlepay'] as string[],
    cart_urgency_banner_text: '🔥 High demand: Complete your purchase before your items sell out.',
    cart_trust_badges: ['secure', 'padlock'] as string[],
    free_shipping_threshold: 100,
    verified_stores: [] as string[],
    exit_intent_enabled: true,
    exit_intent_title: "Wait! Don't Leave Yet",
    exit_intent_message: "Get 10% off your next purchase with code EXIT10. Plus, enjoy free shipping on orders over $50!",
    exit_intent_offer: "Special Offer Just For You!",
    exit_intent_button_text: "Claim My Discount",
  });

  useEffect(() => {
    if (settings) {
      const cartIcons = settings.cart_payment_icons;
      const cartIconsArray =
        cartIcons === undefined || cartIcons === null
          ? ['visa', 'mastercard', 'paypal', 'amex', 'applepay', 'googlepay']
          : Array.isArray(cartIcons)
            ? cartIcons.map((id) => String(id).toLowerCase())
            : typeof cartIcons === 'string'
              ? cartIcons.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
              : [];
      setFormData({
        primary_cta_color: settings.primary_cta_color || '#FF8C00',
        primary_cta_label: settings.primary_cta_label || 'Add to Cart',
        low_stock_threshold_default: settings.low_stock_threshold_default ?? 15,
        enable_urgency_messaging: settings.enable_urgency_messaging ?? true,
        show_secure_payment_badge_default: settings.show_secure_payment_badge_default ?? true,
        show_satisfaction_badge_default: settings.show_satisfaction_badge_default ?? true,
        show_fast_shipping_badge_default: settings.show_fast_shipping_badge_default ?? true,
        payment_methods: (settings.payment_methods || ['Visa', 'Mastercard', 'PayPal']).join(', '),
        cart_payment_icons: cartIconsArray,
        cart_urgency_banner_text: settings.cart_urgency_banner_text || '🔥 High demand: Complete your purchase before your items sell out.',
        cart_trust_badges: settings.cart_trust_badges || ['secure', 'padlock'],
        free_shipping_threshold: settings.free_shipping_threshold ?? 100,
        verified_stores: settings.verified_stores || [],
        exit_intent_enabled: settings.exit_intent_enabled ?? true,
        exit_intent_title: settings.exit_intent_title || "Wait! Don't Leave Yet",
        exit_intent_message: settings.exit_intent_message || "Get 10% off your next purchase with code EXIT10. Plus, enjoy free shipping on orders over $50!",
        exit_intent_offer: settings.exit_intent_offer || "Special Offer Just For You!",
        exit_intent_button_text: settings.exit_intent_button_text || "Claim My Discount",
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // First, check if we can read from the table
      // Check if storefront_settings table exists
      const { data: testData, error: testError } = await supabase
        .from('storefront_settings')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Table access error:', testError);
        throw new Error(`Database table error: ${testError.message}`);
      }

      // Table exists, found records

      // Start with a minimal payload to test
      const minimalPayload = {
        verified_stores: ['GÜELL'], // Test with the exact value the user is entering
      };

      // Testing with minimal payload

      let error;
      if (settings?.id) {
        // Updating existing settings
        const { error: updateError } = await supabase
          .from('storefront_settings')
          .update(minimalPayload)
          .eq('id', settings.id);
        error = updateError;
        console.log('Update result:', { error });
      } else {
        console.log('Inserting new settings');
        const { error: insertError } = await supabase
          .from('storefront_settings')
          .insert([minimalPayload]);
        error = insertError;
        console.log('Insert result:', { error });
      }

      if (error) {
        console.error('Database error with minimal payload:', error);
        throw new Error(`Database operation failed: ${error.message || 'Unknown database error'}`);
      }

      console.log('Minimal payload saved successfully');

      // If minimal save works, try full payload
      const fullPayload = {
        primary_cta_color: formData.primary_cta_color,
        primary_cta_label: formData.primary_cta_label,
        low_stock_threshold_default: Number(formData.low_stock_threshold_default) || null,
        enable_urgency_messaging: formData.enable_urgency_messaging,
        show_secure_payment_badge_default: formData.show_secure_payment_badge_default,
        show_satisfaction_badge_default: formData.show_satisfaction_badge_default,
        show_fast_shipping_badge_default: formData.show_fast_shipping_badge_default,
        payment_methods: formData.payment_methods
          .split(',')
          .map(method => method.trim())
          .filter(Boolean),
        cart_payment_icons: formData.cart_payment_icons.length
          ? formData.cart_payment_icons
          : [],
        cart_urgency_banner_text: formData.cart_urgency_banner_text,
        cart_trust_badges: formData.cart_trust_badges,
        free_shipping_threshold: Number(formData.free_shipping_threshold) || 100,
        verified_stores: Array.isArray(formData.verified_stores) ? formData.verified_stores : [],
        exit_intent_enabled: formData.exit_intent_enabled,
        exit_intent_title: formData.exit_intent_title,
        exit_intent_message: formData.exit_intent_message,
        exit_intent_offer: formData.exit_intent_offer,
        exit_intent_button_text: formData.exit_intent_button_text,
      };

      console.log('Saving full payload:', fullPayload);

      if (settings?.id) {
        const { error: updateError } = await supabase
          .from('storefront_settings')
          .update(fullPayload)
          .eq('id', settings.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('storefront_settings')
          .insert([fullPayload]);
        error = insertError;
      }

      if (error) {
        console.error('Database error with full payload:', error);
        throw new Error(`Full payload save failed: ${error.message || 'Unknown database error'}`);
      }

      toast.success('Storefront settings saved');
      refetch();
    } catch (err) {
      console.error('Error saving storefront settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

      if (errorMessage.includes('relation "public.storefront_settings" does not exist')) {
        toast.error(
          'Failed to save settings: storefront_settings table is missing. Run your database migrations / ensure the table exists.'
        );
      } else {
        toast.error(`Failed to save settings: ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Storefront CRO Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_cta_label">Primary CTA label</Label>
                <Input
                  id="primary_cta_label"
                  value={formData.primary_cta_label}
                  onChange={(e) => handleInputChange('primary_cta_label', e.target.value)}
                  placeholder="Add to Cart"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Text used on the main purchase button across the storefront.
                </p>
              </div>
              <div>
                <Label htmlFor="primary_cta_color">Primary CTA color (hex)</Label>
                <Input
                  id="primary_cta_color"
                  value={formData.primary_cta_color}
                  onChange={(e) => handleInputChange('primary_cta_color', e.target.value)}
                  placeholder="#FF8C00"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Hex color used for the main “Add to Cart” button background.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Urgency messaging</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Controls the default low-stock message behavior on product pages.
                  </p>
                </div>
                <Switch
                  checked={formData.enable_urgency_messaging}
                  onCheckedChange={(checked) => handleInputChange('enable_urgency_messaging', checked)}
                />
              </div>
              <div className="max-w-xs">
                <Label htmlFor="low_stock_threshold_default">Default low-stock threshold</Label>
                <Input
                  id="low_stock_threshold_default"
                  type="number"
                  min={0}
                  value={formData.low_stock_threshold_default}
                  onChange={(e) => handleInputChange('low_stock_threshold_default', e.target.value)}
                  placeholder="15"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  When inventory is below this number and urgency is enabled, the “Hurry, only X left” message will show, unless overridden per product.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label>Default trust badges</Label>
              <p className="text-xs text-muted-foreground mb-2">
                These control which badges are shown by default on products that do not override them individually.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.show_secure_payment_badge_default}
                    onCheckedChange={(checked) => handleInputChange('show_secure_payment_badge_default', checked)}
                  />
                  <Label className="text-sm">Secure SSL Payment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.show_satisfaction_badge_default}
                    onCheckedChange={(checked) => handleInputChange('show_satisfaction_badge_default', checked)}
                  />
                  <Label className="text-sm">Satisfaction Guarantee</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.show_fast_shipping_badge_default}
                    onCheckedChange={(checked) => handleInputChange('show_fast_shipping_badge_default', checked)}
                  />
                  <Label className="text-sm">Fast Shipping</Label>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label htmlFor="payment_methods">Payment methods shown in trust bar</Label>
              <Input
                id="payment_methods"
                value={formData.payment_methods}
                onChange={(e) => handleInputChange('payment_methods', e.target.value)}
                placeholder="Visa, Mastercard, PayPal, Apple Pay"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list. These will be rendered as payment icons/badges under the main Add to Cart button.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label>Cart page — payment icons below “Buy Now”</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose which payment method icons to show. Uncheck all to hide the row.
              </p>
              <div className="flex flex-wrap gap-4">
                {CART_PAYMENT_ICON_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cart_payment_icons.includes(opt.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...formData.cart_payment_icons, opt.id]
                          : formData.cart_payment_icons.filter((id) => id !== opt.id);
                        handleInputChange('cart_payment_icons', next);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label htmlFor="cart_urgency_banner_text">Cart urgency banner text</Label>
              <Input
                id="cart_urgency_banner_text"
                value={formData.cart_urgency_banner_text}
                onChange={(e) => handleInputChange('cart_urgency_banner_text', e.target.value)}
                placeholder="🔥 High demand: Complete your purchase before your items sell out."
              />
              <p className="text-xs text-muted-foreground">
                Text shown in the urgency banner above the cart summary. Leave empty to hide.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label>Cart trust badges</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Additional trust badges shown below payment icons on cart page.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'secure', label: 'Secure SSL' },
                  { id: 'padlock', label: 'Padlock Icon' },
                  { id: 'guarantee', label: 'Money Back Guarantee' },
                ].map((badge) => (
                  <label key={badge.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cart_trust_badges.includes(badge.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...formData.cart_trust_badges, badge.id]
                          : formData.cart_trust_badges.filter((id) => id !== badge.id);
                        handleInputChange('cart_trust_badges', next);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{badge.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label htmlFor="free_shipping_threshold">Free shipping threshold ($)</Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                min={0}
                value={formData.free_shipping_threshold}
                onChange={(e) => handleInputChange('free_shipping_threshold', e.target.value)}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Minimum subtotal for free shipping. Set to 0 to always show shipping cost.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label htmlFor="verified_stores">Verified stores (comma-separated)</Label>
              <Input
                id="verified_stores"
                value={formData.verified_stores.join(', ')}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Verified stores input change:', value);
                  const array = value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  console.log('Parsed array:', array);
                  handleInputChange('verified_stores', array);
                }}
                placeholder="GÜELL, Acme Supplies"
              />
              <p className="text-xs text-muted-foreground">
                Add the store/brand names that should show a verification badge in the UI.
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Exit-intent popup</Label>
                <Switch
                  checked={formData.exit_intent_enabled}
                  onCheckedChange={(checked) => handleInputChange('exit_intent_enabled', checked)}
                />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Show a popup when visitors try to leave the page to offer incentives or assistance.
              </p>

              {formData.exit_intent_enabled && (
                <div className="space-y-3 border-t pt-3">
                  <div>
                    <Label htmlFor="exit_intent_title">Popup title</Label>
                    <Input
                      id="exit_intent_title"
                      value={formData.exit_intent_title}
                      onChange={(e) => handleInputChange('exit_intent_title', e.target.value)}
                      placeholder="Wait! Don't Leave Yet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exit_intent_offer">Offer headline</Label>
                    <Input
                      id="exit_intent_offer"
                      value={formData.exit_intent_offer}
                      onChange={(e) => handleInputChange('exit_intent_offer', e.target.value)}
                      placeholder="Special Offer Just For You!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exit_intent_message">Message</Label>
                    <textarea
                      id="exit_intent_message"
                      value={formData.exit_intent_message}
                      onChange={(e) => handleInputChange('exit_intent_message', e.target.value)}
                      placeholder="Get 10% off your next purchase..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="exit_intent_button_text">Button text</Label>
                    <Input
                      id="exit_intent_button_text"
                      value={formData.exit_intent_button_text}
                      onChange={(e) => handleInputChange('exit_intent_button_text', e.target.value)}
                      placeholder="Claim My Discount"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save settings'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminStorefrontSettings;

