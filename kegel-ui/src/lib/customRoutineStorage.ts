import { DEFAULT_CUSTOM, type CustomRoutine } from '../constants/routines'

const KEY = 'kegel_customRoutine'

function fromDefault(): CustomRoutine {
  return {
    holdTime: DEFAULT_CUSTOM.holdTime,
    relaxTime: DEFAULT_CUSTOM.relaxTime,
    reps: DEFAULT_CUSTOM.reps,
  }
}

export function loadCustomRoutine(): CustomRoutine {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fromDefault()
    const o = JSON.parse(raw) as { holdTime?: number; relaxTime?: number; reps?: number }
    const hold = Number(o.holdTime)
    const relax = Number(o.relaxTime)
    const reps = Number(o.reps)
    if (!Number.isFinite(hold) || !Number.isFinite(relax) || !Number.isFinite(reps)) {
      return fromDefault()
    }
    return {
      holdTime: Math.min(60, Math.max(1, Math.round(hold))),
      relaxTime: Math.min(60, Math.max(1, Math.round(relax))),
      reps: Math.min(100, Math.max(1, Math.round(reps))),
    }
  } catch {
    return fromDefault()
  }
}

export function saveCustomRoutine(c: CustomRoutine) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ holdTime: c.holdTime, relaxTime: c.relaxTime, reps: c.reps }),
    )
  } catch {
    /* ignore */
  }
}
