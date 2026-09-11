export interface FoodModifier {
  id: string;
  name: string;
  price: number;
  type: 'modifier' | 'addon';
  category?: string;
}

export interface ModifierGroup {
  id: string;
  name: string;
  type: 'single-choice' | 'multi-choice';
  required: boolean;
  options: FoodModifier[];
  minSelections?: number;
  maxSelections?: number;
}

export interface Merchant {
  id: string;
  businessName: string;
  logo: string;
  banner: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zip: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deliveryRadius: number; // in miles
  hours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  notificationEmail: string;
  phone: string;
  website?: string;
  story?: string; // "Story of Chef" section
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  isActive: boolean;
  verified: boolean;
  cuisineType: string[];
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  merchantId: string;
  isActive: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  previousPrice?: number;
  discount?: number;
  image: string;
  category: string;
  merchantId: string;
  rating: number;
  deliveryTime: string;
  deliveryPrice: string;
  modifierGroups?: ModifierGroup[];
  promo?: string;
  isActive: boolean;
  inventory: number; // Stock level
  allergens?: string[]; // For dietary restrictions
}

export interface FoodCartItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  selectedModifiers: FoodModifier[];
  selectedOptions: { [groupId: string]: FoodModifier[] };
  specialInstructions?: string;
  totalPrice: number;
}

export interface FoodOrder {
  id: string;
  merchantId: string;
  items: FoodCartItem[];
  deliveryAddress: DeliveryAddress;
  specialInstructions?: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  createdAt: Date;
  estimatedDeliveryTime: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  reference?: string;
  instructions?: string;
}

export interface FoodCheckoutData {
  deliveryAddress: DeliveryAddress;
  specialInstructions?: string;
  paymentMethod: string;
}
