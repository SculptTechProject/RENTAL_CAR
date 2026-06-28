import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/features/domain/status-badge";
import { formatDate, formatPLN } from "@/lib/utils";
import { toReservationDTO } from "@/server/api/presenters";
import { getCurrentUser } from "@/server/auth";
import { domainConfig } from "@/server/domain/config/domain.config";
import { reservationService } from "@/server/services";

export default async function MyReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = (await reservationService.listForUser(user)).map(
    toReservationDTO,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{domainConfig.ui.myRequestsTitle}</h1>

      {items.length === 0 ? (
        <Alert>
          Nie masz jeszcze żadnych rezerwacji.{" "}
          <Link href="/cars" className="font-medium underline">
            Przeglądaj samochody
          </Link>
          .
        </Alert>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Samochód</TableHead>
                <TableHead>Termin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cena</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.car ? `${r.car.brand} ${r.car.model}` : r.carId}
                  </TableCell>
                  <TableCell>
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPLN(r.totalPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/reservations/${r.id}`}>Szczegóły</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
