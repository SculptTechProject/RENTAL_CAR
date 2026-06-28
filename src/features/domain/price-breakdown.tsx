import { formatPLN } from "@/lib/utils";
import type { RentalPriceBreakdown } from "@/server/domain/strategies";

// Presentational price breakdown. The numbers are computed on the BACKEND by
// the pricing algorithm; this component only displays them.
function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        strong
          ? "flex justify-between border-t pt-2 text-base font-semibold"
          : "flex justify-between text-sm"
      }
    >
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function PriceBreakdown({ price }: { price: RentalPriceBreakdown }) {
  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
      <Row label={`Cena bazowa (${price.days} dni)`} value={formatPLN(price.basePrice)} />
      {price.seasonMultiplier !== 1 && (
        <Row
          label={`Dopłata sezonowa (×${price.seasonMultiplier})`}
          value={formatPLN(price.seasonAdjustment)}
        />
      )}
      {price.youngDriverFee > 0 && (
        <Row label="Dopłata: młody kierowca" value={formatPLN(price.youngDriverFee)} />
      )}
      {price.longRentalDiscount > 0 && (
        <Row
          label="Zniżka: długi wynajem"
          value={`- ${formatPLN(price.longRentalDiscount)}`}
        />
      )}
      {price.insuranceFee > 0 && (
        <Row label="Ubezpieczenie" value={formatPLN(price.insuranceFee)} />
      )}
      <Row label="Razem" value={formatPLN(price.totalPrice)} strong />
    </div>
  );
}
