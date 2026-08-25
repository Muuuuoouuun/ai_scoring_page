import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { MemoryCommunityStore, type CommunityStore } from "@/lib/community/store";
import type { AuthorIdentity, ContributorContext } from "@/lib/community/types";

/**
 * 저장소 계약 테스트.
 *
 * 메모리 구현과 Postgres 구현이 **같은 테스트를 통과해야** 합니다.
 * 어댑터를 바꿔도 화면 동작이 달라지지 않는다는 것을 이걸로 보장합니다.
 *
 * Postgres는 DATABASE_URL이 있을 때만 돕니다:
 *   DATABASE_URL=postgres://... npm test
 * 없으면 메모리만 돌고, 어느 쪽이 돌았는지 테스트 이름에 드러납니다.
 */

const TOOL_A = "11111111-1111-4111-8111-111111111111";
const TOOL_B = "22222222-2222-4222-8222-222222222222";

const alice: AuthorIdentity = { tokenHash: "hash-alice", handle: "조용한-분석가-a1" };
const bob: AuthorIdentity = { tokenHash: "hash-bob", handle: "성실한-기획자-b2" };

const context: ContributorContext = { role: "team-lead", teamSize: "6-30", duration: "6m-2y" };

type Harness = {
  name: string;
  store: CommunityStore;
  reset: () => Promise<void>;
  teardown?: () => Promise<void>;
};

const harnesses: Harness[] = [];

// 메모리 어댑터는 항상 검증합니다.
harnesses.push({
  name: "MemoryCommunityStore",
  store: new MemoryCommunityStore(),
  reset: async () => {
    harnesses[0].store = new MemoryCommunityStore();
  }
});

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  const { Pool } = await import("pg");
  const { PostgresCommunityStore } = await import("@/lib/community/postgres-store");
  const pool = new Pool({ connectionString: databaseUrl });
  harnesses.push({
    name: "PostgresCommunityStore",
    store: new PostgresCommunityStore(pool),
    reset: async () => {
      await pool.query("TRUNCATE facet_dissent, decision_records, breakage_reports, authors CASCADE");
    },
    teardown: async () => {
      // 마지막 테스트의 데이터가 DB에 남지 않도록 정리한 뒤 닫습니다.
      await pool.query("TRUNCATE facet_dissent, decision_records, breakage_reports, authors CASCADE");
      await pool.end();
    }
  });
}

afterAll(async () => {
  await Promise.all(harnesses.map((harness) => harness.teardown?.()));
});

harnesses.forEach((harness, index) => {
  describe(harness.name, () => {
    const store = () => harnesses[index].store;

    beforeEach(async () => {
      await harness.reset();
    });

    describe("항목별 반박", () => {
      it("남긴 의견을 다시 읽을 수 있다", async () => {
        await store().addDissent({
          toolId: TOOL_A,
          facet: "reliability",
          direction: "too-low",
          reason: "회의 중에 페이지가 안 열린 적이 세 번 있었습니다.",
          author: alice,
          isEditor: false,
          context
        });

        const entries = await store().listDissent(TOOL_A);
        expect(entries).toHaveLength(1);
        expect(entries[0].authorHandle).toBe(alice.handle);
        expect(entries[0].direction).toBe("too-low");
        expect(entries[0].context.teamSize).toBe("6-30");
        expect(entries[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it("한 사람이 같은 항목에 두 번 답하면 마지막 의견만 남는다", async () => {
        const base = { toolId: TOOL_A, facet: "pricing" as const, author: alice, isEditor: false, context };
        await store().addDissent({ ...base, direction: "too-low", reason: "처음에는 단가만 보고 비싸다고 판단했습니다." });
        await store().addDissent({ ...base, direction: "too-high", reason: "게스트 비용까지 넣어 다시 계산하니 반대였습니다." });

        const entries = await store().listDissent(TOOL_A);
        expect(entries).toHaveLength(1);
        expect(entries[0].direction).toBe("too-high");
      });

      it("다른 사람의 의견은 각각 남는다", async () => {
        const base = { toolId: TOOL_A, facet: "comfort" as const, isEditor: false, context };
        await store().addDissent({ ...base, author: alice, direction: "agree", reason: "" });
        await store().addDissent({ ...base, author: bob, direction: "too-high", reason: "기본 알림 설정 그대로 쓰면 훨씬 나쁘게 느껴집니다." });

        expect(await store().listDissent(TOOL_A)).toHaveLength(2);
      });

      it("근거가 짧은 반박은 거부한다", async () => {
        // 이 규칙이 한 곳만 느슨하면 개발에서 통과한 데이터가 운영에서 거부됩니다.
        // 실제로 Postgres 제약이 먼저 잡아냈고, 그때 메모리 어댑터에는 규칙이 없었습니다.
        await expect(
          store().addDissent({
            toolId: TOOL_A,
            facet: "reliability",
            direction: "too-low",
            reason: "별로예요",
            author: alice,
            isEditor: false,
            context
          })
        ).rejects.toThrow();

        expect(await store().listDissent(TOOL_A)).toHaveLength(0);
      });

      it("동의에는 근거를 요구하지 않는다", async () => {
        await store().addDissent({
          toolId: TOOL_A,
          facet: "reliability",
          direction: "agree",
          reason: "",
          author: alice,
          isEditor: false,
          context
        });
        expect(await store().listDissent(TOOL_A)).toHaveLength(1);
      });

      it("다른 도구의 의견은 섞이지 않는다", async () => {
        const base = { facet: "uiux" as const, author: alice, isEditor: false, context, direction: "agree" as const, reason: "" };
        await store().addDissent({ ...base, toolId: TOOL_A });
        await store().addDissent({ ...base, toolId: TOOL_B });

        expect(await store().listDissent(TOOL_A)).toHaveLength(1);
        expect(await store().listDissent(TOOL_B)).toHaveLength(1);
      });
    });

    describe("도입 결정 기록", () => {
      const decision = {
        toolId: TOOL_A,
        consideredAlternatives: ["Linear", "Jira"],
        whyChosen: "문서와 이슈를 한 곳에서 보고 싶었습니다.",
        adoptedAt: "2025-03",
        outcome: "still-using" as const,
        isEditor: false,
        context
      };

      it("기록을 남기고 다시 읽을 수 있다", async () => {
        await store().addDecision({ ...decision, author: alice });

        const records = await store().listDecisions(TOOL_A);
        expect(records).toHaveLength(1);
        expect(records[0].consideredAlternatives).toEqual(["Linear", "Jira"]);
        expect(records[0].adoptedAt).toBe("2025-03");
        // 작성 시점이 곧 마지막 확인 시점입니다.
        expect(records[0].checkedAt).toBe(records[0].createdAt);
      });

      it("도구를 지정하지 않으면 전체를 돌려준다", async () => {
        await store().addDecision({ ...decision, author: alice });
        await store().addDecision({ ...decision, toolId: TOOL_B, author: bob });

        expect(await store().listDecisions()).toHaveLength(2);
        expect(await store().listDecisions(TOOL_B)).toHaveLength(1);
      });

      it("본인은 '지금도 쓰나요'에 다시 답할 수 있다", async () => {
        const created = await store().addDecision({ ...decision, author: alice });
        const updated = await store().touchDecision(created.id, alice, "reduced");

        expect(updated).not.toBeNull();
        expect(updated!.outcome).toBe("reduced");
        expect(new Date(updated!.checkedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(created.createdAt).getTime()
        );
      });

      it("남의 기록은 갱신하지 못한다", async () => {
        const created = await store().addDecision({ ...decision, author: alice });
        expect(await store().touchDecision(created.id, bob, "stopped")).toBeNull();

        const records = await store().listDecisions(TOOL_A);
        expect(records[0].outcome).toBe("still-using");
      });

      it("같은 표시 이름을 흉내내도 토큰이 다르면 갱신하지 못한다", async () => {
        const created = await store().addDecision({ ...decision, author: alice });
        // handle은 표시용이라 소유 증명에 쓰이면 안 됩니다.
        const impostor = { tokenHash: "hash-impostor", handle: alice.handle };
        expect(await store().touchDecision(created.id, impostor, "stopped")).toBeNull();
      });

      it("없는 기록을 갱신하려 하면 null을 돌려준다", async () => {
        expect(
          await store().touchDecision("33333333-3333-4333-8333-333333333333", alice, "stopped")
        ).toBeNull();
      });
    });

    describe("고장 제보", () => {
      const report = {
        toolId: TOOL_A,
        occurredAt: "2026-03",
        whatBroke: "권한 변경 이후 공유 페이지가 열리지 않았습니다.",
        workaround: "관리자가 개별로 다시 초대했습니다."
      };

      it("제보는 검수 전까지 공개되지 않는다", async () => {
        const created = await store().addBreakage({ ...report, author: alice });
        expect(created.status).toBe("pending");

        // 기본값은 공개된 것만 보여줍니다.
        expect(await store().listBreakage(TOOL_A)).toHaveLength(0);
        expect(await store().listBreakage(TOOL_A, "pending")).toHaveLength(1);
      });

      it("제보자 크레딧이 남는다", async () => {
        await store().addBreakage({ ...report, author: bob });
        const pending = await store().listBreakage(TOOL_A, "pending");
        expect(pending[0].authorHandle).toBe(bob.handle);
      });
    });
  });
});
