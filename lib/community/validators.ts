import { z } from "zod";
import {
  MIN_DISSENT_REASON,
  CONTRIBUTOR_ROLES,
  TEAM_SIZE_BUCKETS,
  USAGE_DURATIONS
} from "@/lib/community/types";

const contextSchema = z.object({
  role: z.enum(CONTRIBUTOR_ROLES as [string, ...string[]]),
  teamSize: z.enum(TEAM_SIZE_BUCKETS as [string, ...string[]]),
  duration: z.enum(USAGE_DURATIONS as [string, ...string[]])
});

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "YYYY-MM 형식으로 적어주세요.");

/**
 * 반박에는 근거를 요구합니다.
 * 에디터에게 점수마다 reason을 강제한 규칙을 사용자에게도 똑같이 적용합니다.
 * 다만 "동의"는 반박이 아니므로 근거를 요구하지 않습니다.
 */
export const dissentSchema = z
  .object({
    facet: z.enum(["functionality", "uiux", "reliability", "comfort", "pricing"]),
    direction: z.enum(["agree", "too-low", "too-high"]),
    reason: z.string().trim().max(400).default(""),
    context: contextSchema
  })
  .refine((value) => value.direction === "agree" || value.reason.length >= MIN_DISSENT_REASON, {
    message: `점수가 다르다고 보신 이유를 ${MIN_DISSENT_REASON}자 이상 적어주세요.`,
    path: ["reason"]
  });

export const decisionSchema = z.object({
  consideredAlternatives: z.array(z.string().trim().min(1).max(60)).max(5).default([]),
  whyChosen: z.string().trim().min(15).max(400),
  adoptedAt: yearMonth,
  outcome: z.enum(["still-using", "reduced", "stopped"]),
  context: contextSchema
});

export const decisionTouchSchema = z.object({
  outcome: z.enum(["still-using", "reduced", "stopped"])
});

export const breakageSchema = z.object({
  occurredAt: yearMonth,
  whatBroke: z.string().trim().min(15).max(500),
  workaround: z.string().trim().max(500).default("")
});
