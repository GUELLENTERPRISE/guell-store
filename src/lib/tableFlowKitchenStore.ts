import {
  KitchenOrder,
  KitchenOrderInput,
  KitchenOrderStatus,
} from "@/types/kitchenOrder";
import { TableSession } from "@/types/tableSession";

const STORAGE_PREFIX = "tableflow-kitchen-orders";
export const KITCHEN_ORDERS_UPDATED_EVENT = "tableflow-kitchen-update";

const storageKey = (merchantId: string) => `${STORAGE_PREFIX}:${merchantId}`;

const memoryStore = new Map<string, KitchenOrder[]>();

const getLocalStorage = (): Storage | null => {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

const notifyKitchenUpdate = (merchantId: string) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(KITCHEN_ORDERS_UPDATED_EVENT, {
      detail: { merchantId },
    })
  );
};

const readOrders = (merchantId: string): KitchenOrder[] => {
  const key = storageKey(merchantId);
  const storage = getLocalStorage();

  if (storage) {
    try {
      const raw = storage.getItem(key);

      if (!raw) {
        return memoryStore.get(key) ?? [];
      }

      const parsed = JSON.parse(raw) as KitchenOrder[];
      const orders = Array.isArray(parsed) ? parsed : [];
      memoryStore.set(key, orders);
      return orders;
    } catch {
      return memoryStore.get(key) ?? [];
    }
  }

  return memoryStore.get(key) ?? [];
};

const writeOrders = (merchantId: string, orders: KitchenOrder[]) => {
  const key = storageKey(merchantId);
  memoryStore.set(key, orders);

  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.setItem(key, JSON.stringify(orders));
    } catch {
      // Persist only in memory for this page load.
    }
  }

  notifyKitchenUpdate(merchantId);
};

export const registerKitchenOrder = (input: KitchenOrderInput): KitchenOrder => {
  const orders = readOrders(input.merchantId);
  const existing = orders.find((o) => o.localOrderId === input.localOrderId);

  if (existing) {
    return existing;
  }

  const order: KitchenOrder = {
    ...input,
    kitchenStatus: "new",
  };

  writeOrders(input.merchantId, [order, ...orders]);
  return order;
};

export const registerKitchenOrderFromSession = (
  session: TableSession
): KitchenOrder | null => {
  if (!session.merchantId || !session.tableNumber || !session.guestId) {
    return null;
  }

  if (!session.items || session.items.length === 0) {
    return null;
  }

  const localOrderId =
    session.localOrderId && session.localOrderId.trim().length > 0
      ? session.localOrderId
      : `tbl-${session.tableNumber}-${Date.now().toString(36)}`;

  const submittedAt =
    session.submittedAt && session.submittedAt.trim().length > 0
      ? session.submittedAt
      : new Date().toISOString();

  return registerKitchenOrder({
    localOrderId,
    merchantId: session.merchantId,
    tableNumber: session.tableNumber,
    guestId: session.guestId,
    submittedAt,
    items: session.items,
    paymentChoice: session.paymentChoice ?? "later",
    totalItems:
      session.totalItems ??
      session.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: session.subtotal ?? 0,
    tax: session.tax ?? 0,
    total: session.total ?? 0,
  });
};

export const listKitchenOrders = (merchantId: string): KitchenOrder[] =>
  readOrders(merchantId).sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

export const updateKitchenOrderStatus = (
  merchantId: string,
  localOrderId: string,
  kitchenStatus: KitchenOrderStatus
): KitchenOrder | null => {
  const orders = readOrders(merchantId);
  const index = orders.findIndex((o) => o.localOrderId === localOrderId);

  if (index === -1) return null;

  const updated: KitchenOrder = {
    ...orders[index],
    kitchenStatus,
  };

  const next = [...orders];
  next[index] = updated;
  writeOrders(merchantId, next);

  return updated;
};

export const clearKitchenOrders = (merchantId: string): void => {
  writeOrders(merchantId, []);
};

export const groupKitchenOrdersByTable = (
  orders: KitchenOrder[]
): Map<string, KitchenOrder[]> => {
  const grouped = new Map<string, KitchenOrder[]>();

  for (const order of orders) {
    const key = order.tableNumber;
    const list = grouped.get(key) ?? [];
    list.push(order);
    grouped.set(key, list);
  }

  return new Map(
    [...grouped.entries()].sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true })
    )
  );
};