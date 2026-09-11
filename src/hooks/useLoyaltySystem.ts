import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  pointMultiplier: number;
  discountRate: number;
  color: string;
  icon: string;
}

interface LoyaltyPoints {
  current: number;
  lifetime: number;
  tier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier: number;
  expiryDate: Date;
  recentEarnings: Array<{
    id: string;
    points: number;
    source: 'purchase' | 'review' | 'referral' | 'bonus';
    orderId?: string;
    description: string;
    timestamp: Date;
    expiresAt?: Date;
  }>;
}

interface PointsTransaction {
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  orderId?: string;
  timestamp: Date;
  balance: number;
}

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['5% puntos en cada compra', 'Descuentos exclusivos', 'Acceso a promociones'],
    pointMultiplier: 1.0,
    discountRate: 0.05,
    color: '#CD7F32',
    icon: 'bronze-medal'
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['7% puntos en cada compra', '10% descuento en cumpleaños', 'Delivery gratis los fines de semana'],
    pointMultiplier: 1.4,
    discountRate: 0.07,
    color: '#C0C0C0',
    icon: 'silver-medal'
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: ['10% puntos en cada compra', '15% descuento en cumpleaños', 'Delivery gratis siempre', 'Soporte prioritario'],
    pointMultiplier: 2.0,
    discountRate: 0.10,
    color: '#FFD700',
    icon: 'gold-medal'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 15000,
    benefits: ['15% puntos en cada compra', '20% descuento en cumpleaños', 'Delivery gratis siempre', 'Soporte VIP', 'Acceso anticipado a nuevos restaurantes'],
    pointMultiplier: 3.0,
    discountRate: 0.15,
    color: '#E5E4E2',
    icon: 'platinum-medal'
  }
];

const useLoyaltySystem = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);

  // Calculate points from purchase amount
  const calculatePoints = useCallback((purchaseAmount: number, tier?: LoyaltyTier): number => {
    const currentTier = tier || loyaltyData?.tier || LOYALTY_TIERS[0];
    const basePoints = Math.floor(purchaseAmount * 0.05); // 5% base rate
    return Math.floor(basePoints * currentTier.pointMultiplier);
  }, [loyaltyData]);

  // Get current tier based on points
  const getCurrentTier = useCallback((points: number): LoyaltyTier => {
    for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
      if (points >= LOYALTY_TIERS[i].minPoints) {
        return LOYALTY_TIERS[i];
      }
    }
    return LOYALTY_TIERS[0];
  }, []);

  // Calculate points to next tier
  const getPointsToNextTier = useCallback((points: number, currentTier: LoyaltyTier): { nextTier?: LoyaltyTier; pointsNeeded: number } => {
    const currentIndex = LOYALTY_TIERS.findIndex(tier => tier.id === currentTier.id);
    if (currentIndex === LOYALTY_TIERS.length - 1) {
      return { pointsNeeded: 0 }; // Already at highest tier
    }
    
    const nextTier = LOYALTY_TIERS[currentIndex + 1];
    const pointsNeeded = nextTier.minPoints - points;
    
    return { nextTier, pointsNeeded };
  }, []);

  // Load loyalty data
  useEffect(() => {
    if (!user) return;

    const loadLoyaltyData = async () => {
      setIsLoading(true);
      
      try {
        // Mock API call - in real app, this would fetch from backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockLoyaltyData: LoyaltyPoints = {
          current: 2850,
          lifetime: 12450,
          tier: getCurrentTier(2850),
          nextTier: getPointsToNextTier(2850, getCurrentTier(2850)).nextTier,
          pointsToNextTier: getPointsToNextTier(2850, getCurrentTier(2850)).pointsNeeded,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          recentEarnings: [
            {
              id: '1',
              points: 142,
              source: 'purchase',
              orderId: 'order-123',
              description: 'Compra en Burger Palace',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              expiresAt: new Date(Date.now() + 363 * 24 * 60 * 60 * 1000)
            },
            {
              id: '2',
              points: 50,
              source: 'review',
              description: 'Reseña de 5 estrellas',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              expiresAt: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000)
            },
            {
              id: '3',
              points: 25,
              source: 'bonus',
              description: 'Bono de bienvenida',
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              expiresAt: new Date(Date.now() + 355 * 24 * 60 * 60 * 1000)
            }
          ]
        };
        
        setLoyaltyData(mockLoyaltyData);
        
        // Load transaction history
        const mockTransactions: PointsTransaction[] = [
          {
            type: 'earn',
            points: 142,
            description: 'Compra en Burger Palace',
            orderId: 'order-123',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            balance: 2850
          },
          {
            type: 'redeem',
            points: -100,
            description: 'Descuento aplicado en checkout',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            balance: 2708
          },
          {
            type: 'earn',
            points: 50,
            description: 'Reseña de 5 estrellas',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            balance: 2758
          }
        ];
        
        setTransactions(mockTransactions);
        
      } catch (error) {
        console.error('Error loading loyalty data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLoyaltyData();
  }, [user, getCurrentTier, getPointsToNextTier]);

  // Earn points from purchase
  const earnPoints = useCallback(async (purchaseAmount: number, orderId: string, section: 'food' | 'store' = 'food') => {
    if (!loyaltyData) return;

    setIsLoading(true);
    
    try {
      const pointsEarned = calculatePoints(purchaseAmount, loyaltyData.tier);
      const newBalance = loyaltyData.current + pointsEarned;
      const newLifetime = loyaltyData.lifetime + pointsEarned;
      
      const newTier = getCurrentTier(newBalance);
      const { nextTier, pointsNeeded } = getPointsToNextTier(newBalance, newTier);
      
      // Check for tier upgrade
      const tierUpgraded = newTier.id !== loyaltyData.tier.id;
      
      // Update loyalty data
      const updatedLoyaltyData: LoyaltyPoints = {
        ...loyaltyData,
        current: newBalance,
        lifetime: newLifetime,
        tier: newTier,
        nextTier,
        pointsToNextTier: pointsNeeded,
        recentEarnings: [
          {
            id: Date.now().toString(),
            points: pointsEarned,
            source: 'purchase',
            orderId,
            description: `Compra en ${section === 'food' ? 'GÜELL Food' : 'GÜELL Store'}`,
            timestamp: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          },
          ...loyaltyData.recentEarnings.slice(0, 9) // Keep only last 10
        ]
      };
      
      setLoyaltyData(updatedLoyaltyData);
      
      // Add transaction
      const newTransaction: PointsTransaction = {
        type: 'earn',
        points: pointsEarned,
        description: `Compra en ${section === 'food' ? 'GÜELL Food' : 'GÜELL Store'}`,
        orderId,
        timestamp: new Date(),
        balance: newBalance
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Send notification for tier upgrade
      if (tierUpgraded) {
        // This would trigger the notification system
        console.log(`¡Felicidades! Has subido al nivel ${newTier.name}`);
      }
      
      return {
        pointsEarned,
        newBalance,
        tierUpgraded,
        newTier: tierUpgraded ? newTier : null
      };
      
    } catch (error) {
      console.error('Error earning points:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loyaltyData, calculatePoints, getCurrentTier, getPointsToNextTier]);

  // Redeem points for discount
  const redeemPoints = useCallback(async (pointsToRedeem: number, orderId?: string) => {
    if (!loyaltyData || pointsToRedeem > loyaltyData.current) {
      throw new Error('Insufficient points');
    }

    setIsLoading(true);
    
    try {
      const discountAmount = pointsToRedeem * 0.01; // 1 point = $0.01
      const newBalance = loyaltyData.current - pointsToRedeem;
      
      // Update loyalty data
      const updatedLoyaltyData = {
        ...loyaltyData,
        current: newBalance,
        pointsToNextTier: getPointsToNextTier(newBalance, loyaltyData.tier).pointsNeeded
      };
      
      setLoyaltyData(updatedLoyaltyData);
      
      // Add transaction
      const newTransaction: PointsTransaction = {
        type: 'redeem',
        points: -pointsToRedeem,
        description: orderId 
          ? `Descuento aplicado en orden ${orderId}`
          : 'Descuento aplicado',
        orderId,
        timestamp: new Date(),
        balance: newBalance
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      return {
        discountAmount,
        pointsRedeem: pointsToRedeem,
        newBalance
      };
      
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loyaltyData, getPointsToNextTier]);

  // Get available rewards
  const getAvailableRewards = useCallback(() => {
    if (!loyaltyData) return [];
    
    const maxPoints = loyaltyData.current;
    const rewards = [
      { points: 100, reward: '$1.00 descuento', description: 'Aplicable en cualquier compra' },
      { points: 250, reward: '$2.50 descuento', description: 'Aplicable en cualquier compra' },
      { points: 500, reward: '$5.00 descuento', description: 'Aplicable en cualquier compra' },
      { points: 1000, reward: '$10.00 descuento', description: 'Aplicable en cualquier compra' },
      { points: 2000, reward: '$20.00 descuento', description: 'Aplicable en cualquier compra' },
      { points: 5000, reward: 'Delivery gratis por un mes', description: 'Válido para pedidos de $20+' }
    ];
    
    return rewards.filter(reward => reward.points <= maxPoints);
  }, [loyaltyData]);

  // Get loyalty statistics
  const getLoyaltyStats = useCallback(() => {
    if (!loyaltyData) return null;
    
    const totalEarned = transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.points, 0);
    
    const totalRedeemed = Math.abs(transactions
      .filter(t => t.type === 'redeem')
      .reduce((sum, t) => sum + t.points, 0));
    
    const thisMonthEarned = transactions
      .filter(t => t.type === 'earn' && 
        new Date(t.timestamp).getMonth() === new Date().getMonth() &&
        new Date(t.timestamp).getFullYear() === new Date().getFullYear())
      .reduce((sum, t) => sum + t.points, 0);
    
    const pointsExpiringSoon = loyaltyData.recentEarnings
      .filter(earning => {
        if (!earning.expiresAt) return false;
        const daysUntilExpiry = Math.ceil(
          (earning.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      })
      .reduce((sum, earning) => sum + earning.points, 0);
    
    return {
      totalEarned,
      totalRedeemed,
      thisMonthEarned,
      pointsExpiringSoon,
      redemptionRate: totalEarned > 0 ? (totalRedeemed / totalEarned) * 100 : 0
    };
  }, [loyaltyData, transactions]);

  return {
    loyaltyData,
    transactions,
    isLoading,
    tiers: LOYALTY_TIERS,
    earnPoints,
    redeemPoints,
    calculatePoints,
    getCurrentTier,
    getAvailableRewards,
    getLoyaltyStats
  };
};

export default useLoyaltySystem;
export type { LoyaltyTier, LoyaltyPoints, PointsTransaction };
