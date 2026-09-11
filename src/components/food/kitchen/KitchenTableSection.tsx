import { UtensilsCrossed } from "lucide-react";

import KitchenOrderCard from "@/components/food/kitchen/KitchenOrderCard";
import { Badge } from "@/components/ui/badge";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchenOrder";

type KitchenTableSectionProps = {
  tableNumber: string;
  orders: KitchenOrder[];
  onStatusChange: (localOrderId: string, status: KitchenOrderStatus) => void;
};

const KitchenTableSection = ({
  tableNumber,
  orders,
  onStatusChange,
}: KitchenTableSectionProps) => {
  const activeCount = orders.filter((o) => o.kitchenStatus !== "served").length;

  return (
    <section className="space-y-3" aria-labelledby={`kitchen-table-${tableNumber}`}>
      <div className="flex items-center gap-2">
        <Badge
          id={`kitchen-table-${tableNumber}`}
          variant="secondary"
          className="gap-1 rounded-full px-3 py-1 text-sm font-semibold"
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Mesa {tableNumber}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
          {activeCount < orders.length
            ? ` · ${activeCount} activo${activeCount === 1 ? "" : "s"}`
            : ""}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {orders.map((order) => (
          <KitchenOrderCard
            key={order.localOrderId}
            order={order}
            onStatusChange={(status) => onStatusChange(order.localOrderId, status)}
          />
        ))}
      </div>
    </section>
  );
};

export default KitchenTableSection;
