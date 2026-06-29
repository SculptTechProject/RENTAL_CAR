import type { DomainConfig } from "../domain.config";
import { ROLES } from "@/types";

// =============================================================================
// PRESET: PACZKOMATY (Parcel Lockers). Algorytm: `assignment`
// (przydziel najmniejszą wolną skrytkę pasującą do paczki).
// Strategia gotowa w: strategies/assignment/locker-assignment.ts
// =============================================================================

export const lockersConfig: DomainConfig = {
  domainName: "Parcel Lockers",
  resource: {
    name: "Paczkomat",
    namePlural: "Paczkomaty",
    namePluralGenitive: "paczkomatów",
    categoryLabel: "Rozmiar skrytki",
  },
  request: {
    name: "Paczka",
    namePlural: "Paczki",
  },
  roles: ROLES, // + opcjonalnie "COURIER" (dodaj w enum Role + politykach)
  algorithmType: "assignment",
  resourceFields: [
    { name: "brand", label: "Lokalizacja", type: "string" },
    { name: "model", label: "Identyfikator", type: "string" },
    {
      name: "carClass",
      label: "Rozmiar",
      type: "enum",
      options: ["SMALL", "MEDIUM", "LARGE"] as const,
    },
    {
      name: "pricePerDay",
      label: "Opłata za nadanie (PLN)",
      type: "number",
      helpText: "Opcjonalna opłata — przy assignment cena bywa stała lub zerowa.",
    },
    { name: "isActive", label: "Czynny", type: "boolean" },
  ],
  requestFields: [
    { name: "startDate", label: "Data nadania", type: "date" },
    { name: "endDate", label: "Termin odbioru", type: "date" },
    {
      name: "driverAge",
      label: "Rozmiar paczki (1-3)",
      type: "number",
      helpText: "Mapuj na rozmiar paczki, który steruje doborem skrytki.",
    },
    { name: "withInsurance", label: "Powiadomienie SMS", type: "boolean" },
  ],
  ui: {
    appName: "Paczkomaty ZPO",
    tagline: "Generyczny system przydziału zasobów",
    catalogTitle: "Dostępne paczkomaty",
    catalogSubtitle: "Wybierz paczkomat i nadaj paczkę.",
    availabilityTitle: "Sprawdź wolne skrytki",
    myRequestsTitle: "Moje paczki",
    adminRequestsTitle: "Wszystkie paczki",
    adminResourcesTitle: "Zarządzanie paczkomatami",
    createRequestCta: "Nadaj paczkę",
    priceLabel: "Opłata",
    priceUnitLabel: "za nadanie",
    detailsCta: "Szczegóły",
    allCategoriesLabel: "Wszystkie rozmiary",
  },
};
