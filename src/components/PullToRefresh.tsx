import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
}

const PullToRefresh = ({ children, onRefresh }: PullToRefreshProps) => {
  const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh,
  });

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center transition-transform duration-200 z-50"
        style={{
          transform: `translateY(${Math.min(pullDistance - 40, 40)}px)`,
          opacity: progress,
        }}
      >
        <div className={`bg-primary text-primary-foreground rounded-full p-2 shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
          <RefreshCw 
            className="w-5 h-5" 
            style={{ 
              transform: `rotate(${progress * 360}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
            }} 
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
