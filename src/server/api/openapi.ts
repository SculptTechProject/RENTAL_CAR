// =============================================================================
// OpenAPI 3.0 specification (hand-written, no extra dependency).
// Served as JSON at /api/api-docs and rendered by Swagger UI at /api-docs.
// =============================================================================

const errorResponse = {
  description: "Błąd — koperta { success:false, error }",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Generic Reservation Template API (Car Rental)",
    version: "1.0.0",
    description:
      "Generyczne REST API systemu rezerwacji zasobów. Wariant startowy: wypożyczalnia samochodów. " +
      "Uwierzytelnianie: httpOnly cookie z podpisanym JWT (logowanie przez POST /api/auth/login). " +
      "Ścieżki /api/cars i /api/reservations to czytelne aliasy ścieżek /api/resources i /api/requests.",
  },
  servers: [{ url: "/", description: "Bieżący host" }],
  tags: [
    { name: "Auth", description: "Rejestracja, logowanie, sesja" },
    { name: "Resources", description: "Katalog zasobów (samochody)" },
    { name: "Requests", description: "Rezerwacje użytkownika" },
    { name: "Admin", description: "Operacje administratora (rola ADMIN)" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "zpo_session",
        description: "Podpisany JWT ustawiany przez /api/auth/login.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Nieprawidłowe dane wejściowe." },
              details: { type: "object", nullable: true },
            },
          },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
        },
      },
      Car: {
        type: "object",
        properties: {
          id: { type: "string" },
          brand: { type: "string", example: "Toyota" },
          model: { type: "string", example: "Corolla" },
          carClass: {
            type: "string",
            enum: ["ECONOMY", "STANDARD", "SUV", "PREMIUM", "LUXURY"],
          },
          pricePerDay: { type: "number", example: 150 },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Reservation: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          carId: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          driverAge: { type: "integer", example: 30 },
          withInsurance: { type: "boolean" },
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
          },
          totalPrice: { type: "number", example: 480 },
          car: { $ref: "#/components/schemas/Car" },
        },
      },
      PriceBreakdown: {
        type: "object",
        description: "Rozbicie ceny policzone przez algorytm na backendzie.",
        properties: {
          days: { type: "integer", example: 3 },
          basePrice: { type: "number", example: 450 },
          seasonMultiplier: { type: "number", example: 1.2 },
          seasonAdjustment: { type: "number", example: 90 },
          youngDriverFee: { type: "number", example: 150 },
          longRentalDiscount: { type: "number", example: 0 },
          insuranceFee: { type: "number", example: 180 },
          totalPrice: { type: "number", example: 870 },
          appliedRules: { type: "array", items: { type: "string" } },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@zpo.dev" },
          password: { type: "string", example: "admin123" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Jan Kowalski" },
          email: { type: "string", format: "email", example: "jan@example.com" },
          password: { type: "string", minLength: 8, example: "haslo1234" },
        },
      },
      CreateReservationRequest: {
        type: "object",
        required: ["carId", "startDate", "endDate", "driverAge"],
        properties: {
          carId: { type: "string", example: "clx123car" },
          startDate: { type: "string", format: "date", example: "2025-07-10" },
          endDate: { type: "string", format: "date", example: "2025-07-13" },
          driverAge: { type: "integer", example: 22 },
          withInsurance: { type: "boolean", example: true },
        },
      },
      CreateCarRequest: {
        type: "object",
        required: ["brand", "model", "carClass", "pricePerDay"],
        properties: {
          brand: { type: "string", example: "Tesla" },
          model: { type: "string", example: "Model 3" },
          carClass: {
            type: "string",
            enum: ["ECONOMY", "STANDARD", "SUV", "PREMIUM", "LUXURY"],
            example: "PREMIUM",
          },
          pricePerDay: { type: "number", example: 400 },
          isActive: { type: "boolean", example: true },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Rejestracja (rola zawsze USER) + automatyczne logowanie",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Utworzono użytkownika i ustawiono sesję" },
          "400": errorResponse,
          "409": errorResponse,
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Logowanie — ustawia httpOnly cookie z sesją",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Zalogowano" },
          "400": errorResponse,
          "401": errorResponse,
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Wylogowanie — czyści cookie sesji",
        responses: { "200": { description: "Wylogowano" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Bieżący użytkownik (lub null)",
        responses: { "200": { description: "Principal lub null" } },
      },
    },
    "/api/resources": {
      get: {
        tags: ["Resources"],
        summary: "Lista dostępnych zasobów (samochodów). Alias: /api/cars",
        responses: {
          "200": {
            description: "Lista samochodów",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Car" },
                    },
                  },
                },
              },
            },
          },
          "401": errorResponse,
        },
      },
    },
    "/api/resources/available": {
      get: {
        tags: ["Resources"],
        summary: "Zasoby wolne w danym terminie. Alias: /api/cars/available",
        parameters: [
          {
            name: "startDate",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" },
            example: "2025-07-10",
          },
          {
            name: "endDate",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" },
            example: "2025-07-13",
          },
          {
            name: "carClass",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["ECONOMY", "STANDARD", "SUV", "PREMIUM", "LUXURY"],
            },
          },
        ],
        responses: {
          "200": { description: "Lista wolnych samochodów" },
          "400": errorResponse,
          "401": errorResponse,
        },
      },
    },
    "/api/resources/{id}": {
      get: {
        tags: ["Resources"],
        summary: "Szczegóły zasobu. Alias: /api/cars/{id}",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Samochód" },
          "401": errorResponse,
          "404": errorResponse,
        },
      },
    },
    "/api/requests": {
      post: {
        tags: ["Requests"],
        summary:
          "Utwórz rezerwację. Cena liczona na backendzie. Alias: /api/reservations",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateReservationRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Utworzona rezerwacja + rozbicie ceny",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        reservation: { $ref: "#/components/schemas/Reservation" },
                        price: { $ref: "#/components/schemas/PriceBreakdown" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": errorResponse,
          "401": errorResponse,
          "404": errorResponse,
          "409": errorResponse,
        },
      },
    },
    "/api/requests/my": {
      get: {
        tags: ["Requests"],
        summary: "Moje rezerwacje. Alias: /api/reservations/my",
        responses: {
          "200": { description: "Lista rezerwacji użytkownika" },
          "401": errorResponse,
        },
      },
    },
    "/api/requests/{id}": {
      get: {
        tags: ["Requests"],
        summary: "Szczegóły rezerwacji (właściciel lub ADMIN)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Rezerwacja" },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
      delete: {
        tags: ["Requests"],
        summary: "Anuluj rezerwację (właściciel lub ADMIN)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Rezerwacja anulowana" },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": errorResponse,
        },
      },
    },
    "/api/admin/requests": {
      get: {
        tags: ["Admin"],
        summary: "Wszystkie rezerwacje (ADMIN). Alias: /api/admin/reservations",
        responses: {
          "200": { description: "Lista wszystkich rezerwacji" },
          "401": errorResponse,
          "403": errorResponse,
        },
      },
    },
    "/api/admin/resources": {
      get: {
        tags: ["Admin"],
        summary: "Cała flota, w tym nieaktywne (ADMIN). Alias: /api/admin/cars",
        responses: {
          "200": { description: "Lista wszystkich samochodów" },
          "401": errorResponse,
          "403": errorResponse,
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Dodaj zasób (ADMIN). Alias: /api/admin/cars",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCarRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Utworzony samochód" },
          "400": errorResponse,
          "401": errorResponse,
          "403": errorResponse,
        },
      },
    },
  },
} as const;
