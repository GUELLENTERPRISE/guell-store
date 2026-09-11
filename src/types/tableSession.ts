import { FoodCartItem } from "@/types/food";

export type TablePaymentChoice = "now" | "later";

export type TableSessionStatus = "draft" | "submitted" | "confirmed";

/** Un comensal en la mesa con su propio carrito y ciclo de pedido. */
export interface TableGuest {
  guestId: string;
  /** Etiqueta corta para UI (ej. "Invitado A3F2"). */
  label: string;
  items: FoodCartItem[];
  paymentChoice: TablePaymentChoice;
  status: TableSessionStatus;
  submittedAt?: string;
  localOrderId?: string;
}

/**
 * Estado compartido de la mesa (varios invitados).
 * Persistencia temporal en sessionStorage hasta sincronización con backend.
 */
export interface TableSharedState {
  merchantId: string;
  tableNumber: string;
  guests: TableGuest[];
  updatedAt: string;
}

/**
 * Vista del invitado actual — misma forma que antes para no romper consumidores.
 * Siempre refleja un solo guestId dentro de la mesa.
 */
export interface TableSession {
  merchantId: string;
  tableNumber: string;
  guestId: string;
  guestLabel: string;
  items: FoodCartItem[];
  paymentChoice: TablePaymentChoice;
  status: TableSessionStatus;
  submittedAt?: string;
  localOrderId?: string;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

/** Totales agregados de todos los invitados en la mesa (base para split bill). */
export interface TableTotalsSummary {
  subtotal: number;
  tax: number;
  total: number;
  totalItems: number;
  guestCount: number;
  guestsWithItems: number;
}
