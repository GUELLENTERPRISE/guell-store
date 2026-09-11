import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import TableGuestBadge from "@/components/food/table/TableGuestBadge";
import TableOrderLineItem from "@/components/food/table/TableOrderLineItem";
import TableOrderTotals from "@/components/food/table/TableOrderTotals";
import TablePaymentChoiceSelector from "@/components/food/table/TablePaymentChoiceSelector";
import { Button } from "@/components/ui/button";
import { useTableSession } from "@/contexts/TableSessionContext";
import type { Merchant } from "@/types/food";

type TableOrderReviewProps = {
  merchant: Merchant;
  tableNumber: string;
  onBack: () => void;
  onSubmitted: () => void;
};

const TableOrderReview = ({
  merchant,
  tableNumber,
  onBack,
  onSubmitted,
}: TableOrderReviewProps) => {
  const {
    session,
    guestIndex,
    tableTotals,
    setPaymentChoice,
    updateQuantity,
    removeItem,
    submitOrder,
    canSubmitOrder,
    isSessionEditable,
  } = useTableSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pendingSubmissionRef = useRef(false);

  useEffect(() => {
    if (!pendingSubmissionRef.current) return;

    if (session.status === "confirmed") {
      pendingSubmissionRef.current = false;
      setIsSubmitting(false);
      setSubmitError(null);
      onSubmitted();
    }
  }, [session.status, onSubmitted]);

  const handleSubmit = () => {
    if (!canSubmitOrder || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);
    pendingSubmissionRef.current = true;

    try {
      submitOrder();

      window.setTimeout(() => {
        if (pendingSubmissionRef.current) {
          pendingSubmissionRef.current = false;
          setIsSubmitting(false);
          setSubmitError(
            "No pudimos confirmar el envío del pedido. Intentá nuevamente."
          );
        }
      }, 1200);
    } catch {
      pendingSubmissionRef.current = false;
      setIsSubmitting(false);
      setSubmitError("Ocurrió un error al enviar el pedido.");
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onBack}
            aria-label="Volver al menú"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              TableFlow
            </p>
            <h1 className="truncate text-lg font-bold">Revisar pedido</h1>
            <p className="truncate text-xs text-muted-foreground">
              {merchant.businessName} · Mesa {tableNumber}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-6">
        <TableGuestBadge
          guestLabel={session.guestLabel}
          guestIndex={guestIndex}
          tableNumber={tableNumber}
          tableTotals={tableTotals}
        />

        <section aria-labelledby="order-items-heading">
          <h2
            id="order-items-heading"
            className="mb-1 text-sm font-semibold text-foreground"
          >
            Tu pedido
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Solo tus platos asociados a la mesa {tableNumber}
          </p>

          {session.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No hay platos en tu pedido. Volvé al menú para agregar.
            </p>
          ) : (
            <ul className="space-y-3">
              {session.items.map((item) => (
                <TableOrderLineItem
                  key={item.id}
                  item={item}
                  editable={isSessionEditable && !isSubmitting}
                  onUpdateQuantity={(qty) => {
                    if (qty <= 0) {
                      removeItem(item.id);
                      return;
                    }

                    updateQuantity(item.id, qty);
                  }}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <TablePaymentChoiceSelector
          value={session.paymentChoice}
          onChange={setPaymentChoice}
          disabled={!isSessionEditable || isSubmitting}
        />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Tu total</p>
          <TableOrderTotals session={session} />
        </div>

        {tableTotals.guestsWithItems > 0 ? (
          <p className="rounded-xl bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
            Mesa {tableNumber} · {tableTotals.guestCount}{" "}
            {tableTotals.guestCount === 1 ? "comensal" : "comensales"} ·{" "}
            {tableTotals.total.toFixed(2)} en pedidos activos
          </p>
        ) : null}

        {submitError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {submitError}
          </div>
        ) : null}
      </main>

      <footer className="sticky bottom-0 border-t bg-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <Button
            type="button"
            size="lg"
            className="w-full rounded-full"
            disabled={!canSubmitOrder || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>Enviar pedido · {session.total.toFixed(2)}</>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Seguir eligiendo platos
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default TableOrderReview;