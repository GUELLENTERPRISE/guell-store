import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import useLoyaltySystem, { LoyaltyPoints, LoyaltyTier } from '@/hooks/useLoyaltySystem';
import useNotificationCenter from '@/hooks/useNotificationCenter';

interface LoyaltyState {
  points: LoyaltyPoints | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

interface LoyaltyContextType extends LoyaltyState {
  earnPoints: (amount: number, orderId: string, section?: 'food' | 'store') => Promise<void>;
  redeemPoints: (points: number, orderId?: string) => Promise<void>;
  refreshPoints: () => Promise<void>;
  syncPoints: () => Promise<void>;
  clearError: () => void;
}

type LoyaltyAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_POINTS'; payload: LoyaltyPoints }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SYNC_STATUS'; payload: 'idle' | 'syncing' | 'success' | 'error' }
  | { type: 'UPDATE_POINTS'; payload: Partial<LoyaltyPoints> };

const initialState: LoyaltyState = {
  points: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  syncStatus: 'idle'
};

const loyaltyReducer = (state: LoyaltyState, action: LoyaltyAction): LoyaltyState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_POINTS':
      return { 
        ...state, 
        points: action.payload, 
        isLoading: false, 
        error: null,
        lastUpdated: new Date()
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'UPDATE_POINTS':
      return { 
        ...state, 
        points: state.points ? { ...state.points, ...action.payload } : null,
        lastUpdated: new Date()
      };
    default:
      return state;
  }
};

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};

interface LoyaltyProviderProps {
  children: ReactNode;
}

export const LoyaltyProvider: React.FC<LoyaltyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const loyaltySystem = useLoyaltySystem();
  const notificationCenter = useNotificationCenter();
  const [state, dispatch] = useReducer(loyaltyReducer, initialState);

  // Load points on user login
  useEffect(() => {
    if (user) {
      refreshPoints();
    } else {
      dispatch({ type: 'SET_POINTS', payload: null });
    }
  }, [user]);

  // Auto-sync points every 5 minutes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      syncPoints();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Listen for storage events (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'guell_loyalty_points' && event.newValue) {
        try {
          const points = JSON.parse(event.newValue);
          dispatch({ type: 'SET_POINTS', payload: points });
        } catch (error) {
          console.error('Error parsing loyalty points from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const earnPoints = async (amount: number, orderId: string, section: 'food' | 'store' = 'food') => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await loyaltySystem.earnPoints(amount, orderId, section);
      
      // Update local state
      if (state.points) {
        dispatch({ type: 'UPDATE_POINTS', payload: {
          current: result.newBalance,
          lifetime: state.points.lifetime + result.pointsEarned
        }});
      }

      // Update localStorage for cross-tab sync
      const updatedPoints = { ...state.points, current: result.newBalance };
      localStorage.setItem('guell_loyalty_points', JSON.stringify(updatedPoints));

      // Send notification
      notificationCenter.addNotification({
        type: 'points',
        title: '¡Puntos Ganados!',
        message: `Has ganado ${result.pointsEarned} puntos en tu compra de ${section === 'food' ? 'GÜELL Food' : 'GÜELL Store'}.`,
        action: {
          type: 'view_points',
          data: { source: 'purchase', orderId }
        },
        icon: 'star',
        priority: 'medium'
      });

      // Check for tier upgrade
      if (result.tierUpgraded && result.newTier) {
        // Send tier upgrade notification
        notificationCenter.addNotification({
          type: 'tier',
          title: '¡Subiste de Nivel!',
          message: `¡Felicidades! Ahora eres miembro ${result.newTier.name} y tienes beneficios exclusivos.`,
          action: {
            type: 'view_points',
            data: { tier: result.newTier.id }
          },
          icon: 'trophy',
          priority: 'high'
        });

        // Trigger surprise effect for Silver tier
        if (result.newTier.id === 'silver') {
          triggerSurpriseEffect(result.newTier);
        }
      }

      dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to earn points';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
    }
  };

  const redeemPoints = async (points: number, orderId?: string) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await loyaltySystem.redeemPoints(points, orderId);
      
      // Update local state
      if (state.points) {
        dispatch({ type: 'UPDATE_POINTS', payload: {
          current: result.newBalance
        }});
      }

      // Update localStorage for cross-tab sync
      const updatedPoints = { ...state.points, current: result.newBalance };
      localStorage.setItem('guell_loyalty_points', JSON.stringify(updatedPoints));

      // Send notification
      notificationCenter.addNotification({
        type: 'points',
        title: 'Puntos Canjeados',
        message: `Has canjeado ${result.pointsRedeem} puntos por un descuento de $${result.discountAmount.toFixed(2)}.`,
        icon: 'star',
        priority: 'medium'
      });

      dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to redeem points';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
    }
  };

  const refreshPoints = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // In a real app, this would fetch from the API
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check localStorage first for cross-tab sync
      const storedPoints = localStorage.getItem('guell_loyalty_points');
      if (storedPoints) {
        try {
          const points = JSON.parse(storedPoints);
          dispatch({ type: 'SET_POINTS', payload: points });
          return;
        } catch (error) {
          console.error('Error parsing stored points:', error);
        }
      }

      // Fallback to mock data
      const mockPoints: LoyaltyPoints = {
        current: 2850,
        lifetime: 12450,
        tier: loyaltySystem.tiers[1], // Silver
        nextTier: loyaltySystem.tiers[2], // Gold
        pointsToNextTier: 2150,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        recentEarnings: [
          {
            id: '1',
            points: 142,
            source: 'purchase',
            orderId: 'order-123',
            description: 'Compra en Burger Palace',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            expiresAt: new Date(Date.now() + 363 * 24 * 60 * 60 * 1000)
          }
        ]
      };

      dispatch({ type: 'SET_POINTS', payload: mockPoints });
      localStorage.setItem('guell_loyalty_points', JSON.stringify(mockPoints));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh points';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const syncPoints = async () => {
    if (!user) return;

    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would sync with the backend
      // For now, we'll just update the sync status
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });

    } catch (error) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Error syncing points:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const triggerSurpriseEffect = (tier: LoyaltyTier) => {
    // Create confetti effect
    const confetti = document.createElement('div');
    confetti.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        animation: surpriseAppear 0.5s ease-out;
      ">
        <div style="font-size: 3rem; margin-bottom: 20px;">${tier.icon === 'silver-medal' ? 'medalla de plata' : 'trofeo'}</div>
        <h1 style="font-size: 2rem; margin-bottom: 10px;">¡Felicidades!</h1>
        <p style="font-size: 1.2rem; margin-bottom: 20px;">Has desbloqueado los beneficios ${tier.name}</p>
        <p style="font-size: 1rem; opacity: 0.9;">Disfruta tu nuevo multiplicador de puntos</p>
      </div>
      <style>
        @keyframes surpriseAppear {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      </style>
    `;
    
    document.body.appendChild(confetti);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 5000);

    // Create confetti particles
    createConfetti();
  };

  const createConfetti = () => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    
    for (let i = 0; i < 50; i++) {
      const confettiPiece = document.createElement('div');
      confettiPiece.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -10px;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
        animation: confettiFall ${2 + Math.random() * 2}s linear;
        z-index: 9998;
      `;
      
      document.body.appendChild(confettiPiece);
      
      setTimeout(() => {
        if (confettiPiece.parentNode) {
          confettiPiece.parentNode.removeChild(confettiPiece);
        }
      }, 4000);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        to {
          top: 100%;
          opacity: 0;
          transform: rotate(${Math.random() * 720}deg);
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 6000);
  };

  const value: LoyaltyContextType = {
    ...state,
    earnPoints,
    redeemPoints,
    refreshPoints,
    syncPoints,
    clearError
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};
