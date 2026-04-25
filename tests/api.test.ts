import { beforeEach, describe, expect, it } from "vitest";
import { ADMIN_USER_ID } from "@/lib/admin";
import { GET as getAuditLogs } from "@/app/api/audit/route";
import { GET as getTools } from "@/app/api/tools/route";
import { GET as getToolById } from "@/app/api/tool/[id]/route";
import {
  GET as getPatchUpdates,
  POST as createPatchUpdate
} from "@/app/api/tool/[id]/patches/route";
import {
  GET as getUserReviews,
  POST as createUserReview
} from "@/app/api/tool/[id]/reviews/route";
import { GET as searchTools } from "@/app/api/search/route";
import { POST as createTool } from "@/app/api/tool/route";
import { resetServerStore } from "@/lib/server-store";

const getJson = async (response: Response) => response.json();
const notionToolId = "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a";

describe("API routes", () => {
  beforeEach(() => {
    resetServerStore();
  });

  it("returns all tools", async () => {
    const response = await getTools();
    const data = await getJson(response);
    expect(response.status).toBe(200);
    expect(data.tools.length).toBeGreaterThanOrEqual(10);
  });

  it("returns a tool by id", async () => {
    const response = await getToolById(new Request("http://localhost/api/tool"), {
      params: { id: notionToolId }
    });
    const data = await getJson(response);
    expect(response.status).toBe(200);
    expect(data.tool.name).toBe("Notion");
  });

  it("searches tools by problem context", async () => {
    const response = await searchTools(new Request("http://localhost/api/search?problem=communication"));
    const data = await getJson(response);
    expect(response.status).toBe(200);
    expect(data.tools.length).toBeGreaterThan(0);
  });

  it("validates tool creation", async () => {
    const response = await createTool(
      new Request("http://localhost/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
    );
    expect(response.status).toBe(400);
  });

  it("creates tool with valid payload", async () => {
    const response = await createTool(
      new Request("http://localhost/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "SignalFlow",
          description: "AI workflow engine for noisy signals.",
          problemContexts: ["We miss critical alerts"],
          whyExist: "Teams needed a reliable filter for operational noise.",
          impact: {
            judgmentSpeed: 6,
            thinkingDepth: 6,
            executionDensity: 7,
            collaborationClarity: 5
          },
          bestCase: "Keeps urgent signals visible without panicking teams.",
          worstCase: "Over-automates response without context.",
          verdictBadges: {
            timeSaver: true,
            thinkCarefully: true,
            lockinRisk: false
          },
          alternatives: ["Manual triage", "Custom scripts"]
        })
      })
    );
    const data = await getJson(response);
    expect(response.status).toBe(201);
    expect(data.tool.id).toBeDefined();
  });

  it("creates and lists server-backed user reviews", async () => {
    const createResponse = await createUserReview(
      new Request(`http://localhost/api/tool/${notionToolId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-nickname": "PM_anna" },
        body: JSON.stringify({
          nickname: "PM_anna",
          line: "Decision history became much easier to inspect.",
          detail: "Useful for weekly product and customer context reviews.",
          rating: 5
        })
      }),
      { params: { id: notionToolId } }
    );
    const created = await getJson(createResponse);

    expect(createResponse.status).toBe(201);
    expect(created.review.toolId).toBe(notionToolId);
    expect(created.review.nickname).toBe("PM_anna");

    const listResponse = await getUserReviews(
      new Request(`http://localhost/api/tool/${notionToolId}/reviews`),
      { params: { id: notionToolId } }
    );
    const listed = await getJson(listResponse);

    expect(listResponse.status).toBe(200);
    expect(listed.reviews).toHaveLength(1);
    expect(listed.reviews[0].line).toContain("Decision history");
  });

  it("rejects invalid user reviews", async () => {
    const response = await createUserReview(
      new Request(`http://localhost/api/tool/${notionToolId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line: "ok", rating: 6 })
      }),
      { params: { id: notionToolId } }
    );

    expect(response.status).toBe(400);
  });

  it("requires admin permission for patch updates", async () => {
    const response = await createPatchUpdate(
      new Request(`http://localhost/api/tool/${notionToolId}/patches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Permissions update",
          change: "Workspace permission defaults changed.",
          errorRisk: "Existing guests may need a new invite.",
          impact: "medium",
          hasIncident: false
        })
      }),
      { params: { id: notionToolId } }
    );

    expect(response.status).toBe(403);
  });

  it("creates patch updates and audit logs for admins", async () => {
    const createResponse = await createPatchUpdate(
      new Request(`http://localhost/api/tool/${notionToolId}/patches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": ADMIN_USER_ID,
          "x-user-nickname": "Admin User"
        },
        body: JSON.stringify({
          title: "Permissions update",
          change: "Workspace permission defaults changed.",
          errorRisk: "Existing guests may need a new invite.",
          impact: "high",
          hasIncident: true,
          authorName: "Ops Lead"
        })
      }),
      { params: { id: notionToolId } }
    );
    const created = await getJson(createResponse);

    expect(createResponse.status).toBe(201);
    expect(created.patch.impact).toBe("high");
    expect(created.patch.hasIncident).toBe(true);

    const listResponse = await getPatchUpdates(
      new Request(`http://localhost/api/tool/${notionToolId}/patches`),
      { params: { id: notionToolId } }
    );
    const listed = await getJson(listResponse);

    expect(listResponse.status).toBe(200);
    expect(listed.patches).toHaveLength(1);

    const auditResponse = await getAuditLogs(
      new Request(`http://localhost/api/audit?toolId=${notionToolId}`, {
        headers: { "x-user-id": ADMIN_USER_ID }
      })
    );
    const audit = await getJson(auditResponse);

    expect(auditResponse.status).toBe(200);
    expect(audit.auditLogs[0].resourceType).toBe("patch_update");
    expect(audit.auditLogs[0].actor.role).toBe("admin");
  });
});
