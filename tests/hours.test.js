import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getOpenStatus, toMinutes, toHHMM, weeklyIntervals } from '../js/core/hours.js';

const TZ = 'America/Sao_Paulo'; // UTC-03:00, no DST since 2019
// Helper: a Date for a local time in São Paulo. 2026-11-02 is a Monday.
const at = (isoLocal) => new Date(`${isoLocal}-03:00`);

const HOURS = {
  mon: [],
  tue: [['19:00', '23:30']],
  wed: [['19:00', '23:30']],
  thu: [['19:00', '23:30']],
  fri: [['12:00', '15:00'], ['19:00', '01:00']], // split shift; second ends after midnight
  sat: [['19:00', '01:00']],
  sun: [['19:00', '00:30']], // runs into Monday
};

test('time helpers', () => {
  assert.equal(toMinutes('19:30'), 1170);
  assert.equal(toHHMM(1170), '19:30');
  assert.equal(toHHMM(24 * 60 + 30), '00:30');
  assert.throws(() => toMinutes('7:00'));
  assert.throws(() => toMinutes('25:00'));
});

test('weekly intervals: closing before opening means next day', () => {
  const sat = weeklyIntervals({ sat: [['19:00', '01:00']] })[0];
  assert.equal(sat.end - sat.start, 6 * 60);
});

test('unknown when hours or time zone is missing', () => {
  assert.equal(getOpenStatus(null, TZ, new Date()).state, 'unknown');
  assert.equal(getOpenStatus(HOURS, null, new Date()).state, 'unknown');
});

test('open during a shift, with closing time', () => {
  const s = getOpenStatus(HOURS, TZ, at('2026-11-03T20:00')); // Tuesday 20:00
  assert.deepEqual([s.state, s.until], ['open', '23:30']);
});

test('closing soon in the last 30 minutes', () => {
  assert.equal(getOpenStatus(HOURS, TZ, at('2026-11-03T23:05')).state, 'closing-soon');
  assert.equal(getOpenStatus(HOURS, TZ, at('2026-11-03T22:59')).state, 'open');
});

test('closed before opening today → opens today', () => {
  const s = getOpenStatus(HOURS, TZ, at('2026-11-03T10:00')); // Tuesday morning
  assert.equal(s.state, 'closed');
  assert.deepEqual(s.nextOpen, { day: 'tue', time: '19:00', today: true, tomorrow: false });
});

test('split shift: closed between lunch and dinner, open again at 19:00', () => {
  const s = getOpenStatus(HOURS, TZ, at('2026-11-06T16:00')); // Friday afternoon
  assert.equal(s.state, 'closed');
  assert.equal(s.nextOpen.time, '19:00');
  assert.equal(s.nextOpen.today, true);
});

test('after midnight: still inside Friday night shift on Saturday 00:30', () => {
  const s = getOpenStatus(HOURS, TZ, at('2026-11-07T00:30'));
  assert.equal(s.state, 'closing-soon');
  assert.equal(s.until, '01:00');
});

test('Sunday shift running into Monday (week wrap)', () => {
  const s = getOpenStatus(HOURS, TZ, at('2026-11-02T00:10')); // Monday 00:10
  assert.equal(s.state, 'closing-soon');
  assert.equal(s.until, '00:30');
});

test('closed all of Monday → next opening is Tuesday (tomorrow)', () => {
  const s = getOpenStatus(HOURS, TZ, at('2026-11-02T15:00'));
  assert.equal(s.state, 'closed');
  assert.deepEqual(s.nextOpen, { day: 'tue', time: '19:00', today: false, tomorrow: true });
});

test("uses the restaurant's time zone, not the device's", () => {
  // 23:00 UTC on Tuesday is 20:00 in São Paulo (open) but 00:00 Wednesday in Lisbon.
  const s = getOpenStatus(HOURS, TZ, new Date('2026-11-03T23:00:00Z'));
  assert.equal(s.state, 'open');
  assert.equal(getOpenStatus(HOURS, 'Europe/Lisbon', new Date('2026-11-03T23:00:00Z')).state, 'closing-soon');
});

test('no shifts at all → closed with no next opening', () => {
  const empty = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
  const s = getOpenStatus(empty, TZ, new Date());
  assert.equal(s.state, 'closed');
  assert.equal(s.nextOpen, undefined);
});
