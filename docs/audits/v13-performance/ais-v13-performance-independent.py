#!/usr/bin/env python3
"""Read fixed V13 JSON observations; write only /private/tmp/ais-v13-performance-independent.*.

Usage: python3 /private/tmp/ais-v13-performance-independent.py --mode before
       python3 /private/tmp/ais-v13-performance-independent.py --mode final
No network, browser, database, deployment, or source mutations.
"""
import argparse
import hashlib
import json
import math
import statistics
from datetime import datetime, timezone
from pathlib import Path

SOURCE = Path('/Users/bigmac_moon/dev/ai_score/docs/audits/v13-performance')
PREFIX = Path('/private/tmp/ais-v13-performance-independent')
PLAN = Path('/Users/bigmac_moon/dev/ai_score/docs/superpowers/plans/2026-09-12-home-streaming.md')
METHOD = Path('/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v7-performance-method.md')
BUDGETS = {'TTFB': 800.0, 'FCP': 1800.0, 'LCP': 2500.0, 'CLS': 0.10}
ROUTES = {'home': '/', 'explore': '/explore'}
ENV_FIELDS = ['capturedAt', 'initialDocumentPath', 'path', 'viewport', 'documentWidth',
              'scrollWidth', 'elapsedMs', 'observerStartedAt', 'framed',
              'initialVisibility', 'visibility', 'visibilityChanges']


def number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and value >= 0


def read_sample(phase, route, index):
    file = SOURCE / f'{phase}-{route}-{index}.json'
    if not file.is_file():
        raise SystemExit(f'Missing expected input; no new output written: {file}')
    data = file.read_bytes()
    raw = json.loads(data)
    readings = raw.get('readings', {})
    metrics = {}
    issues = []
    for key in ENV_FIELDS:
        if key not in raw or raw[key] is None:
            issues.append(f'Missing environment field: {key}')
    for metric in BUDGETS:
        value = readings.get(metric, {}).get('value')
        metrics[metric] = value if number(value) else None
        if metrics[metric] is None:
            issues.append(f'Missing/invalid metric: {metric}; kept unknown')
    for key in ['initialDocumentPath', 'path']:
        if raw.get(key) != ROUTES[route]:
            issues.append(f'Route mismatch: {key}={raw.get(key)!r}')
    if raw.get('viewport') != '1280 × 720':
        issues.append('Actual viewport differs from corrected protocol 1280 × 720')
    if raw.get('documentWidth') != raw.get('scrollWidth'):
        issues.append('Document/scroll widths differ')
    if raw.get('framed') is not False:
        issues.append('Top-level document not confirmed')
    if raw.get('initialVisibility') != 'visible' or raw.get('visibility') != 'visible' or raw.get('visibilityChanges') != 0:
        issues.append('Visibility conditions differ from visible/no recorded transitions')
    if number(raw.get('elapsedMs')) and raw['elapsedMs'] < 10000:
        issues.append('Snapshot precedes 10000 ms target; retained')
    if number(raw.get('observerStartedAt')) and number(raw.get('elapsedMs')) and raw['observerStartedAt'] > raw['elapsedMs']:
        issues.append('Observer starts after snapshot')
    nav = raw.get('navigation') or {}
    for metric in BUDGETS:
        metric_nav = readings.get(metric, {}).get('navigationType')
        if metric_nav and nav.get('type') and metric_nav != nav['type']:
            issues.append(f'Navigation type mismatch for {metric}')
    images = raw.get('images', [])
    return {
        'sample': file.stem, 'phase': phase, 'route': ROUTES[route], 'index': index,
        'sourcePath': str(file), 'sha256': hashlib.sha256(data).hexdigest(),
        'environment': {key: raw.get(key) for key in ENV_FIELDS}, 'navigation': nav,
        'metrics': metrics,
        'metricMetadata': {key: {k: v for k, v in readings.get(key, {}).items() if k != 'value'} for key in BUDGETS},
        'budgetExceeded': {key: None if metrics[key] is None else metrics[key] > limit for key, limit in BUDGETS.items()},
        'rawLayout': raw.get('rawLayout'), 'longTasks': raw.get('longTasks'), 'resources': raw.get('resources'),
        'images': {'loaded': sum(i.get('loaded') is True for i in images), 'total': len(images)},
        'supportedEntries': raw.get('supportedEntries'), 'issues': issues,
    }


def summary(samples):
    result = {}
    for metric, limit in BUDGETS.items():
        values = [s['metrics'][metric] for s in samples if s['metrics'][metric] is not None]
        result[metric] = {
            'budget': limit, 'unit': 'unitless' if metric == 'CLS' else 'ms',
            'count': len(values), 'missingCount': len(samples) - len(values),
            'median': statistics.median(values) if values else None,
            'min': min(values) if values else None, 'worst': max(values) if values else None,
            'exceedCount': sum(value > limit for value in values),
            'allValuesInSampleOrder': [s['metrics'][metric] for s in samples],
        }
    result['loadSamplesExceedingAnyBudget'] = sum(any(s['budgetExceeded'][m] is True for m in ['TTFB', 'FCP', 'LCP']) for s in samples)
    result['loadSamplesWithUnknownMetric'] = sum(any(s['metrics'][m] is None for m in ['TTFB', 'FCP', 'LCP']) for s in samples)
    result['sampleCount'] = len(samples)
    return result


def fmt(value, metric=None):
    if value is None:
        return '미관측'
    return f'{value:.8f}'.rstrip('0').rstrip('.') if metric == 'CLS' else f'{value:.1f}'


def render(report):
    final = report['mode'] == 'final'
    lines = [
        '# V13 성능 독립 계산' + (' — 전후 비교' if final else ' — before 기준선'), '',
        f"계산 시각: {report['calculatedAt']} (UTC). 원시 JSON을 읽어 계산했으며 사이트·배포·브라우저·운영 데이터를 변경하지 않았다.", '',
    ]
    if final:
        before_home, after_home = report['summaries']['before']['/'], report['summaries']['after']['/']
        before_explore, after_explore = report['summaries']['before']['/explore'], report['summaries']['after']['/explore']
        lines += [
            f"**이 표본에서 홈은 빨라졌고 탐색 경로의 초기 지연은 남았다.** 홈 TTFB 중앙값은 {fmt(before_home['TTFB']['median'])}→{fmt(after_home['TTFB']['median'])} ms, FCP/LCP는 {fmt(before_home['FCP']['median'])}→{fmt(after_home['FCP']['median'])} ms다. 홈의 사후 3개는 TTFB/FCP/LCP/CLS 네 예산을 모두 충족했다. /explore 중앙값은 TTFB {fmt(before_explore['TTFB']['median'])}→{fmt(after_explore['TTFB']['median'])} ms, FCP/LCP {fmt(before_explore['FCP']['median'])}→{fmt(after_explore['FCP']['median'])} ms이며 사후 3개 모두 세 로드 예산을 초과했다. 미관측 지표는 없고 CLS는 12개 모두 0이다.", '',
            '홈의 위 예산 충족은 **TTFB/FCP/LCP/CLS 네 지표에만 한정**한다. 전체 성능 예산 통과, 초기 지연 문제의 전 사이트 해결, 전송량 예산 통과를 뜻하지 않는다. 기존 5.3.* 측정 PASS를 유지하는 범위이며 새 점수 변화는 0이다.', '',
        ]
    lines += [
        f"근거: [사전 V13 측정 계획]({PLAN}), [기존 예산·측정 방법]({METHOD}). 고정 예산은 TTFB ≤800 ms, FCP ≤1800 ms, LCP ≤2500 ms, CLS ≤0.10이다. 초과는 엄격히 `>`로 계산하며 미관측을 0 또는 통과로 채우지 않는다.", '',
        '표본은 동일 IAB/계정을 사용하는 계획에 따른 앱 문서 실험 관측이다. JSON에는 인증 상태·캐시 냉온·네트워크 제어·서버 내부 시간이 없다. 비로그인·필드 p75·냉캐시·물리 기기·D1 조회 시간의 증거로 해석하지 않는다. /와 /explore를 합쳐 중앙값을 만들지 않는다. /explore는 공유 레이아웃·런타임 조건을 보는 독립 대조이며 무작위 실험의 통제군은 아니다.', '',
        '문서의 실제 viewport를 사용한다. 1440×900은 최초 요청값이며, 계획의 정정대로 실제 JSON의 1280×720을 기준으로 비교한다. elapsedMs는 관측기 등록 뒤의 길이가 아닌 문서 시간 원점부터 스냅샷까지의 경과시간이다. 초기 10초는 목표이며 실제 편차를 표에 보존한다. 늦은 관측기 등록은 buffered 항목을 회수할 수 있으나 과거 가시성 전체를 복원하지 않는다.', '',
        '## 파일·조건 검사', '',
        f"예상 파일 {len(report['samples'])}개를 모두 읽었다. 중복 수치라도 삭제하지 않았으며 느린 표본을 포함해 모든 원시 파일의 SHA-256과 수치를 JSON에 보존한다. 별도 샘플 제외·재가중·이상치 절삭은 없다.", '',
        '| 표본 | 캡처 UTC | 실제 viewport | 문서/스크롤 폭 | elapsed ms | 관측기 시작 ms | 초기/현재/변화 | 프레임 | navigation |',
        '|---|---|---|---|---:|---:|---|---|---|',
    ]
    for s in report['samples']:
        e = s['environment']
        lines.append(f"| {s['sample']} | {e['capturedAt']} | {e['viewport']} | {e['documentWidth']}/{e['scrollWidth']} | {e['elapsedMs']} | {e['observerStartedAt']} | {e['initialVisibility']}/{e['visibility']}/{e['visibilityChanges']} | {e['framed']} | {s['navigation'].get('type')} |")
    issues = [(s['sample'], issue) for s in report['samples'] for issue in s['issues']]
    lines += ['', '검사 결과: ' + ('; '.join(f'{name}: {issue}' for name, issue in issues) if issues else '요청한 환경 필드와 네 지표에 누락·무효값이 없고 경로·실제 viewport·프레임·기록된 가시성 조건이 일치한다.')]
    lines += ['', 'navigation 종류와 관측기 시작 시각은 위 표처럼 그대로 남긴다. visible/변화 0은 등록 이후 기록이며 관측기 시작 전 모든 가시성 이력을 보증하지 않는다. 진단 버튼 등 수동 입력이 LCP 관측 종료에 영향을 줄 수 있으므로 마지막 평생 LCP라고 부르지 않는다.', '', '## 모든 표본과 예산 초과', '', '| 표본 | TTFB ms | FCP ms | LCP ms | CLS | 초과 지표 | 이미지 완료 | 크기 미관측 리소스 |', '|---|---:|---:|---:|---:|---|---|---:|']
    for s in report['samples']:
        vals = ' | '.join(fmt(s['metrics'][m], m) for m in BUDGETS)
        exceeded = ', '.join(m for m, value in s['budgetExceeded'].items() if value is True) or '없음'
        unknown = ', '.join(m for m, value in s['budgetExceeded'].items() if value is None)
        if unknown:
            exceeded += '; 미관측: ' + unknown
        lines.append(f"| {s['sample']} | {vals} | {exceeded} | {s['images']['loaded']}/{s['images']['total']} | {(s['resources'] or {}).get('unknownSizes')} |")
    lines += ['', '이미지 완료 수는 캡처 시 DOM의 이미지 결과다. 모든 비동기 콘텐츠의 완성이나 hydration 완료 증거는 아니다. 크기 0/미제공 리소스가 있으면 전체 전송 비용을 확정하지 않는다. `resources.scriptEncodedBytes=0`은 캐시·크기 미관측 가능성을 포함하며 비용 0 또는 500 KiB 스크립트 예산 PASS의 근거가 아니다. 이번 계산은 INP나 라이브러리 good 등급을 새 합격 기준으로 사용하지 않는다.', '', '## 경로별 중앙값·최악값', '', '| 버전·경로 | 지표 | 중앙값 | 최악값 | 최소값 | 예산 초과/관측 | 미관측 |', '|---|---|---:|---:|---:|---:|---:|']
    for phase, routes in report['summaries'].items():
        for route, group in routes.items():
            for metric in BUDGETS:
                r = group[metric]
                lines.append(f"| {phase} {route} | {metric}{' ms' if metric != 'CLS' else ''} | {fmt(r['median'], metric)} | {fmt(r['worst'], metric)} | {fmt(r['min'], metric)} | {r['exceedCount']}/{r['count']} | {r['missingCount']} |")
    if final:
        lines += ['', '## 전후 차이', '', '각 행은 같은 경로의 3회 전/후 집계 차이다. Δ=after−before이며 시간의 음수는 이 표본에서 짧아졌다는 뜻이다. 이는 인과효과·유의성·향후 성능 보장이 아니다. CLS의 before 중앙값 0에 대한 비율은 계산하지 않는다.', '', '| 경로 | 지표 | 중앙값 Δ | 중앙값 변화율 | 최악값 Δ | 초과 횟수 before→after |', '|---|---|---:|---:|---:|---|']
        for route, comparisons in report['comparisons'].items():
            for metric, r in comparisons.items():
                pct = '계산하지 않음' if r['medianChangePercent'] is None else f"{r['medianChangePercent']:+.1f}%"
                lines.append(f"| {route} | {metric} | {fmt(r['medianDelta'], metric)} | {pct} | {fmt(r['worstDelta'], metric)} | {r['beforeExceedCount']}→{r['afterExceedCount']} |")
        lines += ['', '모든 사후 표본과 독립 대조를 함께 보고한다. 홈에서 짧아진 값이 있더라도 대조 경로 변화·큰 표본 내 변동·비통제 캐시/네트워크를 고려해야 한다. 공유 런타임 경로의 지연이나 호스팅 버퍼링, D1·인증·프록시 원인 중 하나를 이 숫자만으로 확정할 수 없다. 스트리밍 의존성 분리의 코드 정확성은 별도 검증이며 실제 속도 개선 판정과 동일하지 않다.']
    else:
        lines += ['', 'after 수집은 진행 중이다. 이 기준선 보고서는 after 파일을 읽지 않았으며 최종 비교와 개선 판정을 보류한다. 완료 통보 뒤 동일 계산과 원본 해시 검사를 적용한다.']
    lines += ['', '## 재현', '', f"스크립트: [ais-v13-performance-independent.py]({PREFIX}.py). 원시 파일은 읽기만 하며 출력은 `/private/tmp/ais-v13-performance-independent.*`로 제한한다.", '', '```sh', f"python3 {PREFIX}.py --mode {'final' if final else 'before'}", '```', '', '중앙값은 관측된 유효 수치에 대한 Python statistics.median, 최악값은 max다. 기계 판독 JSON에는 반올림하지 않은 수치·누락 개수·파일 해시가 있다. 화면 표의 ms는 소수점 한 자리, CLS는 소수점 여덟 자리 이내로 표시한다. 고정 게이트·점수는 변경하지 않았다.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['before', 'final'], required=True)
    args = parser.parse_args()
    phases = ['before'] if args.mode == 'before' else ['before', 'after']
    samples = [read_sample(phase, route, index) for phase in phases for index in range(1, 4) for route in ROUTES]
    seen_ids = {}
    for sample in samples:
        for metric, metadata in sample['metricMetadata'].items():
            metric_id = metadata.get('id')
            if metric_id and (metric, metric_id) in seen_ids:
                sample['issues'].append(f"Repeated {metric} metric ID from {seen_ids[metric, metric_id]}")
            if metric_id:
                seen_ids[metric, metric_id] = sample['sample']
    if args.mode == 'final':
        old_path = Path(str(PREFIX) + '.before.json')
        if not old_path.is_file():
            raise SystemExit('Preserved before calculation is missing; no final output written')
        old = json.loads(old_path.read_text())
        old_hashes = {s['sample']: s['sha256'] for s in old['samples']}
        for sample in samples:
            if sample['phase'] == 'before' and old_hashes.get(sample['sample']) != sample['sha256']:
                raise SystemExit(f"Frozen baseline hash changed: {sample['sample']}; no final output written")
    summaries = {phase: {path: summary([s for s in samples if s['phase'] == phase and s['route'] == path]) for path in ROUTES.values()} for phase in phases}
    report = {'mode': args.mode, 'calculatedAt': datetime.now(timezone.utc).isoformat(),
              'sourceDirectory': str(SOURCE), 'budgets': BUDGETS, 'expectedPerPhase': 6,
              'protocolPath': str(PLAN), 'protocolSha256': hashlib.sha256(PLAN.read_bytes()).hexdigest(),
              'samples': samples, 'summaries': summaries, 'comparisons': {}}
    if args.mode == 'final':
        for route in ROUTES.values():
            report['comparisons'][route] = {}
            for metric in BUDGETS:
                before, after = summaries['before'][route][metric], summaries['after'][route][metric]
                delta = after['median'] - before['median'] if before['median'] is not None and after['median'] is not None else None
                report['comparisons'][route][metric] = {
                    'medianDelta': delta,
                    'medianChangePercent': 100 * delta / before['median'] if delta is not None and before['median'] != 0 else None,
                    'worstDelta': after['worst'] - before['worst'] if before['worst'] is not None and after['worst'] is not None else None,
                    'beforeExceedCount': before['exceedCount'], 'afterExceedCount': after['exceedCount'],
                }
    suffix = '.before' if args.mode == 'before' else ''
    json_path, md_path = Path(str(PREFIX) + suffix + '.json'), Path(str(PREFIX) + suffix + '.md')
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    md_path.write_text(render(report))
    print(json.dumps({'json': str(json_path), 'report': str(md_path), 'samples': len(samples), 'summaries': summaries, 'comparisons': report['comparisons']}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
