import { Separator } from "@/components/ui/separator";
import { TableSession } from "@/types/tableSession";

type TableOrderTotalsProps = {
  session: Pick<TableSession, "subtotal" | "tax" | "total" | "totalItems">;
};

const TableOrderTotals = ({ session }: TableOrderTotalsProps) => (
  <div className="rounded-2xl border bg-muted/30 p-4">
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <dt>
          Subtotal ({session.totalItems}{" "}
          {session.totalItems === 1 ? "artículo" : "artículos"})
        </dt>
        <dd className="font-medium text-foreground">${session.subtotal.toFixed(2)}</dd>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <dt>Impuesto (8%)</dt>
        <dd className="font-medium text-foreground">${session.tax.toFixed(2)}</dd>
      </div>
      <Separator />
      <div className="flex justify-between text-base font-bold">
        <dt>Total</dt>
        <dd className="text-foreground">${session.total.toFixed(2)}</dd>
      </div>
    </dl>
  </div>
);

export default TableOrderTotals;
