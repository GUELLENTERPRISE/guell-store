import React from 'react';
import { Trophy, Star, Crown, Gem } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-modal';

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface MembershipCardProps {
  userName: string;
  points: number;
  currentTier: MembershipTier;
  nextTierPoints: number;
  className?: string;
}

const MembershipCard: React.FC<MembershipCardProps> = ({
  userName,
  points,
  currentTier,
  nextTierPoints,
  className = ''
}) => {
  const getTierConfig = (tier: MembershipTier) => {
    const configs = {
      bronze: {
        name: 'Bronze',
        icon: Trophy,
        gradient: 'from-amber-600 to-amber-800',
        borderGradient: 'from-amber-400 to-amber-600',
        backdrop: 'bg-amber-500/10',
        glow: 'shadow-amber-500/25',
        progressColor: 'bg-amber-500'
      },
      silver: {
        name: 'Silver',
        icon: Star,
        gradient: 'from-gray-400 to-gray-600',
        borderGradient: 'from-gray-300 to-gray-500',
        backdrop: 'bg-gray-400/10',
        glow: 'shadow-gray-400/25',
        progressColor: 'bg-background0'
      },
      gold: {
        name: 'Gold',
        icon: Crown,
        gradient: 'from-yellow-400 to-yellow-600',
        borderGradient: 'from-yellow-300 to-yellow-500',
        backdrop: 'bg-yellow-400/10',
        glow: 'shadow-yellow-400/25',
        progressColor: 'bg-yellow-500'
      },
      platinum: {
        name: 'Platinum',
        icon: Gem,
        gradient: 'from-purple-400 to-purple-600',
        borderGradient: 'from-purple-300 to-purple-500',
        backdrop: 'bg-purple-400/10',
        glow: 'shadow-purple-400/25',
        progressColor: 'bg-purple-500'
      }
    };
    return configs[tier];
  };

  const config = getTierConfig(currentTier);
  const Icon = config.icon;
  const progressPercentage = Math.min((points / nextTierPoints) * 100, 100);
  const pointsToNext = Math.max(nextTierPoints - points, 0);

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.glow} blur-xl opacity-50 rounded-2xl`}></div>
      
      {/* Main card with glassmorphism */}
      <GlassmorphismCard className={`relative overflow-hidden border-2 bg-gradient-to-br ${config.backdrop} backdrop-blur-xl`}>
        {/* Animated border gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.borderGradient} opacity-20 rounded-2xl`}></div>
        
        {/* Content */}
        <div className="relative p-8 space-y-6">
          {/* Header with tier icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 bg-gradient-to-br ${config.gradient} rounded-xl shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">GÜELL {config.name}</h3>
                <p className="text-sm text-muted-foreground">Membership Card</p>
              </div>
            </div>
            
            {/* Holographic effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-full backdrop-blur-sm border border-white/30"></div>
            </div>
          </div>

          {/* User info */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">{userName}</p>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-foreground">{points.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">points</span>
            </div>
          </div>

          {/* Progress to next tier */}
          {currentTier !== 'platinum' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Progress to Next Tier</span>
                <span className="text-sm font-semibold text-foreground">{pointsToNext.toLocaleString()} points</span>
              </div>
              
              {/* Progress bar with glassmorphism effect */}
              <div className="relative">
                <div className="w-full h-6 bg-gray-200/50 backdrop-blur-sm rounded-full overflow-hidden border border-gray-300/30">
                  <div 
                    className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{points.toLocaleString()}</span>
                  <span className="text-xs font-medium text-foreground">{nextTierPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Benefits preview */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200/30">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">5%</div>
              <div className="text-xs text-muted-foreground">Cashback</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">2x</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">Free</div>
              <div className="text-xs text-muted-foreground">Shipping</div>
            </div>
          </div>

          {/* Card number decoration */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-xs text-muted-foreground font-mono">•••• •••• •••• 1234</div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </GlassmorphismCard>
    </div>
  );
};

export default MembershipCard;
