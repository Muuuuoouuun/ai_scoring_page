export const reviewRatingAxes=['quality','efficiency','korean','value','workflow'] as const;
export type ReviewRatingAxis=typeof reviewRatingAxes[number];
export type ReviewRatings=Partial<Record<ReviewRatingAxis,number>>;
export type ReviewAxisScore={
  value:number;
  count:number;
  /** Counts of ratings 1, 2, 3, 4 and 5, in that order. */
  distribution:[number,number,number,number,number];
};
export type ReviewScoreRow={
  id:string;
  title:string;
  task:string;
  plan:string;
  ratings:string|null;
  used_at:string|null;
  updated_at:string;
};
export type ReviewScoreEvidence={
  id:string;
  title:string;
  task:string;
  plan:string;
  usedAt:string|null;
  updatedAt:string;
  ratings:ReviewRatings;
};
export type ReviewScores={
  axes:Partial<Record<ReviewRatingAxis,ReviewAxisScore>>;
  sample:number;
  ratedReviewCount:number;
  tasks:string[];
  plans:string[];
  /** Latest review update, distinct from the date the tool was used. */
  latest:string|null;
  usedAtRange:{from:string;to:string}|null;
  evidence:ReviewScoreEvidence[];
  evidenceTotal:number;
};

function readRatings(raw:string|null):ReviewRatings{
  if(!raw)return {};
  try{
    const value:unknown=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    const ratings:ReviewRatings={};
    for(const axis of reviewRatingAxes){
      const rating=(value as Record<string,unknown>)[axis];
      if(typeof rating==='number'&&Number.isInteger(rating)&&rating>=1&&rating<=5){
        ratings[axis]=rating;
      }
    }
    return ratings;
  }catch{return {};}
}

function usageDate(value:string|null):string|null{
  if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const parsed=new Date(value+'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value?value:null;
}

/** Input must contain one latest published review per account and tool. */
export function aggregateReviewScores(
  reviews:readonly ReviewScoreRow[],
  filters:{task?:string;plan?:string}={},
):ReviewScores{
  // Select the population once, so averages, dates and evidence share the same filters.
  const sample=reviews.filter(review=>(!filters.task||review.task===filters.task)&&(!filters.plan||review.plan===filters.plan));
  const evidence:ReviewScoreEvidence[]=sample.map(review=>({
    id:review.id,title:review.title,task:review.task,plan:review.plan,
    usedAt:usageDate(review.used_at),updatedAt:review.updated_at,ratings:readRatings(review.ratings),
  }));
  evidence.sort((a,b)=>a.updatedAt===b.updatedAt
    ?a.id===b.id?0:a.id>b.id?-1:1
    :a.updatedAt>b.updatedAt?-1:1);

  const axes:ReviewScores['axes']={};
  for(const axis of reviewRatingAxes){
    const distribution:ReviewAxisScore['distribution']=[0,0,0,0,0];
    let sum=0,count=0;
    for(const review of evidence){
      const rating=review.ratings[axis];
      if(rating===undefined)continue;
      sum+=rating;
      count++;
      distribution[rating-1]++;
    }
    if(count>0)axes[axis]={value:Math.round(sum/count*10)/10,count,distribution};
  }
  const usedDates=evidence.map(review=>review.usedAt).filter((date):date is string=>date!==null).sort();
  return {
    axes,
    sample:sample.length,
    ratedReviewCount:evidence.filter(review=>Object.keys(review.ratings).length>0).length,
    tasks:[...new Set(reviews.map(review=>review.task))],
    plans:[...new Set(reviews.map(review=>review.plan))],
    latest:evidence[0]?.updatedAt||null,
    usedAtRange:usedDates.length?{from:usedDates[0],to:usedDates[usedDates.length-1]}:null,
    evidence:evidence.slice(0,20),
    evidenceTotal:sample.length,
  };
}
