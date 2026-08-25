import type {
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
 * 지금은 프로세스 메모리 어댑터만 있습니다. Postgres 어댑터를 붙일 때
 * 이 인터페이스만 구현하면 되고 화면·API 코드는 건드리지 않습니다.
 * 스키마는 db/schema.sql에 함께 정의되어 있습니다.
 */
export interface CommunityStore {
  listDissent(toolId: string): Promise<FacetDissent[]>;
  addDissent(input: NewFacetDissent): Promise<FacetDissent>;

  listDecisions(toolId?: string): Promise<DecisionRecord[]>;
  addDecision(input: NewDecisionRecord): Promise<DecisionRecord>;
  touchDecision(id: string, authorHandle: string, outcome: DecisionRecord["outcome"]): Promise<DecisionRecord | null>;

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

  async listDissent(toolId: string) {
    return this.dissent
      .filter((entry) => entry.toolId === toolId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addDissent(input: NewFacetDissent) {
    const entry: FacetDissent = { ...input, id: newId(), createdAt: now() };
    this.dissent = [entry, ...this.dissent];
    return entry;
  }

  async listDecisions(toolId?: string) {
    return this.decisions
      .filter((entry) => (toolId ? entry.toolId === toolId : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addDecision(input: NewDecisionRecord) {
    const stamp = now();
    const entry: DecisionRecord = { ...input, id: newId(), createdAt: stamp, checkedAt: stamp };
    this.decisions = [entry, ...this.decisions];
    return entry;
  }

  async touchDecision(id: string, authorHandle: string, outcome: DecisionRecord["outcome"]) {
    const entry = this.decisions.find((item) => item.id === id);
    // 본인만 자기 기록을 갱신할 수 있습니다.
    if (!entry || entry.authorHandle !== authorHandle) return null;
    entry.outcome = outcome;
    entry.checkedAt = now();
    return entry;
  }

  async listBreakage(toolId: string, status: BreakageStatus = "published") {
    return this.breakage
      .filter((entry) => entry.toolId === toolId && entry.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addBreakage(input: NewBreakageReport) {
    // 제보는 검수 전까지 공개되지 않습니다.
    const entry: BreakageReport = { ...input, id: newId(), status: "pending", createdAt: now() };
    this.breakage = [entry, ...this.breakage];
    return entry;
  }
}

/**
 * 개발 서버가 HMR로 모듈을 다시 평가해도 저장 내용이 날아가지 않도록 전역에 붙입니다.
 */
const globalStore = globalThis as unknown as { __g2CommunityStore?: CommunityStore };

export const communityStore: CommunityStore =
  globalStore.__g2CommunityStore ?? (globalStore.__g2CommunityStore = new MemoryCommunityStore());
