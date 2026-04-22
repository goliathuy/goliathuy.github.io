const KEYS = {
  todayCount: 'todayCount',
  streak: 'streak',
  lastDate: 'lastDate',
  /** Date string (toDateString) that `todayCount` is valid for. New in React app. */
  sessionDay: 'kegel_sessionDay',
} as const

function todayString(): string {
  return new Date().toDateString()
}

function ensureDefaults() {
  try {
    if (localStorage.getItem(KEYS.todayCount) == null) {
      localStorage.setItem(KEYS.todayCount, '0')
    }
    if (localStorage.getItem(KEYS.streak) == null) {
      localStorage.setItem(KEYS.streak, '0')
    }
  } catch {
    /* ignore */
  }
}

/**
 * If `lastDate` is a calendar day before "yesterday", the streak in storage is
 * from an abandoned chain — same idea as a stricter "missed days" rule.
 * Does not run if `lastDate` is missing (first-time users).
 */
function resetStaleStreak() {
  try {
    const last = localStorage.getItem(KEYS.lastDate)
    if (!last) return
    const lastTime = new Date(last).getTime()
    if (Number.isNaN(lastTime)) return
    const today0 = new Date()
    today0.setHours(0, 0, 0, 0)
    const y = new Date(today0)
    y.setDate(y.getDate() - 1)
    const yStr = y.toDateString()
    if (last !== todayString() && last !== yStr) {
      localStorage.setItem(KEYS.streak, '0')
    }
  } catch {
    /* ignore */
  }
}

/**
 * `todayCount` in localStorage is only meaningful for one calendar day.
 * Sync when the day changes (classic app only keyed count, not the day).
 */
function syncTodayCountToCalendar() {
  const today = todayString()
  const storedDay = localStorage.getItem(KEYS.sessionDay)
  if (storedDay === today) return

  if (storedDay == null) {
    // First open with new app / key missing: migrate from classic storage
    const last = localStorage.getItem(KEYS.lastDate)
    if (last && last !== today) {
      // Last session was not today; "today" count from classic was not date-scoped — reset
      localStorage.setItem(KEYS.todayCount, '0')
    }
  } else {
    // New calendar day since we last opened the app
    localStorage.setItem(KEYS.todayCount, '0')
  }
  localStorage.setItem(KEYS.sessionDay, today)
}

export function loadProgress(): { todayCount: number; streak: number } {
  ensureDefaults()
  syncTodayCountToCalendar()
  resetStaleStreak()
  const tc = parseInt(localStorage.getItem(KEYS.todayCount) || '0', 10)
  const s = parseInt(localStorage.getItem(KEYS.streak) || '0', 10)
  return {
    todayCount: Number.isNaN(tc) ? 0 : tc,
    streak: Number.isNaN(s) ? 0 : s,
  }
}

/**
 * Match legacy `script.js` / `kegel-timer.html` logging rules, plus
 * `kegel_sessionDay` so "sessions today" stays accurate across days.
 */
export function logSessionLegacy(): { todayCount: number; streak: number } {
  const today = todayString()
  let { todayCount, streak } = loadProgress()
  todayCount += 1
  const lastDate = localStorage.getItem(KEYS.lastDate)
  if (lastDate !== today) {
    streak += 1
    localStorage.setItem(KEYS.streak, String(streak))
    localStorage.setItem(KEYS.lastDate, today)
  }
  localStorage.setItem(KEYS.todayCount, String(todayCount))
  localStorage.setItem(KEYS.sessionDay, today)
  return { todayCount, streak }
}
