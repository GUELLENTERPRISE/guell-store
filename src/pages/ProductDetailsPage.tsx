
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, ShieldCheck, BadgeCheck, Truck } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ProductHeader from "@/components/ProductHeader";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductDetailsTabs from "@/components/ProductDetailsTabs";
import ShippingInfo from "@/components/ShippingInfo";
import BottomNavigation from "@/components/BottomNavigation";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/utils/currency";
import { useTrackProductView } from "@/hooks/useBrowsingHistory";
import { QuantitySelector } from "@/components/QuantitySelector";
import { FrequentlyBoughtTogether } from "@/components/FrequentlyBoughtTogether";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";

const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isAddingToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { data: products, isLoading, error } = useProducts();
  const [activeTab, setActiveTab] = useState('home');
  const { t } = useTranslation();
  const trackView = useTrackProductView();
  const [quantity, setQuantity] = useState(1);
  const { data: storefrontSettings } = useStorefrontSettings();
  const [showStickyCta] = useState(false);
  const ctaCardRef = useRef<HTMLDivElement | null>(null);

  // Find product by slug first, then fall back to ID for backward compatibility
  const product = useMemo(() => {
    console.log('🔍 ProductDetailsPage - Looking for product:', { slug, totalProducts: products?.length || 0 });
    
    if (!products || !slug) {
      console.log('❌ Missing data:', { hasProducts: !!products, hasSlug: !!slug });
      return undefined;
    }
    
    // Log all products for debugging
    console.log('📋 Available products:', products.map(p => ({ id: p.id, name: p.name, slug: p.slug })));
    
    const foundBySlug = products.find(p => p.slug === slug);
    const foundById = products.find(p => p.id === slug);
    
    console.log('🎯 Search results:', { foundBySlug: foundBySlug?.name, foundById: foundById?.name });
    
    return foundBySlug || foundById;
  }, [products, slug]);

  const productInWishlist = product?.id ? isInWishlist(product.id) : false;
  const cartCount = cart?.length || 0;

  // Track product view
  useEffect(() => {
    if (product?.id && user) {
      trackView.mutate(product.id);
    }
  }, [product?.id, user, trackView]);

  // Extract first 155 chars of description for meta
  const seoDescription = product?.description
    ? product.description.substring(0, 155).trim() + (product.description.length > 155 ? '…' : '')
    : 'Premium quality product available at GÜELL';

  const seoTitle = product?.name
    ? `${product.name} - GÜELL`
    : 'Loading Product - GÜELL';

  // Early returns must be after all hooks are called
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <SEOHead title="Loading Product - GÜELL" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">{t('product.loading')}</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <SEOHead title="Error - GÜELL" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t('product.error')}</h2>
          <p className="text-muted-foreground mb-4">{t('product.tryAgain')}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('product.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <SEOHead title="Product Not Found - GÜELL" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/auth');
      return;
    }
    addToCart({ productId: product.id });
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      navigate('/auth');
      return;
    }
    if (productInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `Check out this product: ${product.name}`, url });
      } catch (error) {
        // Error handled silently - TODO: add proper error reporting
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Product link copied to clipboard!');
      } catch {
        // Submit rating to API
      }
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      navigate('/auth');
      return;
    }
    addToCart({ productId: product.id });
    navigate('/checkout');
  };

  const effectiveUrgencyThreshold =
    product.urgency_threshold ??
    storefrontSettings?.low_stock_threshold_default ??
    15;

  const showUrgencyMessage =
    storefrontSettings?.enable_urgency_messaging !== false &&
    product.inventory > 0 &&
    product.inventory < effectiveUrgencyThreshold;

  const primaryCtaLabel = storefrontSettings?.primary_cta_label || "Add to Cart";
  const primaryCtaColor = storefrontSettings?.primary_cta_color || "#FF8C00";

  const showSecureBadge =
    product.show_secure_payment_badge ??
    storefrontSettings?.show_secure_payment_badge_default ??
    true;
  const showSatisfactionBadge =
    product.show_satisfaction_badge ??
    storefrontSettings?.show_satisfaction_badge_default ??
    true;
  const showFastShippingBadge =
    product.show_fast_shipping_badge ??
    storefrontSettings?.show_fast_shipping_badge_default ??
    true;

  const paymentMethods =
    storefrontSettings?.payment_methods && storefrontSettings.payment_methods.length > 0
      ? storefrontSettings.payment_methods
      : ['Visa', 'Mastercard', 'PayPal'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${product.name}, ${product.brand || ''}, ${product.categories?.name || ''}, ecommerce, online shopping`}
        image={product.images?.[0]}
        type="product"
        product={{
          name: product.name,
          description: product.description,
          price: product.price,
          original_price: product.original_price,
          brand: product.brand,
          inventory: product.inventory,
          images: product.images,
          image_alt_text: product.image_alt_text,
          rating: product.rating,
          review_count: product.review_count,
          slug: product.slug,
        }}
      />

      <ProductHeader
        productName={product.name}
        onBack={() => navigate('/')}
        onShare={handleShare}
        onWishlistToggle={handleWishlistToggle}
        isInWishlist={productInWishlist}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <ProductImageGallery 
              images={product.images}
              videos={product.videos}
              productName={product.name}
              imageAltTexts={product.image_alt_text}
            />
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProductInfo
                  product={product}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={isAddingToCart}
                />
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div ref={ctaCardRef} className="border rounded-lg p-4 bg-card shadow-sm space-y-4">
                    <div className="mb-4">
                      <div className="text-sm text-green-600 font-medium">In Stock</div>
                      <div className="text-sm text-muted-foreground">{product.inventory} available</div>
                      {showUrgencyMessage && (
                        <div className="mt-1 text-sm font-semibold text-red-600">
                          🔥 Hurry! Only {product.inventory} units left in stock
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium block mb-2">Quantity:</label>
                      <QuantitySelector 
                        maxQuantity={product.inventory}
                        initialQuantity={quantity}
                        onQuantityChange={setQuantity}
                      />
                    </div>

                    <Button 
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || product.inventory === 0}
                      className="w-full mb-2 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all bg-blue-600 dark:bg-blue-700"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isAddingToCart ? 'Adding...' : primaryCtaLabel}</span>
                    </Button>

                    <Button 
                      onClick={handleBuyNow}
                      className="w-full mb-4"
                    >
                      Buy Now
                    </Button>

                    {/* Trust bar with payment methods */}
                    <div className="mb-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {paymentMethods.map((method) => (
                          <span
                            key={method}
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-background"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Secure and encrypted transaction
                      </p>
                    </div>

                    <div className="mt-2 border-t pt-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {showSecureBadge && (
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Secure SSL Payment</span>
                          </div>
                        )}
                        {showSatisfactionBadge && (
                          <div className="flex items-center gap-1">
                            <BadgeCheck className="w-4 h-4 text-emerald-600" />
                            <span>Satisfaction Guarantee</span>
                          </div>
                        )}
                        {showFastShippingBadge && (
                          <div className="flex items-center gap-1">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            <span>Fast Shipping</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                      <ShippingInfo product={product} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <FrequentlyBoughtTogether currentProduct={product} />
          
          <ProductDetailsTabs product={product} />
        </div>
      </div>

      {/* Sticky header CTA (desktop and tablet) */}
      {showStickyCta && (
        <div className="fixed top-0 left-0 right-0 z-40 hidden md:block bg-background/95 border-b shadow-sm backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
              <p className="text-sm font-semibold truncate">{product.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-emerald-700">
                {formatPrice(product.price)}
              </span>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.inventory === 0}
                className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all bg-blue-600 dark:bg-blue-700"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isAddingToCart ? 'Adding...' : primaryCtaLabel}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        cartCount={cartCount}
      />
    </div>
  );
};

export default ProductDetailsPage;
