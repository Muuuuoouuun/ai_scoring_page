import { z } from "zod";

export const toolGenreSchema = z.enum(["ai", "it", "githubProject", "saas"]);

export const toolSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  genres: z.array(toolGenreSchema).min(1).default(["saas"]),
  problemContexts: z.array(z.string().min(3)).min(1),
  whyExist: z.string().min(10),
  bestCase: z.string().min(10),
  worstCase: z.string().min(10),
  verdictBadges: z.object({
    timeSaver: z.boolean(),
    thinkCarefully: z.boolean(),
    lockinRisk: z.boolean()
  }),
  alternatives: z.array(z.string().min(2)).min(1),
  review: toolReviewSchema
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
