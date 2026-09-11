import { Clock, CreditCard, Receipt, UtensilsCrossed } from "lucide-react";

import KitchenOrderStatusControls from "@/components/food/kitchen/KitchenOrderStatusControls";
import {
  kitchenStatusLabels,
  kitchenStatusStyles,
} from "@/components/food/kitchen/kitchenStatusConfig";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchenOrder";
import { TablePaymentChoice } from "@/types/tableSession";

type KitchenOrderCardProps = {
  order: KitchenOrder;
  onStatusChange: (status: KitchenOrderStatus) => void;
};

const paymentConfig: Record<
  TablePaymentChoice,
  { label: string; icon: typeof CreditCard }
> = {
  now: { label: "Pagar ahora", icon: CreditCard },
  later: { label: "Pagar al final", icon: Receipt },
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });

const KitchenOrderCard = ({ order, onStatusChange }: KitchenOrderCardProps) => {
  const payment = paymentConfig[order.paymentChoice];
  const PaymentIcon = payment.icon;
  const statusStyle = kitchenStatusStyles[order.kitchenStatus];

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm",
        order.kitchenStatus === "served" && "opacity-70"
      )}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">
            #{order.localOrderId.slice(-8).toUpperCase()}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(order.submittedAt)}
          </p>
        </div>
        <Badge className={cn("rounded-full border-0", statusStyle.badge)}>
          {kitchenStatusLabels[order.kitchenStatus]}
        </Badge>
      </header>

      <ul className="mb-3 space-y-2.5 border-y py-3">
        {order.items.map((line) => (
          <li key={line.id} className="text-sm">
            <div className="flex justify-between gap-2 font-medium text-foreground">
              <span>
                {line.quantity}× {line.foodItem.name}
              </span>
              <span className="shrink-0">${line.totalPrice.toFixed(2)}</span>
            </div>
            {line.selectedModifiers.length > 0 ? (
              <ul className="mt-1 space-y-0.5 pl-1 text-xs text-muted-foreground">
                {line.selectedModifiers.map((mod) => (
                  <li key={mod.id}>· {mod.name}</li>
                ))}
              </ul>
            ) : null}
            {line.specialInstructions ? (
              <p className="mt-1 text-xs italic text-amber-700 dark:text-amber-400">
                Nota: {line.specialInstructions}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <PaymentIcon className="h-4 w-4" />
          {payment.label}
        </span>
        <span className="font-bold text-foreground">${order.total.toFixed(2)}</span>
      </div>

      <KitchenOrderStatusControls
        status={order.kitchenStatus}
        onStatusChange={onStatusChange}
      />
    </article>
  );
};

export default KitchenOrderCard;
