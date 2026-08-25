import { DissentReasonRequired, MIN_DISSENT_REASON } from "@/lib/community/types";
import type {
  AuthorIdentity,
  BreakageReport,
  BreakageStatus,
  DecisionRecord,
  FacetDissent,
  NewBreakageReport,
  NewDecisionRecord,
  NewFacetDissent
} from "@/lib/community/types";

/**
 * 커뮤니티 저장소 인터페이스.
 *
 * 화면과 API는 이 인터페이스만 알고, 어느 어댑터가 붙었는지는 모릅니다.
 * 메모리 어댑터(개발용)와 Postgres 어댑터(운영용)가 같은 계약을 구현하고,
 * `tests/community-store.test.ts`가 두 구현에 같은 테스트를 돌립니다.
 */
export interface CommunityStore {
  listDissent(toolId: string): Promise<FacetDissent[]>;
  addDissent(input: NewFacetDissent): Promise<FacetDissent>;

  listDecisions(toolId?: string): Promise<DecisionRecord[]>;
  addDecision(input: NewDecisionRecord): Promise<DecisionRecord>;
  /** 본인 토큰일 때만 갱신됩니다. handle은 표시용이라 소유 증명에 쓰지 않습니다. */
  touchDecision(
    id: string,
    author: AuthorIdentity,
    outcome: DecisionRecord["outcome"]
  ): Promise<DecisionRecord | null>;

  listBreakage(toolId: string, status?: BreakageStatus): Promise<BreakageReport[]>;
  addBreakage(input: NewBreakageReport): Promise<BreakageReport>;
}

const newId = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();

/**
 * 개발용 메모리 어댑터.
 *
 * 시드 데이터를 넣지 않습니다. 빈 상태가 진짜 빈 상태로 보여야
 * 콜드스타트 화면이 제대로 설계됐는지 확인할 수 있습니다.
 * 서버 재시작 시 사라지므로 운영에는 쓸 수 없습니다.
 */
export class MemoryCommunityStore implements CommunityStore {
  private dissent: FacetDissent[] = [];
  private decisions: DecisionRecord[] = [];
  private breakage: BreakageReport[] = [];
  /** 소유 증명용. Postgres의 authors.token_hash에 대응합니다. */
  private ownerByRecord = new Map<string, string>();

  async listDissent(toolId: string) {
    return this.dissent
      .filter((entry) => entry.toolId === toolId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addDissent({ author, ...input }: NewFacetDissent) {
    // Postgres의 dissent_needs_reason 제약과 같은 규칙입니다.
    // 여기가 느슨하면 개발에서 통과한 데이터가 운영에서 거부됩니다.
    if (input.direction !== "agree" && input.reason.trim().length < MIN_DISSENT_REASON) {
      throw new DissentReasonRequired();
    }
    // 한 사람이 같은 항목에 여러 번 표를 던지지 못하게 합니다.
    this.dissent = this.dissent.filter(
      (entry) =>
        !(
          entry.toolId === input.toolId &&
          entry.facet === input.facet &&
          entry.authorHandle === author.handle
        )
    );
    const entry: FacetDissent = {
      ...input,
      authorHandle: author.handle,
      id: newId(),
      createdAt: now()
    };
    this.dissent = [entry, ...this.dissent];
    return entry;
  }

  async listDecisions(toolId?: string) {
    return this.decisions
      .filter((entry) => (toolId ? entry.toolId === toolId : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addDecision({ author, ...input }: NewDecisionRecord) {
    const stamp = now();
    const entry: DecisionRecord = {
      ...input,
      authorHandle: author.handle,
      id: newId(),
      createdAt: stamp,
      checkedAt: stamp
    };
    this.decisions = [entry, ...this.decisions];
    this.ownerByRecord.set(entry.id, author.tokenHash);
    return entry;
  }

  async touchDecision(id: string, author: AuthorIdentity, outcome: DecisionRecord["outcome"]) {
    const entry = this.decisions.find((item) => item.id === id);
    if (!entry || this.ownerByRecord.get(id) !== author.tokenHash) return null;
    entry.outcome = outcome;
    entry.checkedAt = now();
    return entry;
  }

  async listBreakage(toolId: string, status: BreakageStatus = "published") {
    return this.breakage
      .filter((entry) => entry.toolId === toolId && entry.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addBreakage({ author, ...input }: NewBreakageReport) {
    // 제보는 검수 전까지 공개되지 않습니다.
    const entry: BreakageReport = {
      ...input,
      authorHandle: author.handle,
      id: newId(),
      status: "pending",
      createdAt: now()
    };
    this.breakage = [entry, ...this.breakage];
    return entry;
  }
}
