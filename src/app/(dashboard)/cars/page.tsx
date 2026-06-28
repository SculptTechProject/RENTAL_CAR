import { redirect } from "next/navigation";
import { toCarDTO } from "@/server/api/presenters";
import { getCurrentUser } from "@/server/auth";
import { domainConfig } from "@/server/domain/config/domain.config";
import { carService } from "@/server/services";
import { AvailabilityFilter } from "@/features/domain/availability-filter";
import { CarCard } from "@/features/domain/car-card";

export default async function CarsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cars = (await carService.listActive()).map(toCarDTO);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{domainConfig.ui.catalogTitle}</h1>
        <p className="text-muted-foreground">{domainConfig.ui.catalogSubtitle}</p>
      </div>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">
          {domainConfig.ui.availabilityTitle}
        </h2>
        <AvailabilityFilter />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Wszystkie {domainConfig.resource.namePlural.toLowerCase()}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>
    </div>
  );
}
