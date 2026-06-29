"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ApiError, api } from "@/features/generic/api-client";
import {
  domainConfig,
  resourceFieldLabel,
} from "@/server/domain/config/domain.config";
import { CAR_CLASSES, type CarDTO } from "@/types";

// Admin-only form. The endpoint is still protected by requireRole("ADMIN") on
// the server — this form is just the convenient UI.
export function AddCarForm() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [carClass, setCarClass] = useState<string>(CAR_CLASSES[0]);
  const [pricePerDay, setPricePerDay] = useState("150");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post<CarDTO>("/api/admin/cars", {
        brand,
        model,
        carClass,
        pricePerDay: Number(pricePerDay),
        isActive,
      });
      router.push("/admin/cars");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Nie udało się dodać: ${domainConfig.resource.name.toLowerCase()}.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="brand">{resourceFieldLabel("brand", "Marka")}</Label>
          <Input
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">{resourceFieldLabel("model", "Model")}</Label>
          <Input
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="class">{domainConfig.resource.categoryLabel}</Label>
          <Select
            id="class"
            value={carClass}
            onChange={(e) => setCarClass(e.target.value)}
          >
            {CAR_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">
            {resourceFieldLabel("pricePerDay", "Cena za dobę (PLN)")}
          </Label>
          <Input
            id="price"
            type="number"
            min={1}
            step="0.01"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4"
        />
        {resourceFieldLabel("isActive", "Aktywny")} (dostępny do rezerwacji)
      </label>
      <Button type="submit" disabled={loading}>
        {loading
          ? "Zapisywanie..."
          : `Dodaj: ${domainConfig.resource.name.toLowerCase()}`}
      </Button>
    </form>
  );
}
