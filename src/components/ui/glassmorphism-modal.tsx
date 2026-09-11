import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassmorphismModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  backdropClassName?: string;
}

const GlassmorphismModal: React.FC<GlassmorphismModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
  backdropClassName = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "backdrop-blur-sm bg-black/20",
          "transition-all duration-300 ease-out",
          backdropClassName
        )}
        onClick={handleBackdropClick}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Modal content with glassmorphism */}
        <div
          ref={modalRef}
          className={cn(
            "relative w-full rounded-2xl shadow-2xl",
            "bg-card/80 backdrop-blur-xl border border-white/20",
            "transition-all duration-300 ease-out",
            "transform scale-100 opacity-100",
            sizeClasses[size],
            className
          )}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Glass reflection effect */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-50 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
            }}
          />

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              {title && (
                <h2 
                  id="modal-title"
                  className="text-xl font-semibold text-foreground"
                >
                  {title}
                </h2>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    "hover:bg-card/50 hover:scale-110 active:scale-95",
                    "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 relative">
            {/* Inner glass effect for content */}
            <div 
              className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
              }}
            />
            
            {/* Actual content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphism styles */}
      <style>
        {`
          @keyframes modalSlideIn {
            0% {
              transform: scale(0.9) translateY(20px);
              opacity: 0;
            }
            100% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes modalSlideOut {
            0% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
            100% {
              transform: scale(0.9) translateY(20px);
              opacity: 0;
            }
          }
          
          @keyframes backdropFadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          
          @keyframes backdropFadeOut {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
          
          .glassmorphism-modal-enter {
            animation: modalSlideIn 0.3s ease-out;
          }
          
          .glassmorphism-modal-exit {
            animation: modalSlideOut 0.3s ease-out;
          }
          
          .glassmorphism-backdrop-enter {
            animation: backdropFadeIn 0.3s ease-out;
          }
          
          .glassmorphism-backdrop-exit {
            animation: backdropFadeOut 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
};

// Glassmorphism Drawer (for side panels)
export const GlassmorphismDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, position, children, className = '' }) => {
  const positionClasses = {
    left: 'left-0 transform -translate-x-full',
    right: 'right-0 transform translate-x-full'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          "backdrop-blur-sm bg-black/20"
        )}
        onClick={onClose}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
        }}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 h-full w-80 z-50 transition-all duration-300 ease-out",
          "bg-card/80 backdrop-blur-xl border border-white/20",
          positionClasses[position],
          isOpen ? "translate-x-0" : "",
          className
        )}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: position === 'right' 
            ? '-25px 0 50px -12px rgba(0, 0, 0, 0.25)' 
            : '25px 0 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Glass reflection */}
        <div 
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

// Glassmorphism Card (for smaller overlays)
export const GlassmorphismCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'strong';
}> = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-card/60 backdrop-blur-lg border border-white/30',
    subtle: 'bg-card/40 backdrop-blur-md border border-white/20',
    strong: 'bg-card/80 backdrop-blur-xl border border-white/40'
  };

  return (
    <div
      className={cn(
        "rounded-xl shadow-lg transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02]",
        variantStyles[variant],
        className
      )}
      style={{
        backdropFilter: variant === 'strong' ? 'blur(20px)' : variant === 'default' ? 'blur(12px)' : 'blur(8px)',
        WebkitBackdropFilter: variant === 'strong' ? 'blur(20px)' : variant === 'default' ? 'blur(12px)' : 'blur(8px)',
        backgroundColor: variant === 'strong' ? 'rgba(255, 255, 255, 0.8)' : variant === 'default' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Glass reflection */}
      <div 
        className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassmorphismModal;
