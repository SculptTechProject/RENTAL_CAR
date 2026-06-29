// =============================================================================
// REJESTR PRESETÓW — czyste metadane (BEZ importów "@/..."), żeby mógł je
// bezczelnie wczytać generator `scripts/new-topic.ts` przez tsx.
//
// Każdy wpis mówi generatorowi:
//   - jak przepisać linię `@active-preset` w domain.config.ts,
//   - jaką strategię algorytmu wpiąć,
//   - jakie kroki MANUALNE trzeba jeszcze zrobić (schemat, seed, algorytm).
//
// Sama konfiguracja (etykiety/copy) siedzi w odpowiednim pliku presetu obok.
// =============================================================================

export type AlgorithmFamily =
  | "pricing-and-availability"
  | "assignment"
  | "scheduling";

export interface PresetMeta {
  /** Klucz wpisywany w `npm run topic -- <key>`. */
  key: string;
  /** Nazwa eksportu w pliku presetu (np. `carRentalConfig`). */
  exportName: string;
  /** Nazwa pliku w `./presets` BEZ rozszerzenia (np. `car-rental`). */
  file: string;
  /** Ładna nazwa do wypisania. */
  label: string;
  algorithm: AlgorithmFamily;
  /** Ręczne kroki po przełączeniu presetu (generator ich NIE robi — za ryzykowne). */
  checklist: string[];
}

const SCHEMA_STEP =
  "prisma/schema.prisma: dostosuj pola modeli (enum kategorii, pola Request) do tego tematu, potem `npm run db:reset`.";
const SEED_STEP =
  "prisma/seed.ts: wpisz przykładowe dane pasujące do tematu.";
const TESTS_STEP =
  "tests/**: dopisz/popraw test algorytmu domenowego, `npm test`.";

export const PRESETS: PresetMeta[] = [
  {
    key: "car-rental",
    exportName: "carRentalConfig",
    file: "car-rental",
    label: "Wypożyczalnia samochodów (start)",
    algorithm: "pricing-and-availability",
    checklist: [
      "To jest wariant domyślny — działa od ręki, nic nie trzeba dorabiać.",
    ],
  },
  {
    key: "lockers",
    exportName: "lockersConfig",
    file: "lockers",
    label: "Paczkomaty (przydział skrytek)",
    algorithm: "assignment",
    checklist: [
      "reservation.service.ts: zamiast `calculateRentalPrice` wepnij `assignSmallestAvailableLocker` (gotowa w strategies/assignment/locker-assignment.ts).",
      "enum CarClass -> rozmiary skrytek (SMALL/MEDIUM/LARGE) w schemacie i w types/enums.ts.",
      SCHEMA_STEP,
      SEED_STEP,
      TESTS_STEP,
    ],
  },
  {
    key: "cinema",
    exportName: "cinemaConfig",
    file: "cinema",
    label: "Kino (dobór miejsc)",
    algorithm: "assignment",
    checklist: [
      "Algorytm: dobór sąsiednich/wolnych miejsc (rodzina `assignment`) — napisz strategię na wzór locker-assignment.ts.",
      "Dostępność = zajęte miejsca danego seansu zamiast kolizji dat.",
      SCHEMA_STEP,
      SEED_STEP,
      TESTS_STEP,
    ],
  },
  {
    key: "vet",
    exportName: "vetConfig",
    file: "vet",
    label: "Weterynarz (terminarz wizyt)",
    algorithm: "scheduling",
    checklist: [
      "availability.service.ts: użyj `schedulingStrategy` (hasCollision / findNextAvailable) — gotowa w strategies/availability/date-overlap.ts.",
      "Cena może być stała z bazy (pricePerDay) — pomiń mnożniki car-rental albo uprość algorytm wyceny.",
      SCHEMA_STEP,
      SEED_STEP,
      TESTS_STEP,
    ],
  },
  {
    key: "rooms",
    exportName: "roomsConfig",
    file: "rooms",
    label: "Sale konferencyjne (wycena + kolizja)",
    algorithm: "pricing-and-availability",
    checklist: [
      "Najbliżej startu — ten sam algorytm (wycena + kolizja terminów).",
      "rental-rules.ts: dostosuj stawki/mnożniki do sal (np. brak 'młodego kierowcy').",
      SCHEMA_STEP,
      SEED_STEP,
      TESTS_STEP,
    ],
  },
];

export function findPreset(key: string): PresetMeta | undefined {
  return PRESETS.find((p) => p.key === key);
}
