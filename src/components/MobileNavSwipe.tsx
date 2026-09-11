import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileNavSwipeProps {
  children: ReactNode;
  canGoBack?: boolean;
  onSwipeRight?: () => void;
}

const MobileNavSwipe = ({ children, canGoBack = true, onSwipeRight }: MobileNavSwipeProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { handlers } = useSwipeGesture({
    onSwipeRight: () => {
      if (onSwipeRight) {
        onSwipeRight();
      } else if (canGoBack) {
        navigate(-1);
      }
    },
    threshold: 100,
  });

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div {...handlers} className="min-h-screen">
      {children}
    </div>
  );
};

export default MobileNavSwipe;
