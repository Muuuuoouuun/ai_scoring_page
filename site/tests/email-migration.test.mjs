import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';

test('the actual email migration preserves accepted history and holds legacy uncertain attempts',()=>{
 const sql=new DatabaseSync(':memory:'),directory=new URL('../drizzle/',import.meta.url);
 const files=fs.readdirSync(directory).filter(f=>f.endsWith('.sql')).sort();
 for(const file of files.filter(f=>f<'0003_'))sql.exec(fs.readFileSync(new URL(file,directory),'utf8'));
 for(const [id,status,attempts] of [['old-sent','sent',1],['pending','queued',0],['uncertain','failed',1],['old-cancel','cancelled',1]])sql.prepare('INSERT INTO email_outbox(id,user_id,notification_id,status,attempts,created_at) VALUES(?,?,?,?,?,?)').run(id,'alpha','n-'+id,status,attempts,'2026-09-11T00:00:00.000Z');
 sql.exec(fs.readFileSync(new URL('0003_condemned_darkhawk.sql',directory),'utf8'));
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM email_outbox').get().n,4);
 for(const [id,status] of [['old-sent','sent'],['pending','queued'],['uncertain','needs_review'],['old-cancel','cancelled']]){
  const row=sql.prepare('SELECT * FROM email_outbox WHERE id=?').get(id);assert.equal(row.status,status);assert.equal(row.provider_id,null);assert.equal(row.delivery_id,null);
 }
 sql.close();
});
