"use client";

import { copy as t } from "@/lib/copy";
import {
  CONTRIBUTOR_ROLES,
  TEAM_SIZE_BUCKETS,
  USAGE_DURATIONS,
  type ContributorContext
} from "@/lib/community/types";

export const EMPTY_CONTEXT: Partial<ContributorContext> = {};

export const isContextComplete = (
  context: Partial<ContributorContext>
): context is ContributorContext =>
  Boolean(context.role && context.teamSize && context.duration);

/**
 * 기여자의 "위치"를 받습니다. 신원이 아닙니다.
 *
 * 같은 5점이라도 3인 팀의 5점과 500인 회사의 5점은 다른 정보인데,
 * 실명을 요구해도 그 문제는 풀리지 않습니다.
 * 전부 선택지형이라 나중에 필터와 분해가 가능합니다. 탭 세 번이면 끝납니다.
 */
export function ContextPicker({
  value,
  onChange
}: {
  value: Partial<ContributorContext>;
  onChange: (next: Partial<ContributorContext>) => void;
}) {

  const groups = [
    {
      key: "role" as const,
      label: t.ctxRole,
      options: CONTRIBUTOR_ROLES,
      labels: t.roleLabels as Record<string, string>
    },
    {
      key: "teamSize" as const,
      label: t.ctxTeamSize,
      options: TEAM_SIZE_BUCKETS,
      labels: t.teamSizeLabels as Record<string, string>
    },
    {
      key: "duration" as const,
      label: t.ctxDuration,
      options: USAGE_DURATIONS,
      labels: t.durationLabels as Record<string, string>
    }
  ];

  return (
    <div className="context-picker">
      <p className="context-picker-why">{t.ctxWhy}</p>
      {groups.map((group) => (
        <fieldset className="context-group" key={group.key}>
          <legend>{group.label}</legend>
          <div className="context-options">
            {group.options.map((option) => (
              <button
                type="button"
                key={option}
                className={value[group.key] === option ? "active" : ""}
                aria-pressed={value[group.key] === option}
                onClick={() => onChange({ ...value, [group.key]: option })}
              >
                {group.labels[option] ?? option}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
