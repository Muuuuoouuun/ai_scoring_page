import {validDate} from './billing';

export const ratingAxes={
  quality:'결과 품질',
  efficiency:'작업 효율',
  korean:'한국어',
  value:'비용 대비',
  workflow:'작업 연결'
} as const;

export type RatingAxis=keyof typeof ratingAxes;
export type Ratings=Partial<Record<RatingAxis,number>>;
export type RatingDistribution=[number,number,number,number,number];
export type ScoreAxis={value:number;count:number;distribution:RatingDistribution;fractionalCount:number};
export type ScoreReview={
  id:string;
  title:string;
  author:string;
  excerpt:string;
  affiliation:'none'|'maker'|'sponsored';
  task:string;
  plan:string;
  usedAt:string|null;
  updatedAt:string;
  ratings:Ratings;
};
export type Scores={
  axes:Partial<Record<RatingAxis,ScoreAxis>>;
  sample:number;
  ratedSample:number;
  tasks:string[];
  plans:string[];
  latest:string|null;
  usedAtRange:{earliest:string|null;latest:string|null};
  recentReviews:ScoreReview[];
};
export type ScoreInputReview={
  id:string;
  title:string;
  author?:string|null;
  body?:string|null;
  affiliation?:string|null;
  task:string;
  plan:string;
  used_at:string|null;
  updated_at:string;
  ratings:unknown;
};

// These explain what each existing axis means. They do not claim that older
// reviews were written against a newly calibrated numerical rubric.
export const ratingDescriptions:Record<RatingAxis,string>={
  quality:'사용자가 원하는 결과에 얼마나 가까웠는지에 관한 경험입니다.',
  efficiency:'결과 확인과 수정을 포함해 작업에 드는 수고에 관한 경험입니다.',
  korean:'해당 업무에서 한국어를 이해하고 표현한 방식에 관한 경험입니다.',
  value:'사용한 플랜의 비용에 비해 얻은 도움에 관한 경험입니다.',
  workflow:'결과물을 다음 작업이나 도구로 연결한 과정에 관한 경험입니다.'
};

const axisIds=Object.keys(ratingAxes) as RatingAxis[];

function reviewExcerpt(body?:string|null):string{
  const text=body||'',characters=Array.from(text);
  return characters.length>180?characters.slice(0,180).join('')+'…':text;
}

export function sanitizeRatings(input:unknown):Ratings{
  let parsed:unknown=input;
  if(typeof input==='string'){
    try{parsed=JSON.parse(input);}catch{return {};}
  }
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {};
  const ratings:Ratings={};
  for(const axis of axisIds){
    if(!Object.prototype.hasOwnProperty.call(parsed,axis))continue;
    const value=(parsed as Record<string,unknown>)[axis];
    if(typeof value==='number'&&Number.isFinite(value)&&value>=1&&value<=5)ratings[axis]=value;
  }
  return ratings;
}

/** Accepts the already deduplicated latest public review per account/tool. */
export function aggregateScores(reviews:ScoreInputReview[],filters:{task?:string;plan?:string}={}):Scores{
  const sample=reviews.filter(review=>(!filters.task||review.task===filters.task)&&(!filters.plan||review.plan===filters.plan));
  const axes:Scores['axes']={};
  const sums:Partial<Record<RatingAxis,number>>={};
  const evidence:ScoreReview[]=sample.map(review=>({
    id:review.id,title:review.title,task:review.task,plan:review.plan,
    author:review.author?.trim()||'사용자',excerpt:reviewExcerpt(review.body),
    affiliation:review.affiliation==='maker'||review.affiliation==='sponsored'?review.affiliation:'none',
    usedAt:review.used_at&&validDate(review.used_at)?review.used_at:null,
    updatedAt:review.updated_at,ratings:sanitizeRatings(review.ratings)
  }));
  let ratedSample=0;
  for(const review of evidence){
    if(Object.keys(review.ratings).length)ratedSample++;
    for(const axis of axisIds){
      const value=review.ratings[axis];
      if(value===undefined)continue;
      const result=axes[axis]??={value:0,count:0,distribution:[0,0,0,0,0],fractionalCount:0};
      sums[axis]=(sums[axis]||0)+value;
      result.count++;
      // The existing write contract accepts fractions. Include them in the
      // mean, but never round them into a fabricated 1–5 distribution bucket.
      if(Number.isInteger(value))result.distribution[value-1]++;
      else result.fractionalCount++;
    }
  }
  for(const axis of axisIds){
    const result=axes[axis];
    if(result)result.value=Math.round((sums[axis]||0)/result.count*10)/10;
  }
  // Keep the update-time tie-breaker consistent with the API's latest-review
  // selection. This list is a limited view of the exact same aggregate sample.
  evidence.sort((a,b)=>a.updatedAt===b.updatedAt?(a.id===b.id?0:a.id>b.id?-1:1):a.updatedAt>b.updatedAt?-1:1);
  const usedDates=evidence.flatMap(review=>review.usedAt?[review.usedAt]:[]).sort();
  return {
    axes,sample:sample.length,ratedSample,
    tasks:[...new Set(reviews.map(review=>review.task))],
    plans:[...new Set(reviews.map(review=>review.plan))],
    latest:evidence[0]?.updatedAt||null,
    usedAtRange:{earliest:usedDates[0]||null,latest:usedDates.at(-1)||null},
    recentReviews:evidence.slice(0,5)
  };
}
