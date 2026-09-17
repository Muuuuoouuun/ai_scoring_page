const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const site = '/Users/bigmac_moon/dev/ai_score/site';
const out = '/private/tmp';
const casesPath = path.join(out, 'ais-v10-purpose-query-cases.json');
const freeze = JSON.parse(fs.readFileSync(path.join(out, 'ais-v10-purpose-query-freeze.json'), 'utf8'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const casesBytes = fs.readFileSync(casesPath);
if (hash(casesBytes) !== freeze.sha256) throw new Error('Frozen cases changed');
const benchmark = JSON.parse(casesBytes);
const files = ['lib/catalog.ts', 'data/catalog.json', 'components/Recommend.tsx', 'components/Explore.tsx', 'components/GlobalSearch.tsx', 'components/ToolUI.tsx', 'app/api/search/route.ts'];
const beforeHashes = Object.fromEntries(files.map(p => [p, hash(fs.readFileSync(path.join(site, p)))]));
const source = fs.readFileSync(path.join(site, 'lib/catalog.ts'), 'utf8');
const catalogData = JSON.parse(fs.readFileSync(path.join(site, 'data/catalog.json'), 'utf8'));
const siteRequire = createRequire(path.join(site, 'package.json'));
const ts = siteRequire('typescript');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
const moduleBox = {exports: {}};
const context = vm.createContext({module: moduleBox, exports: moduleBox.exports, require(id) {
  if (id === '@/data/catalog.json') return catalogData;
  throw new Error('Unexpected module import: ' + id);
}}, {codeGeneration: {strings: false, wasm: false}});
new vm.Script(js, {filename: 'site/lib/catalog.ts (TypeScript transpiled in memory)'}).runInContext(context, {timeout: 1000});
const {searchCatalog, categories} = moduleBox.exports;
if (typeof searchCatalog !== 'function') throw new Error('searchCatalog unavailable');

const observations = benchmark.cases.map(c => {
  const all = searchCatalog(c.query, c.options);
  const top6 = all.slice(0, 6);
  const top3 = top6.slice(0, 3);
  const checks = [];
  const add = (name, passed, detail) => checks.push({name, passed, detail});
  if (c.expectEmpty) add('expected empty', all.length === 0, 'count=' + all.length);
  if (c.primaryAnyTop3) add('primary any in top 3', top3.some(t => c.primaryAnyTop3.includes(t.id)), 'expected one of ' + c.primaryAnyTop3.join(', '));
  if (c.forbiddenCategoriesTop6) add('excluded categories absent', !top6.some(t => c.forbiddenCategoriesTop6.includes(t.category)), 'forbidden=' + c.forbiddenCategoriesTop6.join(', '));
  if (c.forbiddenKindsTop6) add('excluded kinds absent', !top6.some(t => c.forbiddenKindsTop6.includes(t.kind)), 'forbidden=' + c.forbiddenKindsTop6.join(', '));
  if (c.forbiddenIdsTop6) add('excluded tools absent', !top6.some(t => c.forbiddenIdsTop6.includes(t.id)), 'forbidden=' + c.forbiddenIdsTop6.join(', '));
  if (c.allResultsWithinOwned) add('all results within synthetic owned fixture', all.every(t => c.options.owned.includes(t.id)), 'fixture=' + c.options.owned.join(', '));
  if (c.options.free) add('catalog free-plan filter', all.every(t => t.pricing.includes('무료')), 'Product-level filter only; does not establish requested feature is free.');
  if (c.options.korean) add('catalog Korean label filter', all.every(t => t.korean === '지원'), 'Strict current catalog label.');
  if (c.conditionalConflict) {
    const present = top6.some(t => t.id === c.conditionalConflict.toolId);
    // Recommend and ToolCard were read before expectations were frozen.
    // They display summary/pricing/generic use-case reason, not feature conditions.
    const specificWarningInRecommendationSurface = false;
    add('feature-level conflict excluded or specifically warned', !present || specificWarningInRecommendationSurface, present ? 'Slack recommended; current Recommend/ToolCard render no group-huddle-paid condition.' : 'Conflicting tool absent.');
  }
  return {
    id: c.id, domain: c.domain, query: c.query, options: c.options, expectation: c.expectation,
    total: all.length,
    allResults: all.map(t => ({id: t.id, name: t.name, relevance: t.relevance, category: t.category, kind: t.kind})),
    recommendationTop6: top6.map(t => ({id: t.id, name: t.name, relevance: t.relevance, summary: t.summary, pricing: t.pricing, korean: t.korean,
      recommendationReason: `추천 근거: ${categories[t.category]} 분야에서 ${t.useCases.slice(0,2).join(', ')}에 활용할 수 있습니다.${c.options.free ? ' 무료 플랜이 확인되었습니다.' : ''}${c.options.korean ? ' 한국어 지원이 확인되었습니다.' : ''}`})),
    evidence: c.evidenceIds.map(id => { const t = catalogData.find(t => t.id === id); return {id, name: t.name, category: t.category, kind: t.kind, pricing: t.pricing, korean: t.korean, useCases: t.useCases, features: t.features}; }),
    checks, verdict: checks.every(x => x.passed) ? 'PASS' : 'FAIL'
  };
});
const afterHashes = Object.fromEntries(files.map(p => [p, hash(fs.readFileSync(path.join(site, p)))]));
const result = {observedAt: new Date().toISOString(), node: process.version, typescript: ts.version, method: 'Actual catalog.ts transpiled in memory to CommonJS and invoked in an isolated VM; the only require returns actual catalog JSON. No browser, API, database or network call.', frozenCases: freeze, sourceHashes: beforeHashes, sourceHashesUnchanged: JSON.stringify(beforeHashes) === JSON.stringify(afterHashes),
  summary: {total: observations.length, pass: observations.filter(x => x.verdict === 'PASS').length, fail: observations.filter(x => x.verdict === 'FAIL').length}, observations};
fs.writeFileSync(path.join(out, 'ais-v10-purpose-query-observations.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({observedAt: result.observedAt, sourceHashesUnchanged: result.sourceHashesUnchanged, summary: result.summary, rows: observations.map(x => ({id:x.id, query:x.query, result:x.recommendationTop6.map(t=>t.name+' ('+t.relevance+')').join(' / '), verdict:x.verdict, failed:x.checks.filter(c=>!c.passed).map(c=>c.name)}))}, null, 2));
