/**
 * Safe localStorage wrapper (TECHNICAL_ARCHITECTURE §7.2).
 * Never throws: blocked storage, private mode, quota errors and corrupted
 * JSON all come back as null / false, and callers fall back to memory.
 */

let available = null;

/** @returns {boolean} whether localStorage can be written and read back */
export function isAvailable() {
  if (available !== null) return available;
  try {
    const probe = '__funshi_probe__';
    window.localStorage.setItem(probe, probe);
    available = window.localStorage.getItem(probe) === probe;
    window.localStorage.removeItem(probe);
  } catch {
    available = false;
  }
  return available;
}

/**
 * @param {string} key
 * @returns {unknown} parsed JSON, or null when missing, unreadable or corrupted
 */
export function readJSON(key) {
  if (!isAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @returns {boolean} saved */
export function writeJSON(key, value) {
  if (!isAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** @returns {boolean} removed */
export function remove(key) {
  if (!isAvailable()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
