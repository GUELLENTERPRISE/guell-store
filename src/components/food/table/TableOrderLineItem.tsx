import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FoodCartItem } from "@/types/food";

type TableOrderLineItemProps = {
  item: FoodCartItem;
  editable?: boolean;
  onUpdateQuantity?: (quantity: number) => void;
  onRemove?: () => void;
};

const TableOrderLineItem = ({
  item,
  editable = false,
  onUpdateQuantity,
  onRemove,
}: TableOrderLineItemProps) => {
  const { foodItem, quantity, selectedModifiers, specialInstructions, totalPrice } =
    item;

  return (
    <li className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <img
          src={foodItem.image}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug text-foreground">
              {foodItem.name}
            </h3>
            <span className="shrink-0 font-bold text-foreground">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          {selectedModifiers.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              {selectedModifiers.map((modifier) => (
                <li key={modifier.id}>
                  {modifier.name}
                  {modifier.price > 0 ? ` (+$${modifier.price.toFixed(2)})` : ""}
                </li>
              ))}
            </ul>
          ) : null}

          {specialInstructions ? (
            <p className="mt-1.5 text-xs italic text-muted-foreground">
              Nota: {specialInstructions}
            </p>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Cantidad: {quantity}
            </span>

            {editable && onUpdateQuantity && onRemove ? (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(quantity - 1)}
                  aria-label="Disminuir cantidad"
                >
                  {quantity <= 1 ? (
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </Button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(quantity + 1)}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
};

export default TableOrderLineItem;
