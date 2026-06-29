import type { DomainConfig } from "../domain.config";
import { ROLES } from "@/types";

// =============================================================================
// PRESET: SALE KONFERENCYJNE (Rooms). Algorytm: `pricing-and-availability`
// (jak car-rental: koszt za okres + kolizja terminów). Najmniej zmian w kodzie.
// =============================================================================

export const roomsConfig: DomainConfig = {
  domainName: "Room Booking",
  resource: {
    name: "Sala",
    namePlural: "Sale",
    namePluralGenitive: "sal",
    categoryLabel: "Typ sali",
  },
  request: {
    name: "Rezerwacja",
    namePlural: "Rezerwacje",
  },
  roles: ROLES,
  algorithmType: "pricing-and-availability",
  resourceFields: [
    { name: "brand", label: "Nazwa sali", type: "string" },
    { name: "model", label: "Budynek", type: "string" },
    {
      name: "carClass",
      label: "Typ",
      type: "enum",
      options: ["SMALL", "CONFERENCE", "AUDITORIUM"] as const,
    },
    {
      name: "pricePerDay",
      label: "Cena za godzinę (PLN)",
      type: "number",
      helpText: "Stawka wykorzystywana przez algorytm wyceny.",
    },
    { name: "isActive", label: "Dostępna", type: "boolean" },
  ],
  requestFields: [
    { name: "startDate", label: "Od", type: "date" },
    { name: "endDate", label: "Do", type: "date" },
    {
      name: "driverAge",
      label: "Liczba osób",
      type: "number",
      helpText: "Dane wejściowe rezerwacji (np. do walidacji pojemności).",
    },
    { name: "withInsurance", label: "Catering", type: "boolean" },
  ],
  ui: {
    appName: "Rezerwacja Sal ZPO",
    tagline: "Generyczny system rezerwacji zasobów",
    catalogTitle: "Dostępne sale",
    catalogSubtitle: "Wybierz salę i zarezerwuj termin.",
    availabilityTitle: "Sprawdź dostępność w terminie",
    myRequestsTitle: "Moje rezerwacje",
    adminRequestsTitle: "Wszystkie rezerwacje",
    adminResourcesTitle: "Zarządzanie salami",
    createRequestCta: "Zarezerwuj",
    priceLabel: "Cena całkowita",
    priceUnitLabel: "za godzinę",
    detailsCta: "Szczegóły",
    allCategoriesLabel: "Wszystkie typy",
  },
};
