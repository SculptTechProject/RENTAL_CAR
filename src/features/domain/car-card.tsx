import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPLN } from "@/lib/utils";
import type { CarDTO } from "@/types";

// Presentational card for a single resource (car). Usable from both server
// (catalogue) and client (availability results) components — no hooks.
export function CarCard({ car }: { car: CarDTO }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {car.brand} {car.model}
          </CardTitle>
          <Badge variant="outline">{car.carClass}</Badge>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">{formatPLN(car.pricePerDay)}</p>
          <p className="text-xs text-muted-foreground">za dobę</p>
        </div>
        <Button asChild size="sm">
          <Link href={`/cars/${car.id}`}>Szczegóły</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
