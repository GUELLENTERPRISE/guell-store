import React, { useState, useEffect, useRef } from 'react';
import { Target, Trophy, Star, Zap, Gift, Crown, Gem, Award, TrendingUp } from 'lucide-react';
import { useUnifiedUser } from '@/contexts/UnifiedUserContext';
import { useLoyaltySystem } from '@/hooks/useLoyaltySystem';
import { useAudioUX } from '@/utils/audio-ux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-modal';

interface LoyaltyMilestonesProgressProps {
  className?: string;
  showNotifications?: boolean;
}

const LoyaltyMilestonesProgress: React.FC<LoyaltyMilestonesProgressProps> = ({
  className = '',
  showNotifications = true
}) => {
  const { state } = useUnifiedUser();
  const { points, tier } = useLoyaltySystem();
  const { playSound } = useAudioUX();
  const [notifiedMilestones, setNotifiedMilestones] = useState<Set<string>>(new Set());
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Define milestones for each tier
  const getTierMilestones = (tierName: string) => {
    const milestones = {
      bronze: [
        { id: 'bronze-25', points: 25, title: 'Welcome Bonus', description: 'Your first 25 points!', reward: '5% off next order' },
        { id: 'bronze-100', points: 100, title: 'Bronze Explorer', description: '100 points milestone!', reward: 'Free delivery' },
        { id: 'bronze-250', points: 250, title: 'Bronze Achiever', description: 'Quarter of the way to Silver!', reward: 'Birthday bonus' },
        { id: 'bronze-500', points: 500, title: 'Bronze Master', description: 'Halfway to Silver!', reward: 'Exclusive offers' }
      ],
      silver: [
        { id: 'silver-750', points: 750, title: 'Silver Rising', description: 'Welcome to Silver!', reward: '10% points boost' },
        { id: 'silver-1000', points: 1000, title: 'Silver Star', description: '1000 points achieved!', reward: 'Priority support' },
        { id: 'silver-1500', points: 1500, title: 'Silver Elite', description: 'Silver mastery!', reward: 'Free shipping store-wide' },
        { id: 'silver-2000', points: 2000, title: 'Silver Champion', description: 'Ready for Gold!', reward: 'VIP event access' }
      ],
      gold: [
        { id: 'gold-2500', points: 2500, title: 'Gold Rising', description: 'Welcome to Gold!', reward: '15% points boost' },
        { id: 'gold-3000', points: 3000, title: 'Gold Star', description: '3000 points milestone!', reward: 'Exclusive products' },
        { id: 'gold-4000', points: 4000, title: 'Gold Elite', description: 'Gold mastery!', reward: 'Personal shopper' },
        { id: 'gold-5000', points: 5000, title: 'Gold Champion', description: 'Ready for Platinum!', reward: 'Concierge service' }
      ],
      platinum: [
        { id: 'platinum-6000', points: 6000, title: 'Platinum Rising', description: 'Welcome to Platinum!', reward: '20% points boost' },
        { id: 'platinum-8000', points: 8000, title: 'Platinum Star', description: '8000 points achieved!', reward: 'Exclusive events' },
        { id: 'platinum-10000', points: 10000, title: 'Platinum Elite', description: 'Platinum mastery!', reward: 'Lifetime benefits' },
        { id: 'platinum-15000', points: 15000, title: 'Platinum Legend', description: 'Ultimate status!', reward: 'Founder recognition' }
      ]
    };

    return milestones[tierName?.toLowerCase() as keyof typeof milestones] || [];
  };

  const milestones = getTierMilestones(tier?.name || '');
  const currentPoints = points.current || 0;

  // Calculate progress for each milestone
  const milestonesWithProgress = milestones.map(milestone => {
    const progress = Math.min((currentPoints / milestone.points) * 100, 100);
    const isCompleted = progress >= 100;
    const isNext = !isCompleted && currentPoints < milestone.points;
    const is90Percent = progress >= 90 && progress < 100 && !notifiedMilestones.has(milestone.id);

    return {
      ...milestone,
      progress,
      isCompleted,
      isNext,
      is90Percent,
      distance: milestone.points - currentPoints
    };
  });

  // Check for 90% milestones and trigger notifications
  useEffect(() => {
    if (!showNotifications) return;

    const nearMilestones = milestonesWithProgress.filter(m => m.is90Percent);
    
    nearMilestones.forEach(milestone => {
      if (!notifiedMilestones.has(milestone.id)) {
        // Trigger Audio-UX notification
        playSound('notification', 0.4);
        
        // Show celebration
        setCelebratingMilestone(milestone.id);
        setTimeout(() => setCelebratingMilestone(null), 3000);
        
        // Mark as notified
        setNotifiedMilestones(prev => new Set([...prev, milestone.id]));
      }
    });
  }, [currentPoints, milestonesWithProgress, notifiedMilestones, showNotifications, playSound]);

  // Get tier icon and colors
  const getTierConfig = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case 'bronze':
        return {
          icon: Trophy,
          color: 'from-amber-500 to-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-900'
        };
      case 'silver':
        return {
          icon: Star,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-background',
          borderColor: 'border-gray-200',
          textColor: 'text-foreground'
        };
      case 'gold':
        return {
          icon: Crown,
          color: 'from-yellow-500 to-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900'
        };
      case 'platinum':
        return {
          icon: Gem,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-900'
        };
      default:
        return {
          icon: Trophy,
          color: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-900'
        };
    }
  };

  const tierConfig = getTierConfig(tier?.name || '');
  const TierIcon = tierConfig.icon;

  // Get next milestone
  const nextMilestone = milestonesWithProgress.find(m => m.isNext);
  const completedMilestones = milestonesWithProgress.filter(m => m.isCompleted);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress to Next Tier */}
      {tier?.nextTier && (
        <GlassmorphismCard className="p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className={`${tierConfig.bgColor} ${tierConfig.textColor} ${tierConfig.borderColor}`}>
              Next Tier: {tier.nextTier.name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${tierConfig.bgColor}`}>
              <TierIcon className={`w-8 h-8 ${tierConfig.textColor}`} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {tier.pointsToNextTier} points to {tier.nextTier.name}
              </h3>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{
                    width: `${Math.min(((points.current - tier.minimumPoints) / (tier.nextTier.minimumPoints - tier.minimumPoints)) * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${tierConfig.color})`,
                  }}
                >
                  {/* Progress shimmer */}
                  <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
                      animation: 'progressShimmer 2s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 90% Warning */}
          {((points.current - tier.minimumPoints) / (tier.nextTier.minimumPoints - tier.minimumPoints)) * 100 >= 90 && (
            <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg border border-orange-200">
              <Zap className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                Almost there! You're 90% of the way to {tier.nextTier.name}!
              </span>
            </div>
          )}
        </GlassmorphismCard>
      )}

      {/* Current Tier Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {tier?.name} Tier Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestonesWithProgress.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-300
                  ${milestone.isCompleted 
                    ? `${tierConfig.bgColor} ${tierConfig.borderColor} bg-opacity-50` 
                    : 'border-gray-200 bg-card'
                  }
                  ${milestone.isNext ? 'ring-2 ring-orange-200' : ''}
                  ${celebratingMilestone === milestone.id ? 'animate-pulse scale-105' : ''}
                `}
              >
                {/* Milestone Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${milestone.isCompleted ? tierConfig.bgColor : 'bg-muted'}
                    `}>
                      {milestone.isCompleted ? (
                        <Trophy className={`w-5 h-5 ${tierConfig.textColor}`} />
                      ) : (
                        <Target className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className={`font-semibold ${milestone.isCompleted ? tierConfig.textColor : 'text-foreground'}`}>
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Points Badge */}
                  <Badge className={milestone.isCompleted ? tierConfig.bgColor : 'bg-muted'}>
                    <span className={milestone.isCompleted ? tierConfig.textColor : 'text-gray-700'}>
                      {milestone.points} pts
                    </span>
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-medium ${milestone.isCompleted ? tierConfig.textColor : 'text-foreground'}`}>
                      {milestone.isCompleted ? 'Completed!' : `${Math.round(milestone.progress)}%`}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{
                        width: `${milestone.progress}%`,
                        background: milestone.isCompleted 
                          ? `linear-gradient(90deg, ${tierConfig.color})`
                          : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      }}
                    >
                      {/* Progress shimmer */}
                      <div 
                        className="absolute inset-0 opacity-50"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
                          animation: 'progressShimmer 2s infinite',
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Distance indicator */}
                  {!milestone.isCompleted && milestone.distance > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{milestone.distance} points to go</span>
                    </div>
                  )}
                </div>

                {/* Reward */}
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-foreground">
                    {milestone.reward}
                  </span>
                </div>

                {/* Celebration Effect */}
                {celebratingMilestone === milestone.id && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${tierConfig.color})`,
                          left: `${10 + (i * 12)}%`,
                          top: `${50 + (i % 2 === 0 ? -30 : 30)}%`,
                          animation: `celebration ${1.5 + (i * 0.2)}s ease-out infinite`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-background rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {completedMilestones.length}/{milestones.length}
                </div>
                <div className="text-sm text-muted-foreground">Milestones Completed</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {completedMilestones.length > 0 ? '100%' : '0%'}
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {nextMilestone ? nextMilestone.distance : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Points to Next</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes progressShimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        
        @keyframes celebration {
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
            transform: translateY(-40px) rotate(360deg); 
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoyaltyMilestonesProgress;
