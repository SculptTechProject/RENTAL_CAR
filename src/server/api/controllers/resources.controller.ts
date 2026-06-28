import type { NextRequest } from "next/server";
import { requireRole, requireUser } from "../../auth";
import { availabilityService, carService } from "../../services";
import { availabilityQuerySchema, createCarSchema } from "../../validators";
import { parseJson, searchParamsToObject } from "../parse";
import { toCarDTO } from "../presenters";
import { created, ok } from "../responses";

// GET /api/resources  (alias: /api/cars) — catalogue of bookable cars.
export async function listResources(_req: NextRequest) {
  await requireUser();
  const cars = await carService.listActive();
  return ok(cars.map(toCarDTO));
}

// GET /api/resources/available?startDate&endDate&carClass
export async function listAvailableResources(req: NextRequest) {
  await requireUser();
  const query = availabilityQuerySchema.parse(searchParamsToObject(req));
  const cars = await availabilityService.getAvailableResources(
    { startDate: query.startDate, endDate: query.endDate },
    query.carClass,
  );
  return ok(cars.map(toCarDTO));
}

// GET /api/resources/[id]
export async function getResource(_req: NextRequest, id: string) {
  await requireUser();
  const car = await carService.getById(id);
  return ok(toCarDTO(car));
}

// GET /api/admin/resources — full fleet (ADMIN).
export async function adminListResources(_req: NextRequest) {
  const admin = await requireRole("ADMIN");
  const cars = await carService.listAll(admin);
  return ok(cars.map(toCarDTO));
}

// POST /api/admin/resources — add a car (ADMIN).
export async function adminCreateResource(req: NextRequest) {
  const admin = await requireRole("ADMIN");
  const input = createCarSchema.parse(await parseJson(req));
  const car = await carService.create(admin, input);
  return created(toCarDTO(car));
}
