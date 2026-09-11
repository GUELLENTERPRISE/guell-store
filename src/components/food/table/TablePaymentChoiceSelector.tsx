import { CreditCard, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { TablePaymentChoice } from "@/types/tableSession";

type TablePaymentChoiceSelectorProps = {
  value: TablePaymentChoice;
  onChange: (choice: TablePaymentChoice) => void;
  disabled?: boolean;
};

const options: Array<{
  value: TablePaymentChoice;
  label: string;
  description: string;
  icon: typeof CreditCard;
}> = [
  {
    value: "now",
    label: "Pagar ahora",
    description: "Tarjeta o billetera al confirmar",
    icon: CreditCard,
  },
  {
    value: "later",
    label: "Pagar al final",
    description: "Cuenta al cerrar la mesa",
    icon: Receipt,
  },
];

const TablePaymentChoiceSelector = ({
  value,
  onChange,
  disabled = false,
}: TablePaymentChoiceSelectorProps) => (
  <fieldset className="space-y-3" disabled={disabled}>
    <legend className="text-sm font-semibold text-foreground">¿Cuándo pagás?</legend>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
              isSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:bg-muted/50",
              disabled && "pointer-events-none opacity-60"
            )}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-foreground">{option.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default TablePaymentChoiceSelector;
