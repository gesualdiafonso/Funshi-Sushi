/**
 * Opening hours: open/closed status in the RESTAURANT's time zone, whatever
 * the visitor's device time zone is (UX_ARCHITECTURE §5.3).
 * Pure — `now` is passed in. Tested in tests/hours.test.js.
 */

export const DAYS = /** @type {const} */ (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
export const CLOSING_SOON_MINUTES = 30;

const WEEKDAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

/** "19:30" → 1170 */
export function toMinutes(hhmm) {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) throw new Error(`Invalid time "${hhmm}" (use HH:MM)`);
  const [hours, minutes] = [Number(match[1]), Number(match[2])];
  if (hours > 24 || minutes > 59 || (hours === 24 && minutes > 0)) throw new Error(`Invalid time "${hhmm}"`);
  return hours * 60 + minutes;
}

/** 1170 → "19:30" (wraps past midnight) */
export function toHHMM(totalMinutes) {
  const m = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Where `now` falls in the restaurant's week.
 * @param {Date} now
 * @param {string} timeZone IANA name
 * @returns {{ dayIndex: number, minuteOfWeek: number }}
 */
export function weekPosition(now, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  const dayIndex = WEEKDAY_INDEX[get('weekday')];
  const minuteOfDay = Number(get('hour')) * 60 + Number(get('minute'));
  return { dayIndex, minuteOfWeek: dayIndex * MINUTES_PER_DAY + minuteOfDay };
}

/**
 * Turn weekly hours into absolute intervals in minutes from Monday 00:00.
 * A shift whose close ≤ open ends the next day.
 * @param {import('../config.js').WeeklyHours} hours
 * @returns {{ start: number, end: number }[]} sorted by start
 */
export function weeklyIntervals(hours) {
  const intervals = [];
  DAYS.forEach((day, index) => {
    for (const [open, close] of hours[day] ?? []) {
      const start = index * MINUTES_PER_DAY + toMinutes(open);
      let end = index * MINUTES_PER_DAY + toMinutes(close);
      if (end <= start) end += MINUTES_PER_DAY;
      intervals.push({ start, end });
    }
  });
  return intervals.sort((a, b) => a.start - b.start);
}

/**
 * @typedef {Object} OpenStatus
 * @property {'open' | 'closing-soon' | 'closed' | 'unknown'} state
 * @property {string} [until]         Closing time "HH:MM" when open
 * @property {{ day: typeof DAYS[number], time: string, today: boolean, tomorrow: boolean }} [nextOpen]
 * @property {number} dayIndex        Today in the restaurant (0 = Monday)
 */

/**
 * @param {import('../config.js').WeeklyHours | null} hours
 * @param {string | null} timeZone
 * @param {Date} now
 * @returns {OpenStatus}
 */
export function getOpenStatus(hours, timeZone, now) {
  if (!hours || !timeZone) return { state: 'unknown', dayIndex: -1 };
  const { dayIndex, minuteOfWeek } = weekPosition(now, timeZone);
  const intervals = weeklyIntervals(hours);
  if (intervals.length === 0) return { state: 'closed', dayIndex };

  // A Sunday-night shift can run into Monday: check the previous week's copy too.
  for (const { start, end } of intervals) {
    for (const offset of [0, -MINUTES_PER_WEEK]) {
      if (minuteOfWeek >= start + offset && minuteOfWeek < end + offset) {
        const left = end + offset - minuteOfWeek;
        return { state: left <= CLOSING_SOON_MINUTES ? 'closing-soon' : 'open', until: toHHMM(end), dayIndex };
      }
    }
  }

  const upcoming = intervals.find(({ start }) => start > minuteOfWeek) ?? intervals[0];
  const startDay = Math.floor(upcoming.start / MINUTES_PER_DAY);
  return {
    state: 'closed',
    dayIndex,
    nextOpen: {
      day: DAYS[startDay],
      time: toHHMM(upcoming.start),
      today: startDay === dayIndex && upcoming.start > minuteOfWeek,
      tomorrow: startDay === (dayIndex + 1) % 7,
    },
  };
}
