import type { PoolClient, QueryResultRow } from "pg";
import { ADMIN_USER_ID } from "@/lib/admin";
import { getPool, isDatabaseConfigured } from "@/lib/db";
import { getToolById } from "@/lib/tools";
import type { AuditLog, PatchUpdate, RequestActor, UserReview } from "@/lib/types";

type ServerStore = {
  reviews: UserReview[];
  patchUpdates: PatchUpdate[];
  auditLogs: AuditLog[];
};

const storeRef = globalThis as typeof globalThis & {
  __aiScoreServerStore?: ServerStore;
};

const getStore = (): ServerStore => {
  if (!storeRef.__aiScoreServerStore) {
    storeRef.__aiScoreServerStore = {
      reviews: [],
      patchUpdates: [],
      auditLogs: []
    };
  }

  return storeRef.__aiScoreServerStore;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const toIsoString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const toDateString = (value: Date | string) => toIsoString(value).slice(0, 10);

const mapReviewRow = (row: QueryResultRow): UserReview => ({
  id: row.id,
  toolId: row.tool_id,
  nickname: row.nickname,
  line: row.line,
  detail: row.detail,
  rating: row.rating,
  createdAt: toIsoString(row.created_at)
});

const mapPatchRow = (row: QueryResultRow): PatchUpdate => ({
  id: row.id,
  toolId: row.tool_id,
  date: toDateString(row.patch_date),
  title: row.title,
  change: row.change,
  errorRisk: row.error_risk,
  impact: row.impact,
  hasIncident: row.has_incident,
  authorName: row.author_name,
  createdAt: toIsoString(row.created_at)
});

const mapAuditRow = (row: QueryResultRow): AuditLog => ({
  id: row.id,
  toolId: row.tool_id,
  action: row.action,
  resourceType: row.resource_type,
  resourceId: row.resource_id,
  actor: {
    id: row.actor_id ?? "system",
    nickname: row.actor_nickname ?? "System",
    role: row.actor_role
  },
  changes: row.changes,
  createdAt: toIsoString(row.created_at)
});

const ensureToolSeeded = async (client: PoolClient, toolId: string) => {
  const tool = getToolById(toolId);
  if (!tool) return;

  await client.query(
    `INSERT INTO tools (
      id,
      name,
      description,
      problem_contexts,
      why_exist,
      impact,
      best_case,
      worst_case,
      verdict_badges,
      alternatives,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9::jsonb, $10, $11, $12)
    ON CONFLICT (id) DO NOTHING`,
    [
      tool.id,
      tool.name,
      tool.description,
      tool.problemContexts,
      tool.whyExist,
      JSON.stringify(tool.impact),
      tool.bestCase,
      tool.worstCase,
      JSON.stringify(tool.verdictBadges),
      tool.alternatives,
      tool.createdAt,
      tool.updatedAt
    ]
  );
};

const ensureAdminSeeded = async (client: PoolClient, actor: RequestActor) => {
  if (actor.id !== ADMIN_USER_ID) return;

  await client.query(
    `INSERT INTO users (id, email, nickname, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (id) DO NOTHING`,
    [ADMIN_USER_ID, "admin@aisite.com", actor.nickname || "Admin User"]
  );
};

const insertAuditLog = async ({
  client,
  toolId,
  resourceType,
  resourceId,
  actor,
  changes
}: {
  client: PoolClient;
  toolId: string;
  resourceType: AuditLog["resourceType"];
  resourceId: string;
  actor: RequestActor;
  changes: Record<string, unknown>;
}) => {
  await ensureAdminSeeded(client, actor);
  await client.query(
    `INSERT INTO audit_logs (
      tool_id,
      actor_id,
      actor_role,
      action,
      resource_type,
      resource_id,
      changes
    )
    VALUES ($1, $2, $3, 'create', $4, $5, $6::jsonb)`,
    [
      toolId,
      actor.id === ADMIN_USER_ID && isUuid(actor.id) ? actor.id : null,
      actor.role,
      resourceType,
      resourceId,
      JSON.stringify(changes)
    ]
  );
};

const createMemoryAuditLog = ({
  toolId,
  resourceType,
  resourceId,
  actor,
  changes
}: {
  toolId: string;
  resourceType: AuditLog["resourceType"];
  resourceId: string;
  actor: RequestActor;
  changes: Record<string, unknown>;
}) => {
  const store = getStore();
  const auditLog: AuditLog = {
    id: crypto.randomUUID(),
    toolId,
    action: "create",
    resourceType,
    resourceId,
    actor,
    changes,
    createdAt: new Date().toISOString()
  };

  store.auditLogs.unshift(auditLog);
  return auditLog;
};

export const listUserReviews = async (toolId: string) => {
  if (!isDatabaseConfigured()) {
    return getStore().reviews.filter((review) => review.toolId === toolId);
  }

  const result = await getPool().query(
    `SELECT id, tool_id, nickname, line, detail, rating, created_at
     FROM user_reviews
     WHERE tool_id = $1
     ORDER BY created_at DESC
     LIMIT 30`,
    [toolId]
  );

  return result.rows.map(mapReviewRow);
};

export const createUserReview = async ({
  toolId,
  actor,
  input
}: {
  toolId: string;
  actor: RequestActor;
  input: {
    nickname?: string;
    line: string;
    detail: string;
    rating: number;
  };
}) => {
  if (isDatabaseConfigured()) {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await ensureToolSeeded(client, toolId);

      const result = await client.query(
        `INSERT INTO user_reviews (tool_id, user_id, nickname, line, detail, rating)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, tool_id, nickname, line, detail, rating, created_at`,
        [
          toolId,
          actor.id !== ADMIN_USER_ID && isUuid(actor.id) ? actor.id : null,
          input.nickname?.trim() || "Anonymous",
          input.line,
          input.detail,
          input.rating
        ]
      );
      const review = mapReviewRow(result.rows[0]);

      await insertAuditLog({
        client,
        toolId,
        resourceType: "user_review",
        resourceId: review.id,
        actor,
        changes: { line: review.line, rating: review.rating }
      });

      await client.query("COMMIT");
      return review;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  const store = getStore();
  const review: UserReview = {
    id: crypto.randomUUID(),
    toolId,
    nickname: input.nickname?.trim() || "Anonymous",
    line: input.line,
    detail: input.detail,
    rating: input.rating,
    createdAt: new Date().toISOString()
  };

  store.reviews.unshift(review);
  createMemoryAuditLog({
    toolId,
    resourceType: "user_review",
    resourceId: review.id,
    actor,
    changes: { line: review.line, rating: review.rating }
  });

  return review;
};

export const listPatchUpdates = async (toolId: string) => {
  if (!isDatabaseConfigured()) {
    return getStore().patchUpdates.filter((patch) => patch.toolId === toolId);
  }

  const result = await getPool().query(
    `SELECT id, tool_id, patch_date, title, change, error_risk, impact, has_incident, author_name, created_at
     FROM patch_updates
     WHERE tool_id = $1
     ORDER BY patch_date DESC, created_at DESC
     LIMIT 30`,
    [toolId]
  );

  return result.rows.map(mapPatchRow);
};

export const createPatchUpdate = async ({
  toolId,
  actor,
  input
}: {
  toolId: string;
  actor: RequestActor;
  input: {
    title: string;
    change: string;
    errorRisk: string;
    impact: PatchUpdate["impact"];
    hasIncident: boolean;
    authorName?: string;
  };
}) => {
  if (isDatabaseConfigured()) {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await ensureToolSeeded(client, toolId);
      await ensureAdminSeeded(client, actor);

      const result = await client.query(
        `INSERT INTO patch_updates (
          tool_id,
          author_id,
          author_name,
          title,
          change,
          error_risk,
          impact,
          has_incident
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, tool_id, patch_date, title, change, error_risk, impact, has_incident, author_name, created_at`,
        [
          toolId,
          actor.id === ADMIN_USER_ID && isUuid(actor.id) ? actor.id : null,
          input.authorName?.trim() || actor.nickname,
          input.title,
          input.change,
          input.errorRisk,
          input.impact,
          input.hasIncident
        ]
      );
      const patchUpdate = mapPatchRow(result.rows[0]);

      await insertAuditLog({
        client,
        toolId,
        resourceType: "patch_update",
        resourceId: patchUpdate.id,
        actor,
        changes: {
          title: patchUpdate.title,
          impact: patchUpdate.impact,
          hasIncident: patchUpdate.hasIncident
        }
      });

      await client.query("COMMIT");
      return patchUpdate;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  const store = getStore();
  const patchUpdate: PatchUpdate = {
    id: crypto.randomUUID(),
    toolId,
    date: new Date().toISOString().slice(0, 10),
    title: input.title,
    change: input.change,
    errorRisk: input.errorRisk,
    impact: input.impact,
    hasIncident: input.hasIncident,
    authorName: input.authorName?.trim() || actor.nickname,
    createdAt: new Date().toISOString()
  };

  store.patchUpdates.unshift(patchUpdate);
  createMemoryAuditLog({
    toolId,
    resourceType: "patch_update",
    resourceId: patchUpdate.id,
    actor,
    changes: {
      title: patchUpdate.title,
      impact: patchUpdate.impact,
      hasIncident: patchUpdate.hasIncident
    }
  });

  return patchUpdate;
};

export const listAuditLogs = async (toolId?: string) => {
  if (isDatabaseConfigured()) {
    const result = await getPool().query(
      `SELECT
        audit_logs.id,
        audit_logs.tool_id,
        audit_logs.actor_id,
        audit_logs.actor_role,
        audit_logs.action,
        audit_logs.resource_type,
        audit_logs.resource_id,
        audit_logs.changes,
        audit_logs.created_at,
        users.nickname AS actor_nickname
      FROM audit_logs
      LEFT JOIN users ON users.id = audit_logs.actor_id
      WHERE ($1::uuid IS NULL OR audit_logs.tool_id = $1::uuid)
      ORDER BY audit_logs.created_at DESC
      LIMIT 100`,
      [toolId ?? null]
    );

    return result.rows.map(mapAuditRow);
  }

  const logs = getStore().auditLogs;
  return toolId ? logs.filter((log) => log.toolId === toolId) : logs;
};

export const resetServerStore = () => {
  storeRef.__aiScoreServerStore = {
    reviews: [],
    patchUpdates: [],
    auditLogs: []
  };
};
