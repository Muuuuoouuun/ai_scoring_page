/**
 * In-memory server store.
 * Acts as a DB layer stub — swap out the arrays with real DB queries
 * when a database client (e.g. pg, prisma) is available.
 */

import type { UserReview, PatchUpdate, AuditLog } from "@/lib/types";

// Global singletons survive hot-reloads in dev (Next.js global pattern)
const g = globalThis as typeof globalThis & {
  _reviews?: UserReview[];
  _patchUpdates?: PatchUpdate[];
  _auditLogs?: AuditLog[];
};

g._reviews ??= [];
g._patchUpdates ??= [];
g._auditLogs ??= [];

// --- Reviews ---

export function getReviews(toolId: string): UserReview[] {
  return g._reviews!.filter((r) => r.toolId === toolId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addReview(review: UserReview): void {
  g._reviews!.unshift(review);
}

// --- Patch Updates ---

export function getPatchUpdates(toolId: string): PatchUpdate[] {
  return g._patchUpdates!.filter((p) => p.toolId === toolId).sort(
    (a, b) => new Date(b.patchDate).getTime() - new Date(a.patchDate).getTime()
  );
}

export function addPatchUpdate(patch: PatchUpdate): void {
  g._patchUpdates!.unshift(patch);
}

// --- Audit Logs ---

export function addAuditLog(log: AuditLog): void {
  g._auditLogs!.unshift(log);
}

export function getAuditLogs(): AuditLog[] {
  return [...g._auditLogs!];
}
