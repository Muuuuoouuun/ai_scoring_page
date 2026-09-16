import {waitUntil} from 'cloudflare:workers';
import {rows} from '@/lib/db';
import {json,failure,input,authenticated} from '@/lib/http';
import {syncBatch} from '@/lib/source-sync';
import {z} from 'zod';
export const dynamic='force-dynamic';
export async function GET(){try{waitUntil(syncBatch().catch(e=>console.error('Source sync failed',e.message)));return json({sources:await rows('SELECT id,url,title,checked_at,changed_at,status,error FROM source_snapshots'),runs:await rows('SELECT started_at,finished_at,status,checked,changed,errors FROM sync_runs ORDER BY started_at DESC LIMIT 5')});}catch(e){return failure(e);}}
export async function POST(request:Request){try{await authenticated();await input(request,z.object({action:z.literal('refresh')}));return json(await syncBatch(true));}catch(e){return failure(e);}}
