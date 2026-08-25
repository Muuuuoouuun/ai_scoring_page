import { z } from "zod";

/** 점수에는 반드시 근거가 따라붙습니다. 근거 없는 점수는 저장 단계에서 거부합니다. */
const scoreFacetSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string().min(10)
});

const scoreBreakdownSchema = z.object({
  functionality: scoreFacetSchema,
  uiux: scoreFacetSchema,
  reliability: scoreFacetSchema,
  comfort: scoreFacetSchema,
  pricing: scoreFacetSchema
});

const capabilityComparisonSchema = z.object({
  competitor: z.string().min(2),
  worksBetterHere: z.string().min(10),
  weakerHere: z.string().min(10)
});

const patchNoteSchema = z.object({
  date: z.string().min(4),
  title: z.string().min(2),
  change: z.string().min(10),
  errorRisk: z.string().min(10),
  impact: z.enum(["high", "medium", "low"])
});

const workPlaybookSchema = z.object({
  title: z.string().min(2),
  howToUse: z.string().min(10),
  recommendation: z.string().min(10)
});

export const toolReviewSchema = z.object({
  verdict: z.string().min(10),
  scoreBreakdown: scoreBreakdownSchema,
  comparisons: z.array(capabilityComparisonSchema).min(1),
  /** 확인된 항목이 없으면 빈 배열이 정답입니다. 지어내지 않습니다. */
  patchNotes: z.array(patchNoteSchema),
  playbook: z.array(workPlaybookSchema).min(1)
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
  alternatives: z.array(z.string().min(2)).min(1),
  review: toolReviewSchema
});
