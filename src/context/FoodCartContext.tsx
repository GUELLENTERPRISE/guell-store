import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FoodItem, FoodCartItem, FoodModifier } from '@/types/food';
import {
  calculateCartTotals,
  calculateLineTotal,
  generateCartItemId,
} from '@/utils/foodCartUtils';

interface FoodCartState {
  items: FoodCartItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

interface FoodCartContextValue {
  cart: FoodCartState;
  addToCart: (
    foodItem: FoodItem,
    quantity?: number,
    selectedModifiers?: FoodModifier[],
    specialInstructions?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  updateModifiers: (cartItemId: string, newModifiers: FoodModifier[]) => void;
  updateSpecialInstructions: (cartItemId: string, instructions: string) => void;
  clearCart: () => void;
  getItemsByRestaurant: () => { [restaurant: string]: FoodCartItem[] };
  isItemInCart: (foodItem: FoodItem, selectedModifiers: FoodModifier[]) => boolean;
  getItemQuantity: (foodItem: FoodItem, selectedModifiers: FoodModifier[]) => number;
  generateCartItemId: typeof generateCartItemId;
}

const DEFAULT_DELIVERY_FEE = 2.99;

const FoodCartContext = createContext<FoodCartContextValue | undefined>(undefined);

export const FoodCartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<FoodCartState>({
    items: [],
    totalItems: 0,
    subtotal: 0,
    deliveryFee: DEFAULT_DELIVERY_FEE,
    tax: 0,
    total: 0,
  });

  const recalculateCartTotals = useCallback((cartState: FoodCartState): FoodCartState => {
    const totals = calculateCartTotals(cartState.items, {
      deliveryFee: cartState.deliveryFee,
    });

    return {
      ...cartState,
      ...totals,
    };
  }, []);

  const addToCart = useCallback((
    foodItem: FoodItem,
    quantity: number = 1,
    selectedModifiers: FoodModifier[] = [],
    specialInstructions?: string
  ) => {
    const cartItemId = generateCartItemId(foodItem, selectedModifiers);
    const totalPrice = calculateLineTotal(foodItem, selectedModifiers, quantity);

    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((item) => item.id === cartItemId);

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevCart.items];
        const existingItem = updatedItems[existingItemIndex];
        const nextQuantity = existingItem.quantity + quantity;

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: nextQuantity,
          specialInstructions: specialInstructions ?? existingItem.specialInstructions,
          totalPrice: calculateLineTotal(foodItem, selectedModifiers, nextQuantity),
        };

        return recalculateCartTotals({ ...prevCart, items: updatedItems });
      }

      const newItem: FoodCartItem = {
        id: cartItemId,
        foodItem,
        quantity,
        selectedModifiers,
        selectedOptions: {},
        specialInstructions,
        totalPrice,
      };

      return recalculateCartTotals({
        ...prevCart,
        items: [...prevCart.items, newItem],
      });
    });
  }, [recalculateCartTotals]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.id !== cartItemId);
      return recalculateCartTotals({ ...prevCart, items: updatedItems });
    });
  }, [recalculateCartTotals]);

  const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: calculateLineTotal(item.foodItem, item.selectedModifiers, newQuantity),
          };
        }
        return item;
      });

      return recalculateCartTotals({ ...prevCart, items: updatedItems });
    });
  }, [removeFromCart, recalculateCartTotals]);

  const updateModifiers = useCallback((cartItemId: string, newModifiers: FoodModifier[]) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.items.findIndex((item) => item.id === cartItemId);
      if (itemIndex === -1) return prevCart;

      const item = prevCart.items[itemIndex];
      const newCartItemId = generateCartItemId(item.foodItem, newModifiers);
      const existingItemIndex = prevCart.items.findIndex((i) => i.id === newCartItemId);

      if (existingItemIndex !== -1 && existingItemIndex !== itemIndex) {
        const updatedItems = prevCart.items.filter((_, index) => index !== itemIndex);
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          totalPrice: calculateLineTotal(
            updatedItems[existingItemIndex].foodItem,
            newModifiers,
            updatedItems[existingItemIndex].quantity + item.quantity
          ),
        };
        return recalculateCartTotals({ ...prevCart, items: updatedItems });
      }

      const updatedItems = prevCart.items.map((entry, index) => {
        if (index === itemIndex) {
          return {
            ...entry,
            id: newCartItemId,
            selectedModifiers: newModifiers,
            totalPrice: calculateLineTotal(entry.foodItem, newModifiers, entry.quantity),
          };
        }
        return entry;
      });

      return recalculateCartTotals({ ...prevCart, items: updatedItems });
    });
  }, [recalculateCartTotals]);

  const updateSpecialInstructions = useCallback((cartItemId: string, instructions: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) => {
        if (item.id === cartItemId) {
          return { ...item, specialInstructions: instructions };
        }
        return item;
      });

      return { ...prevCart, items: updatedItems };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      totalItems: 0,
      subtotal: 0,
      deliveryFee: DEFAULT_DELIVERY_FEE,
      tax: 0,
      total: 0,
    });
  }, []);

  const getItemsByRestaurant = useCallback(() => {
    const grouped: { [restaurant: string]: FoodCartItem[] } = {};
    cart.items.forEach((item) => {
      const key =
        (item.foodItem as FoodItem & { restaurant?: string }).restaurant ??
        item.foodItem.merchantId;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(item);
    });

    return grouped;
  }, [cart.items]);

  const isItemInCart = useCallback((foodItem: FoodItem, selectedModifiers: FoodModifier[]) => {
    const cartItemId = generateCartItemId(foodItem, selectedModifiers);
    return cart.items.some((item) => item.id === cartItemId);
  }, [cart.items]);

  const getItemQuantity = useCallback((foodItem: FoodItem, selectedModifiers: FoodModifier[]) => {
    const cartItemId = generateCartItemId(foodItem, selectedModifiers);
    const item = cart.items.find((entry) => entry.id === cartItemId);
    return item?.quantity ?? 0;
  }, [cart.items]);

  const value = useMemo<FoodCartContextValue>(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateModifiers,
    updateSpecialInstructions,
    clearCart,
    getItemsByRestaurant,
    isItemInCart,
    getItemQuantity,
    generateCartItemId,
  }), [
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateModifiers,
    updateSpecialInstructions,
    clearCart,
    getItemsByRestaurant,
    isItemInCart,
    getItemQuantity,
  ]);

  return (
    <FoodCartContext.Provider value={value}>
      {children}
    </FoodCartContext.Provider>
  );
};

export const useFoodCartContext = () => {
  const context = useContext(FoodCartContext);
  if (!context) {
    throw new Error('useFoodCartContext must be used within a FoodCartProvider');
  }
  return context;
};