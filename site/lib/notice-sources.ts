import {db,now,one} from './db';
export type SourceIdentity={cardKey:string;version:string;revision:number};
export async function registerSource(s:SourceIdentity){
 await db().prepare(`INSERT INTO notice_source_heads(card_key,revision,event_revision,version,conflict,updated_at) VALUES(?,?,?,?,0,?) ON CONFLICT(card_key) DO UPDATE SET revision=excluded.revision,event_revision=CASE WHEN excluded.revision>notice_source_heads.revision AND excluded.version!=notice_source_heads.version THEN excluded.revision ELSE notice_source_heads.event_revision END,version=CASE WHEN excluded.revision>notice_source_heads.revision THEN excluded.version ELSE notice_source_heads.version END,conflict=CASE WHEN excluded.revision>notice_source_heads.revision THEN 0 WHEN excluded.version!=notice_source_heads.version THEN 1 ELSE notice_source_heads.conflict END,updated_at=excluded.updated_at WHERE excluded.revision>=notice_source_heads.revision`).bind(s.cardKey,s.revision,s.revision,s.version,now()).run();
 const head=await one<{revision:number;event_revision:number;version:string;conflict:number}>('SELECT revision,event_revision,version,conflict FROM notice_source_heads WHERE card_key=?',s.cardKey);
 return {valid:head?.revision===s.revision&&head.version===s.version&&!head.conflict,eventRevision:head?.event_revision||s.revision};
}
export const sourceGuard=(s:SourceIdentity)=>s.cardKey.startsWith('billing:')?{sql:'1',args:[]} : ({sql:'EXISTS (SELECT 1 FROM notice_source_heads WHERE card_key=? AND revision=? AND version=? AND conflict=0)',args:[s.cardKey,s.revision,s.version]});
// For every item, including a missing card/head: absence must fail closed.
export function currentItemsGuard(userId:string,items:{notificationId:string;key:string}[]){return {
 sql:items.length?items.map(()=>`EXISTS (SELECT 1 FROM notifications n JOIN notification_cards c ON c.latest_notification_id=n.id AND c.user_id=n.user_id JOIN notice_source_heads h ON h.card_key=c.card_key WHERE n.user_id=? AND n.id=? AND n.source_key=? AND c.source_version=h.version AND c.source_revision=h.revision AND h.conflict=0 AND COALESCE(json_extract(n.metadata,'$.emailNotAfter'),'9999')>?)`).join(' AND '):'0',
 args:items.flatMap(item=>[userId,item.notificationId,item.key,now()]),
};}
