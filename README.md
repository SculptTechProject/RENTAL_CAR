# Generic Reservation / Resource Management Template

**Wariant startowy: Wypożyczalnia samochodów (Car Rental).**

Solidny, generyczny szablon aplikacji pod zaliczenie ZPO. Rdzeń aplikacji jest
generyczny (użytkownik tworzy *request* dotyczący *zasobu*, system sprawdza
dostępność/kolizję, uruchamia algorytm domenowy i zapisuje wynik), a konkretny
temat zamknięty jest w **jednej warstwie domenowej**. Dzięki temu zmiana tematu
(np. na paczkomaty, kino, weterynarza, rezerwację sal) nie wymaga przepisywania
całej aplikacji.

---

## 1. Opis projektu

- **Stack:** Next.js 15 (App Router) · TypeScript · PostgreSQL · Prisma ·
  własna autoryzacja JWT (httpOnly cookie, `jose` + `bcryptjs`) · Zod ·
  Tailwind + shadcn/ui · OpenAPI/Swagger · Vitest.
- **Architektura domenowa:** większość kodu jest generyczna; tematyka
  (Car Rental) jest sparametryzowana w `src/server/domain/config/` i w
  strategiach `src/server/domain/strategies/`.
- **Najważniejsze zasady:**
  - Frontend **wyświetla dane i obsługuje formularze**. Nie liczy algorytmu.
  - Cała logika biznesowa jest na backendzie (service/domain).
  - **Security jest prawdziwe** — sprawdzane w endpointach (`requireUser`,
    `requireRole`) i w serwisach (polityki własności), a nie przez ukrywanie
    przycisków.
  - **Cena i wynik algorytmu nigdy nie pochodzą z frontendu** — backend liczy je
    z danych w bazie.

### Mapa generyczne → domena (Car Rental)

| Pojęcie generyczne | Car Rental |
| --- | --- |
| Resource (zasób) | `Car` (samochód) |
| Request (zgłoszenie) | `Reservation` (rezerwacja) |
| Algorithm | `calculateRentalPrice` + `checkCarAvailability` |

---

## 2. Jak uruchomić

Wymagania: Node 18+ (testowane na Node 22), Docker, npm.

```bash
# 1. Baza danych (PostgreSQL w Dockerze)
docker compose up -d

# 2. Zależności
npm install

# 3. Konfiguracja środowiska
cp .env.example .env          # wartości domyślne pasują do docker-compose.yml

# 4. Klient Prisma + schemat do bazy
npx prisma generate
npx prisma db push

# 5. Dane testowe
npm run db:seed

# 6. Uruchom aplikację
npm run dev                   # http://localhost:3000

# 7. Testy
npm test
```

Skróty (zob. `package.json`): `npm run db:reset` (czyści bazę i seeduje od
nowa), `npm run db:studio` (Prisma Studio), `npm run typecheck`.

> **Uwagi techniczne**
> - npm 11 domyślnie blokuje skrypty instalacyjne pakietów — nie wpływa to na
>   projekt (binarka `esbuild` jest dostarczana w pakiecie platformowym, a
>   `prisma generate` uruchamiamy ręcznie).
> - Wersje zależności są celowo przypięte do sprawdzonego, spójnego zestawu
>   (Next 15 / Prisma 6 / Zod 3 / Tailwind 3) dla maksymalnej stabilności.

---

## 3. Dane testowe użytkowników

| Rola | E-mail | Hasło |
| --- | --- | --- |
| **ADMIN** | `admin@zpo.dev` | `admin123` |
| USER | `anna@zpo.dev` | `user1234` |
| USER | `bartek@zpo.dev` | `user1234` |

Dane tworzy `prisma/seed.ts`: 1 admin, 2 użytkowników, 8 samochodów (wszystkie
klasy, jeden nieaktywny — widoczny tylko dla admina), 4 rezerwacje (ceny
policzone realnym algorytmem).

---

## 4. Role i uprawnienia

| Operacja | USER | ADMIN |
| --- | --- | --- |
| Przeglądanie katalogu / dostępności | ✅ | ✅ |
| Tworzenie rezerwacji | ✅ | ✅ |
| Podgląd **własnych** rezerwacji | ✅ | ✅ |
| Podgląd **cudzych** rezerwacji | ❌ 403 | ✅ |
| Anulowanie własnej rezerwacji | ✅ | ✅ |
| Lista **wszystkich** rezerwacji | ❌ 403 | ✅ |
| Dodawanie/zarządzanie flotą | ❌ 403 | ✅ |

- Egzekwowane w endpointach: `requireUser()` / `requireRole("ADMIN")`
  (`src/server/auth/session.ts`).
- Własność rekordów: `canAccessRequest` / `canManageRequest`
  (`src/server/domain/policies/reservation.policy.ts`), wywoływane w serwisie
  **przed** zwróceniem/zmianą danych.
- Rejestracja zawsze nadaje rolę `USER` (brak możliwości samodzielnego
  podniesienia uprawnień).

---

## 5. Baza danych i modele

Schemat: **`prisma/schema.prisma`**. Modele: `User`, `Car`, `Reservation`.
Enumy: `Role`, `CarClass`, `ReservationStatus`.

- `User` — `id, name, email (unique), passwordHash, role, createdAt, updatedAt`.
- `Car` (Resource) — `id, brand, model, carClass, pricePerDay (Decimal),
  isActive, ...`.
- `Reservation` (Request) — `id, userId, carId, startDate, endDate, driverAge,
  withInsurance, status, totalPrice (Decimal), ...`.

Relacje: `User 1—N Reservation`, `Car 1—N Reservation` (`onDelete: Cascade`).
Indeksy: `users(role)`, `cars(carClass)`, `cars(isActive)`,
`reservations(userId)`, `reservations(status)` oraz indeks złożony
`reservations(carId, startDate, endDate)` pod zapytanie o kolizję terminów.
`totalPrice` i `pricePerDay` są typu `Decimal(10,2)`.

---

## 6. API i Swagger

REST API w **Next.js Route Handlers** (`src/app/api/**`). Logika jest w
kontrolerach (`src/server/api/controllers`) i serwisach — pliki `route.ts` są
cienkie. Każda odpowiedź ma kopertę `{ success, data }` lub
`{ success, error }`.

**Dokumentacja Swagger UI: [`/api-docs`](http://localhost:3000/api-docs)**
(surowy spec OpenAPI: `/api/api-docs`).

### Endpointy generyczne (+ czytelne aliasy dla wariantu samochodów)

| Metoda | Ścieżka generyczna | Alias (Car Rental) | Dostęp |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | publiczny |
| POST | `/api/auth/login` | — | publiczny |
| POST | `/api/auth/logout` | — | publiczny |
| GET | `/api/auth/me` | — | publiczny |
| GET | `/api/resources` | `/api/cars` | USER |
| GET | `/api/resources/available` | `/api/cars/available` | USER |
| GET | `/api/resources/[id]` | `/api/cars/[id]` | USER |
| POST | `/api/requests` | `/api/reservations` | USER |
| GET | `/api/requests/my` | `/api/reservations/my` | USER |
| GET | `/api/requests/[id]` | `/api/reservations/[id]` | właściciel/ADMIN |
| DELETE | `/api/requests/[id]` | `/api/reservations/[id]` | właściciel/ADMIN |
| GET | `/api/admin/requests` | `/api/admin/reservations` | ADMIN |
| GET | `/api/admin/resources` | `/api/admin/cars` | ADMIN |
| POST | `/api/admin/resources` | `/api/admin/cars` | ADMIN |

Kody błędów: `400` walidacja, `401` brak sesji, `403` brak uprawnień,
`404` nie znaleziono, `409` konflikt (kolizja terminów), `500` błąd serwera.
Mapowanie błędów: `src/server/api/handler.ts`.

---

## 7. Opis algorytmu

**Algorytm jest czystą funkcją — testowalną bez bazy i bez UI.**

### `calculateRentalPrice` — `src/server/domain/strategies/pricing/car-rental-pricing.ts`

Wejście: `pricePerDay` (z bazy!), `carClass`, `startDate`, `endDate`,
`driverAge`, `withInsurance`. Reguły w `src/server/domain/config/rental-rules.ts`.

Uwzględnia: liczbę dni, cenę dobową z bazy, klasę auta (mnożnik ubezpieczenia),
dopłatę za młodego kierowcę (<25 lat), zniżkę za długi wynajem (≥7 dni),
ubezpieczenie oraz sezonowość (lipiec/sierpień/grudzień ×1.2).

Zwraca pełne rozbicie:

```
days, basePrice, seasonMultiplier, seasonAdjustment,
youngDriverFee, longRentalDiscount, insuranceFee, totalPrice, appliedRules[]
```

Zwraca `Result` (`ok` / `err`) — błędne dane (zła data, wiek < 18) dają typowane
naruszenie reguły, mapowane na `400`.

### `checkCarAvailability` — `src/server/domain/strategies/availability/date-overlap.ts`

Wykrywa kolizję terminów (półotwarte przedziały `[start, end)` — wynajem
„koniec == początek” się nie nakłada). Kolizja sprawdzana jest **na backendzie**:
zapytaniem do bazy (`reservation.repository.ts`) + czystą funkcją.

> Liczenie odbywa się osobno od pobierania danych: serwis
> (`reservation.service.ts`) pobiera dane z bazy, a samo liczenie robi czysta
> funkcja domenowa.

---

## 8. Opis security

1. **Hasła** — hashowane `bcryptjs` (nigdy plaintext).
2. **Sesja** — podpisany JWT (`jose`, HS256, sekret `AUTH_SECRET`) w cookie
   **httpOnly, SameSite=Lax**. Klient nie może podrobić roli — jest w podpisie.
3. **Autoryzacja w backendzie** — `requireUser()` / `requireRole("ADMIN")` w
   każdym chronionym endpoincie. UI tylko ukrywa linki *dodatkowo*.
4. **Własność danych** — `canAccessRequest` / `canManageRequest`: USER widzi i
   zmienia tylko swoje rekordy (próba dostępu do cudzego → `403`).
5. **Walidacja wejścia** — wszystkie body/query przez **Zod**
   (`src/server/validators`). Brak duplikacji walidacji.
6. **Brak zaufania do frontendu w sprawie ceny** — `totalPrice` liczy serwis z
   `pricePerDay` z bazy; pole `totalPrice` z body jest ignorowane.
7. **Brak eskalacji uprawnień** — rejestracja zawsze nadaje `USER`.
8. **Spójny kontrakt błędów** — `400/401/403/404/409/500`.

---

## 9. Testy

Vitest. Pliki w **`tests/`**. Uruchomienie: **`npm test`**.

- `tests/car-rental-pricing.test.ts` — cena bazowa, dopłata za młodego kierowcę,
  zniżka za długi wynajem, ubezpieczenie, sezonowość, błędna data, błędny wiek,
  pełne rozbicie ceny.
- `tests/availability.test.ts` — kolizja i brak kolizji terminów + scheduling.
- `tests/locker-assignment.test.ts` — przykład alternatywnej domeny (paczkomaty).

```
Test Files  3 passed (3)
     Tests  18 passed (18)
```

---

## 10. Jak zmienić temat projektu

Architektura jest tak zaprojektowana, by zmiana tematu sprowadzała się do:
**(a)** edycji `domain.config.ts`, **(b)** podmiany aktywnej strategii w
`strategies/index.ts`, **(c)** dostosowania modeli Prisma. Generyczne
endpointy/serwisy/polityki zostają.

Pliki kluczowe:
- `src/server/domain/config/domain.config.ts` — nazwy i copy UI.
- `src/server/domain/strategies/index.ts` — która strategia jest aktywna.
- `prisma/schema.prisma` — pola modeli.

### → Paczkomaty (Parcel Lockers)

| Car Rental | Paczkomaty |
| --- | --- |
| `Car` | `Locker` |
| `Reservation` | `Parcel` |
| `calculateRentalPrice` | `assignSmallestAvailableLocker` |
| `carClass` | `lockerSize` |
| `startDate/endDate` | `createdAt / pickupDeadline` |

Kroki: zmień `domainConfig` (resource=„Paczkomat”, request=„Paczka”,
`algorithmType: "assignment"`); w `strategies/index.ts` wyeksportuj
`assignSmallestAvailableLocker` (gotowa, działająca funkcja w
`strategies/assignment/locker-assignment.ts`); w schemacie zamień `CarClass` na
`LockerSize` i pola dat na `pickupDeadline`. Endpointy zostają generyczne lub
dodajesz aliasy `/api/parcels`.

### → Kino (Cinema)

| Car Rental | Kino |
| --- | --- |
| `Car` | `Seat` / `Screening` |
| `Reservation` | `TicketReservation` |
| `calculateRentalPrice` | `suggestAdjacentSeats` |
| dostępność (terminy) | zajęte miejsca na seansie |

Algorytm zmienia rodzinę na „assignment” (dobór sąsiednich miejsc), dostępność =
zbiór zajętych miejsc danego seansu zamiast kolizji dat.

### → Weterynarz (Vet)

| Car Rental | Weterynarz |
| --- | --- |
| `Car` | `Doctor` |
| `Reservation` | `Appointment` |
| `calculateRentalPrice` | `detectAppointmentCollision` / `findNextAvailableSlot` |
| dostępność | terminarz lekarza |

Strategia „scheduling” jest już zaimplementowana i przetestowana —
`schedulingStrategy` w `strategies/availability/date-overlap.ts`
(`hasCollision`, `findNextAvailable`).

---

## 11. Mapa punktów ZPO

| Kategoria | Gdzie w projekcie | Punkty (orient.) |
| --- | --- | --- |
| Baza danych | `prisma/schema.prisma` (modele, relacje, indeksy) | 1–2 |
| UI i algorytm | `src/app/**` (UI) + `src/server/domain/strategies` (algorytm) | ~60% |
| Security | `src/server/auth`, `src/server/domain/policies`, walidatory | 4–5 |
| Testy | `tests/**` (`npm test`) | 1–2 |
| REST API | `src/app/api/**` + Swagger `/api-docs` | 1–2 |

Szczegóły i ściąga na obronę: **[`ZALICZENIE.md`](./ZALICZENIE.md)**.

---

## 12. Jak zaprezentować projekt w 3 minuty

1. **(0:20)** „To generyczny system rezerwacji zasobów; startowo działa jako
   wypożyczalnia, ale architektura pozwala podmienić zasób, request i algorytm.”
   Pokaż `domain.config.ts` i `strategies/index.ts`.
2. **(0:40)** Zaloguj się jako USER (`anna@zpo.dev`). Pokaż katalog, sprawdź
   dostępność w terminie, zarezerwuj auto → pojawia się **rozbicie ceny
   policzone przez serwer**.
3. **(0:40)** Pokaż „Moje rezerwacje” i szczegóły. Podkreśl: USER widzi tylko
   swoje.
4. **(0:40)** Wyloguj, zaloguj jako ADMIN (`admin@zpo.dev`). Pokaż „Wszystkie
   rezerwacje” i dodanie auta. To samo konto USER dostaje **403** na tych
   endpointach.
5. **(0:20)** Pokaż **Swagger `/api-docs`** i `npm test` (18 zielonych testów).
6. **(0:20)** Puenta security: „Ceny i uprawnienia są liczone i sprawdzane na
   backendzie — pokazanie/ukrycie przycisku w UI niczego nie zmienia.”
   (Możesz pokazać `curl` na `/api/admin/reservations` kontem USER → 403.)
