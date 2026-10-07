import Link from '@/components/Link';
import {ratingAxes,ratingDescriptions,type RatingAxis} from '@/lib/scoring';

export default function Page(){
  return <main className="container page article" id="main">
    <span className="eyebrow">About AIs</span>
    <h1>도구를 이해하고,<br/>일에 맞게 선택하도록.</h1>
    <p>AIs는 AI 앱, SaaS, AI 모델의 기능과 이용 조건을 정리하고 실제 사용 경험을 나누는 정보 공간입니다. 공개 정보 탐색과 비교는 로그인 없이 이용할 수 있고, 도구함과 구독 기록은 개인 영역에서 관리합니다.</p>
    <h2>정보를 구분하는 기준</h2>
    <ul className="bullets">
      <li><strong>공식 정보:</strong> 제공사의 문서·제품 페이지·공지에서 확인한 내용입니다. 출처와 확인일을 함께 표시합니다. 문서 확인은 직접 실행 검증과 다릅니다.</li>
      <li><strong>사용자 경험:</strong> 사용 업무·요금제·사용일과 함께 작성한 후기입니다. 검증된 성능 실험이나 공식 지원을 뜻하지 않습니다.</li>
      <li><strong>검수된 직접 평가:</strong> 동일한 과제·환경·검토 기준이 공개된 직접 평가만 해당합니다. 현재 카탈로그는 직접 평가 전이며 ‘미평가’로 표시합니다.</li>
    </ul>
    <h2>다섯 항목은 무엇을 말하나요?</h2>
    <ul className="bullets">{Object.entries(ratingAxes).map(([key,label])=><li key={key}><strong>{label}:</strong> {ratingDescriptions[key as RatingAxis]}</li>)}</ul>
    <p>항목 설명은 기존 점수를 읽는 안내입니다. 모든 작성자가 동일한 기준으로 평가했다는 뜻은 아닙니다. 상단에서 다섯 사용자 점수를 모두 보여주며, 검수된 직접 평가 티어와 구분합니다. 현재는 직접 평가와 티어 산정 결과가 없어 티어를 ‘미평가’로 표시합니다.</p>
    <h2>평균·응답 수·분포를 읽는 방법</h2>
    <p>계정·도구별 최신 공개 후기 한 건을 고른 뒤 업무와 플랜 조건을 적용합니다. 같은 계정의 이전 후기에서 조건이 맞는 응답을 다시 가져오지 않습니다. 전체 조건을 선택하면 여러 업무와 플랜이 섞일 수 있습니다.</p>
    <ul className="bullets">
      <li><strong>집계 대상 후기:</strong> 선택 조건에 포함된 최신 후기 수입니다. 점수를 입력하지 않은 후기까지 포함합니다.</li>
      <li><strong>점수 입력 후기:</strong> 다섯 항목 중 유효한 점수를 하나 이상 입력한 후기 수입니다.</li>
      <li><strong>항목별 응답:</strong> 해당 항목에 입력한 1–5점의 평균과 응답 수입니다. 무응답은 평균에서 제외하고 0점으로 바꾸지 않습니다. 잘못된 형식·범위의 값도 제외합니다.</li>
      <li><strong>점수 분포:</strong> 정확히 1·2·3·4·5점을 입력한 실제 건수입니다. 기존 소수점 응답은 별도 건수로 표시하며 평균과 응답 수에 포함합니다.</li>
      <li><strong>소수 응답 평균:</strong> 항목 응답이 1–4건일 때 붙이는 해석 안내입니다. 통계적 신뢰도 기준이 아니며, 5건 이상도 전체 사용자나 성능을 대표한다고 보장하지 않습니다.</li>
    </ul>
    <p>사용일 범위는 집계 대상 후기의 작성자가 입력한 사용일이고, 후기 갱신일은 글을 작성·수정한 시점입니다. 서비스의 공식 정보 확인일, 직접 평가일과 구분합니다. 상세에서는 같은 집계에 포함된 최근 후기 최대 5건의 원문으로 연결합니다.</p>
    <h2>비교와 발견의 방향</h2>
    <p>공식 자료에 있는 쓰임·요금 구조·환경·한국어·조건을 먼저 읽고, 사용자 경험은 해당 도구의 업무와 플랜을 골라 확인합니다. 다른 플랜이나 작은 표본의 평균을 하나의 종합점수·우열 배지로 합치지 않습니다. 목록에 없는 기능은 미지원이 아니라 미확인입니다.</p>
    <p>커뮤니티 참여 랭킹은 공개 후기의 참여자 수를 기준으로 하며 성능 순위가 아닙니다. 추천은 입력한 목적과 공식 기능의 관련성, 명시한 필수 조건을 기준으로 합니다. 미확인 조건을 충족한 것으로 판단하지 않습니다. 정보를 얻고 나가는 방문도 서비스의 완결된 이용입니다.</p>
    <h2>최신 정보 확인</h2>
    <p>공식 피드와 로고를 갱신하고 일반 문서의 변경은 검토 대상으로 표시합니다. 요금과 기능 조건은 바뀔 수 있어 표시된 확인일과 공식 원문을 함께 확인하세요.</p>
    <div className="actions" style={{marginTop:24}}><Link className="button secondary" href="/sources">출처·갱신 현황</Link><Link className="button ghost" href="/community?write=feature">정보 수정 제안</Link></div>
  </main>;
}
