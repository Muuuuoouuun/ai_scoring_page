import { z } from "zod";

export const toolSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  problemContexts: z.array(z.string().min(3)).min(1),
  whyExist: z.string().min(10),
  impact: z.object({
    judgmentSpeed: z.number().min(0).max(10),
    thinkingDepth: z.number().min(0).max(10),
    executionDensity: z.number().min(0).max(10),
    collaborationClarity: z.number().min(0).max(10)
  }),
  bestCase: z.string().min(10),
  worstCase: z.string().min(10),
  verdictBadges: z.object({
    timeSaver: z.boolean(),
    thinkCarefully: z.boolean(),
    lockinRisk: z.boolean()
  }),
  alternatives: z.array(z.string().min(2)).min(1)
});

export const userReviewSchema = z.object({
  nickname: z.string().trim().max(24).optional(),
  line: z.string().trim().min(3).max(120),
  detail: z.string().trim().max(2000).optional().default(""),
  rating: z.number().int().min(1).max(5)
});

export const patchUpdateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  change: z.string().trim().min(5).max(2000),
  errorRisk: z.string().trim().min(2).max(2000),
  impact: z.enum(["low", "medium", "high"]).default("medium"),
  hasIncident: z.boolean().default(false),
  authorName: z.string().trim().max(40).optional()
});
