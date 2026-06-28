import type {
  AuthenticatedUser,
  DateRange,
  DomainRuleViolation,
  Result,
} from "@/types";
import type { DomainAlgorithmType } from "../config/domain.config";

// =============================================================================
// Generic domain contracts (the "ports" of the architecture).
//
// They are generic over their entity/input types so the same shape works for
// any topic. Concrete implementations (CarRepository, ReservationService, ...)
// bind the type parameters to the current domain. These interfaces are pure
// types — they import nothing from Prisma or Next.
// =============================================================================

// -----------------------------------------------------------------------------
// Repositories — the only layer that talks to the database.
// -----------------------------------------------------------------------------

export interface IResourceRepository<TResource, TCategory, TCreateData> {
  findById(id: string): Promise<TResource | null>;
  /** Bookable resources only (Car.isActive = true), optionally by category. */
  findActive(category?: TCategory): Promise<TResource[]>;
  /** Everything, including inactive — admin only. */
  findAll(): Promise<TResource[]>;
  create(data: TCreateData): Promise<TResource>;
}

export interface IRequestRepository<TRequest, TCreateData, TStatus> {
  findById(id: string): Promise<TRequest | null>;
  findByUser(userId: string): Promise<TRequest[]>;
  findAll(): Promise<TRequest[]>;
  create(data: TCreateData): Promise<TRequest>;
  updateStatus(id: string, status: TStatus): Promise<TRequest>;
  /** Active (non-cancelled) requests for one resource overlapping a window. */
  findOverlapping(resourceId: string, range: DateRange): Promise<TRequest[]>;
  /** Ids of resources that are busy (have an overlapping active request). */
  findBusyResourceIds(range: DateRange): Promise<string[]>;
}

// -----------------------------------------------------------------------------
// Services — orchestrate repositories + algorithms + permissions.
// -----------------------------------------------------------------------------

export interface IAvailabilityService<TResource, TCategory> {
  isResourceAvailable(resourceId: string, range: DateRange): Promise<boolean>;
  getAvailableResources(
    range: DateRange,
    category?: TCategory,
  ): Promise<TResource[]>;
}

export interface IRequestService<TRequest, TCreateInput, TResult> {
  /** Validate -> check availability -> run algorithm -> persist. */
  create(
    user: AuthenticatedUser,
    input: TCreateInput,
  ): Promise<{ request: TRequest; result: TResult }>;
  getForUser(user: AuthenticatedUser, id: string): Promise<TRequest>;
  listForUser(user: AuthenticatedUser): Promise<TRequest[]>;
  cancel(user: AuthenticatedUser, id: string): Promise<TRequest>;
  listAll(admin: AuthenticatedUser): Promise<TRequest[]>;
}

// -----------------------------------------------------------------------------
// Algorithms & strategies — PURE business logic (no DB, no IO).
// -----------------------------------------------------------------------------

/** The active domain algorithm. */
export interface IDomainAlgorithm<TInput, TResult> {
  readonly type: DomainAlgorithmType;
  run(input: TInput): Result<TResult, DomainRuleViolation>;
}

/** Pricing family (Car Rental, Room booking). */
export interface IPricingStrategy<TInput, TBreakdown> {
  readonly name: string;
  calculate(input: TInput): Result<TBreakdown, DomainRuleViolation>;
}

/** Assignment family (Paczkomaty: pick the smallest free locker). */
export interface IAssignmentStrategy<TItem, TSlot> {
  readonly name: string;
  assign(item: TItem, candidates: TSlot[]): Result<TSlot, DomainRuleViolation>;
}

/** Scheduling family (Vet: detect collisions / find next free slot). */
export interface ISchedulingStrategy {
  readonly name: string;
  hasCollision(requested: DateRange, existing: DateRange[]): boolean;
  findNextAvailable(
    requested: DateRange,
    existing: DateRange[],
    horizonDays: number,
  ): DateRange | null;
}

// -----------------------------------------------------------------------------
// Permissions — backend authorization checks.
// -----------------------------------------------------------------------------

export interface IPermissionPolicy<TSubject> {
  /** May this user READ the subject? (owner or admin) */
  canAccess(user: AuthenticatedUser, subject: TSubject): boolean;
  /** May this user MUTATE the subject? (owner under rules, or admin) */
  canManage(user: AuthenticatedUser, subject: TSubject): boolean;
}
