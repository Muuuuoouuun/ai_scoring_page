export const feedbackVersion='2026-09-12-v1';
export const feedbackScopes=['information','personal'] as const;
export type FeedbackScope=typeof feedbackScopes[number];
export const feedbackQuestions={information:{label:'정보 이용 의견',question:'필요한 정보를 이해하는 데 도움이 됐나요?'},personal:{label:'개인 관리 의견',question:'기록·비용·해지 등을 정리하는 데 도움이 됐나요?'}};
export const feedbackAnswers=['helped','partly','not_helped','not_tried','undecided'] as const;
export type FeedbackAnswer=typeof feedbackAnswers[number];
export const feedbackLabels:Record<FeedbackAnswer,string>={helped:'도움 됨',partly:'일부 도움',not_helped:'도움 안 됨',not_tried:'아직 이용하지 않음',undecided:'판단 어려움'};
export const feedbackContexts=['home','tools','explore','compare','recommend','guides','news','community','sources','about','cancellation','promotions','search','workspace','other'] as const;
export type FeedbackContext=typeof feedbackContexts[number];
export function feedbackContext(path:string):FeedbackContext{if(path==='/')return 'home';if(path==='/my'||path.startsWith('/my/'))return 'workspace';const first=path.split('/')[1];return feedbackContexts.includes(first as FeedbackContext)?first as FeedbackContext:'other';}
export type FeedbackRecord={id:string;scope:FeedbackScope;question_version:string;context:FeedbackContext;answer:FeedbackAnswer|null;comment:string;started_at:string;answered_at:string|null;updated_at:string};
export type FeedbackCounts={starts:number;answers:number;unanswered:number;evaluable:number;helped:number;partly:number;notHelped:number;notTried:number;undecided:number;helpedShare:number|null};
export type FeedbackSummary={questionVersion:string;from:string;to:string;scopes:(FeedbackCounts&{scope:FeedbackScope;guests:FeedbackCounts;members:FeedbackCounts})[];recent:(FeedbackRecord&{member:number})[]};
