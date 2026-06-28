import { type Car, type CarClass, Prisma } from "@prisma/client";
import type { IResourceRepository } from "../domain/core/interfaces";
import { prisma } from "../db/prisma";

// =============================================================================
// CAR repository (= generic ResourceRepository). The ONLY place car rows are
// read/written. Implements the generic IResourceRepository contract.
// =============================================================================

export interface CreateCarData {
  brand: string;
  model: string;
  carClass: CarClass;
  pricePerDay: number;
  isActive?: boolean;
}

export const carRepository = {
  findById(id: string): Promise<Car | null> {
    return prisma.car.findUnique({ where: { id } });
  },

  findActive(category?: CarClass): Promise<Car[]> {
    return prisma.car.findMany({
      where: { isActive: true, ...(category ? { carClass: category } : {}) },
      orderBy: [{ carClass: "asc" }, { pricePerDay: "asc" }],
    });
  },

  findAll(): Promise<Car[]> {
    return prisma.car.findMany({ orderBy: { createdAt: "desc" } });
  },

  create(data: CreateCarData): Promise<Car> {
    return prisma.car.create({
      data: {
        brand: data.brand,
        model: data.model,
        carClass: data.carClass,
        pricePerDay: new Prisma.Decimal(data.pricePerDay),
        isActive: data.isActive ?? true,
      },
    });
  },
} satisfies IResourceRepository<Car, CarClass, CreateCarData>;
