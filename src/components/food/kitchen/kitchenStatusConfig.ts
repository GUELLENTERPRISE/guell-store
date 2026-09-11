import { KitchenOrderStatus } from "@/types/kitchenOrder";

export const KITCHEN_STATUS_FLOW: KitchenOrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "served",
];

export const kitchenStatusLabels: Record<KitchenOrderStatus, string> = {
  new: "Nuevo",
  preparing: "Preparando",
  ready: "Listo",
  served: "Servido",
};

export const kitchenStatusStyles: Record<
  KitchenOrderStatus,
  { badge: string; ring: string }
> = {
  new: {
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    ring: "ring-blue-500/40",
  },
  preparing: {
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    ring: "ring-amber-500/40",
  },
  ready: {
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500/40",
  },
  served: {
    badge: "bg-muted text-muted-foreground",
    ring: "ring-muted-foreground/30",
  },
};
