import { FoodCartItem } from "@/types/food";
import { TablePaymentChoice } from "@/types/tableSession";

export type KitchenOrderStatus = "new" | "preparing" | "ready" | "served";

export interface KitchenOrder {
  localOrderId: string;
  merchantId: string;
  tableNumber: string;
  guestId: string;
  submittedAt: string;
  items: FoodCartItem[];
  paymentChoice: TablePaymentChoice;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  kitchenStatus: KitchenOrderStatus;
}

/** Snapshot enviado al registrar un pedido confirmado (reemplazable por API). */
export type KitchenOrderInput = Omit<KitchenOrder, "kitchenStatus">;
