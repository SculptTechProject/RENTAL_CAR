import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPLN } from "@/lib/utils";
import { toCarDTO } from "@/server/api/presenters";
import { getCurrentUser } from "@/server/auth";
import { domainConfig } from "@/server/domain/config/domain.config";
import { carService } from "@/server/services";

export default async function AdminCarsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const cars = (await carService.listAll(user)).map(toCarDTO);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {domainConfig.ui.adminResourcesTitle}
          </h1>
          <p className="text-muted-foreground">
            Cała flota, w tym pojazdy nieaktywne.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cars/new">+ Dodaj samochód</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marka / Model</TableHead>
              <TableHead>Klasa</TableHead>
              <TableHead className="text-right">Cena / dobę</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell className="font-medium">
                  {car.brand} {car.model}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{car.carClass}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatPLN(car.pricePerDay)}
                </TableCell>
                <TableCell>
                  {car.isActive ? (
                    <Badge variant="success">Aktywny</Badge>
                  ) : (
                    <Badge variant="secondary">Nieaktywny</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
