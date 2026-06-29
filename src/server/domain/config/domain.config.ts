// =============================================================================
//  DOMAIN CONFIG — typy + helpery + WYBÓR AKTYWNEGO PRESETU.
//
//  Cała tematyka aplikacji (Wypożyczalnia / Paczkomaty / Kino / Wet / Sale) jest
//  opisana DEKLARATYWNIE w pliku presetu w `./presets`. Tutaj zostają tylko:
//    1. typy konfiguracji,
//    2. helpery do czytania etykiet (UI ich używa zamiast stringów na sztywno),
//    3. JEDNA linia wybierająca aktywny preset (przełącza ją `npm run topic`).
//
//  Dzięki temu re-theme = edycja jednego presetu (lub `npm run topic`), a UI
//  podąża automatycznie. Patrz: ADAPT.md.
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
    namePluralGenitive: string; // "samochodów" (dla "Znaleziono wolnych ...")
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
    /** Jednostka ceny, np. "za dobę" / "za bilet" / "za wizytę". */
    priceUnitLabel: string;
    /** CTA na karcie zasobu, np. "Szczegóły". */
    detailsCta: string;
    /** Opcja "wszystkie kategorie" w filtrze. */
    allCategoriesLabel: string;
  };
}

import { ROLES, type UserRole } from "@/types";

// -----------------------------------------------------------------------------
// >>> AKTYWNY PRESET <<<  — tę linię przełącza `npm run topic`.
// Możesz też podmienić ją ręcznie na dowolny preset z `./presets`.
import { carRentalConfig as activePreset } from "./presets/car-rental"; // @active-preset
// -----------------------------------------------------------------------------

export const domainConfig: DomainConfig = activePreset;

// Re-export listy ról domyślnie używanej przez presety (wygoda).
export { ROLES };

// -----------------------------------------------------------------------------
// Helpery — UI czyta etykiety stąd, więc zmiana presetu re-themuje formularze.
// -----------------------------------------------------------------------------

function findLabel(
  fields: DomainFieldConfig[],
  name: string,
  fallback: string,
): string {
  return fields.find((f) => f.name === name)?.label ?? fallback;
}

/** Etykieta pola ZASOBU (np. "brand" -> "Marka"). */
export function resourceFieldLabel(name: string, fallback = name): string {
  return findLabel(domainConfig.resourceFields, name, fallback);
}

/** Etykieta pola ZGŁOSZENIA (np. "driverAge" -> "Wiek kierowcy"). */
export function requestFieldLabel(name: string, fallback = name): string {
  return findLabel(domainConfig.requestFields, name, fallback);
}

/** Pełna konfiguracja pojedynczego pola (label + helpText + options). */
export function resourceField(name: string): DomainFieldConfig | undefined {
  return domainConfig.resourceFields.find((f) => f.name === name);
}
export function requestField(name: string): DomainFieldConfig | undefined {
  return domainConfig.requestFields.find((f) => f.name === name);
}
