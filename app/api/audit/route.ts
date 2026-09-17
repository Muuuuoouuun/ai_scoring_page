import { requireAdmin } from "@/lib/admin";
import { listAuditLogs } from "@/lib/server-store";

export async function GET(request: Request) {
  const actor = requireAdmin(request.headers);
  if (actor instanceof Response) {
    return actor;
  }

  const { searchParams } = new URL(request.url);
  const toolId = searchParams.get("toolId") ?? undefined;

  return Response.json({ auditLogs: await listAuditLogs(toolId) }, { status: 200 });
}
