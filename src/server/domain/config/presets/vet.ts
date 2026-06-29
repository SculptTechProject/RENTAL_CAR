import type { DomainConfig } from "../domain.config";
import { ROLES } from "@/types";

// =============================================================================
// PRESET: WETERYNARZ (Vet). Algorytm: `scheduling`
// (wykryj kolizję wizyt / znajdź najbliższy wolny termin).
// Strategia gotowa: schedulingStrategy w strategies/availability/date-overlap.ts
// =============================================================================

export const vetConfig: DomainConfig = {
  domainName: "Vet Clinic",
  resource: {
    name: "Lekarz",
    namePlural: "Lekarze",
    namePluralGenitive: "lekarzy",
    categoryLabel: "Specjalizacja",
  },
  request: {
    name: "Wizyta",
    namePlural: "Wizyty",
  },
  roles: ROLES, // + opcjonalnie "DOCTOR"
  algorithmType: "scheduling",
  resourceFields: [
    { name: "brand", label: "Imię i nazwisko", type: "string" },
    { name: "model", label: "Gabinet", type: "string" },
    {
      name: "carClass",
      label: "Specjalizacja",
      type: "enum",
      options: ["INTERNA", "CHIRURGIA", "DERMATOLOGIA"] as const,
    },
    {
      name: "pricePerDay",
      label: "Cena wizyty (PLN)",
      type: "number",
      helpText: "Cena bazowa za wizytę.",
    },
    { name: "isActive", label: "Przyjmuje", type: "boolean" },
  ],
  requestFields: [
    { name: "startDate", label: "Początek wizyty", type: "date" },
    { name: "endDate", label: "Koniec wizyty", type: "date" },
    {
      name: "driverAge",
      label: "Wiek zwierzęcia (lata)",
      type: "number",
      helpText: "Dane wejściowe wizyty.",
    },
    { name: "withInsurance", label: "Pilne", type: "boolean" },
  ],
  ui: {
    appName: "Weterynarz ZPO",
    tagline: "Generyczny system terminarzy",
    catalogTitle: "Nasi lekarze",
    catalogSubtitle: "Wybierz lekarza i umów wizytę.",
    availabilityTitle: "Sprawdź wolne terminy",
    myRequestsTitle: "Moje wizyty",
    adminRequestsTitle: "Wszystkie wizyty",
    adminResourcesTitle: "Zarządzanie lekarzami",
    createRequestCta: "Umów wizytę",
    priceLabel: "Koszt wizyty",
    priceUnitLabel: "za wizytę",
    detailsCta: "Szczegóły",
    allCategoriesLabel: "Wszystkie specjalizacje",
  },
};
