import type { DomainConfig } from "../domain.config";
import { ROLES } from "@/types";

// =============================================================================
// PRESET: KINO (Cinema). Algorytm: `assignment`
// (dobór wolnych / sąsiednich miejsc na seansie).
// =============================================================================

export const cinemaConfig: DomainConfig = {
  domainName: "Cinema",
  resource: {
    name: "Seans",
    namePlural: "Seanse",
    namePluralGenitive: "seansów",
    categoryLabel: "Sala",
  },
  request: {
    name: "Bilet",
    namePlural: "Bilety",
  },
  roles: ROLES, // + opcjonalnie "CASHIER"
  algorithmType: "assignment",
  resourceFields: [
    { name: "brand", label: "Tytuł filmu", type: "string" },
    { name: "model", label: "Reżyser", type: "string" },
    {
      name: "carClass",
      label: "Typ sali",
      type: "enum",
      options: ["NORMAL", "VIP", "IMAX"] as const,
    },
    {
      name: "pricePerDay",
      label: "Cena biletu (PLN)",
      type: "number",
      helpText: "Cena bazowa za miejsce.",
    },
    { name: "isActive", label: "W repertuarze", type: "boolean" },
  ],
  requestFields: [
    { name: "startDate", label: "Początek seansu", type: "date" },
    { name: "endDate", label: "Koniec seansu", type: "date" },
    {
      name: "driverAge",
      label: "Liczba miejsc",
      type: "number",
      helpText: "Ile sąsiednich miejsc dobrać.",
    },
    { name: "withInsurance", label: "Miejsce VIP", type: "boolean" },
  ],
  ui: {
    appName: "Kino ZPO",
    tagline: "Generyczny system rezerwacji zasobów",
    catalogTitle: "Repertuar",
    catalogSubtitle: "Wybierz seans i zarezerwuj miejsca.",
    availabilityTitle: "Sprawdź wolne miejsca",
    myRequestsTitle: "Moje bilety",
    adminRequestsTitle: "Wszystkie rezerwacje",
    adminResourcesTitle: "Zarządzanie repertuarem",
    createRequestCta: "Rezerwuj miejsca",
    priceLabel: "Cena całkowita",
    priceUnitLabel: "za bilet",
    detailsCta: "Szczegóły",
    allCategoriesLabel: "Wszystkie sale",
  },
};
