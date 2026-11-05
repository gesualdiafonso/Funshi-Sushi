/**
 * Opening-hours status and table, computed in the restaurant's time zone.
 * Hooks:
 *   [data-hours-status]   status line (hero, visit section) — hidden until known
 *   [data-hours-summary]  one-line status in the footer (replaces placeholder)
 *   [data-hours-table]    weekly table (replaces placeholder)
 */

import { DAYS, getOpenStatus } from '../core/hours.js';
import { t } from '../strings.js';
import { on, qsa } from './dom.js';

const REFRESH_MS = 60_000;

/**
 * @param {typeof import('../config.js').CONFIG} config
 * @param {import('../core/features.js').Features} features
 */
export function initHoursView(config, features) {
  if (!features.showOpenStatus) return;
  const dayNames = weekdayNames(config.locale);

  const render = () => {
    const status = getOpenStatus(config.hours, config.timeZone, new Date());
    const text = statusText(status, dayNames);

    for (const el of qsa('[data-hours-status]')) {
      el.replaceChildren(statusElement(status.state, text));
      el.hidden = false;
    }
    for (const el of qsa('[data-hours-summary]')) {
      el.replaceChildren(statusElement(status.state, text));
    }
    for (const el of qsa('[data-hours-table]')) {
      el.replaceChildren(hoursTable(config.hours, status.dayIndex, dayNames));
    }
  };

  render();

  // Keep the status current while the page is visible; pause in background tabs.
  let timer = window.setInterval(render, REFRESH_MS);
  on(document, 'visibilitychange', () => {
    window.clearInterval(timer);
    if (document.visibilityState === 'visible') {
      render();
      timer = window.setInterval(render, REFRESH_MS);
    }
  });
}

/** Localized weekday names, Monday first. */
function weekdayNames(locale) {
  const format = new Intl.DateTimeFormat(locale ?? 'en', { weekday: 'long', timeZone: 'UTC' });
  // 2024-01-01 was a Monday.
  return DAYS.map((_, index) => {
    const name = format.format(new Date(Date.UTC(2024, 0, 1 + index)));
    return name.charAt(0).toLocaleUpperCase(locale ?? 'en') + name.slice(1);
  });
}

/** @param {import('../core/hours.js').OpenStatus} status */
function statusText(status, dayNames) {
  switch (status.state) {
    case 'open':
      return t('hours.open', { time: status.until });
    case 'closing-soon':
      return t('hours.closingSoon', { time: status.until });
    case 'closed': {
      const next = status.nextOpen;
      if (!next) return t('hours.closed');
      if (next.today) return t('hours.closedOpensToday', { time: next.time });
      if (next.tomorrow) return t('hours.closedOpensTomorrow', { time: next.time });
      return t('hours.closedOpensOn', { day: dayNames[DAYS.indexOf(next.day)], time: next.time });
    }
    default:
      return '';
  }
}

function statusElement(state, text) {
  const span = document.createElement('span');
  span.className = 'status';
  span.dataset.state = state;
  span.textContent = text;
  return span;
}

function hoursTable(hours, todayIndex, dayNames) {
  const table = document.createElement('table');
  table.className = 'hours';
  const caption = table.createCaption();
  caption.className = 'visually-hidden';
  caption.textContent = t('hours.caption');
  const body = table.createTBody();

  DAYS.forEach((day, index) => {
    const row = body.insertRow();
    if (index === todayIndex) row.setAttribute('aria-current', 'date');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = dayNames[index];
    const td = row.insertCell();
    const shifts = hours[day] ?? [];
    if (shifts.length === 0) {
      td.textContent = t('hours.closedDay');
      td.className = 'hours__closed';
    } else {
      td.textContent = shifts.map(([open, close]) => `${open}–${close}`).join(t('hours.shiftSeparator'));
    }
    row.prepend(th);
  });
  return table;
}
