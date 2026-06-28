import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { domainConfig } from "@/server/domain/config/domain.config";
import { carService, reservationService } from "@/server/services";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [cars, myReservations] = await Promise.all([
    carService.listActive(),
    reservationService.listForUser(user),
  ]);
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Witaj, {user.name}!</h1>
        <p className="text-muted-foreground">{domainConfig.ui.tagline}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dostępne {domainConfig.resource.namePlural.toLowerCase()}</CardDescription>
            <CardTitle className="text-3xl">{cars.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/cars">Przeglądaj katalog</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{domainConfig.ui.myRequestsTitle}</CardDescription>
            <CardTitle className="text-3xl">{myReservations.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/reservations">Zobacz moje rezerwacje</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Twoja rola</CardDescription>
            <CardTitle className="text-3xl">{user.role}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {isAdmin
              ? "Masz pełny dostęp do wszystkich rezerwacji i floty."
              : "Widzisz wyłącznie swoje rezerwacje."}
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Panel administratora</CardTitle>
            <CardDescription>
              Operacje dostępne tylko dla roli ADMIN.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/reservations">Wszystkie rezerwacje</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/cars">Zarządzaj flotą</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
