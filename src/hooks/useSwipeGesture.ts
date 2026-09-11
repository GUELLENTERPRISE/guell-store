import { useState, useCallback, useRef } from 'react';
import { useHaptics } from '@/hooks/useHaptics';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enableHaptics?: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enableHaptics = true,
}: SwipeGestureOptions) => {
  const { lightTap } = useHaptics();
  const [isSwiping, setIsSwiping] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    const deltaX = currentPos.current.x - startPos.current.x;
    const deltaY = currentPos.current.y - startPos.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY && absX > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        if (enableHaptics) lightTap();
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        if (enableHaptics) lightTap();
        onSwipeLeft();
      }
    } else if (absY > absX && absY > threshold) {
      if (deltaY > 0 && onSwipeDown) {
        if (enableHaptics) lightTap();
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        if (enableHaptics) lightTap();
        onSwipeUp();
      }
    }

    setIsSwiping(false);
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, enableHaptics, lightTap]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isSwiping,
  };
};
