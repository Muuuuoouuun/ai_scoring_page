import type { ResourceGroup, ResourceSite } from "@/lib/types";
import { RESOURCE_GROUPS } from "@/lib/types";
import { resources } from "@/data/resources";

export const getResources = (): ResourceSite[] => resources;

export const groupResources = (sites: ResourceSite[]): Array<{ group: ResourceGroup; sites: ResourceSite[] }> =>
  RESOURCE_GROUPS.map((group) => ({ group, sites: sites.filter((site) => site.group === group) })).filter(
    ({ sites: groupSites }) => groupSites.length > 0
  );

const haystack = (site: ResourceSite) =>
  [site.name, site.tagline, site.useCase, site.strength, site.caution, site.pricingDetail, ...site.alternatives]
    .join(" ")
    .toLowerCase();

/** 키워드, 그룹, 무료 여부, 한국어 지원으로 사이트를 거릅니다. */
export const filterResources = (
  sites: ResourceSite[],
  {
    query,
    group,
    freeOnly,
    koreanOnly
  }: { query?: string; group?: ResourceGroup; freeOnly?: boolean; koreanOnly?: boolean }
): ResourceSite[] => {
  const needle = query?.trim().toLowerCase() ?? "";
  return sites.filter((site) => {
    if (group && site.group !== group) return false;
    if (freeOnly && site.pricing === "paid") return false;
    if (koreanOnly && site.koreanFriendly === "none") return false;
    if (needle && !haystack(site).includes(needle)) return false;
    return true;
  });
};
