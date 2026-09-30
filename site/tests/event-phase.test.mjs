import test from 'node:test';
import assert from 'node:assert/strict';
import {eventPhase} from '../lib/event-phase.ts';

test('event phase distinguishes upcoming, live and ended at exact boundaries',()=>{
 const start='2026-09-29T15:00:00Z',end='2026-09-30T02:00:00Z';
 assert.equal(eventPhase(start,end,Date.parse('2026-09-29T14:59:59Z')),'upcoming');
 assert.equal(eventPhase(start,end,Date.parse(start)),'live');
 assert.equal(eventPhase(start,end,Date.parse('2026-09-30T01:00:00Z')),'live');
 assert.equal(eventPhase(start,end,Date.parse(end)),'ended');
});
