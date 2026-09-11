import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useAudioUX } from '@/utils/audio-ux';

// Unified User Profile Interface
interface UnifiedProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bio?: string;
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Address Interface
interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  apartment?: string;
  instructions?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Payment Method Interface
interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  isDefault: boolean;
  cardInfo?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
  };
  paypalInfo?: {
    email: string;
    accountName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Order Interface (Unified)
interface UnifiedOrder {
  id: string;
  userId: string;
  type: 'food' | 'store';
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled' | 'completed';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    category?: string;
  }>;
  totalAmount: number;
  currency: string;
  deliveryAddress?: Address;
  paymentMethod: PaymentMethod;
  timestamps: {
    createdAt: string;
    confirmedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
  metadata: {
    restaurantName?: string;
    storeMerchant?: string;
    deliveryTime?: string;
    trackingNumber?: string;
    loyaltyPointsEarned?: number;
  };
}

// Unified User State
interface UnifiedUserState {
  profile: UnifiedProfile | null;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  orders: UnifiedOrder[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
}

// Action Types
type UnifiedUserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PROFILE'; payload: UnifiedProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UnifiedProfile> }
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'UPDATE_ADDRESS'; payload: { id: string; updates: Partial<Address> } }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'SET_DEFAULT_ADDRESS'; payload: string }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'UPDATE_PAYMENT_METHOD'; payload: { id: string; updates: Partial<PaymentMethod> } }
  | { type: 'DELETE_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_DEFAULT_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_ORDERS'; payload: UnifiedOrder[] }
  | { type: 'ADD_ORDER'; payload: UnifiedOrder }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<UnifiedOrder> } }
  | { type: 'SET_LAST_SYNC'; payload: string };

// Initial State
const initialState: UnifiedUserState = {
  profile: null,
  addresses: [],
  paymentMethods: [],
  orders: [],
  isLoading: false,
  error: null,
  lastSync: null,
};

// Reducer
const unifiedUserReducer = (state: UnifiedUserState, action: UnifiedUserAction): UnifiedUserState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, isLoading: false };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload, updatedAt: new Date().toISOString() } : null,
      };
    
    case 'SET_ADDRESSES':
      return { ...state, addresses: action.payload };
    
    case 'ADD_ADDRESS':
      return { ...state, addresses: [...state.addresses, action.payload] };
    
    case 'UPDATE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map(addr =>
          addr.id === action.payload.id ? { ...addr, ...action.payload.updates, updatedAt: new Date().toISOString() } : addr
        ),
      };
    
    case 'DELETE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.filter(addr => addr.id !== action.payload),
      };
    
    case 'SET_DEFAULT_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === action.payload,
        })),
      };
    
    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };
    
    case 'ADD_PAYMENT_METHOD':
      return { ...state, paymentMethods: [...state.paymentMethods, action.payload] };
    
    case 'UPDATE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.map(pm =>
          pm.id === action.payload.id ? { ...pm, ...action.payload.updates, updatedAt: new Date().toISOString() } : pm
        ),
      };
    
    case 'DELETE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(pm => pm.id !== action.payload),
      };
    
    case 'SET_DEFAULT_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm.id === action.payload,
        })),
      };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, ...action.payload.updates } : order
        ),
      };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    
    default:
      return state;
  }
};

// Context
const UnifiedUserContext = createContext<{
  state: UnifiedUserState;
  actions: {
    // Profile
    updateProfile: (updates: Partial<UnifiedProfile>) => Promise<void>;
    
    // Addresses
    addAddress: (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    
    // Payment Methods
    addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
    deletePaymentMethod: (id: string) => Promise<void>;
    setDefaultPaymentMethod: (id: string) => Promise<void>;
    
    // Orders
    refreshOrders: () => Promise<void>;
    
    // Sync
    syncAllData: () => Promise<void>;
  };
} | undefined>(undefined);

// Provider
export const UnifiedUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(unifiedUserReducer, initialState);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { toggleMute, setVolume: setAudioVolume } = useAudioUX();

  const loadUserData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Load profile
      await loadProfile();
      // Load addresses
      await loadAddresses();
      // Load payment methods
      await loadPaymentMethods();
      // Load orders
      await loadOrders();
      
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date().toISOString() });
    } catch (error) {
      // TODO: add proper error reporting
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data on logout
      dispatch({ type: 'SET_PROFILE', payload: null });
      dispatch({ type: 'SET_ADDRESSES', payload: [] });
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: [] });
      dispatch({ type: 'SET_ORDERS', payload: [] });
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use real user metadata with consistent fallbacks
    const userProfile: UnifiedProfile = {
      id: user.id,
      firstName: user.user_metadata?.first_name || 'Andres',
      lastName: user.user_metadata?.last_name || '',
      email: user.email || '',
      phoneNumber: user.user_metadata?.phone_number || user.phone || '',
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      dateOfBirth: user.user_metadata?.date_of_birth,
      gender: user.user_metadata?.gender || 'prefer_not_to_say',
      bio: user.user_metadata?.bio || '',
      preferences: {
        newsletter: user.user_metadata?.newsletter ?? true,
        smsNotifications: user.user_metadata?.sms_notifications ?? true,
        emailNotifications: user.user_metadata?.email_notifications ?? true,
        pushNotifications: user.user_metadata?.push_notifications ?? true,
        marketingEmails: user.user_metadata?.marketing_emails ?? false,
      },
      createdAt: user.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'SET_PROFILE', payload: userProfile });
  };

  const loadAddresses = async () => {
    if (!user) return;

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockAddresses: Address[] = [
      {
        id: 'addr-1',
        userId: user.id,
        type: 'home',
        isDefault: true,
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        apartment: 'Apt 4B',
        instructions: 'Ring doorbell 3 times',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'addr-2',
        userId: user.id,
        type: 'work',
        isDefault: false,
        street: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA',
        createdAt: '2023-02-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
    ];

    dispatch({ type: 'SET_ADDRESSES', payload: mockAddresses });
  };

  const loadPaymentMethods = async () => {
    if (!user) return;

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userName = `${user.user_metadata?.first_name || user.email?.split('@')[0] || 'User'} ${user.user_metadata?.last_name || ''}`.trim();
    
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 'pm-1',
        userId: user.id,
        type: 'card',
        isDefault: true,
        cardInfo: {
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          holderName: userName,
        },
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pm-2',
        userId: user.id,
        type: 'paypal',
        isDefault: false,
        paypalInfo: {
          email: user.email || '',
          accountName: userName,
        },
        createdAt: '2023-03-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
    ];

    dispatch({ type: 'SET_PAYMENT_METHODS', payload: mockPaymentMethods });
  };

  const loadOrders = async () => {
    if (!user) return;

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockOrders: UnifiedOrder[] = [
      {
        id: 'order-1',
        userId: user.id,
        type: 'food',
        orderNumber: 'FOOD-001',
        status: 'delivered',
        items: [
          { id: '1', name: 'Burger Combo', quantity: 1, price: 12.99, image: '/burger.jpg' },
          { id: '2', name: 'Fries', quantity: 1, price: 3.99, image: '/fries.jpg' },
        ],
        totalAmount: 16.98,
        currency: 'USD',
        deliveryAddress: state.addresses[0],
        paymentMethod: state.paymentMethods[0],
        timestamps: {
          createdAt: '2024-01-15T00:00:00.000Z',
          confirmedAt: '2024-01-15T00:00:00.000Z',
          deliveredAt: '2024-01-15T00:00:00.000Z',
        },
        metadata: {
          restaurantName: 'Burger Palace',
          deliveryTime: '25-35 min',
          loyaltyPointsEarned: 85,
        },
      },
      {
        id: 'order-2',
        userId: user.id,
        type: 'store',
        orderNumber: 'STORE-001',
        status: 'completed',
        items: [
          { id: '3', name: 'Vintage T-Shirt', quantity: 2, price: 29.99, image: '/tshirt.jpg', category: 'clothing' },
        ],
        totalAmount: 59.98,
        currency: 'USD',
        paymentMethod: state.paymentMethods[0],
        timestamps: {
          createdAt: '2024-01-10T00:00:00.000Z',
          confirmedAt: '2024-01-10T00:00:00.000Z',
        },
        metadata: {
          storeMerchant: 'Vintage Store',
          trackingNumber: 'TRACK123456',
        },
      },
    ];

    dispatch({ type: 'SET_ORDERS', payload: mockOrders });
  };

  // Action implementations
  const updateProfile = async (updates: Partial<UnifiedProfile>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
      
      // Update cross-platform preferences
      if (updates.preferences) {
        // Note: Cross-platform preference sync removed as these properties don't exist in the interface
        // Add sync logic here when needed for existing preference properties
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAddress: Address = {
        ...address,
        id: `addr-${Date.now()}`,
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({ type: 'ADD_ADDRESS', payload: newAddress });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add address' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({ type: 'UPDATE_ADDRESS', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update address' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteAddress = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({ type: 'DELETE_ADDRESS', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete address' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setDefaultAddress = async (id: string) => {
    dispatch({ type: 'SET_DEFAULT_ADDRESS', payload: id });
  };

  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm-${Date.now()}`,
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({ type: 'ADD_PAYMENT_METHOD', payload: newPaymentMethod });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add payment method' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({ type: 'UPDATE_PAYMENT_METHOD', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update payment method' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({ type: 'DELETE_PAYMENT_METHOD', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete payment method' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    dispatch({ type: 'SET_DEFAULT_PAYMENT_METHOD', payload: id });
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  const syncAllData = async () => {
    await loadUserData();
  };

  const actions = {
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    refreshOrders,
    syncAllData,
  };

  return (
    <UnifiedUserContext.Provider value={{ state, actions }}>
      {children}
    </UnifiedUserContext.Provider>
  );
};

// Hook
export const useUnifiedUser = () => {
  const context = useContext(UnifiedUserContext);
  if (context === undefined) {
    throw new Error('useUnifiedUser must be used within a UnifiedUserProvider');
  }
  return context;
};

export default UnifiedUserProvider;
