import {interpretCatalogQuery} from '@/lib/catalog';
export default function SearchMeaning({query}:{query:string}){
 const meaning=interpretCatalogQuery(query);
 if(!meaning.exclusions.length&&!meaning.unresolvedExclusions.length&&!meaning.requirements.length&&!meaning.free)return null;
 return <div className="search-meaning" aria-label="해석한 검색 조건">
  {meaning.exclusions.length>0&&<p>제외한 대상: {meaning.exclusions.map(e=>e.label+(e.type==='category'?' 분야':e.type==='kind'?' 유형':'')).join(' · ')}. 입력 문장에서 대상을 바꾸면 조건도 바뀝니다.</p>}
  {meaning.free&&<p>무료 플랜이 있는 서비스를 찾습니다. 요청한 기능의 무료 범위·한도는 별도로 확인하세요.</p>}
  {meaning.requirements.length>0&&<p className="note warning">확인 필요한 요구 조건: {meaning.requirements.join(' · ')}. 검색어 일치만으로 이 조건의 충족 여부를 판단할 수 없어 결과를 확정하지 않습니다. 각 서비스의 공식 이용 조건을 확인하세요.</p>}
  {meaning.unresolvedExclusions.length>0&&<p className="note warning">제외 대상을 확인하지 못했습니다: {meaning.unresolvedExclusions.join(' · ')}. 도구 이름이나 분야·유형을 구체적으로 입력해주세요. 이 제외 조건은 결과에 적용되지 않았습니다.</p>}
 </div>;
}
