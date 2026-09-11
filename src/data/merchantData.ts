import { Merchant, FoodCategory, FoodItem, ModifierGroup, FoodModifier } from '@/types/food';

export const sampleMerchants: Merchant[] = [
  {
    id: 'merchant-1',
    businessName: 'Burger Palace',
    logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1568901343476-25c52d4f15e9?w=800&h=300&fit=crop',
    address: {
      street: 'Main Street',
      number: '123',
      city: 'Downtown',
      state: 'NY',
      zip: '10001',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    deliveryRadius: 5,
    hours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' }
    },
    notificationEmail: 'orders@burgerpalace.com',
    phone: '+1-555-0123',
    website: 'https://burgerpalace.com',
    story: 'Family-owned since 1985, Burger Palace started as a small food truck with a dream to serve the perfect burger. Three generations later, we still use Grandma Rose\'s secret recipe for our signature sauce. Every burger is hand-pressed with locally sourced beef and served with a smile.',
    rating: 4.6,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    isActive: true,
    verified: true,
    cuisineType: ['American', 'Burgers', 'Fast Food']
  },
  {
    id: 'merchant-2',
    businessName: 'Pizza Palace',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1555399503-87dd5e32f71c?w=800&h=300&fit=crop',
    address: {
      street: 'Oak Avenue',
      number: '456',
      city: 'Midtown',
      state: 'NY',
      zip: '10002',
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    deliveryRadius: 4,
    hours: {
      monday: { open: '10:30', close: '23:00' },
      tuesday: { open: '10:30', close: '23:00' },
      wednesday: { open: '10:30', close: '23:00' },
      thursday: { open: '10:30', close: '23:00' },
      friday: { open: '10:30', close: '00:00' },
      saturday: { open: '10:30', close: '00:00' },
      sunday: { open: '11:00', close: '22:00' }
    },
    notificationEmail: 'orders@pizzapalace.com',
    phone: '+1-555-0456',
    website: 'https://pizzapalace.com',
    story: 'Born in Naples, Italy, Chef Marco brought his family\'s pizza recipes to New York in 1992. Our wood-fired oven was imported directly from Italy and has been baking perfect pizzas for over 30 years. We use San Marzano tomatoes and fresh mozzarella daily.',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    isActive: true,
    verified: true,
    cuisineType: ['Italian', 'Pizza']
  },
  {
    id: 'merchant-3',
    businessName: 'Sushi Express',
    logo: 'https://images.unsplash.com/photo-1579584429530-5e0d0c4d5b7d?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1579584429530-5e0d0c4d5b7d?w=800&h=300&fit=crop',
    address: {
      street: 'Pine Street',
      number: '789',
      city: 'Uptown',
      state: 'NY',
      zip: '10003',
      coordinates: { lat: 40.7831, lng: -73.9712 }
    },
    deliveryRadius: 6,
    hours: {
      monday: { open: '11:30', close: '21:30' },
      tuesday: { open: '11:30', close: '21:30' },
      wednesday: { open: '11:30', close: '21:30' },
      thursday: { open: '11:30', close: '21:30' },
      friday: { open: '11:30', close: '22:00' },
      saturday: { open: '12:00', close: '22:00' },
      sunday: { open: '12:00', close: '21:00' }
    },
    notificationEmail: 'orders@sushiexpress.com',
    phone: '+1-555-0789',
    website: 'https://sushiexpress.com',
    story: 'Master Chef Yuki Tanaka trained in Tokyo for 15 years before opening Sushi Express in 2005. We believe in the art of sushi - each piece is crafted with precision and care. Our fish is delivered daily from Tsukiji Market.',
    rating: 4.9,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    isActive: true,
    verified: true,
    cuisineType: ['Japanese', 'Sushi', 'Asian']
  }
];

export const generateMerchantMenu = (merchantId: string): FoodCategory[] => {
  const merchant = sampleMerchants.find(m => m.id === merchantId);
  if (!merchant) return [];

  switch (merchantId) {
    case 'merchant-1':
      return [
        {
          id: 'burgers',
          name: 'Burgers',
          icon: '🍔',
          color: 'bg-red-100 text-red-600',
          merchantId,
          isActive: true
        },
        {
          id: 'sides',
          name: 'Sides',
          icon: '🍟',
          color: 'bg-orange-100 text-orange-600',
          merchantId,
          isActive: true
        },
        {
          id: 'drinks',
          name: 'Drinks',
          icon: '🥤',
          color: 'bg-blue-100 text-blue-600',
          merchantId,
          isActive: true
        }
      ];
    
    case 'merchant-2':
      return [
        {
          id: 'pizza',
          name: 'Pizza',
          icon: '🍕',
          color: 'bg-orange-100 text-orange-600',
          merchantId,
          isActive: true
        },
        {
          id: 'pasta',
          name: 'Pasta',
          icon: '🍝',
          color: 'bg-green-100 text-green-600',
          merchantId,
          isActive: true
        },
        {
          id: 'salads',
          name: 'Salads',
          icon: '🥗',
          color: 'bg-emerald-100 text-emerald-600',
          merchantId,
          isActive: true
        }
      ];
    
    case 'merchant-3':
      return [
        {
          id: 'sushi',
          name: 'Sushi',
          icon: '🍱',
          color: 'bg-pink-100 text-pink-600',
          merchantId,
          isActive: true
        },
        {
          id: 'rolls',
          name: 'Rolls',
          icon: '🍣',
          color: 'bg-purple-100 text-purple-600',
          merchantId,
          isActive: true
        },
        {
          id: 'sashimi',
          name: 'Sashimi',
          icon: '🐟',
          color: 'bg-yellow-100 text-yellow-600',
          merchantId,
          isActive: true
        }
      ];
    
    default:
      return [];
  }
};

export const generateFoodItems = (merchantId: string, categoryId: string): FoodItem[] => {
  const merchant = sampleMerchants.find(m => m.id === merchantId);
  if (!merchant) return [];

  const commonModifiers: ModifierGroup[] = [
    {
      id: 'dietary',
      name: 'Dietary Preferences',
      type: 'multi-choice',
      required: false,
      options: [
        { id: 'gluten-free', name: 'Gluten Free', price: 2.00, type: 'addon' },
        { id: 'vegetarian', name: 'Vegetarian', price: 0, type: 'modifier' },
        { id: 'vegan', name: 'Vegan', price: 0, type: 'modifier' }
      ]
    }
  ];

  switch (merchantId) {
    case 'merchant-1':
      return [
        {
          id: 'classic-burger',
          name: 'Classic Burger',
          description: 'Juicy beef patty with lettuce, tomato, onion, and pickles',
          price: 10.99,
          image: 'https://images.unsplash.com/photo-1568901343476-25c52d4f15e9?w=300&h=200&fit=crop',
          category: 'burgers',
          merchantId,
          rating: 4.6,
          deliveryTime: '20-30 min',
          deliveryPrice: '$1.99',
          modifierGroups: [
            {
              id: 'meat-choice',
              name: 'Meat Choice',
              type: 'single-choice',
              required: true,
              options: [
                { id: 'beef', name: 'Beef', price: 0, type: 'modifier' },
                { id: 'chicken', name: 'Chicken', price: 0, type: 'modifier' },
                { id: 'veggie', name: 'Veggie Patty', price: 0, type: 'modifier' }
              ]
            },
            {
              id: 'cheese-choice',
              name: 'Cheese Choice',
              type: 'single-choice',
              required: true,
              options: [
                { id: 'cheddar', name: 'Cheddar', price: 0, type: 'modifier' },
                { id: 'swiss', name: 'Swiss', price: 0, type: 'modifier' },
                { id: 'american', name: 'American', price: 0, type: 'modifier' }
              ]
            },
            {
              id: 'extras',
              name: 'Extras',
              type: 'multi-choice',
              required: false,
              options: [
                { id: 'extra-cheese', name: 'Extra Cheese', price: 1.50, type: 'addon' },
                { id: 'extra-bacon', name: 'Extra Bacon', price: 2.00, type: 'addon' },
                { id: 'double-patty', name: 'Double Patty', price: 3.00, type: 'addon' },
                { id: 'extra-onion', name: 'Extra Onion', price: 0.50, type: 'addon' }
              ]
            },
            {
              id: 'remove-ingredients',
              name: 'Remove Ingredients',
              type: 'multi-choice',
              required: false,
              options: [
                { id: 'no-onion', name: 'No Onion', price: 0, type: 'modifier' },
                { id: 'no-tomato', name: 'No Tomato', price: 0, type: 'modifier' },
                { id: 'no-lettuce', name: 'No Lettuce', price: 0, type: 'modifier' },
                { id: 'no-pickle', name: 'No Pickle', price: 0, type: 'modifier' }
              ]
            },
            ...commonModifiers
          ],
          promo: '20% OFF',
          isActive: true,
          inventory: 50,
          allergens: ['gluten', 'dairy']
        },
        {
          id: 'cheeseburger',
          name: 'Cheeseburger',
          description: 'Classic burger with melted cheddar cheese',
          price: 11.99,
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
          category: 'burgers',
          merchantId,
          rating: 4.5,
          deliveryTime: '20-30 min',
          deliveryPrice: '$1.99',
          modifierGroups: [
            {
              id: 'meat-choice',
              name: 'Meat Choice',
              type: 'single-choice',
              required: true,
              options: [
                { id: 'beef', name: 'Beef', price: 0, type: 'modifier' },
                { id: 'chicken', name: 'Chicken', price: 0, type: 'modifier' },
                { id: 'veggie', name: 'Veggie Patty', price: 0, type: 'modifier' }
              ]
            },
            {
              id: 'extras',
              name: 'Extras',
              type: 'multi-choice',
              required: false,
              options: [
                { id: 'extra-cheese', name: 'Extra Cheese', price: 1.50, type: 'addon' },
                { id: 'extra-bacon', name: 'Extra Bacon', price: 2.00, type: 'addon' },
                { id: 'double-patty', name: 'Double Patty', price: 3.00, type: 'addon' }
              ]
            },
            ...commonModifiers
          ],
          isActive: true,
          inventory: 45,
          allergens: ['gluten', 'dairy']
        }
      ];
    
    case 'merchant-2':
      return [
        {
          id: 'margherita-pizza',
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, tomato sauce, and basil',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
          category: 'pizza',
          merchantId,
          rating: 4.8,
          deliveryTime: '25-35 min',
          deliveryPrice: '$2.99',
          modifierGroups: [
            {
              id: 'crust-choice',
              name: 'Crust Type',
              type: 'single-choice',
              required: true,
              options: [
                { id: 'thin-crust', name: 'Thin Crust', price: 0, type: 'modifier' },
                { id: 'thick-crust', name: 'Thick Crust', price: 0, type: 'modifier' },
                { id: 'stuffed-crust', name: 'Stuffed Crust', price: 2.00, type: 'addon' }
              ]
            },
            {
              id: 'toppings',
              name: 'Extra Toppings',
              type: 'multi-choice',
              required: false,
              options: [
                { id: 'extra-cheese-pizza', name: 'Extra Cheese', price: 2.00, type: 'addon' },
                { id: 'pepperoni', name: 'Pepperoni', price: 1.50, type: 'addon' },
                { id: 'mushrooms', name: 'Mushrooms', price: 1.00, type: 'addon' },
                { id: 'olives', name: 'Olives', price: 1.00, type: 'addon' },
                { id: 'extra-sauce', name: 'Extra Sauce', price: 0.50, type: 'addon' }
              ]
            },
            {
              id: 'remove-toppings',
              name: 'Remove Toppings',
              type: 'multi-choice',
              required: false,
              options: [
                { id: 'no-mushrooms', name: 'No Mushrooms', price: 0, type: 'modifier' },
                { id: 'no-olives', name: 'No Olives', price: 0, type: 'modifier' }
              ]
            },
            ...commonModifiers
          ],
          promo: 'FREE DELIVERY',
          isActive: true,
          inventory: 30,
          allergens: ['gluten']
        }
      ];
    
    case 'merchant-3':
      return [
        {
          id: 'california-roll',
          name: 'California Roll',
          description: 'Crab, avocado, and cucumber with sesame seeds',
          price: 15.99,
          image: 'https://images.unsplash.com/photo-1579584429530-5e0d0c4d5b7d?w=300&h=200&fit=crop',
          category: 'sushi',
          merchantId,
          rating: 4.9,
          deliveryTime: '30-40 min',
          deliveryPrice: '$3.99',
          modifierGroups: [
            {
              id: 'fish-choice',
              name: 'Fish Choice',
              type: 'single-choice',
              required: true,
              options: [
                { id: 'salmon', name: 'Salmon', price: 0, type: 'modifier' },
                { id: 'tuna', name: 'Tuna', price: 0, type: 'modifier' },
                { id: 'shrimp', name: 'Shrimp', price: 0, type: 'modifier' }
              ]
            },
            {
              id: 'extras',
              name: 'Extras',
              type: 'multi-choice',
              required: false,
              options: [
                { id: 'extra-salmon', name: 'Extra Salmon', price: 4.00, type: 'addon' },
                { id: 'extra-soy-sauce', name: 'Extra Soy Sauce', price: 0.50, type: 'addon' },
                { id: 'wasabi', name: 'Extra Wasabi', price: 0.50, type: 'addon' }
              ]
            },
            {
              id: 'remove-items',
              name: 'Remove Items',
              type: 'multi-choice',
              required: false,
              options: [
                { id: 'no-wasabi', name: 'No Wasabi', price: 0, type: 'modifier' },
                { id: 'no-ginger', name: 'No Ginger', price: 0, type: 'modifier' }
              ]
            },
            ...commonModifiers
          ],
          isActive: true,
          inventory: 25,
          allergens: ['soy', 'fish']
        }
      ];
    
    default:
      return [];
  }
};

export const getAllMerchants = (): Merchant[] => {
  return sampleMerchants.filter(m => m.isActive);
};

export const getMerchantById = (merchantId: string): Merchant | undefined => {
  return sampleMerchants.find(m => m.id === merchantId);
};
