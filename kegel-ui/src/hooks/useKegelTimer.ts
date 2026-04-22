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
  repDisplay: number
  totalReps: number
  instruction: string
  /** Remaining time fraction: 0 = full, 1 = end (depleted) for ring */
  progress01: number
  blinkLastThree: boolean
  isHolding: boolean
}

const idle: KegelTimerView = {
  phase: 'READY',
  remaining: 0,
  repDisplay: 0,
  totalReps: 0,
  instruction: 'Select a routine, then start.',
  progress01: 0,
  blinkLastThree: false,
  isHolding: true,
}

function paintExercise(params: {
  isHolding: boolean
  count: number
  phaseDuration: number
  phaseSeconds: number
  r: Routine
}): KegelTimerView {
  const { isHolding, count, phaseDuration, phaseSeconds, r } = params
  const rem = Math.max(0, phaseDuration - phaseSeconds)
  const frac = phaseDuration > 0 ? phaseSeconds / phaseDuration : 0
  return {
    phase: isHolding ? 'HOLD' : 'RELAX',
    remaining: rem,
    repDisplay: count + 1,
    totalReps: r.reps,
    instruction: isHolding ? 'Contract your pelvic floor muscles' : 'Relax your muscles',
    progress01: Math.min(1, frac),
    blinkLastThree: rem <= 3 && rem > 0,
    isHolding,
  }
}

const doneView = (r: Routine): KegelTimerView => ({
  phase: 'DONE',
  remaining: 0,
  repDisplay: r.reps,
  totalReps: r.reps,
  instruction: 'Well done! Session complete.',
  progress01: 1,
  blinkLastThree: false,
  isHolding: true,
})

/**
 * Port of `goliathuy.github.io/script.js` `startKegelExercise` + `runExerciseRoutine`.
 */
export function useKegelTimer() {
  const [view, setView] = useState<KegelTimerView>(idle)
  const mainIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearMain = useCallback(() => {
    if (mainIntervalRef.current) {
      clearInterval(mainIntervalRef.current)
      mainIntervalRef.current = null
    }
  }, [])

  const clearPrep = useCallback(() => {
    if (prepIntervalRef.current) {
      clearInterval(prepIntervalRef.current)
      prepIntervalRef.current = null
    }
  }, [])

  const clearAll = useCallback(() => {
    clearMain()
    clearPrep()
  }, [clearMain, clearPrep])

  const stop = useCallback(() => {
    clearAll()
    setView(idle)
  }, [clearAll])

  const start = useCallback(
    (r: Routine, audioEnabled: boolean, hapticEnabled: boolean) => {
      clearAll()

      let prepTime = 3
      setView({
        phase: 'PREP',
        remaining: 3,
        repDisplay: 1,
        totalReps: r.reps,
        instruction: 'Get ready...',
        progress01: 0,
        blinkLastThree: false,
        isHolding: true,
      })
      playPhaseSound(true, audioEnabled)
      triggerVibration(100, hapticEnabled)

      prepIntervalRef.current = setInterval(() => {
        prepTime -= 1
        if (prepTime > 0) {
          setView({
            phase: 'PREP',
            remaining: prepTime,
            repDisplay: 1,
            totalReps: r.reps,
            instruction: 'Get ready...',
            progress01: (3 - prepTime) / 3,
            blinkLastThree: false,
            isHolding: true,
          })
          playPhaseSound(true, audioEnabled)
          triggerVibration(100, hapticEnabled)
        } else {
          clearPrep()
          runMainLoop(r, audioEnabled, hapticEnabled, setView, mainIntervalRef)
        }
      }, 1000)
    },
    [clearAll, clearPrep]
  )

  useEffect(() => () => clearAll(), [clearAll])

  return { view, start, stop }
}

function runMainLoop(
  r: Routine,
  audioEnabled: boolean,
  hapticEnabled: boolean,
  setView: React.Dispatch<React.SetStateAction<KegelTimerView>>,
  mainIntervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
) {
  let phaseSeconds = 0
  let phaseDuration = r.holdTime
  let isHolding = true
  let count = 0

  const tick = () => {
    setView(
      paintExercise({
        isHolding,
        count,
        phaseDuration,
        phaseSeconds,
        r,
      })
    )
  }

  tick()

  mainIntervalRef.current = setInterval(() => {
    phaseSeconds += 1
    setView(
      paintExercise({
        isHolding,
        count,
        phaseDuration,
        phaseSeconds,
        r,
      })
    )

    if (phaseSeconds >= phaseDuration) {
      phaseSeconds = 0
      isHolding = !isHolding
      playPhaseSound(isHolding, audioEnabled)
      triggerVibration(isHolding ? 200 : 100, hapticEnabled)

      if (isHolding) {
        count += 1
        phaseDuration = r.holdTime
        if (count >= r.reps) {
          if (mainIntervalRef.current) {
            clearInterval(mainIntervalRef.current)
            mainIntervalRef.current = null
          }
          setView(doneView(r))
          triggerVibration(300, hapticEnabled)
          return
        }
      } else {
        phaseDuration = r.relaxTime
      }
      setView(
        paintExercise({
          isHolding,
          count,
          phaseDuration,
          phaseSeconds: 0,
          r,
        })
      )
    }
  }, 1000)
}
