import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';

// Expected instants were frozen independently in ais-v14-timing-cases.md.
const source=new URL('../lib/email-timing.ts',import.meta.url);
const timing=fs.existsSync(source)?harness().load('lib/email-timing.ts'):{};
const schedule=(zone,time='09:00',mode='digest')=>timing.emailSchedule({emailMode:mode,emailTimeZone:zone,emailTime:time});

test('the server exposes the actual calendar decision functions',()=>{
 for(const key of ['emailSchedule','emailLocalParts','emailDueOnDate','emailWindow'])assert.equal(typeof timing[key],'function',key);
});
if(timing.emailSchedule){
test('named zones and strict wall time validate without host-zone fallback',()=>{
 for(const value of [{emailTimeZone:'Mars/Olympus'},{emailTimeZone:'+09:00'},{emailTime:'9:00'},{emailTime:'24:00'},{emailTime:'09:60'},{emailTime:'09:00:00'},{emailMode:'instant'}])assert.throws(()=>timing.emailSchedule(value));
 assert.equal(schedule('Asia/Seoul','00:00').time,'00:00');
 assert.equal(schedule('Asia/Seoul','23:59').time,'23:59');
});
for(const [zone,date,time,expected] of [
 ['Asia/Seoul','2026-09-12','09:00','2026-09-12T00:00:00.000Z'],
 ['Asia/Kathmandu','2026-09-12','09:00','2026-09-12T03:15:00.000Z'],
 ['Pacific/Kiritimati','2026-09-12','09:00','2026-09-11T19:00:00.000Z'],
 ['Pacific/Pago_Pago','2026-09-12','09:00','2026-09-12T20:00:00.000Z'],
 ['America/New_York','2026-03-08','02:30','2026-03-08T07:00:00.000Z'],
 ['America/New_York','2026-11-01','01:30','2026-11-01T05:30:00.000Z'],
 ['Australia/Lord_Howe','2026-10-04','02:15','2026-10-03T15:30:00.000Z'],
 ['Australia/Lord_Howe','2026-04-05','01:45','2026-04-04T14:45:00.000Z'],
 ['Pacific/Apia','2011-12-30','09:00',null],
 ['Pacific/Apia','2011-12-31','09:00','2011-12-30T19:00:00.000Z'],
])test(`frozen local due: ${zone} ${date} ${time}`,()=>assert.equal(timing.emailDueOnDate(date,schedule(zone,time)),expected));

test('local date comes from the explicit named zone and invalid dates fail',()=>{
 assert.equal(timing.emailLocalParts('2026-09-11T15:00:00Z','Asia/Seoul').date,'2026-09-12');
 for(const date of ['2026-02-30','2026-2-01','bad'])assert.throws(()=>timing.emailDueOnDate(date,schedule('UTC')));
});
test('gap opens at its first valid minute; fold remains open after wall clock rolls back',()=>{
 const gap=schedule('America/New_York','02:30');
 assert.equal(timing.emailWindow('2026-03-08T06:59:59Z',gap).eligible,false);
 assert.equal(timing.emailWindow('2026-03-08T07:00:00Z',gap).eligible,true);
 assert.equal(timing.emailWindow('2026-11-01T06:05:00Z',schedule('America/New_York','01:30','matched')).eligible,true);
});
test('digest guard advances by actual local date across 23-hour and 25-hour days',()=>{
 assert.equal(timing.emailWindow('2026-03-07T14:00:00Z',schedule('America/New_York')).nextDigestNotBefore,'2026-03-08T13:00:00.000Z');
 assert.equal(timing.emailWindow('2026-10-31T13:00:00Z',schedule('America/New_York')).nextDigestNotBefore,'2026-11-01T14:00:00.000Z');
});
for(const [zone,time,now,guard,expected] of [
 ['Asia/Seoul','18:00','2026-09-12T01:00Z','2026-09-13T00:00Z','2026-09-13T09:00:00.000Z'],
 ['Asia/Seoul','08:00','2026-09-12T01:00Z','2026-09-13T00:00Z','2026-09-13T00:00:00.000Z'],
 ['Pacific/Pago_Pago','09:00','2026-09-11T20:00Z','2026-09-12T19:00Z','2026-09-12T20:00:00.000Z'],
 ['Pacific/Kiritimati','15:00','2026-09-12T00:30Z','2026-09-13T00:00Z','2026-09-13T01:00:00.000Z'],
])test(`consumed guard survives schedule change to ${zone} ${time}`,()=>{
 const w=timing.emailWindow(now,schedule(zone,time),guard);assert.equal(w.eligible,false);assert.equal(w.nextEligibleAt,expected);
});
test('unconsumed same-day catch-up is allowed, but missed previous dates are not replayed',()=>{
 const s=schedule('Asia/Seoul');
 assert.equal(timing.emailWindow('2026-09-12T01:01:00Z',s).eligible,true);
 const missed=timing.emailWindow('2026-09-12T23:59:59Z',s);assert.equal(missed.eligible,false);assert.equal(missed.nextEligibleAt,'2026-09-13T00:00:00.000Z');
 const fold=timing.emailWindow('2026-11-01T05:46:00Z',schedule('America/New_York','01:30'));
 assert.equal(fold.eligible,true);assert.equal(fold.nextDigestNotBefore,'2026-11-02T06:30:00.000Z');
});
}
