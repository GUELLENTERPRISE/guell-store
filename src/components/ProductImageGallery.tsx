import { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipeableProductGallery from "./SwipeableProductGallery";
import PinchZoomImage from "./PinchZoomImage";

interface ProductImageGalleryProps {
  images: string[];
  videos?: string[];
  productName: string;
  imageAltTexts?: string[];
}

const ProductImageGallery = ({ images, videos, productName, imageAltTexts }: ProductImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  
  // Combine images and videos for display
  const allMedia = [...images, ...(videos || [])];
  const isVideo = (url: string) => videos?.includes(url);

  // Early return for mobile must be before any other logic that creates different hook structure
  if (isMobile === undefined || isMobile) {
    return <SwipeableProductGallery images={images} productName={productName} imageAltTexts={imageAltTexts} />;
  }

  const getAltText = (index: number) => {
    if (imageAltTexts && imageAltTexts[index]) return imageAltTexts[index];
    return `${productName} - Image ${index + 1}`;
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => (prev - 1 + allMedia.length) % allMedia.length);
    handleReset();
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev + 1) % allMedia.length);
    handleReset();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * (zoomLevel - 1) * -100;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * (zoomLevel - 1) * -100;
    setPosition({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Horizontal layout with thumbnails on left and main image on right */}
      <div className="flex gap-4">
        {/* Thumbnail column on the left */}
        {allMedia.length > 1 && (
          <div className="flex flex-col gap-2 w-16">
            {allMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                  index === selectedImageIndex 
                    ? 'border-[#FF8C00] ring-2 ring-[#FF8C00]/50' 
                    : 'border-border'
                } transition-all`}
              >
                {isVideo(media) ? (
                  <video 
                    src={media} 
                    className="w-full h-full object-contain"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={media} 
                    alt={getAltText(index)}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main media container - aligned with thumbnails */}
        <div className="flex-1">
          <div className="aspect-square bg-background border rounded-lg overflow-hidden p-4 max-w-md">
            {isVideo(allMedia[selectedImageIndex]) ? (
              <video 
                src={allMedia[selectedImageIndex]} 
                className="w-full h-full object-contain cursor-pointer"
                controls
                onClick={() => setIsFullViewOpen(true)}
              />
            ) : (
              <img 
                src={allMedia[selectedImageIndex] || '/placeholder.svg'} 
                alt={getAltText(selectedImageIndex)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsFullViewOpen(true)}
                loading="lazy"
              />
            )}
          </div>
          <div className="text-center mt-2">
            <button 
              onClick={() => setIsFullViewOpen(true)}
              className="text-primary hover:text-primary/80 text-sm hover:underline"
            >
              Click to see full view
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Full view modal with zoom controls */}
      <Dialog open={isFullViewOpen} onOpenChange={(open) => {
        setIsFullViewOpen(open);
        if (!open) handleReset();
      }}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-black/95">
          <div className="relative h-[85vh] flex flex-col">
            {/* Top toolbar */}
            <div className="flex items-center justify-between p-4 bg-black/50">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">
                  {selectedImageIndex + 1} / {allMedia.length}
                </span>
              </div>
              
              {/* Zoom controls */}
              {!isVideo(allMedia[selectedImageIndex]) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="text-white hover:bg-card/10 hover:text-foreground"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-white text-sm min-w-[60px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 4}
                    className="text-white hover:bg-card/10 hover:text-foreground"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-white hover:bg-card/10 hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullViewOpen(false)}
                className="text-white hover:bg-card/10 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Main content area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              {/* Previous button */}
              {allMedia.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevImage}
                  className="absolute left-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {/* Image/Video display */}
              {isVideo(allMedia[selectedImageIndex]) ? (
                <video 
                  src={allMedia[selectedImageIndex]} 
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center cursor-move overflow-hidden"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => zoomLevel > 1 && setPosition({ x: 0, y: 0 })}
                  onDoubleClick={() => zoomLevel === 1 ? handleZoomIn() : handleReset()}
                >
                  <img 
                    src={allMedia[selectedImageIndex] || '/placeholder.svg'} 
                    alt={getAltText(selectedImageIndex)}
                    className="max-w-full max-h-full object-contain transition-transform duration-150"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}%, ${position.y / zoomLevel}%)`,
                    }}
                    draggable={false}
                  />
                </div>
              )}

              {/* Next button */}
              {allMedia.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextImage}
                  className="absolute right-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Bottom thumbnail strip */}
            {allMedia.length > 1 && (
              <div className="flex justify-center gap-2 p-4 bg-black/50 overflow-x-auto">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      handleReset();
                    }}
                    className={`flex-shrink-0 w-14 h-14 rounded border-2 overflow-hidden transition-all ${
                      index === selectedImageIndex 
                        ? 'border-[#FF8C00] ring-2 ring-[#FF8C00]/50' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isVideo(media) ? (
                      <video 
                        src={media} 
                        className="w-full h-full object-contain"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={media} 
                        alt={getAltText(index)}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Help text */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-xs">
              Double-click to zoom • Hover to pan when zoomed
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageGallery;
