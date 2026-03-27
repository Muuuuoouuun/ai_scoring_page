import { patchNoteSchema } from "@/lib/validators";
import { addAuditLog, addPatchUpdate, getPatchUpdates } from "@/lib/store";
import { getActorId, isAdminRequest } from "@/lib/admin";
import type { PatchUpdate, AuditLog } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const toolId = searchParams.get("toolId");
  if (!toolId) {
    return Response.json({ message: "toolId is required." }, { status: 400 });
  }
  const patches = getPatchUpdates(toolId);
  return Response.json({ patches }, { status: 200 });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: "Forbidden." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const result = patchNoteSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Invalid payload.", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const actorId = getActorId(request) ?? "admin";
  const patch: PatchUpdate = {
    id: crypto.randomUUID(),
    toolId: result.data.toolId,
    title: result.data.title,
    change: result.data.change,
    errorRisk: result.data.errorRisk,
    authorId: actorId,
    patchDate: result.data.patchDate ?? new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };

  addPatchUpdate(patch);

  const log: AuditLog = {
    id: crypto.randomUUID(),
    actorId,
    action: "CREATE_PATCH_NOTE",
    resourceType: "patch_update",
    resourceId: patch.id,
    payload: { toolId: patch.toolId, title: patch.title },
    createdAt: new Date().toISOString()
  };
  addAuditLog(log);

  return Response.json({ patch }, { status: 201 });
}
