import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TIME_OF_DAY, DAY_OF_WEEK, MICROCOPY_LIBRARY } from './dynamic-microcopy-constants';
import { useAuth } from '@/contexts/AuthContext';

interface MicrocopyContextType {
  getPersonalizedText: (key: string, fallback?: string) => string;
  getPlaceholder: (context: string, fallback?: string) => string;
  getStatusMessage: (status: string, context?: string) => string;
  getWelcomeMessage: () => string;
  getTimeBasedGreeting: () => string;
  updateUserName: (name: string) => void;
}

const MicrocopyContext = createContext<MicrocopyContextType | undefined>(undefined);

export const useMicrocopy = () => {
  const context = useContext(MicrocopyContext);
  if (context === undefined) {
    throw new Error('useMicrocopy must be used within a MicrocopyProvider');
  }
  return context;
};

interface MicrocopyProviderProps {
  children: ReactNode;
}

export const MicrocopyProvider: React.FC<MicrocopyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (user?.user_metadata?.first_name) {
      setUserName(user.user_metadata.first_name);
    }
  }, [user]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return TIME_OF_DAY.morning;
    if (hour >= 12 && hour < 17) return TIME_OF_DAY.afternoon;
    if (hour >= 17 && hour < 21) return TIME_OF_DAY.evening;
    return TIME_OF_DAY.night;
  };

  const getDayOfWeek = () => {
    const day = new Date().getDay();
    return DAY_OF_WEEK[day];
  };

  const getTimeBasedGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const dayOfWeek = getDayOfWeek();
    
    const greetings = {
      morning: {
        weekday: ['Good morning', 'Rise and shine', 'Top of the morning'],
        weekend: ['Morning sunshine', 'Good morning', 'Weekend vibes']
      },
      afternoon: {
        weekday: ['Good afternoon', 'Hello', 'Afternoon delight'],
        weekend: ['Afternoon bliss', 'Weekend afternoon', 'Good afternoon']
      },
      evening: {
        weekday: ['Good evening', 'Evening greetings', 'Hello tonight'],
        weekend: ['Evening magic', 'Weekend evening', 'Good evening']
      },
      night: {
        weekday: ['Good night', 'Evening vibes', 'Night owl'],
        weekend: ['Late night', 'Weekend night', 'Good night']
      }
    };

    const isWeekend = dayOfWeek === 'saturday' || dayOfWeek === 'sunday';
    const timeGreetings = greetings[timeOfDay][isWeekend ? 'weekend' : 'weekday'];
    const randomGreeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
    
    return randomGreeting;
  };

  const getPersonalizedText: (key: string, fallback?: string) => string = (key, fallback = '') => {
    const timeOfDay = getTimeOfDay();
    const dayOfWeek = getDayOfWeek();
    const name = userName || 'friend';
    
    const microcopyLibrary = {
      'search.empty': {
        morning: `No results yet ${name}, but the day is young!`,
        afternoon: `Nothing found ${name}, but we're adding new items!`,
        evening: `No matches ${name}, try something different tonight?`,
        night: `No results ${name}, but we're here 24/7!`
      },
      
      // Cart messages
      'cart.empty': {
        morning: `Your cart is empty ${name}, let's fix that with breakfast!`,
        afternoon: `Empty cart ${name}! Time for a delicious lunch?`,
        evening: `No items yet ${name}, what's for dinner tonight?`,
        night: `Cart's empty ${name}, perfect for a late-night snack!`
      },
      'cart.added': {
        morning: `Great choice ${name}! Added to your morning feast`,
        afternoon: `Perfect ${name}! Added to your lunch`,
        evening: `Excellent ${name}! Added to your dinner`,
        night: `Smart choice ${name}! Added to your late-night order`
      },
      
      // Checkout messages
      'checkout.title': {
        morning: `Breakfast checkout, ${name}!`,
        afternoon: `Lunch checkout, ${name}!`,
        evening: `Dinner checkout, ${name}!`,
        night: `Late-night checkout, ${name}!`
      },
      'checkout.success': {
        morning: `Morning order confirmed ${name}! Your breakfast is on the way!`,
        afternoon: `Lunch ordered ${name}! Get ready to eat!`,
        evening: `Dinner's coming ${name}! Your order is confirmed!`,
        night: `Late-night order ${name}! Your snack is on the way!`
      },
      
      // Profile messages
      'profile.welcome': {
        morning: `Good morning ${name}! Ready for today's food adventure?`,
        afternoon: `Hello ${name}! How's your food day going?`,
        evening: `Evening ${name}! Ready for dinner plans?`,
        night: `Hi ${name}! Late-night food run?`
      },
      
      // Loyalty messages
      'loyalty.welcome': {
        morning: `Good morning ${name}! Your points are ready to use!`,
        afternoon: `Hi ${name}! Check out your points balance!`,
        evening: `Evening ${name}! Your loyalty rewards await!`,
        night: `Night owl ${name}! Your points never sleep!`
      },
      
      // Error messages
      'error.general': {
        morning: `Morning hiccup ${name}! Let's try that again`,
        afternoon: `Afternoon glitch ${name}! One more time?`,
        evening: `Evening bump ${name}! Let's give it another go`,
        night: `Late-night issue ${name}! Refresh and try again`
      },
      
      // Loading messages
      'loading.search': {
        morning: `Finding your breakfast options ${name}...`,
        afternoon: `Searching for lunch ideas ${name}...`,
        evening: `Looking up dinner choices ${name}...`,
        night: `Finding late-night options ${name}...`
      },
      
      // Empty states
      'empty.orders': {
        morning: `No orders yet ${name}! Start with breakfast!`,
        afternoon: `No orders today ${name}! Time for lunch?`,
        evening: `No recent orders ${name}! What's for dinner?`,
        night: `No orders yet ${name}! Try a midnight snack!`
      },
      
      // Recommendations
      'recommendations.title': {
        morning: `${name}'s morning recommendations`,
        afternoon: `${name}'s lunch suggestions`,
        evening: `${name}'s dinner picks`,
        night: `${name}'s late-night cravings`
      }
    };

    const timeSpecificCopy = microcopyLibrary[key]?.[timeOfDay];
    return timeSpecificCopy || fallback || key;
  };

  const getPlaceholder: (context: string, fallback?: string) => string = (context, fallback = '') => {
    const name = userName || 'food lover';
    const timeOfDay = getTimeOfDay();
    
    const placeholders: Record<string, string> = {
      'search': getPersonalizedText('search.placeholder', `What are you craving ${name}?`),
      'email': `your.email@example.com`,
      'phone': `(555) 123-4567`,
      'address': `Where should we deliver ${name}?`,
      'name': userName || 'Your name',
      'notes': `Any special requests ${name}?`,
      'coupon': `Enter your promo code ${name}`,
      'gift.message': `Write a message for your friend, ${name}!`,
      'review': `Share your experience ${name}!`
    };

    return placeholders[context] || fallback || '';
  };

  const getStatusMessage: (status: string, context?: string) => string = (status, context) => {
    const name = userName || 'friend';
    const timeOfDay = getTimeOfDay();
    
    const statusMessages: Record<string, string> = {
      'pending': `Your order is being prepared ${name}!`,
      'confirmed': `Order confirmed ${name}! The kitchen is working on it!`,
      'preparing': `Your food is being prepared with love ${name}!`,
      'ready': `Your order is ready ${name}! Driver is on the way!`,
      'delivering': `Your delicious food is on its way ${name}!`,
      'delivered': `Enjoy your meal ${name}!`,
      'cancelled': `Order cancelled ${name}. We're sorry about that!`,
      'processing': `Processing your request ${name}...`,
      'completed': `All done ${name}! Thank you for your order!`,
      'error': `Something went wrong ${name}, but we'll fix it!`,
      'loading': `Just a moment ${name}...`
    };

    return statusMessages[status] || status;
  };

  const getWelcomeMessage: () => string = () => {
    const greeting = getTimeBasedGreeting();
    const name = userName || 'food lover';
    const timeOfDay = getTimeOfDay();
    
    const welcomeMessages = {
      morning: [
        `${greeting} ${name}! Ready for a delicious breakfast?`,
        `${greeting} ${name}! Let's make today delicious!`,
        `${greeting} ${name}! Your morning food adventure starts here!`
      ],
      afternoon: [
        `${greeting} ${name}! What's on your lunch menu today?`,
        `${greeting} ${name}! Time for a midday treat!`,
        `${greeting} ${name}! Let's find your perfect lunch!`
      ],
      evening: [
        `${greeting} ${name}! What delicious dinner awaits?`,
        `${greeting} ${name}! Ready for an evening feast?`,
        `${greeting} ${name}! Let's make dinner special tonight!`
      ],
      night: [
        `${greeting} ${name}! Late-night cravings? We've got you!`,
        `${greeting} ${name}! Perfect time for a midnight snack!`,
        `${greeting} ${name}! Your 24/7 food companion is here!`
      ]
    };

    const messages = welcomeMessages[timeOfDay];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const updateUserName: (name: string) => void = (name) => {
    setUserName(name);
  };

  const value: MicrocopyContextType = {
    getPersonalizedText,
    getPlaceholder,
    getStatusMessage,
    getWelcomeMessage,
    getTimeBasedGreeting,
    updateUserName
  };

  return (
    <MicrocopyContext.Provider value={value}>
      {children}
    </MicrocopyContext.Provider>
  );
};

// Hook for easy access to personalized text
export const usePersonalizedText = () => {
  const { getPersonalizedText, getPlaceholder, getStatusMessage, getWelcomeMessage } = useMicrocopy();
  
  return {
    getText: getPersonalizedText,
    getPlaceholder,
    getStatusMessage,
    getWelcomeMessage
  };
};

// Component for displaying personalized messages
export const PersonalizedMessage: React.FC<{
  type: 'welcome' | 'status' | 'placeholder';
  content: string;
  context?: string;
  className?: string;
}> = ({ type, content, context, className = '' }) => {
  const { getText, getStatusMessage, getPlaceholder } = usePersonalizedText();
  
  const getMessage = () => {
    switch (type) {
      case 'welcome':
        return getText(content);
      case 'status':
        return getStatusMessage(content, context);
      case 'placeholder':
        return getPlaceholder(content);
      default:
        return content;
    }
  };

  return (
    <span className={className}>
      {getMessage()}
    </span>
  );
};

export default MicrocopyProvider;
