export type EventPhase='upcoming'|'live'|'ended';

export function eventPhase(startsAt:string,endsAt:string,now:number):EventPhase{
 if(now<Date.parse(startsAt))return 'upcoming';
 if(now<Date.parse(endsAt))return 'live';
 return 'ended';
}
