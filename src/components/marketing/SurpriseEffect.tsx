import React, { useEffect, useState } from 'react';
import { LoyaltyTier } from '@/hooks/useLoyaltySystem';

interface SurpriseEffectProps {
  tier: LoyaltyTier;
  isVisible: boolean;
  onClose: () => void;
}

const SurpriseEffect: React.FC<SurpriseEffectProps> = ({ tier, isVisible, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Start confetti first
      setShowConfetti(true);
      
      // Show message after 500ms
      setTimeout(() => {
        setShowMessage(true);
      }, 500);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        onClose();
      }, 5000);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'bronze': return 'medalla de bronce';
      case 'silver': return 'medalla de plata';
      case 'gold': return 'medalla de oro';
      case 'platinum': return 'corona de platino';
      default: return 'trofeo';
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'bronze': return 'from-amber-500 to-amber-700';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const getTierEmoji = (tierId: string) => {
    switch (tierId) {
      case 'bronze': return 'medalla';
      case 'silver': return 'medalla';
      case 'gold': return 'medalla';
      case 'platinum': return 'corona';
      default: return 'trofeo';
    }
  };

  return (
    <>
      {/* Confetti Background */}
      {showConfetti && <ConfettiAnimation />}
      
      {/* Main Surprise Message */}
      {showMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-8 max-w-md mx-4 text-center text-white shadow-2xl transform scale-100 animate-bounce">
            {/* Icon */}
            <div className="text-6xl mb-4 animate-spin">
              {tier.id === 'platinum' ? 'crown' : 'medal'}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold mb-2 animate-pulse">
              ¡Felicidades!
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-xl mb-4">
              Has desbloqueado el nivel {tier.name}
            </h2>
            
            {/* Benefits */}
            <div className="bg-card bg-opacity-20 rounded-2xl p-4 mb-4">
              <h3 className="font-semibold mb-2">Tus nuevos beneficios:</h3>
              <ul className="text-sm space-y-1">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center justify-center gap-2">
                    <span className="text-yellow-300">star</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Points Multiplier */}
            <div className="bg-card bg-opacity-20 rounded-2xl p-4 mb-4">
              <div className="text-2xl font-bold">
                {tier.pointMultiplier}x Multiplicador de Puntos
              </div>
              <div className="text-sm opacity-90">
                ¡Ahora ganas {tier.pointMultiplier} veces más puntos!
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-card text-purple-600 font-semibold py-3 px-6 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105"
              >
                ¡Genial! Ver mis beneficios
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-full hover:bg-card hover:text-purple-600 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ConfettiAnimation: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      style: {
        position: 'fixed' as const,
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`,
        top: '-20px',
        opacity: 1,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `confettiFall ${2 + Math.random() * 3}s linear`,
        zIndex: 9998,
        borderRadius: Math.random() > 0.5 ? '50%' : '0%'
      }
    }));
    
    setParticles(newParticles);
    
    // Clean up after animation
    const timeout = setTimeout(() => {
      setParticles([]);
    }, 6000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes confettiFall {
            to {
              top: 100vh;
              opacity: 0;
              transform: rotate(${Math.random() * 720}deg);
            }
          }
        `}
      </style>
      {particles.map((particle) => (
        <div key={particle.id} style={particle.style} />
      ))}
    </>
  );
};

// Hook for triggering surprise effects
export const useSurpriseEffect = () => {
  const [currentTier, setCurrentTier] = useState<LoyaltyTier | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const triggerSurpriseEffect = (tier: LoyaltyTier) => {
    setCurrentTier(tier);
    setIsVisible(true);
  };

  const closeSurpriseEffect = () => {
    setIsVisible(false);
    setCurrentTier(null);
  };

  return {
    triggerSurpriseEffect,
    closeSurpriseEffect,
    currentTier,
    isVisible
  };
};

// Component to wrap the surprise effect
export const SurpriseEffectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { triggerSurpriseEffect, closeSurpriseEffect, currentTier, isVisible } = useSurpriseEffect();

  return (
    <>
      {children}
      {currentTier && (
        <SurpriseEffect
          tier={currentTier}
          isVisible={isVisible}
          onClose={closeSurpriseEffect}
        />
      )}
    </>
  );
};

export default SurpriseEffect;
