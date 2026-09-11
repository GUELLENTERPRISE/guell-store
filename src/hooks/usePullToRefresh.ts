import { useState, useCallback, useRef, useEffect } from 'react';
import { useHaptics } from '@/hooks/useHaptics';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasReachedThreshold = useRef(false);
  const { mediumTap, successFeedback } = useHaptics();

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = (currentY - startY.current) / resistance;
    
    if (diff > 0 && window.scrollY === 0) {
      const newDistance = Math.min(diff, threshold * 1.5);
      setPullDistance(newDistance);
      
      // Haptic feedback when threshold is reached
      if (newDistance >= threshold && !hasReachedThreshold.current) {
        hasReachedThreshold.current = true;
        mediumTap();
      } else if (newDistance < threshold) {
        hasReachedThreshold.current = false;
      }
      
      if (diff > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, isRefreshing, resistance, threshold, mediumTap]);

  const handleTouchEnd = useCallback(async () => {
    hasReachedThreshold.current = false;
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      successFeedback();
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh, successFeedback]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    progress: Math.min(pullDistance / threshold, 1),
  };
};
