export const ADMIN_USER_ID = "admin-9e9b87f3-7b17-4ab9-9c3a-15359e0a2f95";

/**
 * Extracts the actor ID from the request headers.
 * Clients should send X-User-Id (any user) or X-Admin-Token (admin).
 */
export function getActorId(request: Request): string | null {
  return request.headers.get("x-user-id") ?? null;
}

/**
 * Returns true when the request carries a valid admin token.
 */
export function isAdminRequest(request: Request): boolean {
  return request.headers.get("x-admin-token") === ADMIN_USER_ID;
}
