import { describe, expect, it } from "vitest";
import { GET as getTools } from "@/app/api/tools/route";
import { GET as getToolById } from "@/app/api/tool/[id]/route";
import { GET as searchTools } from "@/app/api/search/route";
import { POST as createTool } from "@/app/api/tool/route";

const getJson = async (response: Response) => response.json();

describe("API routes", () => {
  it("returns all tools", async () => {
    const response = await getTools();
    const data = await getJson(response);
    expect(response.status).toBe(200);
    expect(data.tools.length).toBeGreaterThanOrEqual(10);
  });

  it("returns a tool by id", async () => {
    const response = await getToolById(new Request("http://localhost/api/tool"), {
      params: { id: "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a" }
    });
    const data = await getJson(response);
    expect(response.status).toBe(200);
    expect(data.tool.name).toBe("Notion");
  });

  it("문제 태그로 검색하면 후보가 여럿 나온다", async () => {
    const response = await searchTools(
      new Request("http://localhost/api/search?tag=meetings-without-decisions")
    );
    const data = await getJson(response);
    expect(response.status).toBe(200);
    // 이 제품의 핵심 동선은 "후보를 놓고 고르기"라, 한 문제에 도구 하나만 나오면 성립하지 않습니다.
    expect(data.results.length).toBeGreaterThanOrEqual(3);
  });

  it("존재하지 않는 태그로 검색하면 0건이 나온다", async () => {
    // 이전 구현에는 `score > 0 || !query` 조건 때문에 문제만으로 검색하면
    // 아무 태그나 넣어도 전체 10개가 반환되는 버그가 있었습니다.
    const response = await searchTools(new Request("http://localhost/api/search?tag=nope-not-a-tag"));
    const data = await getJson(response);
    expect(response.status).toBe(200);
    expect(data.results.length).toBe(0);
  });

  it("결과에 이 문제에서의 되는 것/안 되는 것이 함께 온다", async () => {
    const response = await searchTools(new Request("http://localhost/api/search?tag=info-scattered"));
    const data = await getJson(response);
    data.results.forEach((entry: { angle?: { angle: string; limitation: string } }) => {
      expect(entry.angle?.angle.length ?? 0).toBeGreaterThan(0);
      expect(entry.angle?.limitation.length ?? 0).toBeGreaterThan(0);
    });
  });

  it("팀 규모에서 권하지 않는 도구는 결과에서 빠진다", async () => {
    const all = await getJson(
      await searchTools(new Request("http://localhost/api/search?tag=info-scattered"))
    );
    const large = await getJson(
      await searchTools(new Request("http://localhost/api/search?tag=info-scattered&teamSize=30%2B"))
    );
    expect(large.results.length).toBeLessThan(all.results.length);
  });

  it("rejects a tool whose score has no stated reason", async () => {
    const response = await createTool(
      new Request("http://localhost/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "NoReason",
          description: "Scores without any stated basis.",
          problemTagIds: ["info-scattered"],
          whyExist: "Placeholder tool used to assert schema behaviour.",
          bestCase: "Nothing in particular happens here.",
          worstCase: "Nothing in particular happens here either.",
          verdictBadges: { timeSaver: true, thinkCarefully: false, lockinRisk: false },
          alternatives: ["Doing nothing"],
          review: {
            verdict: "근거 없는 점수는 저장되면 안 됩니다.",
            scoreBreakdown: {
              functionality: { score: 70, reason: "" },
              uiux: { score: 70, reason: "" },
              reliability: { score: 70, reason: "" },
              comfort: { score: 70, reason: "" },
              pricing: { score: 70, reason: "" }
            },
            comparisons: [
              { competitor: "Doing nothing", worksBetterHere: "충분히 긴 문장입니다.", weakerHere: "이것도 충분히 긴 문장입니다." }
            ],
            patchNotes: [],
            playbook: [
              { title: "제목", howToUse: "충분히 긴 설명 문장입니다.", recommendation: "충분히 긴 권고 문장입니다." }
            ]
          }
        })
      })
    );
    expect(response.status).toBe(400);
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
          problemTagIds: ["info-scattered"],
          whyExist: "Teams needed a reliable filter for operational noise.",
          bestCase: "Keeps urgent signals visible without panicking teams.",
          worstCase: "Over-automates response without context.",
          verdictBadges: {
            timeSaver: true,
            thinkCarefully: true,
            lockinRisk: false
          },
          alternatives: ["Manual triage", "Custom scripts"],
          review: {
            verdict: "알림 노이즈를 줄이는 데는 확실하지만, 임계값 설계를 못 하면 진짜 장애를 놓칩니다.",
            scoreBreakdown: {
              functionality: { score: 70, reason: "규칙 기반 필터와 라우팅은 충분하지만 이상 탐지는 얕습니다." },
              uiux: { score: 60, reason: "설정 화면이 규칙 수가 늘면 빠르게 복잡해집니다." },
              reliability: { score: 80, reason: "수집 파이프라인 자체는 안정적으로 동작합니다." },
              comfort: { score: 55, reason: "임계값을 잘못 잡으면 오히려 알림이 늘어납니다." },
              pricing: { score: 45, reason: "이벤트 수 기반 과금이라 트래픽이 늘면 비용이 급증합니다." }
            },
            comparisons: [
              {
                competitor: "Manual triage",
                worksBetterHere: "야간과 주말에도 동일한 기준으로 걸러내 대응 편차가 사라집니다.",
                weakerHere: "맥락을 아는 사람의 판단이 필요한 예외 상황에서는 오히려 방해가 됩니다."
              }
            ],
            patchNotes: [],
            playbook: [
              {
                title: "임계값을 2주마다 재조정하기",
                howToUse: "무시된 알림 비율을 주기적으로 보고 규칙을 좁힙니다.",
                recommendation: "무시율이 30%를 넘으면 팀이 알림을 신뢰하지 않기 시작한 신호입니다."
              }
            ]
          }
        })
      })
    );
    const data = await getJson(response);
    expect(response.status).toBe(201);
    expect(data.tool.id).toBeDefined();
  });
});
