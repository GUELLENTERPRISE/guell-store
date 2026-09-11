import { useCallback, useEffect, useState } from "react";

import {
  KITCHEN_ORDERS_UPDATED_EVENT,
  listKitchenOrders,
  updateKitchenOrderStatus,
} from "@/lib/tableFlowKitchenStore";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchenOrder";

export const useKitchenOrders = (merchantId: string) => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  const refresh = useCallback(() => {
    if (!merchantId) {
      setOrders([]);
      return;
    }

    setOrders(listKitchenOrders(merchantId));
  }, [merchantId]);

  const setOrderStatus = useCallback(
    (localOrderId: string, status: KitchenOrderStatus) => {
      if (!merchantId) return;

      updateKitchenOrderStatus(merchantId, localOrderId, status);
      setOrders(listKitchenOrders(merchantId));
    },
    [merchantId]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined" || !merchantId) return;

    const onKitchenUpdate = (
      event: Event | CustomEvent<{ merchantId?: string }>
    ) => {
      const detail =
        "detail" in event
          ? (event as CustomEvent<{ merchantId?: string }>).detail
          : undefined;

      if (!detail?.merchantId || detail.merchantId === merchantId) {
        refresh();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;

      if (
        event.storageArea === window.localStorage &&
        event.key === `tableflow-kitchen-orders:${merchantId}`
      ) {
        refresh();
      }
    };

    window.addEventListener(
      KITCHEN_ORDERS_UPDATED_EVENT,
      onKitchenUpdate as EventListener
    );
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(
        KITCHEN_ORDERS_UPDATED_EVENT,
        onKitchenUpdate as EventListener
      );
      window.removeEventListener("storage", onStorage);
    };
  }, [merchantId, refresh]);

  return {
    orders,
    refresh,
    setOrderStatus,
  };
};

export default useKitchenOrders;