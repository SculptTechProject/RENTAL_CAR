"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ApiError, api } from "@/features/generic/api-client";
import { CarCard } from "@/features/domain/car-card";
import { CAR_CLASSES, type CarDTO } from "@/types";

// Calls GET /api/cars/available. The collision logic runs on the BACKEND;
// this form only sends the window and renders whatever the API returns.
export function AvailabilityFilter() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [carClass, setCarClass] = useState("");
  const [results, setResults] = useState<CarDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (carClass) params.set("carClass", carClass);
      const data = await api.get<CarDTO[]>(`/api/cars/available?${params.toString()}`);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Błąd wyszukiwania.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end"
      >
        <div className="space-y-2">
          <Label htmlFor="from">Data od</Label>
          <Input
            id="from"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">Data do</Label>
          <Input
            id="to"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Klasa (opcjonalnie)</Label>
          <Select
            id="class"
            value={carClass}
            onChange={(e) => setCarClass(e.target.value)}
          >
            <option value="">Wszystkie</option>
            {CAR_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Szukam..." : "Sprawdź dostępność"}
        </Button>
      </form>

      {error && <Alert variant="destructive">{error}</Alert>}

      {results !== null && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Znaleziono wolnych samochodów: {results.length}
          </p>
          {results.length === 0 ? (
            <Alert>Brak wolnych samochodów w wybranym terminie.</Alert>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
