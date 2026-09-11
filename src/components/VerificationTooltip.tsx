import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface VerificationTooltipProps {
  showTooltip: boolean;
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const VerificationTooltip: React.FC<VerificationTooltipProps> = ({
  showTooltip,
  className = '',
  iconClassName = 'text-emerald-500',
  size = 'sm'
}) => {
  const [hoveredTooltip, setHoveredTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleTooltipShow = (e: React.MouseEvent | React.TouchEvent) => {
    if (!showTooltip) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const tooltipWidth = 320; // Increased width for full message
    const tooltipHeight = 60;
    const margin = 10;
    
    let placement: 'top' | 'bottom' = 'top';
    let top = rect.top - tooltipHeight - margin;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    
    // Check if tooltip would go above viewport
    if (top < window.scrollY) {
      placement = 'bottom';
      top = rect.bottom + margin;
    }
    
    // Check if tooltip would go below viewport
    if (top + tooltipHeight > window.scrollY + window.innerHeight) {
      placement = 'top';
      top = rect.top - tooltipHeight - margin;
    }
    
    // Check if tooltip would go left of viewport
    if (left < window.scrollX) {
      left = window.scrollX + margin;
    }
    
    // Check if tooltip would go right of viewport
    if (left + tooltipWidth > window.scrollX + window.innerWidth) {
      left = window.scrollX + window.innerWidth - tooltipWidth - margin;
    }
    
    setTooltipPosition({ top, left, placement });
    setHoveredTooltip(true);
  };

  const handleTooltipHide = () => {
    setHoveredTooltip(false);
    setTooltipPosition(null);
  };

  if (!showTooltip) {
    return <CheckCircle2 className={`${sizeClasses[size]} ${iconClassName} ${className}`} />;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={(e) => !isMobile && handleTooltipShow(e)}
        onMouseLeave={() => !isMobile && handleTooltipHide()}
        onTouchStart={(e) => isMobile && handleTooltipShow(e)}
        onTouchEnd={() => isMobile && handleTooltipHide()}
        className="p-0 m-0 bg-transparent border-0 cursor-pointer"
      >
        <CheckCircle2 className={`${sizeClasses[size]} ${iconClassName}`} />
      </button>
      <AnimatePresence>
        {hoveredTooltip && tooltipPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: 9999,
              padding: '8px 12px',
            }}
            className="px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-normal max-w-[300px] leading-relaxed"
          >
            Verified Mark: Guarantee of authenticity and quality certified by GÜELL.
            <div 
              className={`absolute w-0 h-0 border-4 ${
                tooltipPosition.placement === 'top' 
                  ? 'border-l-transparent border-r-transparent border-t-black border-b-transparent'
                  : 'border-l-transparent border-r-transparent border-b-black border-t-transparent'
              }`}
              style={{
                [tooltipPosition.placement === 'top' ? 'bottom' : 'top']: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerificationTooltip;
