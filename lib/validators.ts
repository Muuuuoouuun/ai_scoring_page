import { z } from "zod";

export const reviewSchema = z.object({
  toolId: z.string().uuid(),
  nickname: z.string().min(1).max(24).default("Anonymous"),
  line: z.string().min(1).max(120),
  detail: z.string().max(1000).optional(),
  rating: z.number().int().min(1).max(5),
  imageUrl: z.string().url().optional(),
  role: z.string().max(50).optional(),
  teamSize: z.enum(["1-10", "10-50", "50-200", "200+"]).optional(),
  usagePeriod: z.enum(["1개월 미만", "1-6개월", "6개월-1년", "1년 이상"]).optional()
});

export const patchNoteSchema = z.object({
  toolId: z.string().uuid(),
  title: z.string().min(2).max(100),
  change: z.string().min(5).max(1000),
  errorRisk: z.string().min(5).max(1000),
  patchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  impact: z.enum(["high", "medium", "low"]).optional(),
  isOutage: z.boolean().optional()
});

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
