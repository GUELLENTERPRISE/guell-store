import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PinchZoomImage from './PinchZoomImage';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

interface SwipeableProductGalleryProps {
  images: string[];
  productName: string;
  imageAltTexts?: string[];
}

const SwipeableProductGallery = ({ images, productName, imageAltTexts }: SwipeableProductGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const { handlers } = useSwipeGesture({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
    threshold: 50,
  });

  // Early return must be before any other logic
  if (!images.length) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
        <span className="text-muted-foreground">No images</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Main Image with Pinch Zoom */}
      <div
        className="aspect-square bg-background rounded-lg overflow-hidden relative"
        {...handlers}
      >
        <PinchZoomImage
          src={images[currentIndex]}
          alt={imageAltTexts?.[currentIndex] || `${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {/* Navigation Arrows - Hidden on mobile, shown on desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-md hidden md:flex items-center justify-center transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-md hidden md:flex items-center justify-center transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? 'border-[#FF8C00] ring-2 ring-[#FF8C00]/40'
                : 'border-transparent hover:border-muted-foreground/30'
            }`}
          >
            <img
              src={image}
              alt={imageAltTexts?.[index] || `${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {/* Swipe hint for mobile */}
      <p className="text-center text-xs text-muted-foreground mt-2 md:hidden">
        Swipe to browse • Pinch to zoom
      </p>
    </div>
  );
};

export default SwipeableProductGallery;
