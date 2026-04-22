import { useCallback, useEffect, useRef, useState } from 'react'
import { playPhaseSound, triggerVibration } from '../lib/sounds'

export type PhaseLabel = 'READY' | 'PREP' | 'HOLD' | 'RELAX' | 'DONE'

export interface Routine {
  id: string
  name: string
  holdTime: number
  relaxTime: number
  reps: number
}

export interface KegelTimerView {
  phase: PhaseLabel
  remaining: number
  /** 1..totalReps (same as legacy “rep round”) */
  repDisplay: number
  totalReps: number
  /** 1 = first hold, 2 = first rest, 3 = second hold, … (advances every hold/rest) */
  subStep: number
  subTotal: number
  instruction: string
  /** 0..1 within the current sub-phase (smooth) */
  progress01: number
  blinkLastThree: boolean
  isHolding: boolean
  subPhase: 'hold' | 'relax' | 'prep' | 'idle'
}

const idle: KegelTimerView = {
  phase: 'READY',
  remaining: 0,
  repDisplay: 0,
  totalReps: 0,
  subStep: 0,
  subTotal: 0,
  instruction: 'Select a routine, then start.',
  progress01: 0,
  blinkLastThree: false,
  isHolding: true,
  subPhase: 'idle',
}

function paintExercise(params: {
  isHolding: boolean
  phaseDuration: number
  elapsed: number
  subStep: number
  r: Routine
}): KegelTimerView {
  const { isHolding, phaseDuration, elapsed, subStep, r } = params
  const t = Math.max(0, Math.min(phaseDuration, elapsed))
  const remF = Math.max(0, phaseDuration - t)
  const remaining = Math.max(0, Math.ceil(remF - 1e-9))
  const progress01 = phaseDuration > 0 ? t / phaseDuration : 0
  const subTotal = 2 * r.reps
  return {
    phase: isHolding ? 'HOLD' : 'RELAX',
    remaining,
    repDisplay: Math.min(r.reps, Math.max(1, Math.ceil(subStep / 2))),
    totalReps: r.reps,
    subStep,
    subTotal,
    instruction: isHolding ? 'Contract your pelvic floor muscles' : 'Relax your muscles',
    progress01: Math.min(1, progress01),
    blinkLastThree: remaining > 0 && remaining <= 3,
    isHolding,
    subPhase: isHolding ? 'hold' : 'relax',
  }
}

const doneView = (r: Routine): KegelTimerView => ({
  phase: 'DONE',
  remaining: 0,
  repDisplay: r.reps,
  totalReps: r.reps,
  subStep: 2 * r.reps,
  subTotal: 2 * r.reps,
  instruction: 'Well done! Session complete.',
  progress01: 1,
  blinkLastThree: false,
  isHolding: true,
  subPhase: 'idle',
})

export function useKegelTimer() {
  const [view, setView] = useState<KegelTimerView>(idle)
  const mainRafRef = useRef<number | null>(null)
  const prepRafRef = useRef<number | null>(null)
  const loopStopRef = useRef<() => void>(() => {})

  const clearMain = useCallback(() => {
    loopStopRef.current()
    if (mainRafRef.current != null) {
      cancelAnimationFrame(mainRafRef.current)
      mainRafRef.current = null
    }
  }, [])

  const clearPrepRaf = useCallback(() => {
    if (prepRafRef.current != null) {
      cancelAnimationFrame(prepRafRef.current)
      prepRafRef.current = null
    }
  }, [])

  const clearAll = useCallback(() => {
    clearMain()
    clearPrepRaf()
  }, [clearMain, clearPrepRaf])

  const stop = useCallback(() => {
    clearAll()
    setView(idle)
  }, [clearAll])

  const start = useCallback(
    (r: Routine, audioEnabled: boolean, hapticEnabled: boolean) => {
      clearAll()

      const prepStart = performance.now()
      setView({
        phase: 'PREP',
        remaining: 3,
        repDisplay: 1,
        totalReps: r.reps,
        subStep: 0,
        subTotal: 2 * r.reps,
        instruction: 'Get ready...',
        progress01: 0,
        blinkLastThree: false,
        isHolding: true,
        subPhase: 'prep',
      })
      playPhaseSound(true, audioEnabled)
      triggerVibration(100, hapticEnabled)

      const tickPrep = () => {
        const e = (performance.now() - prepStart) / 1000
        if (e >= 3) {
          clearPrepRaf()
          runMainLoop(r, audioEnabled, hapticEnabled, setView, mainRafRef, loopStopRef)
          return
        }
        const rem = Math.max(0, Math.ceil(3 - e - 1e-9))
        const pr = Math.min(1, e / 3)
        setView({
          phase: 'PREP',
          remaining: rem,
          repDisplay: 1,
          totalReps: r.reps,
          subStep: 0,
          subTotal: 2 * r.reps,
          instruction: 'Get ready...',
          progress01: pr,
          blinkLastThree: false,
          isHolding: true,
          subPhase: 'prep',
        })
        prepRafRef.current = requestAnimationFrame(tickPrep)
      }
      prepRafRef.current = requestAnimationFrame(tickPrep)
    },
    [clearAll, clearPrepRaf]
  )

  useEffect(() => () => clearAll(), [clearAll])

  return { view, start, stop }
}

/** ~30fps view updates during hold/rest — enough for the ring; cuts React work roughly in half vs 60fps rAF. */
const MAIN_LOOP_SETVIEW_STRIDE = 2

function runMainLoop(
  r: Routine,
  audioEnabled: boolean,
  hapticEnabled: boolean,
  setView: React.Dispatch<React.SetStateAction<KegelTimerView>>,
  mainRafRef: React.MutableRefObject<number | null>,
  loopStopRef: React.MutableRefObject<() => void>
) {
  let isHolding = true
  let count = 0
  let phaseDuration = r.holdTime
  let segmentStart = performance.now()
  /** 1 = first hold, 2 = first rest, 3 = second hold, … */
  let subStep = 1
  let setViewFrame = 0

  let stopped = false
  const stopLoop = () => {
    stopped = true
  }
  loopStopRef.current = stopLoop

  const tick = () => {
    if (stopped) return
    const now = performance.now()
    let tInPhase = (now - segmentStart) / 1000
    let guard = 0
    let phaseAdvanced = false

    while (tInPhase >= phaseDuration && guard < 32) {
      phaseAdvanced = true
      guard += 1
      const prevDur = phaseDuration
      isHolding = !isHolding
      subStep += 1
      if (guard === 1) {
        playPhaseSound(isHolding, audioEnabled)
        triggerVibration(isHolding ? 200 : 100, hapticEnabled)
      }
      segmentStart += prevDur * 1000
      tInPhase = (now - segmentStart) / 1000

      if (isHolding) {
        count += 1
        phaseDuration = r.holdTime
        if (count >= r.reps) {
          if (mainRafRef.current != null) {
            cancelAnimationFrame(mainRafRef.current)
            mainRafRef.current = null
          }
          setView(doneView(r))
          triggerVibration(300, hapticEnabled)
          return
        }
      } else {
        phaseDuration = r.relaxTime
      }
    }

    const next = paintExercise({
      isHolding,
      phaseDuration,
      elapsed: tInPhase,
      subStep,
      r,
    })
    if (phaseAdvanced || setViewFrame % MAIN_LOOP_SETVIEW_STRIDE === 0) {
      setView(next)
    }
    setViewFrame += 1
    mainRafRef.current = requestAnimationFrame(tick)
  }

  segmentStart = performance.now()
  mainRafRef.current = requestAnimationFrame(tick)
}
