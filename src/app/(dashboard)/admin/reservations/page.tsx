import { redirect } from "next/navigation";
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

export default async function AdminReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  // listAll also re-checks the ADMIN role on the backend (defense in depth).
  const items = (await reservationService.listAll(user)).map(toReservationDTO);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{domainConfig.ui.adminRequestsTitle}</h1>
        <p className="text-muted-foreground">
          Widok administratora — wszystkie rezerwacje wszystkich użytkowników.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Samochód</TableHead>
              <TableHead>Termin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cena</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.user?.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.user?.email}
                  </div>
                </TableCell>
                <TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
