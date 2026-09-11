import { useState, useRef, useCallback } from 'react';

interface PinchZoomImageProps {
  src: string;
  alt: string;
  className?: string;
}

const PinchZoomImage = ({ src, alt, className = '' }: PinchZoomImageProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDistance = useRef(0);
  const initialScale = useRef(1);
  const lastPosition = useRef({ x: 0, y: 0 });

  const getDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const getCenter = (touches: React.TouchList) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);
      initialDistance.current = getDistance(e.touches);
      initialScale.current = scale;
      lastPosition.current = position;
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const newScale = Math.min(
        Math.max(initialScale.current * (currentDistance / initialDistance.current), 1),
        4
      );
      setScale(newScale);

      // Calculate pan with pinch
      if (newScale > 1) {
        const center = getCenter(e.touches);
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const centerX = center.x - rect.left - rect.width / 2;
          const centerY = center.y - rect.top - rect.height / 2;
          setPosition({
            x: Math.max(Math.min(centerX * (1 - 1 / newScale), rect.width / 2), -rect.width / 2),
            y: Math.max(Math.min(centerY * (1 - 1 / newScale), rect.height / 2), -rect.height / 2),
          });
        }
      }
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan when zoomed
      const touch = e.touches[0];
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const maxX = (rect.width * (scale - 1)) / 2;
        const maxY = (rect.height * (scale - 1)) / 2;
        setPosition((prev) => ({
          x: Math.max(Math.min(prev.x + (touch.clientX - lastPosition.current.x) * 0.5, maxX), -maxX),
          y: Math.max(Math.min(prev.y + (touch.clientY - lastPosition.current.y) * 0.5, maxY), -maxY),
        }));
        lastPosition.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  }, [isPinching, scale]);

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
    if (scale <= 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  }, [scale]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden touch-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain transition-transform duration-100"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
        }}
        draggable={false}
      />
      {scale > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

export default PinchZoomImage;
