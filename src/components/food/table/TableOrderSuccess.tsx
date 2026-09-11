import { CheckCircle2, CreditCard, Receipt, UtensilsCrossed } from "lucide-react";

import TableOrderLineItem from "@/components/food/table/TableOrderLineItem";
import TableOrderTotals from "@/components/food/table/TableOrderTotals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Merchant } from "@/types/food";
import type { TablePaymentChoice, TableSession } from "@/types/tableSession";

type TableOrderSuccessProps = {
  merchant: Merchant;
  tableNumber: string;
  onNewOrder: () => void;
  session: TableSession;
  guestIndex: number;
};

const paymentLabels: Record<
  TablePaymentChoice,
  { label: string; icon: typeof CreditCard }
> = {
  now: {
    label: "Pago al confirmar",
    icon: CreditCard,
  },
  later: {
    label: "Pago al cerrar la mesa",
    icon: Receipt,
  },
};

const TableOrderSuccess = ({
  merchant,
  tableNumber,
  onNewOrder,
  session,
  guestIndex,
}: TableOrderSuccessProps) => {
  const payment = paymentLabels[session.paymentChoice];
  const PaymentIcon = payment.icon;

  const submittedTime = session.submittedAt
    ? new Date(session.submittedAt).toLocaleTimeString("es", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" aria-hidden />
          </div>

          <span className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Pedido confirmado
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ¡Listo, enviamos tu pedido!
          </h1>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            La cocina recibirá tu orden en breve. Te avisamos cuando esté en preparación.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1 rounded-full">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              {session.guestLabel} · Mesa {tableNumber}
            </Badge>

            <Badge variant="outline" className="rounded-full text-xs">
              Comensal {guestIndex}
            </Badge>

            {session.localOrderId ? (
              <Badge variant="outline" className="rounded-full font-mono text-xs">
                {session.localOrderId.slice(-8).toUpperCase()}
              </Badge>
            ) : null}

            {submittedTime ? (
              <Badge variant="outline" className="rounded-full text-xs">
                {submittedTime}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
            <PaymentIcon className="h-4 w-4 text-primary" />
            <span className="font-medium">{payment.label}</span>
          </div>
        </div>

        <section
          className="mt-8 space-y-4"
          aria-labelledby="confirmed-order-heading"
        >
          <h2
            id="confirmed-order-heading"
            className="text-sm font-semibold text-muted-foreground"
          >
            Resumen · {merchant.businessName}
          </h2>

          <ul className="space-y-3">
            {session.items.map((item) => (
              <TableOrderLineItem
                key={item.id}
                item={item}
                editable={false}
              />
            ))}
          </ul>

          <TableOrderTotals session={session} />
        </section>
      </main>

      <footer className="border-t bg-card/95 p-4">
        <div className="mx-auto max-w-lg space-y-2">
          <Button
            type="button"
            size="lg"
            className="w-full rounded-full"
            onClick={onNewOrder}
          >
            Hacer otro pedido
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Podés seguir pidiendo desde el menú cuando quieras.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TableOrderSuccess;