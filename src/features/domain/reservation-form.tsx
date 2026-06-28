"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/features/generic/api-client";
import { PriceBreakdown } from "@/features/domain/price-breakdown";
import type { RentalPriceBreakdown } from "@/server/domain/strategies";
import type { ReservationDTO } from "@/types";

interface CreateResult {
  reservation: ReservationDTO;
  price: RentalPriceBreakdown;
}

// Posts to /api/reservations. The price is computed and returned BY THE BACKEND;
// nothing about money is trusted from this form.
export function ReservationForm({ carId }: { carId: string }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [driverAge, setDriverAge] = useState("30");
  const [withInsurance, setWithInsurance] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<CreateResult>("/api/reservations", {
        carId,
        startDate,
        endDate,
        driverAge: Number(driverAge),
        withInsurance,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nie udało się utworzyć rezerwacji.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          Rezerwacja utworzona! Cena policzona przez serwer.
        </Alert>
        <PriceBreakdown price={result.price} />
        <Button
          className="w-full"
          onClick={() => router.push(`/reservations/${result.reservation.id}`)}
        >
          Przejdź do rezerwacji
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start">Data od</Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Data do</Label>
          <Input
            id="end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">Wiek kierowcy</Label>
        <Input
          id="age"
          type="number"
          min={16}
          max={120}
          value={driverAge}
          onChange={(e) => setDriverAge(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Poniżej 25 lat: dopłata. Poniżej 18 lat: brak zgody (sprawdzane na serwerze).
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={withInsurance}
          onChange={(e) => setWithInsurance(e.target.checked)}
          className="h-4 w-4"
        />
        Wykup ubezpieczenie
      </label>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Rezerwuję..." : "Zarezerwuj i policz cenę"}
      </Button>
    </form>
  );
}
