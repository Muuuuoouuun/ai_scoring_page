import type { RequestActor } from "@/lib/types";

export const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";
export const ANONYMOUS_USER_ID = "anonymous";

export const getActorFromHeaders = (headers: Headers): RequestActor => {
  const id = headers.get("x-user-id")?.trim() || ANONYMOUS_USER_ID;
  const nickname = headers.get("x-user-nickname")?.trim() || (id === ANONYMOUS_USER_ID ? "Anonymous" : "Admin User");

  return {
    id,
    nickname,
    role: id === ADMIN_USER_ID ? "admin" : "user"
  };
};

export const requireAdmin = (headers: Headers): RequestActor | Response => {
  const actor = getActorFromHeaders(headers);
  if (actor.role !== "admin") {
    return Response.json({ message: "Admin permission required." }, { status: 403 });
  }
  return actor;
};
