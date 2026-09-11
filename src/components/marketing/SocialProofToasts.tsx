import React, { useState, useEffect, useCallback } from 'react';
import { X, ShoppingCart, Star, Users, Gift, Trophy, MapPin } from 'lucide-react';
import { useAudioUX } from '@/utils/audio-ux';

interface SocialProofEvent {
  id: string;
  type: 'order' | 'new_member' | 'review' | 'gift_sent' | 'milestone';
  message: string;
  details: string;
  timestamp: Date;
  location?: string;
  userName?: string;
  avatar?: string;
  icon: React.ReactNode;
  priority: 'low' | 'medium' | 'high';
}

interface SocialProofToastProps {
  event: SocialProofEvent;
  onClose: (id: string) => void;
  isVisible: boolean;
}

const SocialProofToast: React.FC<SocialProofToastProps> = ({ event, onClose, isVisible }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      
      // Auto-remove after 6 seconds
      const timer = setTimeout(() => {
        setShouldRender(false);
        setTimeout(() => onClose(event.id), 300);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, event.id, onClose]);

  if (!shouldRender) return null;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400';
      case 'medium':
        return 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-900 border-orange-300';
      default:
        return 'bg-card text-foreground border-gray-200';
    }
  };

  return (
    <div
      className={`
        relative max-w-sm mx-4 mb-3 p-4 rounded-lg shadow-lg border
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getPriorityStyles(event.priority)}
      `}
    >
      {/* Close button */}
      <button
        onClick={() => {
          setShouldRender(false);
          setTimeout(() => onClose(event.id), 300);
        }}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          event.priority === 'high' ? 'bg-card bg-opacity-20' : 'bg-orange-100'
        }`}>
          {event.icon}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">
            {event.message}
          </p>
          <p className="text-xs opacity-80 mb-2">
            {event.details}
          </p>
          
          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <MapPin className="w-3 h-3" />
              <span>{event.location}</span>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="text-xs opacity-60 mt-1">
            {formatRelativeTime(event.timestamp)}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-card bg-opacity-30 rounded-b-lg transition-all duration-6000 ease-linear"
        style={{
          animation: 'shrinkWidth 6s linear forwards'
        }}
      />
    </div>
  );
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// Main Social Proof Manager
export const SocialProofManager: React.FC = () => {
  const [events, setEvents] = useState<SocialProofEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());
  const { playSound } = useAudioUX();

  // Generate mock social proof events
  const generateMockEvent = useCallback((): SocialProofEvent => {
    const eventTypes = [
      {
        type: 'order' as const,
        messages: [
          'Someone just ordered',
          'New order placed',
          'Fresh order incoming'
        ],
        details: [
          'Burger Palace combo meal',
          'Pizza Margherita',
          'Sushi Deluxe Set',
          'Tacos al Pastor',
          'Caesar Salad'
        ],
        icon: <ShoppingCart className="w-5 h-5" />,
        priority: 'medium' as const
      },
      {
        type: 'new_member' as const,
        messages: [
          'New GÜELL Club member',
          'Someone joined the club',
          'Welcome new member'
        ],
        details: [
          'Silver tier achieved',
          'Gold member joined',
          'Bronze level unlocked',
          'Platinum member'
        ],
        icon: <Trophy className="w-5 h-5" />,
        priority: 'high' as const
      },
      {
        type: 'review' as const,
        messages: [
          'New review posted',
          'Customer feedback',
          'Rating received'
        ],
        details: [
          '5 stars for Burger Palace',
          'Excellent service!',
          'Amazing food quality',
          'Fast delivery'
        ],
        icon: <Star className="w-5 h-5" />,
        priority: 'medium' as const
      },
      {
        type: 'gift_sent' as const,
        messages: [
          'Gift card sent',
          'Meal gifted',
          'Surprise delivered'
        ],
        details: [
          '$25 gift to a friend',
          'Birthday meal surprise',
          'Thank you gift',
          'Celebration treat'
        ],
        icon: <Gift className="w-5 h-5" />,
        priority: 'high' as const
      },
      {
        type: 'milestone' as const,
        messages: [
          'Milestone reached',
          'Achievement unlocked',
          'Record broken'
        ],
        details: [
          '1000th order today',
          '5000 happy customers',
          'New restaurant joined',
          'Best day ever!'
        ],
        icon: <Users className="w-5 h-5" />,
        priority: 'low' as const
      }
    ];

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const message = eventType.messages[Math.floor(Math.random() * eventType.messages.length)];
    const detail = eventType.details[Math.floor(Math.random() * eventType.details.length)];
    
    const locations = ['Downtown', 'Uptown', 'Westside', 'Eastside', 'Midtown', 'North District'];
    const location = locations[Math.floor(Math.random() * locations.length)];

    return {
      id: `event-${Date.now()}-${Math.random()}`,
      type: eventType.type,
      message,
      details: detail,
      timestamp: new Date(),
      location,
      icon: eventType.icon,
      priority: eventType.priority
    };
  }, []);

  // Start generating events
  useEffect(() => {
    // Generate first event after 2 seconds
    const initialTimer = setTimeout(() => {
      const newEvent = generateMockEvent();
      setEvents(prev => [...prev, newEvent]);
      setVisibleEvents(prev => new Set([...prev, newEvent.id]));
      playSound('notification', 0.2);
    }, 2000);

    // Generate events periodically
    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents(prev => [...prev, newEvent]);
      setVisibleEvents(prev => new Set([...prev, newEvent.id]));
      playSound('notification', 0.2);
    }, 8000 + Math.random() * 4000); // 8-12 seconds interval

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [generateMockEvent, playSound]);

  const handleClose = (eventId: string) => {
    setVisibleEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-h-screen overflow-y-auto pointer-events-none">
      {events.map(event => (
        <div key={event.id} className="pointer-events-auto">
          <SocialProofToast
            event={event}
            onClose={handleClose}
            isVisible={visibleEvents.has(event.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Hook for manual social proof events
export const useSocialProof = () => {
  const [events, setEvents] = useState<SocialProofEvent[]>([]);
  const { playSound } = useAudioUX();

  const addEvent = useCallback((event: Omit<SocialProofEvent, 'id' | 'timestamp'>) => {
    const newEvent: SocialProofEvent = {
      ...event,
      id: `manual-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    
    setEvents(prev => [...prev, newEvent]);
    playSound('notification', 0.2);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
      setEvents(prev => prev.filter(e => e.id !== newEvent.id));
    }, 6000);
  }, [playSound]);

  const addOrderEvent = useCallback((userName: string, orderDetails: string, location: string) => {
    addEvent({
      type: 'order',
      message: `${userName} just placed an order`,
      details: orderDetails,
      location,
      icon: <ShoppingCart className="w-5 h-5" />,
      priority: 'medium'
    });
  }, [addEvent]);

  const addNewMemberEvent = useCallback((userName: string, tier: string) => {
    addEvent({
      type: 'new_member',
      message: `${userName} joined GÜELL Club`,
      details: `${tier} tier achieved`,
      icon: <Trophy className="w-5 h-5" />,
      priority: 'high'
    });
  }, [addEvent]);

  const addGiftEvent = useCallback((fromUser: string, toUser: string, amount: string) => {
    addEvent({
      type: 'gift_sent',
      message: `${fromUser} sent a gift`,
      details: `${amount} meal gift card`,
      icon: <Gift className="w-5 h-5" />,
      priority: 'high'
    });
  }, [addEvent]);

  return {
    events,
    addEvent,
    addOrderEvent,
    addNewMemberEvent,
    addGiftEvent
  };
};

export default SocialProofManager;
