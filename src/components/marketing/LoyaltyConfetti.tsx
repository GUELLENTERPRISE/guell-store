import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Star, Crown, Medal, Gift } from 'lucide-react';
import { useAudioUX } from '@/utils/audio-ux';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  lifetime: number;
}

interface LoyaltyTier {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  confettiColors: string[];
}

interface LoyaltyConfettiProps {
  tier: LoyaltyTier;
  isVisible: boolean;
  onComplete?: () => void;
  intensity?: 'low' | 'medium' | 'high' | 'epic';
}

const LoyaltyConfetti: React.FC<LoyaltyConfettiProps> = ({
  tier,
  isVisible,
  onComplete,
  intensity = 'medium'
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { playSound } = useAudioUX();

  // GÜELL color palette
  const guellColors = {
    orange: '#f97316',
    orangeDark: '#ea580c',
    orangeLight: '#fb923c',
    yellow: '#fbbf24',
    yellowDark: '#f59e0b',
    red: '#ef4444',
    redDark: '#dc2626',
    purple: '#8b5cf6',
    purpleDark: '#7c3aed',
    green: '#10b981',
    greenDark: '#059669',
    blue: '#3b82f6',
    blueDark: '#2563eb'
  };

  const getTierColors = (tierId: string): string[] => {
    switch (tierId) {
      case 'bronze':
        return [guellColors.orange, guellColors.orangeDark, guellColors.orangeLight, guellColors.yellow, guellColors.yellowDark];
      case 'silver':
        return [guellColors.blue, guellColors.blueDark, '#e5e7eb', '#9ca3af', '#f3f4f6'];
      case 'gold':
        return [guellColors.yellow, guellColors.yellowDark, '#fbbf24', '#fde047', '#fef3c7'];
      case 'platinum':
        return [guellColors.purple, guellColors.purpleDark, '#e9d5ff', '#c084fc', '#f3e8ff'];
      default:
        return Object.values(guellColors);
    }
  };

  const getParticleCount = (intensity: string): number => {
    switch (intensity) {
      case 'low': return 50;
      case 'medium': return 100;
      case 'high': return 200;
      case 'epic': return 500;
      default: return 100;
    }
  };

  const createParticle = (index: number, total: number): ConfettiParticle => {
    const colors = getTierColors(tier.id);
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    
    // Create burst pattern from center
    const angle = (index / total) * Math.PI * 2;
    const velocity = 5 + Math.random() * 10;
    
    return {
      id: Date.now() + index,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 5 - Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      lifetime: 2000 + Math.random() * 1000
    };
  };

  useEffect(() => {
    if (isVisible) {
      // Play celebration sound
      playSound('level-up', 0.5);
      
      // Create particles
      const particleCount = getParticleCount(intensity);
      const newParticles = Array.from({ length: particleCount }, (_, i) => createParticle(i, particleCount));
      setParticles(newParticles);
      
      // Show message after particles start
      setTimeout(() => setShowMessage(true), 300);
      
      // Clean up after animation
      setTimeout(() => {
        setParticles([]);
        setShowMessage(false);
        onComplete?.();
      }, 3000);
    }
  }, [isVisible, tier, intensity, playSound, onComplete]);

  useEffect(() => {
    if (!isVisible || particles.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const updatedParticles = particles.map(particle => {
        // Update physics
        const updated = {
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.3, // gravity
          rotation: particle.rotation + particle.rotationSpeed,
          opacity: Math.max(0, particle.opacity - 0.01),
          lifetime: particle.lifetime - 16
        };

        // Draw particle
        ctx.save();
        ctx.globalAlpha = updated.opacity;
        ctx.translate(updated.x, updated.y);
        ctx.rotate((updated.rotation * Math.PI) / 180);
        ctx.fillStyle = updated.color;

        if (updated.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, updated.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (updated.shape === 'square') {
          ctx.fillRect(-updated.size / 2, -updated.size / 2, updated.size, updated.size);
        } else if (updated.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -updated.size / 2);
          ctx.lineTo(-updated.size / 2, updated.size / 2);
          ctx.lineTo(updated.size / 2, updated.size / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        return updated;
      }).filter(p => p.lifetime > 0 && p.opacity > 0);

      setParticles(updatedParticles);

      if (updatedParticles.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, particles]);

  if (!isVisible) return null;

  return (
    <>
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Tier Achievement Message */}
      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-8 shadow-2xl max-w-md mx-4 text-center transform animate-bounce border-2 border-orange-200">
            {/* Tier Icon */}
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg">
              {tier.icon}
            </div>
            
            {/* Achievement Text */}
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Level Up!
            </h1>
            
            <h2 className="text-2xl font-semibold text-orange-600 mb-2">
              {tier.name} Member
            </h2>
            
            <p className="text-gray-700 mb-4">
              Congratulations! You've unlocked exclusive benefits and rewards.
            </p>
            
            {/* Benefits Preview */}
            <div className="bg-orange-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-orange-900 mb-2">New Benefits:</h3>
              <div className="space-y-1 text-sm text-orange-800">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Enhanced points multiplier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-500" />
                  <span>Exclusive member rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-orange-500" />
                  <span>Priority customer support</span>
                </div>
              </div>
            </div>
            
            {/* Confetti Animation */}
            <div className="text-4xl mb-2">
              {'celebration'.split('').map((char, i) => (
                <span 
                  key={i} 
                  className="inline-block animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {char === ' ' ? '\u00A0' : 'confetti'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional CSS for animations */}
      <style>
        {`
          @keyframes tierUpBounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-20px);
            }
            60% {
              transform: translateY(-10px);
            }
          }
          
          .tier-up-bounce {
            animation: tierUpBounce 2s ease-in-out;
          }
          
          @keyframes confettiShimmer {
            0% {
              transform: scale(1) rotate(0deg);
            }
            50% {
              transform: scale(1.1) rotate(180deg);
            }
            100% {
              transform: scale(1) rotate(360deg);
            }
          }
          
          .confetti-shimmer {
            animation: confettiShimmer 1s ease-in-out;
          }
        `}
      </style>
    </>
  );
};

// Hook for triggering loyalty confetti
export const useLoyaltyConfetti = () => {
  const [currentTier, setCurrentTier] = useState<LoyaltyTier | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high' | 'epic'>('medium');

  const triggerConfetti = (tier: LoyaltyTier, customIntensity?: 'low' | 'medium' | 'high' | 'epic') => {
    setCurrentTier(tier);
    setIntensity(customIntensity || 'medium');
    setIsVisible(true);
  };

  const hideConfetti = () => {
    setIsVisible(false);
    setCurrentTier(null);
  };

  return {
    triggerConfetti,
    hideConfetti,
    currentTier,
    isVisible,
    intensity
  };
};

// Predefined tier configurations
export const loyaltyTiers: Record<string, LoyaltyTier> = {
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    color: '#f97316',
    icon: <Medal className="w-8 h-8" />,
    confettiColors: ['#f97316', '#ea580c', '#fb923c', '#fbbf24', '#f59e0b']
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    color: '#3b82f6',
    icon: <Trophy className="w-8 h-8" />,
    confettiColors: ['#3b82f6', '#2563eb', '#e5e7eb', '#9ca3af', '#f3f4f6']
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    color: '#fbbf24',
    icon: <Crown className="w-8 h-8" />,
    confettiColors: ['#fbbf24', '#f59e0b', '#fde047', '#fef3c7', '#facc15']
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    color: '#8b5cf6',
    icon: <Crown className="w-8 h-8" />,
    confettiColors: ['#8b5cf6', '#7c3aed', '#e9d5ff', '#c084fc', '#f3e8ff']
  }
};

export default LoyaltyConfetti;
