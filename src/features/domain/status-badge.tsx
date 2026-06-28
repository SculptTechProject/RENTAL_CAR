import { Badge } from "@/components/ui/badge";
import type { ReservationStatus } from "@/types";

type Variant = "default" | "secondary" | "destructive" | "success" | "warning";

const STATUS: Record<ReservationStatus, { label: string; variant: Variant }> = {
  PENDING: { label: "Oczekująca", variant: "warning" },
  CONFIRMED: { label: "Potwierdzona", variant: "success" },
  CANCELLED: { label: "Anulowana", variant: "destructive" },
  COMPLETED: { label: "Zakończona", variant: "secondary" },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const s = STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
