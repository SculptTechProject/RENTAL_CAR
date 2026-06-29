# ADAPT.md — jak przerobić ten szablon na DOWOLNY temat ze szkoły

> ## ✅ Bez AI? TAK.
> Cała ta instrukcja (sekcje 1–6) to **ręczna + skryptowa** robota — żadnego AI.
> Przełącznik tematu to zwykły skrypt Node, a recepta to edycja kilku plików.
> Na obronie / zajęciach bez internetu zrobisz to sam. Sekcja 7 (oddanie roboty
> Claude Code) to **opcjonalny skrót**, nie podstawa.

---

## 1. TL;DR (bez AI)

```bash
npm run topic                 # lista gotowych tematów
npm run topic -- rooms        # przełącz na "sale" (albo: vet / lockers / cinema)
# generator wypisze CHECKLISTĘ ręcznych kroków
npm run typecheck && npm test # zawsze na końcu
```

`npm run topic` zmienia **całe UI** (etykiety, tytuły, copy). Resztę (schemat,
algorytm, seed) robisz ręcznie wg recepty niżej — masz to rozpisane plik po pliku.

---

## 2. Co jest GENERYCZNE, a co dotykasz przy zmianie tematu

Większość kodu jest domenowo-neutralna i **zostaje bez zmian**:

| Zostaje bez zmian (generyczne) | Plik(i) |
| --- | --- |
| Autoryzacja, sesje, role | `src/server/auth/**` |
| Polityki własności (USER widzi swoje) | `src/server/domain/policies/**` |
| Koperta odpowiedzi, mapowanie błędów | `src/server/api/responses.ts`, `handler.ts` |
| Kontrolery + route handlers | `src/server/api/controllers/**`, `src/app/api/**` |
| Strony/layout UI (czytają z `domainConfig`) | `src/app/**` |
| Komponenty UI (czytają etykiety z configu) | `src/features/domain/**` |

### Mapa: co dotykasz przy zmianie tematu

| Warstwa | Plik | Co zmieniasz |
| --- | --- | --- |
| **Etykiety/copy** | `src/server/domain/config/presets/<temat>.ts` | nazwy zasobu/zgłoszenia, pola, teksty UI |
| **Wybór tematu** | `domain.config.ts` (linia `@active-preset`) | przełącza `npm run topic` |
| **Model danych** | `prisma/schema.prisma` | pola modeli, enum kategorii |
| **Enumy TS** | `src/types/enums.ts` | wartości kategorii (`CAR_CLASSES`) |
| **Algorytm** | `src/server/domain/strategies/**` | dobór/napisanie strategii |
| **Reguły** | `src/server/domain/config/rental-rules.ts` | stałe biznesowe algorytmu |
| **Wpięcie algorytmu** | `src/server/services/reservation.service.ts` | która strategia liczy wynik |
| **Walidacja** | `src/server/validators/**` | schematy Zod pod nowe pola |
| **Dane testowe** | `prisma/seed.ts` | przykładowe rekordy |
| **Testy** | `tests/**` | testy nowego algorytmu |

> Modele Prisma celowo zostają konkretne (`Car`, `Reservation`) — łatwiej obronić
> i nic nie psuje. Generyczne aliasy (`Resource`, `Request`, `ResourceCategory`)
> są w `src/types`. Pełny fizyczny rename → sekcja 6.

---

## 3. Trzy rodziny algorytmu (wybierz pasującą do tematu)

Wszystkie są **czystymi funkcjami** (bez bazy, bez UI) — łatwe do testów.

| Rodzina | Kiedy | Gotowe w repo |
| --- | --- | --- |
| `pricing-and-availability` | wycena + kolizja terminów (auta, sale, hotel) | `strategies/pricing/car-rental-pricing.ts` + `availability/date-overlap.ts` |
| `assignment` | przydziel najlepszy wolny slot (paczkomaty, miejsca w kinie) | `strategies/assignment/locker-assignment.ts` |
| `scheduling` | terminarz: kolizja wizyt / najbliższy wolny termin (wet, fryzjer) | `schedulingStrategy` w `availability/date-overlap.ts` |

---

## 4. PRZYKŁAD A (łatwy): Sale konferencyjne — TEN SAM algorytm

Sale = wycena za czas + kolizja terminów, czyli dokładnie rodzina startowa.
Pola mapują się 1:1, więc **kodu algorytmu w ogóle nie ruszasz**.

**Krok 1 — etykiety (zero AI):**
```bash
npm run topic -- rooms
```
To samo zrobiłbyś ręcznie: w `domain.config.ts` linia `// @active-preset` →
`presets/rooms`. UI od razu mówi „Sala / Rezerwacja / za godzinę”.

**Krok 2 — (opcjonalnie) wartości kategorii.** Jeśli chcesz, by typ sali nazywał
się ładnie, w `prisma/schema.prisma` zmień wartości enuma `CarClass`:
```prisma
enum CarClass {            // możesz zostawić nazwę enuma, zmień tylko wartości
  SMALL
  CONFERENCE
  AUDITORIUM
}
```
Lustrzanie w `src/types/enums.ts` (`CAR_CLASSES`) i w
`src/server/domain/config/rental-rules.ts` (klucze `classInsuranceMultiplier`).

**Krok 3 — reguły wyceny.** W `rental-rules.ts` dostosuj stawki (np. usuń dopłatę
„młody kierowca”, bo dla sal nie ma sensu — wyzeruj `youngDriverDailyFee`).

**Krok 4 — seed.** W `prisma/seed.ts` wpisz sale zamiast aut, potem:
```bash
npm run db:reset
```

**Krok 5 — sprawdź:** `npm run typecheck && npm test && npm run dev`.

---

## 5. PRZYKŁAD B (trudniejszy): Weterynarz — PODMIANA algorytmu

Wet = terminarz wizyt: liczy się kolizja terminów, a cena jest stała z bazy
(brak mnożników z wypożyczalni). Pokazuje, jak wymienić rodzinę algorytmu.

**Krok 1:** `npm run topic -- vet`.

**Krok 2 — wpięcie algorytmu w serwisie.** W
`src/server/services/reservation.service.ts` blok wyceny (krok „3) Run the
pricing algorithm…”) zastępujesz prostą, stałą ceną — kolizję terminów masz już
wyżej w kroku 2 (`checkResourceAvailability`):

```ts
// BYŁO (car-rental): policz cenę mnożnikami
// const priced = calculateRentalPrice({ ... });
// if (isErr(priced)) throw fromRuleViolation(priced.error);

// JEST (wet): cena = stawka lekarza z bazy (nic z frontu)
const total = Number(car.pricePerDay);

const request = await reservationRepository.create({
  userId: user.id,
  carId: car.id,
  startDate: input.startDate,
  endDate: input.endDate,
  driverAge: input.driverAge,
  withInsurance: input.withInsurance,
  totalPrice: total,           // <-- liczone na backendzie, nie z body
  status: "PENDING",
});
```

Kolizja terminów (czysta funkcja) jest już używana — ta sama, której używa
`schedulingStrategy.hasCollision` w
`strategies/availability/date-overlap.ts`. Chcesz „znajdź najbliższy wolny
termin”? Masz gotowe `schedulingStrategy.findNextAvailable(...)`.

**Krok 3:** dostosuj `breakdown` w odpowiedzi/UI (dla stałej ceny wystarczy
`totalPrice`), seed, walidatory, test. `npm run typecheck && npm test`.

> To samo dla **paczkomatów/kina** (rodzina `assignment`): zamiast liczyć cenę,
> w serwisie wołasz strategię przydziału — wzór gotowy w
> `strategies/assignment/locker-assignment.ts`.

---

## 6. Pełna recepta (skrót) + weryfikacja

1. `npm run topic -- <temat>` (albo skopiuj `presets/car-rental.ts` na nowy plik
   i dopisz wpis w `presets/registry.ts`).
2. `prisma/schema.prisma` + `src/types/enums.ts` — pola i wartości kategorii.
3. Algorytm: wybierz rodzinę (sekcja 3), wepnij w `reservation.service.ts`.
4. `rental-rules.ts` — stałe. `src/server/validators/**` — Zod pod nowe pola.
5. `prisma/seed.ts` → `npm run db:reset`. Testy w `tests/**`.

**Zawsze na końcu:**
```bash
npm run typecheck     # typy OK
npm test              # algorytm zielony
npm run db:reset      # schemat + seed wchodzą
npm run dev           # klik przez UI na http://localhost:3000
```
Dowód security (jak w README): USER dostaje **403** na endpointach admina,
a cena z `body` jest ignorowana (liczy ją serwer).

### (Opcjonalnie) pełny rename modeli
Gdy prowadzący wymaga, by model nazywał się dosłownie jak temat
(`Appointment` zamiast `Reservation`): zmień nazwy modeli + `@@map("...")` w
`schema.prisma`, `npx prisma generate && npm run db:reset`, a potem przejedź
`Car`/`Reservation`/`carClass` w `src/types`, repozytoriach i serwisach. To dużo
więcej dotknięć — rób tylko jeśli musisz.

---

## 7. (Opcjonalny skrót) Oddaj konwersję Claude Code 🤖

Jeśli AKURAT masz dostęp do AI i chcesz szybciej — wklej w Claude Code:

> Przerób ten projekt na temat: **<treść zadania>**. Trzymaj się `ADAPT.md`
> (sekcje 2–6), na końcu uruchom `npm run typecheck && npm test` i pokaż wynik.

Ale wszystko powyżej działa **bez tego**.
