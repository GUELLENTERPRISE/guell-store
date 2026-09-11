import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, Minus, Plus, Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { FoodItem, FoodModifier } from "@/types/food";
import { flattenModifierGroups } from "@/utils/foodCartUtils";

export interface FoodItemModalCartActions {
  addToCart: (
    foodItem: FoodItem,
    quantity?: number,
    selectedModifiers?: FoodModifier[],
    specialInstructions?: string
  ) => void | Promise<void>;
  isItemInCart: (foodItem: FoodItem, selectedModifiers: FoodModifier[]) => boolean;
  getItemQuantity: (foodItem: FoodItem, selectedModifiers: FoodModifier[]) => number;
}

interface FoodItemModalProps {
  item: FoodItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartActions: FoodItemModalCartActions;
  addButtonPrefix?: string;
  hideDeliveryMeta?: boolean;
}

const FoodItemModal = ({
  item,
  open,
  onOpenChange,
  cartActions,
  addButtonPrefix,
  hideDeliveryMeta = false,
}: FoodItemModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<FoodModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const resetForm = () => {
    setQuantity(1);
    setSelectedModifiers([]);
    setSpecialInstructions("");
    setIsAdding(false);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, item?.id]);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const itemModifiers = useMemo(() => {
    if (!item) return [];
    return flattenModifierGroups(item);
  }, [item]);

  const groupedModifiers = useMemo(() => {
    return itemModifiers.reduce(
      (acc, modifier) => {
        const category = modifier.category || "General";

        if (!acc[category]) {
          acc[category] = { modifiers: [], addons: [] };
        }

        if (modifier.type === "modifier") {
          acc[category].modifiers.push(modifier);
        } else {
          acc[category].addons.push(modifier);
        }

        return acc;
      },
      {} as Record<string, { modifiers: FoodModifier[]; addons: FoodModifier[] }>
    );
  }, [itemModifiers]);

  const calculateTotalPrice = () => {
    if (!item) return 0;

    const basePrice = item.price;
    const modifiersTotal = selectedModifiers.reduce(
      (sum, modifier) => sum + modifier.price,
      0
    );

    return (basePrice + modifiersTotal) * quantity;
  };

  const handleModifierToggle = (modifier: FoodModifier) => {
    setSelectedModifiers((prev) => {
      const isSelected = prev.some((m) => m.id === modifier.id);

      if (isSelected) {
        return prev.filter((m) => m.id !== modifier.id);
      }

      return [...prev, modifier];
    });
  };

  const handleAddToCart = async () => {
    if (!item) return;

    setIsAdding(true);

    try {
      await cartActions.addToCart(
        item,
        quantity,
        selectedModifiers,
        specialInstructions.trim() || undefined
      );
      onOpenChange(false);
      resetForm();
    } finally {
      setIsAdding(false);
    }
  };

  const existingQuantity = useMemo(() => {
    if (!item) return 0;
    return cartActions.getItemQuantity(item, selectedModifiers);
  }, [cartActions, item, selectedModifiers]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-item-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-card p-4">
          <h2 id="food-item-modal-title" className="text-xl font-bold">
            {item.name}
          </h2>

          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-4">
          <div className="flex gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="h-32 w-32 rounded-lg object-cover"
            />

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="ml-1 text-sm font-medium">{item.rating}</span>
                </div>

                {!hideDeliveryMeta ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{item.deliveryTime}</span>
                  </div>
                ) : null}
              </div>

              <p className="mb-2 text-sm text-muted-foreground">
                {item.description}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">${item.price.toFixed(2)}</span>

                {item.promo ? (
                  <Badge className="bg-orange-500 text-xs text-white">
                    {item.promo}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <Separator />

          {Object.keys(groupedModifiers).length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {hideDeliveryMeta ? "Personaliza tu pedido" : "Customize Your Order"}
              </h3>

              {Object.entries(groupedModifiers).map(([category, groups]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-foreground">{category}</h4>

                  {groups.modifiers.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {hideDeliveryMeta
                          ? "Quitar ingredientes sin costo"
                          : "Remove ingredients, no extra cost"}
                      </p>

                      {groups.modifiers.map((modifier) => {
                        const isSelected = selectedModifiers.some(
                          (m) => m.id === modifier.id
                        );

                        return (
                          <button
                            key={modifier.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-background"
                            onClick={() => handleModifierToggle(modifier)}
                            aria-pressed={isSelected}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="h-3 w-3 text-white" />
                                ) : null}
                              </div>

                              <span className="text-sm">{modifier.name}</span>
                            </div>

                            <span className="text-sm text-green-600">Free</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {groups.addons.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {hideDeliveryMeta ? "Agregar extras" : "Add extras"}
                      </p>

                      {groups.addons.map((modifier) => {
                        const isSelected = selectedModifiers.some(
                          (m) => m.id === modifier.id
                        );

                        return (
                          <button
                            key={modifier.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-background"
                            onClick={() => handleModifierToggle(modifier)}
                            aria-pressed={isSelected}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="h-3 w-3 text-white" />
                                ) : null}
                              </div>

                              <span className="text-sm">{modifier.name}</span>
                            </div>

                            <span className="text-sm font-medium text-orange-600">
                              +${modifier.price.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="special-instructions">
              {hideDeliveryMeta ? "Indicaciones especiales" : "Special Instructions"}
            </Label>

            <Textarea
              id="special-instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={
                hideDeliveryMeta
                  ? "Ej. sin cebolla, término medio, salsa aparte"
                  : "Any special requests? e.g. extra sauce, well done, etc."
              }
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Quantity</span>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="w-8 text-center font-medium">{quantity}</span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-background p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base price × {quantity}</span>
                  <span>${(item.price * quantity).toFixed(2)}</span>
                </div>

                {selectedModifiers.length > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span>Extras seleccionados</span>
                    <span>
                      +$
                      {(
                        selectedModifiers.reduce((sum, m) => sum + m.price, 0) *
                        quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {existingQuantity > 0 ? (
              <div className="text-center text-sm text-orange-600">
                {existingQuantity} de esta combinación ya está en tu pedido
              </div>
            ) : null}

            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              {isAdding
                ? hideDeliveryMeta
                  ? "Agregando..."
                  : "Adding..."
                : `${addButtonPrefix ?? "Add to Cart"} - $${calculateTotalPrice().toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemModal;