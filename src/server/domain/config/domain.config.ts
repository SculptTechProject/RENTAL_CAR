import { CAR_CLASSES, ROLES, type UserRole } from "@/types";

// =============================================================================
//  >>> THE ONE FILE YOU EDIT TO RE-THEME THE WHOLE APP <<<
//
//  This object centralises every domain-specific *label* and *copy* string.
//  The generic UI/services read names from here, so renaming the topic
//  (Car Rental -> Lockers / Cinema / Vet / Rooms ...) is mostly editing values
//  in this file. See README.md -> "Jak zmienić temat projektu".
//
//  NOTE: this is intentionally a simple typed config object, NOT a fully
//  dynamic metadata framework. It is meant to stay readable and defensible.
// =============================================================================

export type DomainFieldType = "string" | "number" | "boolean" | "date" | "enum";

export interface DomainFieldConfig {
  name: string;
  label: string;
  type: DomainFieldType;
  options?: readonly string[];
  helpText?: string;
}

export type DomainAlgorithmType =
  | "pricing-and-availability" // Car Rental, Room booking
  | "assignment" // Paczkomaty (assign smallest free locker)
  | "scheduling"; // Vet (find next free slot / detect collision)

export interface DomainConfig {
  /** Human name of the whole system. */
  domainName: string;
  /** What the RESOURCE is called. */
  resource: {
    name: string; // "Samochód"
    namePlural: string; // "Samochody"
    categoryLabel: string; // "Klasa"
  };
  /** What the REQUEST is called. */
  request: {
    name: string; // "Rezerwacja"
    namePlural: string; // "Rezerwacje"
  };
  roles: readonly UserRole[];
  /** Which family of algorithm this domain uses. */
  algorithmType: DomainAlgorithmType;
  /** Declarative description of the resource fields (drives admin form labels). */
  resourceFields: DomainFieldConfig[];
  /** Declarative description of the request fields (drives reservation form). */
  requestFields: DomainFieldConfig[];
  /** UI copy strings (Polish). Change these to re-label the app. */
  ui: {
    appName: string;
    tagline: string;
    catalogTitle: string;
    catalogSubtitle: string;
    availabilityTitle: string;
    myRequestsTitle: string;
    adminRequestsTitle: string;
    adminResourcesTitle: string;
    createRequestCta: string;
    priceLabel: string;
  };
}

/**
 * ===== ACTIVE DOMAIN: CAR RENTAL (Wypożyczalnia samochodów) =====
 */
export const domainConfig: DomainConfig = {
  domainName: "Car Rental",
  resource: {
    name: "Samochód",
    namePlural: "Samochody",
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
    {
      name: "carClass",
      label: "Klasa",
      type: "enum",
      options: CAR_CLASSES,
    },
    {
      name: "pricePerDay",
      label: "Cena za dzień (PLN)",
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
  },
};

// ---------------------------------------------------------------------------
// EXAMPLE of the SAME config re-themed for Paczkomaty (kept here as a guide).
// To switch topic: replace `domainConfig` above with something like this and
// swap the active strategy in src/server/domain/strategies/index.ts.
//
// export const domainConfig: DomainConfig = {
//   domainName: "Parcel Lockers",
//   resource: { name: "Paczkomat", namePlural: "Paczkomaty", categoryLabel: "Rozmiar" },
//   request: { name: "Paczka", namePlural: "Paczki" },
//   roles: ["USER", "ADMIN"],          // + "COURIER"
//   algorithmType: "assignment",
//   ...
// };
// ---------------------------------------------------------------------------
