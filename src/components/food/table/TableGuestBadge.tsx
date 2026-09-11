import { User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TableTotalsSummary } from "@/types/tableSession";

type TableGuestBadgeProps = {
  guestLabel: string;
  guestIndex: number;
  tableNumber: string;
  tableTotals?: TableTotalsSummary;
  compact?: boolean;
};

const TableGuestBadge = ({
  guestLabel,
  guestIndex,
  tableNumber,
  tableTotals,
  compact = false,
}: TableGuestBadgeProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge
      variant="secondary"
      className="gap-1 rounded-full px-3 py-1 text-sm font-semibold"
    >
      <User className="h-3.5 w-3.5" />
      {guestLabel}
    </Badge>
    {!compact ? (
      <Badge variant="outline" className="rounded-full text-xs">
        Comensal {guestIndex} · Mesa {tableNumber}
      </Badge>
    ) : null}
    {tableTotals && tableTotals.guestCount > 1 ? (
      <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">
        {tableTotals.guestCount} en la mesa · ${tableTotals.total.toFixed(2)} total
      </Badge>
    ) : null}
  </div>
);

export default TableGuestBadge;
