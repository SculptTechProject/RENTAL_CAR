"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/features/generic/api-client";

export function CancelReservationButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onCancel() {
    if (!window.confirm("Na pewno anulować tę rezerwację?")) return;
    setError(null);
    setLoading(true);
    try {
      await api.del(`/api/reservations/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nie udało się anulować.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <Alert variant="destructive">{error}</Alert>}
      <Button
        variant="destructive"
        size="sm"
        disabled={loading}
        onClick={onCancel}
      >
        {loading ? "Anulowanie..." : "Anuluj rezerwację"}
      </Button>
    </div>
  );
}
