import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Award, MapPin, Heart, Star, Utensils, Leaf, Truck } from 'lucide-react';
import { getAllMerchants } from '@/data/merchantData';

interface ChefStory {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  category: 'origin' | 'quality' | 'specialty' | 'sustainability' | 'service';
  factType: 'quick-fact' | 'chef-tip' | 'origin-story' | 'quality-promise';
}

interface ChefStoriesCarouselProps {
  merchantId: string;
  isLoading?: boolean;
  className?: string;
}

const ChefStoriesCarousel: React.FC<ChefStoriesCarouselProps> = ({
  merchantId,
  isLoading = false,
  className = ''
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [stories, setStories] = useState<ChefStory[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const merchantStories = generateChefStories(merchantId);
    setStories(merchantStories);
    setCurrentStoryIndex(0);
  }, [merchantId]);

  useEffect(() => {
    if (isPaused || stories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
    }, 4000); // Change story every 4 seconds

    return () => clearInterval(interval);
  }, [isPaused, stories.length]);

  const generateChefStories = (mid: string): ChefStory[] => {
    const merchant = getAllMerchants().find(m => m.id === mid);
    const merchantName = merchant?.businessName || 'Our Restaurant';
    
    const baseStories: ChefStory[] = [
      {
        id: 'origin-1',
        title: 'Family Tradition',
        content: `Our recipes have been passed down through 3 generations at ${merchantName}. Every dish tells a story of heritage and love.`,
        icon: <Heart className="w-5 h-5" />,
        category: 'origin',
        factType: 'origin-story'
      },
      {
        id: 'quality-1',
        title: 'Fresh Ingredients Daily',
        content: `We source 90% of our ingredients from local farms within 50 miles. Freshness is not just a promise, it's our standard.`,
        icon: <Leaf className="w-5 h-5" />,
        category: 'quality',
        factType: 'quality-promise'
      },
      {
        id: 'specialty-1',
        title: 'Signature Dish',
        content: `Our chef spent 2 years perfecting the signature recipe. It takes 6 hours to prepare and uses 12 secret spices.`,
        icon: <Award className="w-5 h-5" />,
        category: 'specialty',
        factType: 'chef-tip'
      },
      {
        id: 'sustainability-1',
        title: 'Zero Waste Kitchen',
        content: `We compost all food scraps and use eco-friendly packaging. Our carbon footprint is 40% lower than industry average.`,
        icon: <Leaf className="w-5 h-5" />,
        category: 'sustainability',
        factType: 'quick-fact'
      },
      {
        id: 'service-1',
        title: '30-Minute Promise',
        content: `From kitchen to your door in 30 minutes or less. Our delivery team knows every street in the neighborhood.`,
        icon: <Truck className="w-5 h-5" />,
        category: 'service',
        factType: 'quick-fact'
      },
      {
        id: 'quality-2',
        title: 'Hand-Crafted Daily',
        content: `Everything is made fresh daily. No freezers, no microwaves. Just traditional cooking methods.`,
        icon: <ChefHat className="w-5 h-5" />,
        category: 'quality',
        factType: 'quality-promise'
      },
      {
        id: 'origin-2',
        title: 'Local Roots',
        content: `Founded right here in the neighborhood. We've been serving this community for over 15 years.`,
        icon: <MapPin className="w-5 h-5" />,
        category: 'origin',
        factType: 'origin-story'
      },
      {
        id: 'specialty-2',
        title: 'Secret Recipe',
        content: `Our grandmother's recipe book contains over 200 recipes. Only 12 are on the menu - the rest are family secrets!`,
        icon: <Star className="w-5 h-5" />,
        category: 'specialty',
        factType: 'chef-tip'
      }
    ];

    // Merchant-specific stories
    const merchantSpecificStories: Record<string, Partial<ChefStory>[]> = {
      'merchant-1': [
        {
          title: 'Burger Perfection',
          content: 'Our patties are hand-pressed daily and cooked at exactly 155°F for the perfect juicy texture.'
        },
        {
          title: 'Local Beef Partnership',
          content: 'We work with a single local farm that supplies all our beef. The cows are grass-fed and hormone-free.'
        }
      ],
      'merchant-2': [
        {
          title: 'Wood-Fired Oven',
          content: 'Our pizza oven was imported from Italy and heats to 900°F. It cooks a perfect pizza in 90 seconds.'
        },
        {
          title: 'Sourdough Starter',
          content: 'Our pizza dough uses a 10-year-old sourdough starter. It ferments for 48 hours for maximum flavor.'
        }
      ],
      'merchant-3': [
        {
          title: 'Sushi Master',
          content: 'Our head chef trained in Tokyo for 8 years before bringing authentic techniques here.'
        },
        {
          title: 'Daily Fish Delivery',
          content: 'We receive fresh fish every morning from the coast. It\'s never more than 24 hours from ocean to plate.'
        }
      ]
    };

    const specific = merchantSpecificStories[merchantId] || [];
    
    return [
      ...baseStories.slice(0, 5),
      ...specific.map((story, index) => ({
        id: `specific-${index}`,
        icon: <Utensils className="w-5 h-5" />,
        category: 'specialty' as const,
        factType: 'quick-fact' as const,
        ...story
      } as ChefStory))
    ];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'origin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quality': return 'bg-green-100 text-green-800 border-green-200';
      case 'specialty': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sustainability': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'service': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-muted text-gray-800 border-gray-200';
    }
  };

  const getFactTypeIcon = (factType: string) => {
    switch (factType) {
      case 'quick-fact': return <Star className="w-4 h-4" />;
      case 'chef-tip': return <ChefHat className="w-4 h-4" />;
      case 'origin-story': return <Heart className="w-4 h-4" />;
      case 'quality-promise': return <Award className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-card rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  const currentStory = stories[currentStoryIndex];

  return (
    <div 
      className={`bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 shadow-sm border border-orange-200 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Chef's Stories</h3>
            <p className="text-xs text-muted-foreground">Behind your delicious meal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStoryIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStoryIndex 
                  ? 'bg-orange-500 w-6' 
                  : 'bg-orange-200 hover:bg-orange-300'
              }`}
              aria-label={`Go to story ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Story Content */}
      <div className="space-y-3">
        {/* Story Header */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getCategoryColor(currentStory.category)}`}>
            {currentStory.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground">{currentStory.title}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(currentStory.category)}`}>
                {getFactTypeIcon(currentStory.factType)}
                <span className="ml-1 capitalize">{currentStory.factType.replace('-', ' ')}</span>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentStory.content}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Story {currentStoryIndex + 1} of {stories.length}</span>
          <span>·</span>
          <span>{isPaused ? 'Paused' : 'Auto-playing'}</span>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-1 mt-4">
        {stories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStoryIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentStoryIndex 
                ? 'bg-orange-500' 
                : 'bg-orange-200'
            }`}
            aria-label={`Story ${index + 1}`}
          />
        ))}
      </div>

      {/* Pause/Play Hint */}
      <div className="text-center text-xs text-muted-foreground mt-2">
        {isPaused ? 'Hover to resume' : 'Hover to pause'}
      </div>
    </div>
  );
};

// Hook for managing chef stories during loading states
export const useChefStories = (merchantId: string) => {
  const [stories, setStories] = useState<ChefStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStories = async () => {
    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const merchantStories = generateChefStories(merchantId);
    setStories(merchantStories);
    setIsLoading(false);
  };

  const generateChefStories = (mid: string): ChefStory[] => {
    // This would be the same logic as in the component
    // For now, return empty array
    return [];
  };

  return {
    stories,
    isLoading,
    loadStories
  };
};

export default ChefStoriesCarousel;
