import { Pool, type PoolClient } from "pg";
import type { CommunityStore } from "@/lib/community/store";
import type {
  AuthorIdentity,
  BreakageReport,
  BreakageStatus,
  ContributorContext,
  DecisionRecord,
  FacetDissent
} from "@/lib/community/types";
import type {
  NewBreakageReport,
  NewDecisionRecord,
  NewFacetDissent
} from "@/lib/community/types";

/**
 * Postgres 어댑터.
 *
 * 스키마는 db/community.sql 입니다. 메모리 어댑터와 같은 계약을 구현하고,
 * tests/community-store.test.ts 가 두 구현에 같은 테스트를 돌립니다.
 * DATABASE_URL 이 설정되어 있을 때만 선택됩니다.
 */

/** DB의 timestamptz는 Date로 오지만 앱 전체는 ISO 문자열을 씁니다. */
const iso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

type DissentRow = {
  id: string;
  tool_id: string;
  facet: FacetDissent["facet"];
  direction: FacetDissent["direction"];
  reason: string;
  is_editor: boolean;
  role: ContributorContext["role"];
  team_size: ContributorContext["teamSize"];
  duration: ContributorContext["duration"];
  handle: string;
  created_at: Date;
};

const toDissent = (row: DissentRow): FacetDissent => ({
  id: row.id,
  toolId: row.tool_id,
  facet: row.facet,
  direction: row.direction,
  reason: row.reason,
  authorHandle: row.handle,
  isEditor: row.is_editor,
  context: { role: row.role, teamSize: row.team_size, duration: row.duration },
  createdAt: iso(row.created_at)
});

type DecisionRow = {
  id: string;
  tool_id: string;
  considered_alternatives: string[];
  why_chosen: string;
  adopted_at: string;
  outcome: DecisionRecord["outcome"];
  is_editor: boolean;
  role: ContributorContext["role"];
  team_size: ContributorContext["teamSize"];
  duration: ContributorContext["duration"];
  handle: string;
  created_at: Date;
  checked_at: Date;
};

const toDecision = (row: DecisionRow): DecisionRecord => ({
  id: row.id,
  toolId: row.tool_id,
  consideredAlternatives: row.considered_alternatives ?? [],
  whyChosen: row.why_chosen,
  adoptedAt: row.adopted_at,
  outcome: row.outcome,
  authorHandle: row.handle,
  isEditor: row.is_editor,
  context: { role: row.role, teamSize: row.team_size, duration: row.duration },
  createdAt: iso(row.created_at),
  checkedAt: iso(row.checked_at)
});

type BreakageRow = {
  id: string;
  tool_id: string;
  occurred_at: string;
  what_broke: string;
  workaround: string;
  status: BreakageStatus;
  handle: string;
  created_at: Date;
};

const toBreakage = (row: BreakageRow): BreakageReport => ({
  id: row.id,
  toolId: row.tool_id,
  occurredAt: row.occurred_at,
  whatBroke: row.what_broke,
  workaround: row.workaround,
  status: row.status,
  authorHandle: row.handle,
  createdAt: iso(row.created_at)
});

export class PostgresCommunityStore implements CommunityStore {
  constructor(private readonly pool: Pool) {}

  /**
   * 저자 행을 확보합니다.
   *
   * 토큰 원본은 저장하지 않고 해시만 넣습니다.
   * handle은 토큰에서 파생되므로 같은 토큰이면 항상 같은 값이 들어옵니다.
   */
  private async ensureAuthor(client: PoolClient, author: AuthorIdentity): Promise<string> {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO authors (token_hash, handle)
       VALUES ($1, $2)
       ON CONFLICT (token_hash) DO UPDATE SET handle = EXCLUDED.handle
       RETURNING id`,
      [author.tokenHash, author.handle]
    );
    return rows[0].id;
  }

  private async withAuthor<T>(
    author: AuthorIdentity,
    run: (client: PoolClient, authorId: string) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const authorId = await this.ensureAuthor(client, author);
      const result = await run(client, authorId);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listDissent(toolId: string): Promise<FacetDissent[]> {
    const { rows } = await this.pool.query<DissentRow>(
      `SELECT d.*, a.handle
         FROM facet_dissent d
         JOIN authors a ON a.id = d.author_id
        WHERE d.tool_id = $1
        ORDER BY d.created_at DESC`,
      [toolId]
    );
    return rows.map(toDissent);
  }

  async addDissent({ author, ...input }: NewFacetDissent): Promise<FacetDissent> {
    return this.withAuthor(author, async (client, authorId) => {
      // UNIQUE (tool_id, author_id, facet) 위에서 갱신합니다.
      // 한 사람이 같은 항목에 여러 번 표를 던지면 마지막 의견만 남습니다.
      const { rows } = await client.query<DissentRow>(
        `INSERT INTO facet_dissent
           (tool_id, author_id, facet, direction, reason, is_editor, role, team_size, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (tool_id, author_id, facet) DO UPDATE SET
           direction = EXCLUDED.direction,
           reason = EXCLUDED.reason,
           created_at = NOW()
         RETURNING *, $10::text AS handle`,
        [
          input.toolId,
          authorId,
          input.facet,
          input.direction,
          input.reason,
          input.isEditor,
          input.context.role,
          input.context.teamSize,
          input.context.duration,
          author.handle
        ]
      );
      return toDissent(rows[0]);
    });
  }

  async listDecisions(toolId?: string): Promise<DecisionRecord[]> {
    const { rows } = await this.pool.query<DecisionRow>(
      `SELECT d.*, a.handle
         FROM decision_records d
         JOIN authors a ON a.id = d.author_id
        WHERE ($1::uuid IS NULL OR d.tool_id = $1::uuid)
        ORDER BY d.created_at DESC`,
      [toolId ?? null]
    );
    return rows.map(toDecision);
  }

  async addDecision({ author, ...input }: NewDecisionRecord): Promise<DecisionRecord> {
    return this.withAuthor(author, async (client, authorId) => {
      const { rows } = await client.query<DecisionRow>(
        `INSERT INTO decision_records
           (tool_id, author_id, considered_alternatives, why_chosen, adopted_at,
            outcome, is_editor, role, team_size, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *, $11::text AS handle`,
        [
          input.toolId,
          authorId,
          input.consideredAlternatives,
          input.whyChosen,
          input.adoptedAt,
          input.outcome,
          input.isEditor,
          input.context.role,
          input.context.teamSize,
          input.context.duration,
          author.handle
        ]
      );
      return toDecision(rows[0]);
    });
  }

  async touchDecision(
    id: string,
    author: AuthorIdentity,
    outcome: DecisionRecord["outcome"]
  ): Promise<DecisionRecord | null> {
    // 소유 증명은 handle이 아니라 token_hash로 합니다. handle은 표시용입니다.
    const { rows } = await this.pool.query<DecisionRow>(
      `UPDATE decision_records d
          SET outcome = $3, checked_at = NOW()
         FROM authors a
        WHERE d.id = $1
          AND d.author_id = a.id
          AND a.token_hash = $2
      RETURNING d.*, a.handle`,
      [id, author.tokenHash, outcome]
    );
    return rows[0] ? toDecision(rows[0]) : null;
  }

  async listBreakage(toolId: string, status: BreakageStatus = "published"): Promise<BreakageReport[]> {
    const { rows } = await this.pool.query<BreakageRow>(
      `SELECT b.*, a.handle
         FROM breakage_reports b
         JOIN authors a ON a.id = b.author_id
        WHERE b.tool_id = $1 AND b.status = $2
        ORDER BY b.created_at DESC`,
      [toolId, status]
    );
    return rows.map(toBreakage);
  }

  async addBreakage({ author, ...input }: NewBreakageReport): Promise<BreakageReport> {
    return this.withAuthor(author, async (client, authorId) => {
      const { rows } = await client.query<BreakageRow>(
        `INSERT INTO breakage_reports (tool_id, author_id, occurred_at, what_broke, workaround)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *, $6::text AS handle`,
        [input.toolId, authorId, input.occurredAt, input.whatBroke, input.workaround, author.handle]
      );
      return toBreakage(rows[0]);
    });
  }
}

/** 앱 전역에서 커넥션 풀 하나만 씁니다. 개발 서버의 HMR에도 살아남도록 전역에 붙입니다. */
const globalPool = globalThis as unknown as { __g2Pool?: Pool };

export const getPool = (connectionString: string): Pool =>
  globalPool.__g2Pool ??
  (globalPool.__g2Pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  }));
