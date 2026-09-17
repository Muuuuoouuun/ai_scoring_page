import { requireAdmin } from "@/lib/admin";
import { createPatchUpdate, listPatchUpdates } from "@/lib/server-store";
import { getToolById } from "@/lib/tools";
import { patchUpdateSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const tool = getToolById(params.id);
  if (!tool) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }

  return Response.json({ patches: await listPatchUpdates(params.id) }, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const tool = getToolById(params.id);
  if (!tool) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }

  const actor = requireAdmin(request.headers);
  if (actor instanceof Response) {
    return actor;
  }

  const body = await request.json().catch(() => null);
  const result = patchUpdateSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ message: "Invalid payload.", errors: result.error.flatten() }, { status: 400 });
  }

  const patch = await createPatchUpdate({
    toolId: params.id,
    actor,
    input: result.data
  });

  return Response.json({ patch }, { status: 201 });
}
