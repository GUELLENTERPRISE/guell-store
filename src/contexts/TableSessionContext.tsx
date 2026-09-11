import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { registerKitchenOrderFromSession } from "@/lib/tableFlowKitchenStore";
import {
  loadTableState,
  resolveTableAndGuest,
  saveTableState,
} from "@/lib/tableFlowTableStore";
import { FoodCartItem, FoodItem, FoodModifier } from "@/types/food";
import {
  TableGuest,
  TablePaymentChoice,
  TableSession,
  TableSharedState,
  TableTotalsSummary,
} from "@/types/tableSession";
import {
  calculateCartTotals,
  calculateLineTotal,
  generateCartItemId,
} from "@/utils/foodCartUtils";

const TABLEFLOW_FALLBACK_EVENT = "tableflow-table-update";

const createLocalOrderId = (): string =>
  `TF-${Date.now().toString(36).toUpperCase()}`;

const createGuestId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const createGuestLabel = (guestId: string): string => {
  const suffix = guestId.replace(/^guest_/, "").slice(-4).toUpperCase();
  return `Invitado ${suffix || "----"}`;
};

const createEmptyGuestLocal = (guestId?: string): TableGuest => {
  const id = guestId ?? createGuestId();

  return {
    guestId: id,
    label: createGuestLabel(id),
    items: [],
    paymentChoice: "later",
    status: "draft",
  };
};

const createFallbackTableState = (
  merchantId: string,
  tableNumber: string,
  guestId?: string
): { table: TableSharedState; guestId: string } => {
  const guest = createEmptyGuestLocal(guestId);

  return {
    guestId: guest.guestId,
    table: {
      merchantId,
      tableNumber,
      guests: [guest],
      updatedAt: new Date().toISOString(),
    },
  };
};

const isValidGuest = (guest: unknown): guest is TableGuest => {
  if (!guest || typeof guest !== "object") return false;

  const value = guest as Partial<TableGuest>;

  return (
    typeof value.guestId === "string" &&
    typeof value.label === "string" &&
    Array.isArray(value.items) &&
    (value.paymentChoice === "now" || value.paymentChoice === "later") &&
    typeof value.status === "string"
  );
};

const normalizeTableState = (
  merchantId: string,
  tableNumber: string,
  input: unknown,
  preferredGuestId?: string
): { table: TableSharedState; guestId: string } => {
  const fallback = createFallbackTableState(
    merchantId,
    tableNumber,
    preferredGuestId
  );

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const source = input as Partial<TableSharedState> & { guestId?: string };
  const guests = Array.isArray(source.guests)
    ? source.guests.filter(isValidGuest)
    : [];

  const normalizedGuests =
    guests.length > 0 ? guests : [createEmptyGuestLocal(preferredGuestId)];

  const guestId =
    preferredGuestId &&
    normalizedGuests.some((guest) => guest.guestId === preferredGuestId)
      ? preferredGuestId
      : source.guestId &&
          normalizedGuests.some((guest) => guest.guestId === source.guestId)
        ? source.guestId
        : normalizedGuests[0].guestId;

  return {
    guestId,
    table: {
      merchantId,
      tableNumber,
      guests: normalizedGuests,
      updatedAt:
        typeof source.updatedAt === "string"
          ? source.updatedAt
          : new Date().toISOString(),
    },
  };
};

interface TableSessionContextValue {
  session: TableSession;
  table: TableSharedState;
  currentGuest: TableGuest;
  guestIndex: number;
  tableTotals: TableTotalsSummary;
  isSessionEditable: boolean;
  addItem: (
    foodItem: FoodItem,
    quantity?: number,
    selectedModifiers?: FoodModifier[],
    specialInstructions?: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  setPaymentChoice: (choice: TablePaymentChoice) => void;
  submitOrder: () => void;
  confirmOrder: () => void;
  startNewOrder: () => void;
  clearItems: () => void;
  isItemInSession: (
    foodItem: FoodItem,
    selectedModifiers: FoodModifier[]
  ) => boolean;
  getItemQuantity: (
    foodItem: FoodItem,
    selectedModifiers: FoodModifier[]
  ) => number;
  canSubmitOrder: boolean;
}

const TableSessionContext = createContext<TableSessionContextValue | undefined>(
  undefined
);

const getGuestByIdLocal = (
  table: TableSharedState | undefined,
  guestId: string
): TableGuest | undefined => {
  if (!table || !Array.isArray(table.guests)) return undefined;
  return table.guests.find((guest) => guest.guestId === guestId);
};

const getGuestOrderIndexLocal = (
  table: TableSharedState | undefined,
  guestId: string
): number => {
  if (!table || !Array.isArray(table.guests)) return 1;
  const index = table.guests.findIndex((guest) => guest.guestId === guestId);
  return index >= 0 ? index + 1 : 1;
};

const updateGuestInTableLocal = (
  table: TableSharedState,
  guestId: string,
  updater: (guest: TableGuest) => TableGuest
): TableSharedState => {
  const exists = table.guests.some((guest) => guest.guestId === guestId);

  return {
    ...table,
    guests: exists
      ? table.guests.map((guest) =>
          guest.guestId === guestId ? updater(guest) : guest
        )
      : [...table.guests, updater(createEmptyGuestLocal(guestId))],
    updatedAt: new Date().toISOString(),
  };
};

const guestToTableSessionLocal = (
  table: TableSharedState,
  guest: TableGuest
): TableSession => {
  const totals = calculateCartTotals(guest.items, { deliveryFee: 0 });

  return {
    merchantId: table.merchantId,
    tableNumber: table.tableNumber,
    guestId: guest.guestId,
    guestLabel: guest.label,
    items: guest.items,
    paymentChoice: guest.paymentChoice,
    status: guest.status,
    submittedAt: guest.submittedAt,
    localOrderId: guest.localOrderId,
    totalItems: totals.totalItems,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
  };
};

const computeTableTotalsLocal = (table: TableSharedState): TableTotalsSummary => {
  const guests = Array.isArray(table.guests) ? table.guests : [];
  const guestsWithItems = guests.filter((guest) => guest.items.length > 0);
  const allItems = guests.flatMap((guest) => guest.items);
  const totals = calculateCartTotals(allItems, { deliveryFee: 0 });

  return {
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    totalItems: totals.totalItems,
    guestCount: guests.length,
    guestsWithItems: guestsWithItems.length,
  };
};

export const useTableSession = (): TableSessionContextValue => {
  const context = useContext(TableSessionContext);

  if (!context) {
    throw new Error("useTableSession must be used within a TableSessionProvider");
  }

  return context;
};

interface TableSessionProviderProps {
  merchantId: string;
  tableNumber: string;
  children: ReactNode;
}

export const TableSessionProvider = ({
  merchantId,
  tableNumber,
  children,
}: TableSessionProviderProps) => {
  const [state, setState] = useState(() => {
    try {
      const resolved = resolveTableAndGuest(merchantId, tableNumber);
      return normalizeTableState(
        merchantId,
        tableNumber,
        resolved?.table,
        resolved?.guestId
      );
    } catch {
      return createFallbackTableState(merchantId, tableNumber);
    }
  });

  const setTable = useCallback(
    (updater: TableSharedState | ((prev: TableSharedState) => TableSharedState)) => {
      setState((prev) => ({
        ...prev,
        table: typeof updater === "function" ? updater(prev.table) : updater,
      }));
    },
    []
  );

  const syncFromStorage = useCallback(() => {
    try {
      const stored = loadTableState(merchantId, tableNumber);

      if (stored) {
        setState((prev) =>
          normalizeTableState(merchantId, tableNumber, stored, prev.guestId)
        );
      }
    } catch {
      setState((prev) =>
        normalizeTableState(merchantId, tableNumber, prev.table, prev.guestId)
      );
    }
  }, [merchantId, tableNumber]);

  useEffect(() => {
    try {
      const resolved = resolveTableAndGuest(merchantId, tableNumber);
      setState(
        normalizeTableState(
          merchantId,
          tableNumber,
          resolved?.table,
          resolved?.guestId
        )
      );
    } catch {
      setState(createFallbackTableState(merchantId, tableNumber));
    }
  }, [merchantId, tableNumber]);

  useEffect(() => {
    const onTableUpdate = (event: Event) => {
      const detail = (
        event as CustomEvent<{ merchantId?: string; tableNumber?: string }>
      ).detail;

      if (
        !detail ||
        (detail.merchantId === merchantId && detail.tableNumber === tableNumber)
      ) {
        syncFromStorage();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (
        event.storageArea === sessionStorage &&
        event.key?.includes(merchantId) &&
        event.key?.includes(tableNumber)
      ) {
        syncFromStorage();
      }
    };

    window.addEventListener(TABLEFLOW_FALLBACK_EVENT, onTableUpdate);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(TABLEFLOW_FALLBACK_EVENT, onTableUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [merchantId, tableNumber, syncFromStorage]);

  const table = state.table;
  const currentGuestId = state.guestId;

  const currentGuest = useMemo(() => {
    return (
      getGuestByIdLocal(table, currentGuestId) ??
      table.guests[0] ??
      createEmptyGuestLocal(currentGuestId)
    );
  }, [table, currentGuestId]);

  const session = useMemo(() => {
    return guestToTableSessionLocal(table, currentGuest);
  }, [table, currentGuest]);

  const tableTotals = useMemo(() => computeTableTotalsLocal(table), [table]);

  const guestIndex = useMemo(
    () => getGuestOrderIndexLocal(table, currentGuest.guestId),
    [table, currentGuest]
  );

  const persistGuestUpdate = useCallback(
    (updater: (guest: TableGuest) => TableGuest) => {
      setTable((prev) => {
        const baseGuest =
          getGuestByIdLocal(prev, currentGuest.guestId) ?? currentGuest;

        const next = updateGuestInTableLocal(prev, baseGuest.guestId, updater);

        try {
          saveTableState(next);
        } catch {
          // no-op
        }

        return next;
      });
    },
    [currentGuest, setTable]
  );

  const isSessionEditable = session.status === "draft";

  const addItem = useCallback(
    (
      foodItem: FoodItem,
      quantity = 1,
      selectedModifiers: FoodModifier[] = [],
      specialInstructions?: string
    ) => {
      persistGuestUpdate((guest) => {
        if (guest.status !== "draft") return guest;

        const cartItemId = generateCartItemId(foodItem, selectedModifiers);
        const lineTotal = calculateLineTotal(foodItem, selectedModifiers, quantity);
        const existingIndex = guest.items.findIndex((item) => item.id === cartItemId);

        if (existingIndex !== -1) {
          const updatedItems = [...guest.items];
          const existing = updatedItems[existingIndex];
          const newQuantity = existing.quantity + quantity;

          updatedItems[existingIndex] = {
            ...existing,
            quantity: newQuantity,
            specialInstructions:
              specialInstructions ?? existing.specialInstructions,
            totalPrice: calculateLineTotal(
              foodItem,
              selectedModifiers,
              newQuantity
            ),
          };

          return {
            ...guest,
            items: updatedItems,
          };
        }

        const newItem: FoodCartItem = {
          id: cartItemId,
          foodItem,
          quantity,
          selectedModifiers,
          selectedOptions: {},
          specialInstructions,
          totalPrice: lineTotal,
        };

        return {
          ...guest,
          items: [...guest.items, newItem],
        };
      });
    },
    [persistGuestUpdate]
  );

  const removeItem = useCallback(
    (cartItemId: string) => {
      persistGuestUpdate((guest) => {
        if (guest.status !== "draft") return guest;

        return {
          ...guest,
          items: guest.items.filter((item) => item.id !== cartItemId),
        };
      });
    },
    [persistGuestUpdate]
  );

  const updateQuantity = useCallback(
    (cartItemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeItem(cartItemId);
        return;
      }

      persistGuestUpdate((guest) => {
        if (guest.status !== "draft") return guest;

        return {
          ...guest,
          items: guest.items.map((item) => {
            if (item.id !== cartItemId) return item;

            return {
              ...item,
              quantity: newQuantity,
              totalPrice: calculateLineTotal(
                item.foodItem,
                item.selectedModifiers,
                newQuantity
              ),
            };
          }),
        };
      });
    },
    [persistGuestUpdate, removeItem]
  );

  const updateItemQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      updateQuantity(cartItemId, quantity);
    },
    [updateQuantity]
  );

  const setPaymentChoice = useCallback(
    (choice: TablePaymentChoice) => {
      persistGuestUpdate((guest) => {
        if (guest.status !== "draft") return guest;
        return { ...guest, paymentChoice: choice };
      });
    },
    [persistGuestUpdate]
  );

  const submitOrder = useCallback(() => {
    const activeGuest =
      getGuestByIdLocal(table, currentGuest.guestId) ?? currentGuest;

    if (activeGuest.items.length === 0 || activeGuest.status !== "draft") {
      return;
    }

    const submittedAt = new Date().toISOString();
    const localOrderId = createLocalOrderId();

    const confirmedGuest: TableGuest = {
      ...activeGuest,
      status: "confirmed",
      submittedAt,
      localOrderId,
    };

    const nextTable = updateGuestInTableLocal(
      table,
      confirmedGuest.guestId,
      () => confirmedGuest
    );

    try {
      saveTableState(nextTable);
    } catch {
      // no-op
    }

    setState((prev) => ({
      ...prev,
      table: nextTable,
      guestId: confirmedGuest.guestId,
    }));

    const kitchenSession = guestToTableSessionLocal(nextTable, confirmedGuest);

    registerKitchenOrderFromSession({
      ...kitchenSession,
      status: "confirmed",
      submittedAt,
      localOrderId,
    });
  }, [table, currentGuest]);

  const confirmOrder = useCallback(() => {
    submitOrder();
  }, [submitOrder]);

  const startNewOrder = useCallback(() => {
    persistGuestUpdate((guest) => ({
      ...guest,
      items: [],
      paymentChoice: "later",
      status: "draft",
      submittedAt: undefined,
      localOrderId: undefined,
    }));
  }, [persistGuestUpdate]);

  const clearItems = useCallback(() => {
    persistGuestUpdate((guest) => {
      if (guest.status !== "draft") return guest;
      return { ...guest, items: [] };
    });
  }, [persistGuestUpdate]);

  const isItemInSession = useCallback(
    (foodItem: FoodItem, selectedModifiers: FoodModifier[]) => {
      const cartItemId = generateCartItemId(foodItem, selectedModifiers);
      return session.items.some((item) => item.id === cartItemId);
    },
    [session.items]
  );

  const getItemQuantity = useCallback(
    (foodItem: FoodItem, selectedModifiers: FoodModifier[]) => {
      const cartItemId = generateCartItemId(foodItem, selectedModifiers);
      return session.items.find((item) => item.id === cartItemId)?.quantity ?? 0;
    },
    [session.items]
  );

  const canSubmitOrder =
    session.status === "draft" && session.items.length > 0;

  const value = useMemo<TableSessionContextValue>(
    () => ({
      session,
      table,
      currentGuest,
      guestIndex,
      tableTotals,
      isSessionEditable,
      addItem,
      removeItem,
      updateQuantity,
      updateItemQuantity,
      setPaymentChoice,
      submitOrder,
      confirmOrder,
      startNewOrder,
      clearItems,
      isItemInSession,
      getItemQuantity,
      canSubmitOrder,
    }),
    [
      session,
      table,
      currentGuest,
      guestIndex,
      tableTotals,
      isSessionEditable,
      addItem,
      removeItem,
      updateQuantity,
      updateItemQuantity,
      setPaymentChoice,
      submitOrder,
      confirmOrder,
      startNewOrder,
      clearItems,
      isItemInSession,
      getItemQuantity,
      canSubmitOrder,
    ]
  );

  return (
    <TableSessionContext.Provider value={value}>
      {children}
    </TableSessionContext.Provider>
  );
};

export default TableSessionContext;