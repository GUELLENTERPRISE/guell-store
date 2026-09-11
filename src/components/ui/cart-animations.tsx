import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

// Hook for cart animations
export const useCartAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const triggerAddAnimation = () => {
    setIsAnimating(true);
    setQuantity(prev => prev + 1);
    
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const triggerRemoveAnimation = () => {
    setIsAnimating(true);
    setQuantity(prev => Math.max(0, prev - 1));
    
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([30]);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  return {
    isAnimating,
    quantity,
    triggerAddAnimation,
    triggerRemoveAnimation,
    setQuantity
  };
};

// Animated Quantity Badge
export const AnimatedQuantityBadge: React.FC<{ 
  quantity: number; 
  isAnimating?: boolean;
  className?: string;
}> = ({ quantity, isAnimating = false, className = '' }) => {
  return (
    <div 
      className={`
        relative inline-flex items-center justify-center
        min-w-[24px] h-6 px-2 text-xs font-bold text-white
        bg-gradient-to-r from-orange-500 to-orange-600
        rounded-full shadow-md
        transition-all duration-300
        ${isAnimating ? 'animate-bounce scale-125' : 'scale-100'}
        ${className}
      `}
      style={{
        animation: isAnimating ? 'popIn 0.6s ease-out' : 'none'
      }}
    >
      {quantity}
      
      {/* Pulse effect */}
      {isAnimating && (
        <div 
          className="absolute inset-0 bg-orange-500 rounded-full"
          style={{
            animation: 'pulse 0.6s ease-out'
          }}
        />
      )}
    </div>
  );
};

// Animated Cart Icon
export const AnimatedCartIcon: React.FC<{
  itemCount: number;
  isAnimating?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ itemCount, isAnimating = false, onClick, className = '' }) => {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
  }, [isAnimating]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onClick}
        className={`
          relative p-2 rounded-lg bg-card shadow-md
          hover:shadow-lg transition-all duration-300
          hover:scale-105 active:scale-95
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      >
        <ShoppingCart className="w-6 h-6 text-orange-600" />
        
        {/* Quantity Badge */}
        {itemCount > 0 && (
          <AnimatedQuantityBadge 
            quantity={itemCount} 
            isAnimating={isAnimating}
            className="absolute -top-2 -right-2"
          />
        )}
      </button>
      
      {/* Particle Effects */}
      {showParticles && <CartParticles />}
    </div>
  );
};

// Particle Effects for Cart
const CartParticles: React.FC = () => {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 50,
    duration: 800 + i * 100
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-orange-500 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `particleFloat ${particle.duration}ms ease-out ${particle.delay}ms forwards`
          }}
        />
      ))}
    </div>
  );
};

// Animated Quantity Controls
export const AnimatedQuantityControls: React.FC<{
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  className?: string;
}> = ({ quantity, onIncrease, onDecrease, min = 0, max = 99, className = '' }) => {
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [isDecreasing, setIsDecreasing] = useState(false);

  const handleIncrease = () => {
    if (quantity >= max) return;
    
    setIsIncreasing(true);
    onIncrease();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
    
    setTimeout(() => setIsIncreasing(false), 300);
  };

  const handleDecrease = () => {
    if (quantity <= min) return;
    
    setIsDecreasing(true);
    onDecrease();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([30]);
    }
    
    setTimeout(() => setIsDecreasing(false), 300);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className={`
          p-2 rounded-lg border-2 border-gray-300
          hover:border-orange-500 hover:bg-orange-50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isDecreasing ? 'scale-75 bg-orange-100 border-orange-500' : 'hover:scale-105'}
        `}
      >
        <Minus className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div 
        className={`
          w-12 h-12 flex items-center justify-center
          bg-gradient-to-r from-orange-100 to-orange-200
          border-2 border-orange-300 rounded-lg
          font-bold text-orange-800 text-lg
          transition-all duration-300
          ${isIncreasing || isDecreasing ? 'scale-110' : 'scale-100'}
        `}
        style={{
          animation: (isIncreasing || isDecreasing) ? 'quantityChange 0.3s ease-out' : 'none'
        }}
      >
        {quantity}
      </div>
      
      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        className={`
          p-2 rounded-lg border-2 border-gray-300
          hover:border-orange-500 hover:bg-orange-50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isIncreasing ? 'scale-75 bg-orange-100 border-orange-500' : 'hover:scale-105'}
        `}
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

// Add to Cart Button with Animation
export const AnimatedAddToCartButton: React.FC<{
  onClick: () => void;
  isAdded?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}> = ({ onClick, isAdded = false, isLoading = false, children, className = '' }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isAdded || isLoading) return;
    
    setIsAnimating(true);
    onClick();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isAdded || isLoading}
      className={`
        relative px-6 py-3 rounded-lg font-semibold
        transition-all duration-300
        ${isAdded 
          ? 'bg-green-500 text-white cursor-default' 
          : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
        }
        ${isAnimating ? 'scale-95' : 'hover:scale-105 active:scale-95'}
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
        ${className}
      `}
      style={{
        animation: isAnimating ? 'addToCart 0.6s ease-out' : 'none'
      }}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Agregando...
        </div>
      ) : isAdded ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-card rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
          ¡Agregado!
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          {children || 'Agregar al Carrito'}
        </div>
      )}
      
      {/* Ripple Effect */}
      {isAnimating && (
        <div 
          className="absolute inset-0 bg-card opacity-30 rounded-lg"
          style={{
            animation: 'ripple 0.6s ease-out'
          }}
        />
      )}
    </button>
  );
};

// Cart Item Animation
export const AnimatedCartItem: React.FC<{
  children: React.ReactNode;
  isRemoving?: boolean;
  className?: string;
}> = ({ children, isRemoving = false, className = '' }) => {
  return (
    <div 
      className={`
        transition-all duration-500
        ${isRemoving ? 'opacity-0 transform -translate-x-full scale-0.8' : 'opacity-100 transform translate-x-0 scale-100'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// CSS Animations
export const CartAnimationStyles: React.FC = () => {
  return (
    <style>
      {`
        @keyframes popIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes particleFloat {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, -20px)) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes quantityChange {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes addToCart {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(0.95);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        .cart-item-enter {
          animation: slideInRight 0.4s ease-out;
        }
        
        .cart-item-exit {
          animation: slideOutRight 0.4s ease-out;
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}
    </style>
  );
};

export default CartAnimationStyles;
