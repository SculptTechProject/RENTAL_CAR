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
import { ReservationForm } from "@/features/domain/reservation-form";
import { formatPLN } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth";
import { carService } from "@/server/services";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const car = await carService.getById(id).catch(() => null);
  if (!car) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/cars">&larr; Wróć do katalogu</Link>
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {car.brand} {car.model}
              </CardTitle>
              <Badge variant="outline">{car.carClass}</Badge>
            </div>
            <CardDescription>
              Cena bazowa: {formatPLN(Number(car.pricePerDay))} / dobę
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Ostateczna cena zależy od długości wynajmu, wieku kierowcy,
              sezonu i ubezpieczenia — liczona jest na serwerze po wysłaniu
              formularza.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zarezerwuj</CardTitle>
            <CardDescription>Wybierz termin i podaj dane.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationForm carId={car.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
