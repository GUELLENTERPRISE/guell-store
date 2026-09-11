import React, { useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/currency';

const WishlistSharing: React.FC = () => {
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const [shareToken, setShareToken] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Early return must be before any other logic
  if (!user) return null;

  const generateShareLink = async () => {
    if (!user) return;

    try {
      // Generate a random share token
      const token = Math.random().toString(36).substring(2, 15);
      
      // Calculate total value and get product details for OpenGraph
      const totalValue = wishlist.reduce((sum, item) => sum + item.products.price, 0);
      const productNames = wishlist.slice(0, 3).map(item => item.products.name).join(', ');
      const shareDescription = wishlist.length === 1 
        ? `Check out this item on my wishlist: ${productNames}`
        : wishlist.length <= 3
        ? `Check out my wishlist with ${wishlist.length} items: ${productNames}`
        : `Check out my wishlist with ${wishlist.length} items including: ${productNames} and more!`;
      
      const { error } = await supabase
        .from('wishlist_shares')
        .insert({
          wishlist_owner_id: user.id,
          share_token: token,
          is_public: isPublic,
          share_title: `${user.email?.split('@')[0]}'s Wishlist (${wishlist.length} items)`,
          share_description: shareDescription,
          share_image: wishlist[0]?.products.images[0] || '/lovable-uploads/5b8befac-98b9-4eca-81c7-5d4bdcbac1b2.png',
          total_value: totalValue,
        });

      if (error) throw error;

      setShareToken(token);
      toast.success('Share link generated!');
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    }
  };

  const copyToClipboard = () => {
    const shareUrl = `${window.location.origin}/wishlist/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const shareUrl = `${window.location.origin}/wishlist/shared/${shareToken}`;
    const totalValue = wishlist.reduce((sum, item) => sum + item.products.price, 0);
    const text = `Check out my wishlist with ${wishlist.length} items worth ${formatPrice(totalValue)}!`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
    };
    
    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Share2 className="h-5 w-5" />
          Share Your Wishlist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Privacy Settings</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="public-wishlist"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="public-wishlist" className="text-sm text-muted-foreground">
              Make wishlist public (anyone with the link can view)
            </label>
          </div>
        </div>

        {!shareToken ? (
          <Button
            onClick={generateShareLink}
            disabled={wishlist.length === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Generate Share Link
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/wishlist/shared/${shareToken}`}
                  readOnly
                  className="bg-background text-foreground border-border"
                />
                <Button
                  onClick={copyToClipboard}
                  size="icon"
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Social Sharing Buttons */}
            <div className="space-y-2">
              <Label className="text-foreground">Share on Social Media</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => shareOnSocial('facebook')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareOnSocial('twitter')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-sky-200 text-sky-600 hover:bg-sky-50"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareOnSocial('whatsapp')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-green-200 text-green-600 hover:bg-green-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview:</p>
              <div className="bg-card rounded p-3 border">
                <div className="flex gap-3">
                  <img 
                    src={wishlist[0]?.products.images[0] || '/placeholder.svg'} 
                    alt="Product preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">
                      {user.email?.split('@')[0]}'s Wishlist ({wishlist.length} items)
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {wishlist.slice(0, 3).map(item => item.products.name).join(', ')}
                      {wishlist.length > 3 && ` and ${wishlist.length - 3} more...`}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-1">
                      {formatPrice(wishlist.reduce((sum, item) => sum + item.products.price, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Share your wishlist with friends and family!</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Anyone with the link can view your wishlist</li>
            <li>Items are always up-to-date</li>
            <li>Perfect for gift-giving occasions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistSharing;
