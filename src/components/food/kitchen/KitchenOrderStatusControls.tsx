import { cn } from "@/lib/utils";
import { KitchenOrderStatus } from "@/types/kitchenOrder";
import {
  KITCHEN_STATUS_FLOW,
  kitchenStatusLabels,
  kitchenStatusStyles,
} from "@/components/food/kitchen/kitchenStatusConfig";

type KitchenOrderStatusControlsProps = {
  status: KitchenOrderStatus;
  onStatusChange: (status: KitchenOrderStatus) => void;
};

const KitchenOrderStatusControls = ({
  status,
  onStatusChange,
}: KitchenOrderStatusControlsProps) => (
  <div
    className="flex flex-wrap gap-1.5"
    role="group"
    aria-label="Estado en cocina"
  >
    {KITCHEN_STATUS_FLOW.map((value) => {
      const isActive = status === value;
      const styles = kitchenStatusStyles[value];

      return (
        <button
          key={value}
          type="button"
          onClick={() => onStatusChange(value)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
            isActive
              ? cn(styles.badge, "ring-2", styles.ring)
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          )}
          aria-pressed={isActive}
        >
          {kitchenStatusLabels[value]}
        </button>
      );
    })}
  </div>
);

export default KitchenOrderStatusControls;
