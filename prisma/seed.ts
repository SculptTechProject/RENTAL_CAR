import { type Car, type CarClass, PrismaClient, type ReservationStatus } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";
import { calculateRentalPrice } from "../src/server/domain/strategies";
import { isOk } from "../src/types";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Idempotent: wipe in FK-safe order so `npm run db:seed` can re-run.
  await prisma.reservation.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();

  // --- Users: 1 admin + 2 regular users -----------------------------------
  const [adminHash, annaHash, bartekHash] = await Promise.all([
    hashPassword("admin123"),
    hashPassword("user1234"),
    hashPassword("user1234"),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@zpo.dev",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  const anna = await prisma.user.create({
    data: {
      name: "Anna Nowak",
      email: "anna@zpo.dev",
      passwordHash: annaHash,
      role: "USER",
    },
  });
  const bartek = await prisma.user.create({
    data: {
      name: "Bartek Wójcik",
      email: "bartek@zpo.dev",
      passwordHash: bartekHash,
      role: "USER",
    },
  });

  // --- 8 cars across all classes -------------------------------------------
  const carsData: Array<{
    brand: string;
    model: string;
    carClass: CarClass;
    pricePerDay: number;
    isActive?: boolean;
  }> = [
    { brand: "Toyota", model: "Yaris", carClass: "ECONOMY", pricePerDay: 120 },
    { brand: "Škoda", model: "Fabia", carClass: "ECONOMY", pricePerDay: 130 },
    { brand: "Volkswagen", model: "Golf", carClass: "STANDARD", pricePerDay: 180 },
    { brand: "Toyota", model: "Corolla", carClass: "STANDARD", pricePerDay: 190 },
    { brand: "Kia", model: "Sportage", carClass: "SUV", pricePerDay: 260 },
    { brand: "Volvo", model: "XC60", carClass: "SUV", pricePerDay: 320 },
    { brand: "BMW", model: "Seria 5", carClass: "PREMIUM", pricePerDay: 420 },
    {
      brand: "Mercedes-Benz",
      model: "Klasa S",
      carClass: "LUXURY",
      pricePerDay: 700,
      isActive: false, // an inactive car, visible only to ADMIN
    },
  ];

  const cars: Car[] = [];
  for (const data of carsData) {
    cars.push(await prisma.car.create({ data }));
  }

  // --- A few reservations; prices computed by the REAL algorithm -----------
  async function makeReservation(
    userId: string,
    car: Car,
    startDate: Date,
    endDate: Date,
    driverAge: number,
    withInsurance: boolean,
    status: ReservationStatus,
  ) {
    const priced = calculateRentalPrice({
      pricePerDay: Number(car.pricePerDay),
      carClass: car.carClass,
      startDate,
      endDate,
      driverAge,
      withInsurance,
    });
    const totalPrice = isOk(priced) ? priced.value.totalPrice : 0;
    await prisma.reservation.create({
      data: {
        userId,
        carId: car.id,
        startDate,
        endDate,
        driverAge,
        withInsurance,
        status,
        totalPrice,
      },
    });
  }

  await makeReservation(anna.id, cars[0], new Date("2025-07-10"), new Date("2025-07-14"), 22, true, "CONFIRMED");
  await makeReservation(anna.id, cars[2], new Date("2025-08-01"), new Date("2025-08-05"), 35, false, "PENDING");
  await makeReservation(bartek.id, cars[4], new Date("2025-09-10"), new Date("2025-09-20"), 40, true, "COMPLETED");
  await makeReservation(bartek.id, cars[6], new Date("2025-12-20"), new Date("2025-12-27"), 28, true, "CONFIRMED");

  console.log("✅ Seed complete:");
  console.log(`   users: 3 (admin: ${admin.email}, users: ${anna.email}, ${bartek.email})`);
  console.log(`   cars: ${cars.length}`);
  console.log("   reservations: 4");
  console.log("\n   Login: admin@zpo.dev / admin123  |  anna@zpo.dev / user1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
