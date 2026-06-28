# ZALICZENIE ZPO — mapa punktów i ściąga na obronę

Dokument prowadzi prowadzącego (i Ciebie) po projekcie kategoria po kategorii:
**gdzie** jest dana rzecz w kodzie i **co** robi.

---

## Baza danych (1–2 pkt)

- **Schemat:** `prisma/schema.prisma`
- **Modele:** `User`, `Car` (Resource), `Reservation` (Request)
- **Enumy:** `Role` (USER/ADMIN), `CarClass`, `ReservationStatus`
- **Relacje:** `User 1—N Reservation`, `Car 1—N Reservation` (`onDelete: Cascade`)
- **Ograniczenia / indeksy:**
  - `email` UNIQUE
  - `pricePerDay`, `totalPrice` → `Decimal(10,2)` (poprawny typ na pieniądze)
  - indeksy: `users(role)`, `cars(carClass)`, `cars(isActive)`,
    `reservations(userId)`, `reservations(status)`,
    `reservations(carId, startDate, endDate)` ← pod zapytanie o kolizję
- **Dane testowe:** `prisma/seed.ts` (1 admin, 2 userów, 8 aut, 4 rezerwacje)
- **Uruchomienie:** `npx prisma db push && npm run db:seed`

---

## UI (część z ~60% puli „UI i algorytm”)

Server Components renderują dane (czytają z warstwy serwisów), a interaktywne
formularze to Client Components, które wołają REST API.

| Widok | Plik | Co pokazuje |
| --- | --- | --- |
| Logowanie | `src/app/(auth)/login/page.tsx` | formularz + konta testowe |
| Rejestracja | `src/app/(auth)/register/page.tsx` | rejestracja (rola USER) |
| Dashboard | `src/app/(dashboard)/dashboard/page.tsx` | statystyki, różnica USER/ADMIN |
| Lista zasobów | `src/app/(dashboard)/cars/page.tsx` | katalog + filtr dostępności |
| Filtr dostępności | `src/features/domain/availability-filter.tsx` | woła `/api/cars/available` |
| Szczegóły zasobu | `src/app/(dashboard)/cars/[id]/page.tsx` | dane auta + formularz rezerwacji |
| Formularz rezerwacji | `src/features/domain/reservation-form.tsx` | POST + rozbicie ceny z serwera |
| Moje rezerwacje | `src/app/(dashboard)/reservations/page.tsx` | tylko własne rekordy |
| Szczegóły rezerwacji | `src/app/(dashboard)/reservations/[id]/page.tsx` | rozbicie ceny + anulowanie |
| Admin: rezerwacje | `src/app/(dashboard)/admin/reservations/page.tsx` | wszystkie rezerwacje |
| Admin: flota | `src/app/(dashboard)/admin/cars/page.tsx` | wszystkie auta (też nieaktywne) |
| Admin: dodaj auto | `src/app/(dashboard)/admin/cars/new/page.tsx` | formularz dodania zasobu |

Komponenty UI (shadcn/ui): `src/components/ui/**`. Dane pochodzą z bazy/API,
nie z mocków.

---

## Algorytm (serce puli „UI i algorytm”)

- **Główny algorytm:** `calculateRentalPrice`
  → `src/server/domain/strategies/pricing/car-rental-pricing.ts`
- **Reguły (stałe biznesowe):** `src/server/domain/config/rental-rules.ts`
- **Co liczy:** dni × cena dobowa z bazy, sezonowość, dopłata za młodego
  kierowcę, zniżka za długi wynajem, ubezpieczenie zależne od klasy; zwraca
  pełne `breakdown` + `appliedRules`.
- **Kolizja terminów:** `checkCarAvailability` / `rangesOverlap`
  → `src/server/domain/strategies/availability/date-overlap.ts`
- **Dlaczego na backendzie:** to czysta funkcja wołana przez serwis
  (`src/server/services/reservation.service.ts`) z **ceną z bazy danych**.
  Frontend nie ma wpływu na wynik — gdyby wysłał własną cenę, jest ignorowana.
- **Dowód „czystości”:** algorytm jest testowany bez bazy i bez UI
  (`tests/car-rental-pricing.test.ts`).

---

## REST API (1–2 pkt)

- **Endpointy:** `src/app/api/**` (Route Handlers); logika w
  `src/server/api/controllers/**` i serwisach (pliki `route.ts` są cienkie).
- **Pełna lista + role:** tabela w `README.md` §6.
- **Koperta odpowiedzi:** `{ success, data }` / `{ success, error }`
  (`src/server/api/responses.ts`).
- **Mapowanie błędów** (`400/401/403/404/409/500`): `src/server/api/handler.ts`.
- **Swagger / OpenAPI:** UI pod **`/api-docs`**, spec pod **`/api/api-docs`**
  (`src/server/api/openapi.ts`). Opisane body, odpowiedzi, statusy, role,
  przykłady.

---

## Security (4–5 pkt)

| Mechanizm | Plik |
| --- | --- |
| Hashowanie haseł (bcrypt) | `src/server/auth/password.ts` |
| Podpisany JWT w httpOnly cookie | `src/server/auth/token.ts` |
| `getCurrentUser` / `requireUser` / `requireRole` | `src/server/auth/session.ts` |
| Polityka własności (`canAccessRequest`/`canManageRequest`) | `src/server/domain/policies/reservation.policy.ts` |
| Walidacja Zod | `src/server/validators/**` |
| Cena liczona na serwerze (nie z frontu) | `src/server/services/reservation.service.ts` |

**Jak USER jest ograniczony do swoich danych:** serwis przed zwróceniem/zmianą
rekordu woła `canAccessRequest`/`canManageRequest`. Próba pobrania cudzej
rezerwacji po ID → **403**. Endpointy admina mają `requireRole("ADMIN")` → USER
dostaje **403**.

**Jak ADMIN ma pełny dostęp:** `canAccessRequest`/`canManageRequest` zwracają
`true` dla roli ADMIN; `listAll` dodatkowo weryfikuje rolę w serwisie
(defense in depth).

**Czego NIE robimy:** nie ufamy UI (ukryte przyciski to nie zabezpieczenie),
nie przyjmujemy ceny ani roli z body.

### Szybki dowód (po `npm run dev` i seedzie)

```bash
# USER nie wejdzie na endpoint admina:
curl -i -c u.txt -X POST localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"anna@zpo.dev","password":"user1234"}'
curl -i -b u.txt localhost:3000/api/admin/reservations    # -> 403
```

---

## Testy (1–2 pkt)

- **Gdzie:** `tests/**`
- **Jak odpalić:** `npm test`
- **Co sprawdzają:**
  - `car-rental-pricing.test.ts` — cena bazowa, młody kierowca, długi wynajem,
    ubezpieczenie, sezonowość, błędna data, błędny wiek, pełne rozbicie ceny.
  - `availability.test.ts` — kolizja / brak kolizji terminów, kolejny wolny slot.
  - `locker-assignment.test.ts` — alternatywna domena (paczkomaty).
- **Wynik:** `Test Files 3 passed · Tests 18 passed`.

---

## Co powiedzieć na obronie

> „Projekt jest generycznym systemem zarządzania zasobami i rezerwacjami.
> Startowo działa jako wypożyczalnia samochodów, ale architektura pozwala
> podmienić zasób, request i algorytm domenowy. Najważniejsza logika jest po
> stronie backendu. Frontend tylko wyświetla dane i wysyła formularze. Security
> jest sprawdzane w endpointach przez `requireUser` i `requireRole` oraz w
> serwisach przez polityki własności, więc użytkownik nie może zobaczyć cudzych
> danych. Cena nigdy nie pochodzi z frontendu — liczy ją czysta, przetestowana
> funkcja domenowa na podstawie danych z bazy.”

**Gdybym miał zmienić temat na paczkomaty:** edytuję `domain.config.ts`,
przełączam aktywną strategię w `strategies/index.ts` na
`assignSmallestAvailableLocker` (już zaimplementowaną i przetestowaną) i
dostosowuję pola w `schema.prisma`. Endpointy, autoryzacja, walidacja i warstwa
serwisów zostają bez zmian.

**Najmocniejsze punkty do podkreślenia:**
1. Separacja: pure algorithm ↔ service (DB) ↔ controller (HTTP) ↔ UI.
2. Security egzekwowane na backendzie (pokaz `curl` → 403).
3. Cena liczona na serwerze (pokaz: wysłanie `totalPrice` w body jest ignorowane).
4. Testy jednostkowe algorytmu (czysta funkcja, bez bazy).
5. Generyczność: jeden plik konfiguracji + jedna strategia = nowy temat.
