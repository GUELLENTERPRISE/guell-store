import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ChefHat,
  RefreshCw,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import KitchenTableSection from "@/components/food/kitchen/KitchenTableSection";
import {
  KITCHEN_STATUS_FLOW,
  kitchenStatusLabels,
} from "@/components/food/kitchen/kitchenStatusConfig";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMerchantById } from "@/data/merchantData";
import { useKitchenOrders } from "@/hooks/useKitchenOrders";
import {
  clearKitchenOrders,
  groupKitchenOrdersByTable,
} from "@/lib/tableFlowKitchenStore";
import { KitchenOrderStatus } from "@/types/kitchenOrder";

type KitchenErrorProps = {
  title: string;
  description: string;
  hint?: string;
};

const KitchenError = ({ title, description, hint }: KitchenErrorProps) => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-12">
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border bg-card p-8 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
      </div>
      <span className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        TableFlow · Cocina
      </span>
      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      {hint ? (
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 font-mono text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  </div>
);

type StatusFilter = "active" | "all";

const KitchenPage = () => {
  const [searchParams] = useSearchParams();
  const merchantId = searchParams.get("merchant")?.trim() ?? "";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const merchant = useMemo(
    () => (merchantId ? getMerchantById(merchantId) : undefined),
    [merchantId]
  );

  const { orders, refresh, setOrderStatus } = useKitchenOrders(merchantId);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.kitchenStatus !== "served");
  }, [orders, statusFilter]);

  const groupedByTable = useMemo(
    () => groupKitchenOrdersByTable(filteredOrders),
    [filteredOrders]
  );

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      KITCHEN_STATUS_FLOW.map((s) => [s, 0])
    ) as Record<KitchenOrderStatus, number>;

    for (const order of orders) {
      counts[order.kitchenStatus] += 1;
    }
    return counts;
  }, [orders]);

  if (!merchantId) {
    return (
      <KitchenError
        title="Local no especificado"
        description="Abrí la cocina con el parámetro merchant en la URL."
        hint="/kitchen?merchant=merchant-1"
      />
    );
  }

  if (!merchant || !merchant.isActive) {
    return (
      <KitchenError
        title="Restaurante no encontrado"
        description="No encontramos este local. Verificá el enlace del panel de cocina."
        hint={`merchant=${merchantId}`}
      />
    );
  }

  return (
    <>
      <SEOHead
        title={`Cocina · ${merchant.businessName}`}
        description="Panel de cocina TableFlow — pedidos en mesa"
      />

      <div className="min-h-[100dvh] bg-background">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                TableFlow · KDS
              </p>
              <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
                <ChefHat className="h-6 w-6 shrink-0 text-primary" />
                <span className="truncate">{merchant.businessName}</span>
              </h1>
              <p className="text-sm text-muted-foreground">Pedidos confirmados en mesa</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 self-start sm:self-center"
                onClick={refresh}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 self-start sm:self-center"
                onClick={() => {
                  clearKitchenOrders(merchantId);
                  refresh();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar órdenes
              </Button>
            </div>
          </div>

          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pb-3">
            {KITCHEN_STATUS_FLOW.map((status) => (
              <Badge
                key={status}
                variant="outline"
                className="rounded-full text-xs"
              >
                {kitchenStatusLabels[status]}: {statusCounts[status]}
              </Badge>
            ))}
          </div>

          <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3">
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "active" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setStatusFilter("active")}
            >
              Activos
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setStatusFilter("all")}
            >
              Todos
            </Button>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/50 px-6 py-16 text-center">
              <UtensilsCrossed className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold text-foreground">
                {statusFilter === "active"
                  ? "Sin pedidos activos"
                  : "Sin pedidos todavía"}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {statusFilter === "active"
                  ? "Los pedidos servidos están ocultos. Cambiá a «Todos» o esperá nuevos envíos desde las mesas."
                  : "Cuando un comensal confirme su pedido en /table, aparecerá aquí al instante."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {[...groupedByTable.entries()].map(([tableNumber, tableOrders]) => (
                <KitchenTableSection
                  key={tableNumber}
                  tableNumber={tableNumber}
                  orders={tableOrders}
                  onStatusChange={setOrderStatus}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default KitchenPage;