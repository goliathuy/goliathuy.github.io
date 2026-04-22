const KEYS = { todayCount: 'todayCount', streak: 'streak', lastDate: 'lastDate' } as const

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

export function loadProgress(): { todayCount: number; streak: number } {
  ensureDefaults()
  const tc = parseInt(localStorage.getItem(KEYS.todayCount) || '0', 10)
  const s = parseInt(localStorage.getItem(KEYS.streak) || '0', 10)
  return {
    todayCount: Number.isNaN(tc) ? 0 : tc,
    streak: Number.isNaN(s) ? 0 : s,
  }
}

/**
 * Match legacy `script.js` / `kegel-timer.html` behavior.
 */
export function logSessionLegacy(): { todayCount: number; streak: number } {
  const today = new Date().toDateString()
  let { todayCount, streak } = loadProgress()
  todayCount += 1
  const lastDate = localStorage.getItem(KEYS.lastDate)
  if (lastDate !== today) {
    streak += 1
    localStorage.setItem(KEYS.streak, String(streak))
    localStorage.setItem(KEYS.lastDate, today)
  }
  localStorage.setItem(KEYS.todayCount, String(todayCount))
  return { todayCount, streak }
}
