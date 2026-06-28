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
import { AddCarForm } from "@/features/domain/add-car-form";
import { getCurrentUser } from "@/server/auth";

export default async function NewCarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/cars">&larr; Wróć do floty</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Dodaj samochód</CardTitle>
          <CardDescription>
            Tylko administrator może dodawać pojazdy (sprawdzane na serwerze).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddCarForm />
        </CardContent>
      </Card>
    </div>
  );
}
