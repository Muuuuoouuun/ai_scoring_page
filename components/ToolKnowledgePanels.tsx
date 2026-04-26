"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import type { SignalBenchmark } from "@/lib/insights";
import { JournalIcon } from "@/components/JournalIcon";
import { useLanguage } from "@/components/LanguageProvider";
import { journalArchiveEntries } from "@/lib/editorial";

export function ToolKnowledgePanels({ tool, benchmark }: { tool: Tool; benchmark: SignalBenchmark }) {
  const { lang } = useLanguage();
  const technicalSpecs = [
    { label: lang === "ko" ? "강한 지표" : "Strong marker", value: benchmark.strongestDimension },
    { label: lang === "ko" ? "전체 순위" : "Overall rank", value: `#${benchmark.overallRank}/${benchmark.peerCount}` },
    { label: lang === "ko" ? "평균 신호" : "Signal average", value: `${benchmark.toolAverage}/10` }
  ];
  const similarSignals = Object.values(benchmark.leaders)
    .filter((leader) => leader.id !== tool.id)
    .slice(0, 3);

  return (
    <section className="tool-knowledge-grid">
      <article className="card expert-spotlight-card">
        <span className="section-kicker">
          <JournalIcon name="spark" />
          EXPERT SPOTLIGHT
        </span>
        <h2>{lang === "ko" ? "실무 검토 관점" : "Field review angle"}</h2>
        <p>
          {lang === "ko"
            ? `${tool.name}는 기능보다 운영 리듬이 성패를 가릅니다. 첫 도입 전 책임자, 보존할 기록, 폐기 기준을 먼저 정하세요.`
            : `${tool.name} succeeds or fails by operating rhythm more than feature depth. Set owner, records, and exit criteria first.`}
        </p>
      </article>

      <article className="card technical-spec-card">
        <span className="section-kicker">TECHNICAL SPECS</span>
        <dl>
          {technicalSpecs.map((spec) => (
            <div key={spec.label}>
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="card similar-signals-card">
        <span className="section-kicker">SIMILAR SIGNALS</span>
        {similarSignals.length > 0 ? (
          similarSignals.map((signal) => (
            <Link href={`/tools/${signal.id}`} key={`${signal.id}-${signal.name}`}>
              <strong>{signal.name}</strong>
              <span>{signal.value}/10</span>
            </Link>
          ))
        ) : (
          <p className="text-muted">{lang === "ko" ? "비슷한 리더 신호가 아직 없습니다." : "No adjacent leader signal yet."}</p>
        )}
      </article>

      <article className="card archive-mini-card">
        <span className="section-kicker">
          <JournalIcon name="archive" />
          FROM THE JOURNAL ARCHIVE
        </span>
        {journalArchiveEntries.slice(0, 2).map((entry) => (
          <Link href="/archive" key={entry.id}>
            <strong>{entry.title[lang]}</strong>
            <small>{entry.tag[lang]}</small>
          </Link>
        ))}
      </article>
    </section>
  );
}
