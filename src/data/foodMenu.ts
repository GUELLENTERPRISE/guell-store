import { FoodItem, FoodModifier } from "@/types/food";

export const foodModifiers: FoodModifier[] = [
  // Burger Modifiers
  { id: 'no-onion', name: 'No Onion', price: 0, type: 'modifier', category: 'Burgers' },
  { id: 'no-tomato', name: 'No Tomato', price: 0, type: 'modifier', category: 'Burgers' },
  { id: 'no-lettuce', name: 'No Lettuce', price: 0, type: 'modifier', category: 'Burgers' },
  { id: 'no-pickle', name: 'No Pickle', price: 0, type: 'modifier', category: 'Burgers' },
  { id: 'extra-cheese', name: 'Extra Cheese', price: 1.50, type: 'addon', category: 'Burgers' },
  { id: 'extra-bacon', name: 'Extra Bacon', price: 2.00, type: 'addon', category: 'Burgers' },
  { id: 'double-patty', name: 'Double Patty', price: 3.00, type: 'addon', category: 'Burgers' },
  
  // Pizza Modifiers
  { id: 'no-mushrooms', name: 'No Mushrooms', price: 0, type: 'modifier', category: 'Pizza' },
  { id: 'no-olives', name: 'No Olives', price: 0, type: 'modifier', category: 'Pizza' },
  { id: 'extra-cheese-pizza', name: 'Extra Cheese', price: 2.00, type: 'addon', category: 'Pizza' },
  { id: 'extra-toppings', name: 'Extra Toppings', price: 3.00, type: 'addon', category: 'Pizza' },
  { id: 'thin-crust', name: 'Thin Crust', price: 0, type: 'modifier', category: 'Pizza' },
  { id: 'thick-crust', name: 'Thick Crust', price: 0, type: 'modifier', category: 'Pizza' },
  
  // Sushi Modifiers
  { id: 'no-wasabi', name: 'No Wasabi', price: 0, type: 'modifier', category: 'Sushi' },
  { id: 'no-ginger', name: 'No Ginger', price: 0, type: 'modifier', category: 'Sushi' },
  { id: 'extra-soy-sauce', name: 'Extra Soy Sauce', price: 0.50, type: 'addon', category: 'Sushi' },
  { id: 'extra-salmon', name: 'Extra Salmon', price: 4.00, type: 'addon', category: 'Sushi' },
  
  // General Modifiers
  { id: 'extra-spicy', name: 'Extra Spicy', price: 0.50, type: 'addon', category: 'All' },
  { id: 'no-spicy', name: 'No Spicy', price: 0, type: 'modifier', category: 'All' },
  { id: 'gluten-free', name: 'Gluten Free', price: 2.00, type: 'addon', category: 'All' },
];

export const foodMenu: FoodItem[] = [
  {
    id: 'burger-1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and pickles',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1568901343476-25c52d4f15e9?w=300&h=200&fit=crop',
    category: 'Burgers',
    restaurant: 'Burger Palace',
    rating: 4.6,
    deliveryTime: '20-30 min',
    deliveryPrice: '$1.99',
    modifiers: foodModifiers.filter(m => m.category === 'Burgers' || m.category === 'All'),
    promo: '20% OFF'
  },
  {
    id: 'pizza-1',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
    category: 'Pizza',
    restaurant: 'Pizza Palace',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryPrice: '$2.99',
    modifiers: foodModifiers.filter(m => m.category === 'Pizza' || m.category === 'All'),
    promo: 'FREE DELIVERY'
  },
  {
    id: 'sushi-1',
    name: 'California Roll',
    description: 'Crab, avocado, and cucumber with sesame seeds',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1579584429530-5e0d0c4d5b7d?w=300&h=200&fit=crop',
    category: 'Sushi',
    restaurant: 'Sushi Express',
    rating: 4.9,
    deliveryTime: '30-40 min',
    deliveryPrice: '$3.99',
    modifiers: foodModifiers.filter(m => m.category === 'Sushi' || m.category === 'All')
  },
  {
    id: 'burger-2',
    name: 'Cheeseburger',
    description: 'Classic burger with melted cheddar cheese',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    category: 'Burgers',
    restaurant: 'Burger Palace',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryPrice: '$1.99',
    modifiers: foodModifiers.filter(m => m.category === 'Burgers' || m.category === 'All')
  },
  {
    id: 'pizza-2',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella cheese',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
    category: 'Pizza',
    restaurant: 'Pizza Palace',
    rating: 4.7,
    deliveryTime: '25-35 min',
    deliveryPrice: '$2.99',
    modifiers: foodModifiers.filter(m => m.category === 'Pizza' || m.category === 'All')
  },
  {
    id: 'asian-1',
    name: 'Pad Thai',
    description: 'Traditional Thai noodles with shrimp and peanuts',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1563245372-f15324654270?w=300&h=200&fit=crop',
    category: 'Asian',
    restaurant: 'Thai Kitchen',
    rating: 4.7,
    deliveryTime: '35-45 min',
    deliveryPrice: '$2.49',
    modifiers: foodModifiers.filter(m => m.category === 'All'),
    promo: '15% OFF'
  },
  {
    id: 'mexican-1',
    name: 'Taco Supreme',
    description: 'Three tacos with beef, cheese, and fresh vegetables',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
    category: 'Mexican',
    restaurant: 'Taco Fiesta',
    rating: 4.5,
    deliveryTime: '25-35 min',
    deliveryPrice: '$1.99',
    modifiers: foodModifiers.filter(m => m.category === 'All')
  },
  {
    id: 'healthy-1',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan and croutons',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
    category: 'Healthy',
    restaurant: 'Green Bowl',
    rating: 4.4,
    deliveryTime: '20-30 min',
    deliveryPrice: '$1.99',
    modifiers: foodModifiers.filter(m => m.category === 'All')
  },
  {
    id: 'dessert-1',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with vanilla frosting',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&h=200&fit=crop',
    category: 'Desserts',
    restaurant: 'Sweet Treats',
    rating: 4.9,
    deliveryTime: '25-35 min',
    deliveryPrice: '$2.99',
    modifiers: foodModifiers.filter(m => m.category === 'All'),
    promo: 'BUY 1 GET 1'
  },
  {
    id: 'drinks-1',
    name: 'Iced Coffee',
    description: 'Cold brew coffee with ice and milk',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
    category: 'Drinks',
    restaurant: 'Coffee House',
    rating: 4.6,
    deliveryTime: '15-25 min',
    deliveryPrice: '$0.99',
    modifiers: foodModifiers.filter(m => m.category === 'All')
  }
];
