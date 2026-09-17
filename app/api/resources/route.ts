import { filterResources, getResources } from "@/lib/resources";
import { RESOURCE_GROUPS, type ResourceGroup } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupParam = searchParams.get("group");
  const group = RESOURCE_GROUPS.includes(groupParam as ResourceGroup) ? (groupParam as ResourceGroup) : undefined;

  const sites = filterResources(getResources(), {
    query: searchParams.get("query") ?? undefined,
    group,
    freeOnly: searchParams.get("freeOnly") === "true",
    koreanOnly: searchParams.get("koreanOnly") === "true"
  });

  return Response.json({ resources: sites }, { status: 200 });
}
