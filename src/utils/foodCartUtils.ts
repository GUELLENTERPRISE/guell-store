import { FoodCartItem, FoodItem, FoodModifier } from "@/types/food";

export const FOOD_TAX_RATE = 0.08;

export const generateCartItemId = (
  foodItem: FoodItem,
  selectedModifiers: FoodModifier[]
): string => {
  const modifierIds = selectedModifiers
    .map((m) => m.id)
    .sort()
    .join("-");
  return `${foodItem.id}-${modifierIds}`;
};

export const calculateLineTotal = (
  foodItem: FoodItem,
  selectedModifiers: FoodModifier[],
  quantity: number
): number => {
  const modifiersTotal = selectedModifiers.reduce(
    (sum, modifier) => sum + modifier.price,
    0
  );
  return (foodItem.price + modifiersTotal) * quantity;
};

export interface CartTotals {
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

export const calculateCartTotals = (
  items: FoodCartItem[],
  options?: { deliveryFee?: number; taxRate?: number }
): CartTotals => {
  const deliveryFee = options?.deliveryFee ?? 0;
  const taxRate = options?.taxRate ?? FOOD_TAX_RATE;
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  return { totalItems, subtotal, tax, total };
};

export const flattenModifierGroups = (foodItem: FoodItem): FoodModifier[] => {
  if (!foodItem.modifierGroups?.length) return [];

  return foodItem.modifierGroups.flatMap((group) =>
    group.options.map((option) => ({
      ...option,
      category: group.name,
    }))
  );
};
