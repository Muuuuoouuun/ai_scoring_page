import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';
import {eventPhase} from '../lib/event-phase.ts';

const {industryNews, industryTopics, filterIndustryNews, normalizeIndustryTopic} = harness().load('lib/industry-news.ts');
const events = JSON.parse(fs.readFileSync(new URL('../data/events.json', import.meta.url), 'utf8'));
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const officialHosts = new Set(['openai.com', 'news.microsoft.com', 'www.notion.com', 'vercel.com', 'www.anthropic.com']);

test('industry briefs distinguish publication from source verification and link official articles', () => {
  assert.ok(industryNews.length > 0);
  assert.equal(new Set(industryNews.map(item => item.id)).size, industryNews.length);
  for (const item of industryNews) {
    assert.ok(Object.hasOwn(industryTopics, item.topic) && item.topic !== 'all');
    for (const key of ['title', 'summary', 'takeaway', 'sourceName', 'sourceTitle']) assert.ok(item[key]?.trim(), item.id + ': ' + key);
    assert.match(item.publishedAt, datePattern);
    assert.match(item.sourceCheckedAt, datePattern);
    assert.ok(item.publishedAt <= item.sourceCheckedAt, item.id + ' cannot be verified before publication');
    const url = new URL(item.sourceUrl);
    assert.equal(url.protocol, 'https:');
    assert.ok(officialHosts.has(url.hostname), item.sourceUrl);
    assert.notEqual(url.pathname, '/', 'use a source article, not a vendor homepage');
  }
});

test('topic filters preserve publication order and recover from unknown URL input', () => {
  const dates = industryNews.map(item => item.publishedAt);
  assert.deepEqual([...dates], [...dates].sort().reverse());
  for (const topic of Object.keys(industryTopics).filter(topic => topic !== 'all')) {
    const selected = filterIndustryNews(topic);
    assert.ok(selected.length > 0, topic);
    assert.ok(selected.every(item => item.topic === topic));
  }
  assert.equal(normalizeIndustryTopic('toString'), 'all');
  assert.equal(normalizeIndustryTopic('missing'), 'all');
  assert.equal(filterIndustryNews('missing').length, industryNews.length);
});

test('event dates have valid boundaries, official sources and no obsolete stored phase', () => {
  assert.equal(new Set(events.map(event => event.id)).size, events.length);
  for (const event of events) {
    assert.match(event.date, datePattern);
    assert.match(event.checkedAt, datePattern);
    assert.ok(Number.isFinite(Date.parse(event.startsAt)) && Date.parse(event.startsAt) < Date.parse(event.endsAt), event.id);
    assert.ok(!Object.hasOwn(event, 'status'), 'phase is derived from dates');
    assert.ok(event.sourceUrls.length > 0 && event.sourceUrls.every(url => new URL(url).protocol === 'https:'));
    const date = instant => new Intl.DateTimeFormat('en-CA', {timeZone:event.timeZone, year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date(instant));
    assert.equal(date(event.startsAt), event.date, event.id + ' starts in the advertised local date');
    if (event.schedulePrecision === 'day') {
      assert.equal(event.startTime, '', 'do not present midnight boundaries as real session times');
      assert.equal(event.endTime, '');
      assert.match(event.endDate, datePattern);
      assert.ok(event.date <= event.endDate);
      assert.equal(date(Date.parse(event.endsAt) - 1), event.endDate, event.id + ' includes the final local day');
    }
  }
});

test('a multi-day event stays current through its final local day', () => {
  const event = events.find(event => event.id === 'microsoft-ignite-2026');
  assert.ok(event);
  assert.equal(eventPhase(event.startsAt, event.endsAt, Date.parse('2026-11-20T21:00:00Z')), 'live');
  assert.equal(eventPhase(event.startsAt, event.endsAt, Date.parse(event.endsAt)), 'ended');
});
