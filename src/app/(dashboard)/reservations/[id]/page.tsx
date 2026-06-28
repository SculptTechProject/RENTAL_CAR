import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CancelReservationButton } from "@/features/domain/cancel-reservation-button";
import { PriceBreakdown } from "@/features/domain/price-breakdown";
import { StatusBadge } from "@/features/domain/status-badge";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth";
import { calculateRentalPrice } from "@/server/domain/strategies";
import { reservationService } from "@/server/services";
import { isOk } from "@/types";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  // getForUser enforces ownership (USER) / full access (ADMIN) on the backend.
  const reservation = await reservationService
    .getForUser(user, id)
    .catch(() => null);
  if (!reservation) notFound();

  // Recompute the price breakdown for display (pure function, no DB).
  const priced = calculateRentalPrice({
    pricePerDay: Number(reservation.car.pricePerDay),
    carClass: reservation.car.carClass,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    driverAge: reservation.driverAge,
    withInsurance: reservation.withInsurance,
  });

  const cancellable =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/reservations">&larr; Wróć do moich rezerwacji</Link>
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {reservation.car.brand} {reservation.car.model}
              </CardTitle>
              <StatusBadge status={reservation.status} />
            </div>
            <CardDescription>Rezerwacja #{reservation.id.slice(-6)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Termin</span>
              <span>
                {formatDate(reservation.startDate)} –{" "}
                {formatDate(reservation.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Klasa</span>
              <Badge variant="outline">{reservation.car.carClass}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wiek kierowcy</span>
              <span>{reservation.driverAge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ubezpieczenie</span>
              <span>{reservation.withInsurance ? "Tak" : "Nie"}</span>
            </div>
            {cancellable && (
              <div className="pt-3">
                <CancelReservationButton id={reservation.id} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rozbicie ceny</CardTitle>
            <CardDescription>Policzone przez algorytm na serwerze.</CardDescription>
          </CardHeader>
          <CardContent>
            {isOk(priced) ? (
              <PriceBreakdown price={priced.value} />
            ) : (
              <p className="text-sm text-destructive">{priced.error.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
