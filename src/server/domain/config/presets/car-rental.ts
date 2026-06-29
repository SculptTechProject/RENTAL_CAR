import type { DomainConfig } from "../domain.config";
import { CAR_CLASSES, ROLES } from "@/types";

// =============================================================================
// PRESET: CAR RENTAL (Wypożyczalnia samochodów) — wariant startowy.
//
// To jest "źródło prawdy" dla nazewnictwa i copy UI w tym temacie. Algorytm:
// `pricing-and-availability` (wycena + kolizja terminów).
// =============================================================================

export const carRentalConfig: DomainConfig = {
  domainName: "Car Rental",
  resource: {
    name: "Samochód",
    namePlural: "Samochody",
    namePluralGenitive: "samochodów",
    categoryLabel: "Klasa",
  },
  request: {
    name: "Rezerwacja",
    namePlural: "Rezerwacje",
  },
  roles: ROLES,
  algorithmType: "pricing-and-availability",
  resourceFields: [
    { name: "brand", label: "Marka", type: "string" },
    { name: "model", label: "Model", type: "string" },
    { name: "carClass", label: "Klasa", type: "enum", options: CAR_CLASSES },
    {
      name: "pricePerDay",
      label: "Cena za dobę (PLN)",
      type: "number",
      helpText: "Bazowa cena dobowa wykorzystywana przez algorytm wyceny.",
    },
    { name: "isActive", label: "Aktywny", type: "boolean" },
  ],
  requestFields: [
    { name: "startDate", label: "Data od", type: "date" },
    { name: "endDate", label: "Data do", type: "date" },
    {
      name: "driverAge",
      label: "Wiek kierowcy",
      type: "number",
      helpText: "Kierowcy poniżej 25 lat: dopłata. Poniżej 18 lat: brak zgody.",
    },
    { name: "withInsurance", label: "Ubezpieczenie", type: "boolean" },
  ],
  ui: {
    appName: "CarRental ZPO",
    tagline: "Generyczny system rezerwacji zasobów",
    catalogTitle: "Dostępne samochody",
    catalogSubtitle: "Wybierz samochód i zarezerwuj online.",
    availabilityTitle: "Sprawdź dostępność w terminie",
    myRequestsTitle: "Moje rezerwacje",
    adminRequestsTitle: "Wszystkie rezerwacje",
    adminResourcesTitle: "Zarządzanie flotą",
    createRequestCta: "Zarezerwuj",
    priceLabel: "Cena całkowita",
    priceUnitLabel: "za dobę",
    detailsCta: "Szczegóły",
    allCategoriesLabel: "Wszystkie",
  },
};
