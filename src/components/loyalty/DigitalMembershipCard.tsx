import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Star, Crown, Gem, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import { useLoyaltySystem } from '@/hooks/useLoyaltySystem';
import { useAudioUX } from '@/utils/audio-ux';

interface DigitalMembershipCardProps {
  className?: string;
  showAnimation?: boolean;
}

const DigitalMembershipCard: React.FC<DigitalMembershipCardProps> = ({
  className = '',
  showAnimation = true
}) => {
  const { state } = useUnifiedUser();
  const { points, tier } = useLoyaltySystem();
  const { playSound } = useAudioUX();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Trigger animation on tier change
  useEffect(() => {
    if (tier && showAnimation) {
      setIsAnimating(true);
      playSound('level-up', 0.3);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [tier?.name, showAnimation, playSound]);

  const getTierConfig = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case 'bronze':
        return {
          gradient: 'from-amber-600 via-amber-500 to-amber-400',
          bgGradient: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-900',
          icon: Trophy,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          shimmerColor: 'rgba(251, 191, 36, 0.3)',
          animationDelay: 'delay-0',
          particleColor: 'from-amber-400 to-amber-600',
          benefits: ['5% Points Bonus', 'Birthday Reward', 'Member Only Offers']
        };
      case 'silver':
        return {
          gradient: 'from-gray-600 via-gray-500 to-gray-400',
          bgGradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-300',
          textColor: 'text-foreground',
          icon: Star,
          iconBg: 'bg-muted',
          iconColor: 'text-muted-foreground',
          shimmerColor: 'rgba(156, 163, 175, 0.3)',
          animationDelay: 'delay-100',
          particleColor: 'from-gray-400 to-gray-600',
          benefits: ['10% Points Bonus', 'Free Shipping', 'Priority Support']
        };
      case 'gold':
        return {
          gradient: 'from-yellow-600 via-yellow-500 to-yellow-400',
          bgGradient: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-900',
          icon: Crown,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          shimmerColor: 'rgba(250, 204, 21, 0.3)',
          animationDelay: 'delay-200',
          particleColor: 'from-yellow-400 to-yellow-600',
          benefits: ['15% Points Bonus', 'Free Shipping', 'Exclusive Access', 'Birthday Bonus']
        };
      case 'platinum':
        return {
          gradient: 'from-purple-600 via-purple-500 to-purple-400',
          bgGradient: 'from-purple-50 to-indigo-50',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-900',
          icon: Gem,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          shimmerColor: 'rgba(147, 51, 234, 0.3)',
          animationDelay: 'delay-300',
          particleColor: 'from-purple-400 to-purple-600',
          benefits: ['20% Points Bonus', 'Free Shipping', 'VIP Support', 'Exclusive Events', 'Early Access']
        };
      default:
        return {
          gradient: 'from-orange-600 via-orange-500 to-orange-400',
          bgGradient: 'from-orange-50 to-yellow-50',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-900',
          icon: Trophy,
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          shimmerColor: 'rgba(249, 115, 22, 0.3)',
          animationDelay: 'delay-0',
          particleColor: 'from-orange-400 to-orange-600',
          benefits: ['Basic Benefits']
        };
    }
  };

  const tierConfig = getTierConfig(tier?.name || '');
  const Icon = tierConfig.icon;

  const progressToNext = tier?.nextTier 
    ? ((points.current - tier.minimumPoints) / (tier.nextTier.minimumPoints - tier.minimumPoints)) * 100
    : 100;

  return (
    <div className={`relative ${className}`}>
      {/* Main Card */}
      <div
        ref={cardRef}
        className={`
          relative overflow-hidden rounded-2xl p-8 transition-all duration-500 transform
          ${isHovered ? 'scale-105 shadow-2xl' : 'scale-100 shadow-xl'}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(255, 255, 255, 0.85) 50%, 
            rgba(255, 255, 255, 0.95) 100%)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${tierConfig.borderColor.replace('border-', '').replace('-300', '')}`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glass Reflection Effect */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.6) 0%, 
              rgba(255, 255, 255, 0.2) 50%, 
              rgba(255, 255, 255, 0) 100%)`,
          }}
        />

        {/* Shimmer Effect */}
        {showAnimation && (
          <div 
            className={`absolute inset-0 opacity-50 pointer-events-none ${tierConfig.animationDelay}`}
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                ${tierConfig.shimmerColor} 50%, 
                transparent 100%)`,
              backgroundSize: '200% 100%',
              animation: isHovered ? 'shimmer 2s infinite' : 'shimmer 3s infinite',
            }}
          />
        )}

        {/* Tier Header */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Tier Icon */}
              <div className={`
                relative w-16 h-16 rounded-2xl flex items-center justify-center
                ${tierConfig.iconBg} shadow-lg
                ${isAnimating ? 'animate-bounce' : ''}
              `}>
                <Icon className={`w-8 h-8 ${tierConfig.iconColor}`} />
                
                {/* Sparkles around icon */}
                {isAnimating && (
                  <div className="absolute inset-0">
                    <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500 animate-ping" />
                    <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-yellow-500 animate-ping" />
                  </div>
                )}
              </div>
              
              {/* Tier Name */}
              <div>
                <h2 className={`text-2xl font-bold ${tierConfig.textColor}`}>
                  {tier?.name || 'Member'}
                </h2>
                <p className="text-sm text-muted-foreground">GÜELL Club</p>
              </div>
            </div>

            {/* Shield Badge */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              <Shield className="w-3 h-3" />
              Active
            </div>
          </div>

          {/* Member Info */}
          {state.profile && (
            <div className="text-sm text-muted-foreground">
              {state.profile.firstName} {state.profile.lastName}
            </div>
          )}
        </div>

        {/* Points Display */}
        <div className="relative z-10 mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-foreground">
              {points.current?.toLocaleString() || '0'}
            </span>
            <span className="text-lg text-muted-foreground">points</span>
          </div>
          
          {/* Progress Bar to Next Tier */}
          {tier?.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{tier.pointsToNextTier} points to {tier.nextTier.name}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{
                    width: `${Math.min(progressToNext, 100)}%`,
                    background: `linear-gradient(90deg, ${tierConfig.gradient})`,
                  }}
                >
                  {/* Progress Shimmer */}
                  <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: `linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(255, 255, 255, 0.5) 50%, 
                        transparent 100%)`,
                      animation: 'progressShimmer 2s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Preview */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Active Benefits</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {tierConfig.benefits.slice(0, 3).map((benefit, index) => (
              <div 
                key={index}
                className={`
                  flex items-center gap-2 text-sm p-2 rounded-lg
                  ${isHovered ? 'bg-card bg-opacity-60' : 'bg-card bg-opacity-40'}
                  transition-all duration-300
                `}
                style={{
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
          
          {tierConfig.benefits.length > 3 && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              +{tierConfig.benefits.length - 3} more benefits
            </div>
          )}
        </div>

        {/* Floating Particles */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${tierConfig.particleColor})`,
                  left: `${20 + (i * 15)}%`,
                  top: `${50 + (i % 2 === 0 ? -20 : 20)}%`,
                  animation: `float ${2 + (i * 0.5)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Glow Effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${tierConfig.shimmerColor}`,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes progressShimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(-30px) rotate(180deg); 
            opacity: 0;
          }
        }
        
        .delay-0 { animation-delay: 0s; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default DigitalMembershipCard;
