import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Plus, Volume2, Smartphone, X } from 'lucide-react'
import { useKegelTimer, type Routine } from '../hooks/useKegelTimer'
import { BUILTIN_ROUTINES, type CustomRoutine } from '../constants/routines'
import { loadCustomRoutine, saveCustomRoutine } from '../lib/customRoutineStorage'

const C = 2 * Math.PI * 160
const FILL_VISUAL_COMPLETE_AT = 0.96
const COUNTDOWN_MIN_SEC = 10

function squeezeAnimationDurationSec(holdTimeSec: number): number {
  return Math.min(Math.max(holdTimeSec, 0.45), 8)
}

const TimerRing = memo(function TimerRing({
  progress01,
  holdPhase,
  prepPhase,
  isExercisePhase,
}: {
  progress01: number
  holdPhase: boolean
  prepPhase: boolean
  isExercisePhase: boolean
}) {
  const phaseProgress = Math.min(1, Math.max(0, progress01))
  const offset = prepPhase ? C : C * (1 - phaseProgress)
  const isRelaxPhase = isExercisePhase && !holdPhase && !prepPhase
  const fillLevel = holdPhase
    ? Math.min(1, progress01 / FILL_VISUAL_COMPLETE_AT)
    : Math.max(0, 1 - progress01 / FILL_VISUAL_COMPLETE_AT)
  const visibleFillLevel = prepPhase || !isExercisePhase ? 0 : fillLevel
  const fillHeight = 290 * visibleFillLevel
  const fillY = 325 - fillHeight
  const showActiveArc = isExercisePhase && !prepPhase && !isRelaxPhase
  const showMarker = isExercisePhase && !prepPhase
  const markerProgress = isRelaxPhase ? 0 : phaseProgress
  const markerAngle = 360 * markerProgress
  const markerX = 180 + 160 * Math.cos((markerAngle * Math.PI) / 180)
  const markerY = 180 + 160 * Math.sin((markerAngle * Math.PI) / 180)

  const prepLastSecT = prepPhase ? Math.min(1, Math.max(0, phaseProgress * 3 - 2)) : 0
  const prepMarkerEndX = 340
  const prepMarkerEndY = 180
  const prepMarkerX = 180 + (prepMarkerEndX - 180) * prepLastSecT
  const prepMarkerY = 180 + (prepMarkerEndY - 180) * prepLastSecT
  const prepMarkerR = 7 * prepLastSecT
  const showPrepMarker = prepLastSecT > 0
  const dotCx = showPrepMarker ? prepMarkerX : markerX
  const dotCy = showPrepMarker ? prepMarkerY : markerY
  const dotR = showPrepMarker ? prepMarkerR : 7
  const dotOpacity = showPrepMarker ? prepLastSecT : showMarker ? 1 : 0
  const dotPlopScale =
    showPrepMarker && prepLastSecT >= 0.85
      ? 1 + 0.24 * Math.sin(Math.min(1, (prepLastSecT - 0.85) / 0.15) * Math.PI)
      : 1

  return (
    <svg className="w-full max-w-[22rem] aspect-square shrink-0 -rotate-90" viewBox="0 0 360 360">
      <defs>
        <linearGradient id="timer-active-gradient" x1="20" y1="180" x2="340" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D8CFF" />
          <stop offset="100%" stopColor="#3B63E6" />
        </linearGradient>
        <filter id="timer-active-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="timer-fill-clip">
          <rect x="35" y={fillY} width="290" height={fillHeight} />
        </clipPath>
      </defs>
      <circle
        cx="180"
        cy="180"
        r="145"
        fill="var(--color-kegel-secondary)"
        fillOpacity="0.35"
        clipPath="url(#timer-fill-clip)"
      />
      <circle
        cx="180"
        cy="180"
        r="160"
        fill="none"
        stroke="#e3e5f6"
        strokeWidth="16"
        className={prepPhase ? 'animate-pulse' : ''}
      />
      <circle
        cx="180"
        cy="180"
        r="160"
        fill="none"
        stroke="url(#timer-active-gradient)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        filter="url(#timer-active-glow)"
        className={showActiveArc ? 'opacity-100' : 'opacity-0'}
      />
      <circle
        cx="180"
        cy="180"
        r="160"
        fill="none"
        stroke="url(#timer-active-gradient)"
        strokeWidth="16"
        className={isRelaxPhase ? 'opacity-100' : 'opacity-0'}
      />
      <circle
        cx="180"
        cy="180"
        r="160"
        fill="none"
        stroke="#e3e5f6"
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        className={isRelaxPhase ? 'opacity-100' : 'opacity-0'}
      />
      <g transform={`translate(${dotCx}, ${dotCy}) scale(${dotPlopScale}) translate(${-dotCx}, ${-dotCy})`}>
        <circle
          cx={dotCx}
          cy={dotCy}
          r={dotR}
          fill="#3B63E6"
          stroke="#f7f8ff"
          strokeWidth="4"
          opacity={dotOpacity}
        />
      </g>
    </svg>
  )
})

const PREP_HANDOFF_BOOST = 1.07

type WorkoutPanelProps = {
  onLog: (opts?: { goToProgress?: boolean }) => void
}

function WorkoutPanelContent({ onLog }: WorkoutPanelProps) {
  const { view, start, stop } = useKegelTimer()
  const [currentRoutine, setCurrentRoutine] = useState<Routine>(BUILTIN_ROUTINES[0])
  const [custom, setCustom] = useState<CustomRoutine>(() => loadCustomRoutine())
  const [audio, setAudio] = useState(true)
  const [haptic, setHaptic] = useState(true)
  const [showCustom, setShowCustom] = useState(false)
  const customTriggerRef = useRef<HTMLButtonElement>(null)

  const closeCustom = useCallback(() => {
    setShowCustom(false)
    queueMicrotask(() => customTriggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!showCustom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCustom()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCustom, closeCustom])

  const running = view.phase === 'PREP' || view.phase === 'HOLD' || view.phase === 'RELAX'
  const canPickRoutine = view.phase === 'READY' || view.phase === 'DONE'
  const showRing =
    view.phase === 'PREP' ||
    view.phase === 'HOLD' ||
    view.phase === 'RELAX' ||
    view.phase === 'READY' ||
    view.phase === 'DONE'
  const showCenterStart = view.phase === 'READY'

  const showExerciseCountdown =
    (view.phase === 'HOLD' && currentRoutine.holdTime > COUNTDOWN_MIN_SEC) ||
    (view.phase === 'RELAX' && currentRoutine.relaxTime > COUNTDOWN_MIN_SEC)
  const showCenterPhaseWord =
    running && view.subStep > 0 && (view.phase === 'HOLD' || view.phase === 'RELAX')
  const showCenterGlyph = (view.phase === 'READY' && !showCenterStart) || view.phase === 'DONE'

  const prepLastSecT =
    view.phase === 'PREP' ? Math.min(1, Math.max(0, view.progress01 * 3 - 2)) : 0

  const prepGlowScale =
    view.phase === 'PREP' ? 1 + (PREP_HANDOFF_BOOST - 1) * prepLastSecT : PREP_HANDOFF_BOOST

  const phaseT = Math.min(1, Math.max(0, view.progress01 / FILL_VISUAL_COMPLETE_AT))
  const squeezeInner =
    view.phase === 'HOLD' ? 1 - 0.18 * phaseT : view.phase === 'RELAX' ? 0.82 + 0.18 * phaseT : 1
  const workoutGlowScale =
    view.phase === 'HOLD' || view.phase === 'RELAX' ? PREP_HANDOFF_BOOST * squeezeInner : PREP_HANDOFF_BOOST

  const onStart = useCallback(() => {
    start(currentRoutine, audio, haptic)
  }, [start, currentRoutine, audio, haptic])

  return (
    <div className="space-y-6">
      <div className="bg-kegel-white rounded-3xl border border-kegel-border p-6 flex flex-col items-center shadow-sm">
        <div
          className={`flex flex-col items-center w-full max-w-[22rem] mx-auto ${running ? 'ring-glow-host' : ''}`}
        >
          {running && (
            <>
              <div
                className={`ring-glow-layer ring-glow-workout ${
                  view.phase === 'HOLD' || view.phase === 'RELAX' ? 'opacity-100' : 'opacity-0'
                }`}
                style={
                  {
                    '--workout-glow-scale': String(
                      view.phase === 'HOLD' || view.phase === 'RELAX' ? workoutGlowScale : PREP_HANDOFF_BOOST,
                    ),
                  } as CSSProperties
                }
                aria-hidden
              />
              <div
                className={`ring-glow-layer ring-glow-prep ${view.phase === 'PREP' ? 'opacity-100' : 'opacity-0'}`}
                style={{ '--prep-glow-scale': String(prepGlowScale) } as CSSProperties}
                aria-hidden
              />
            </>
          )}
          <div className="relative flex items-center justify-center ring-stack">
            {running && <div className="ring-inner-occluder" aria-hidden />}
            {showRing && (
              <div className="relative z-10 pointer-events-none">
                <TimerRing
                  progress01={view.progress01}
                  holdPhase={view.phase === 'HOLD'}
                  prepPhase={view.phase === 'PREP'}
                  isExercisePhase={view.phase === 'HOLD' || view.phase === 'RELAX'}
                />
              </div>
            )}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-2">
              {showCenterStart ? null : showCenterPhaseWord ? (
                <p
                  className={`font-headline text-4xl sm:text-5xl font-extrabold text-kegel-primary tracking-wide leading-none inline-block ${
                    view.subPhase === 'hold' ? 'text-squeeze-animate' : ''
                  }`}
                  style={
                    view.subPhase === 'hold'
                      ? { animationDuration: `${squeezeAnimationDurationSec(currentRoutine.holdTime)}s` }
                      : undefined
                  }
                  aria-live="polite"
                >
                  {view.subPhase === 'hold' ? 'Squeeze' : 'Rest'}
                </p>
              ) : showCenterGlyph ? (
                <p className="font-headline text-8xl sm:text-9xl font-extrabold text-kegel-primary" aria-live="polite">
                  {view.phase === 'READY' && '—'}
                  {view.phase === 'DONE' && '✓'}
                </p>
              ) : running && view.phase === 'PREP' ? (
                <div
                  className="flex flex-col items-center justify-center min-h-[7rem] sm:min-h-[8rem] max-w-[17rem] px-1"
                  aria-live="polite"
                  style={{
                    opacity: 1 - prepLastSecT,
                    transform: `translateY(${-18 * prepLastSecT}px)`,
                  }}
                >
                  <p className="font-headline text-5xl sm:text-6xl font-extrabold text-kegel-primary animate-pulse">
                    {view.remaining}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-kegel-muted">
                    Starting session
                  </p>
                  <p className="font-headline text-sm sm:text-base font-bold text-kegel-on leading-tight mt-0.5">
                    {currentRoutine.name}
                  </p>
                  <p className="text-xs text-kegel-primary font-semibold mt-1.5 leading-snug">
                    {currentRoutine.holdTime}s squeeze · {currentRoutine.relaxTime}s rest · {currentRoutine.reps} reps
                  </p>
                </div>
              ) : running && (view.phase === 'HOLD' || view.phase === 'RELAX') ? (
                <div className="min-h-[7rem] sm:min-h-[8rem]" aria-hidden />
              ) : null}
              {showCenterStart && (
                <button
                  type="button"
                  onClick={onStart}
                  className="mt-2 h-28 w-28 rounded-full border border-kegel-primary/30 bg-gradient-to-b from-kegel-primary to-kegel-primary-dim text-white font-headline text-base font-bold shadow-[0_8px_24px_rgba(0,88,187,0.28)] hover:opacity-95 transition-opacity flex items-center justify-center"
                >
                  Start
                </button>
              )}
              {running && view.subStep > 0 && (
                <div className="absolute inset-x-0 bottom-[4.5rem] text-center px-6">
                  <p className="text-base font-semibold text-kegel-primary">
                    Rep {view.repDisplay} / {view.totalReps}
                  </p>
                  {showExerciseCountdown && (
                    <p
                      className={`mt-1 font-headline text-2xl sm:text-3xl font-extrabold text-kegel-on ${
                        view.blinkLastThree && running ? 'animate-pulse' : ''
                      }`}
                      aria-live="polite"
                    >
                      {view.remaining}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-kegel-on mt-4 max-w-sm leading-relaxed">{view.instruction}</p>

        <div className="w-full max-w-sm mt-6 space-y-3">
          {canPickRoutine && (
            <div className="space-y-2">
              {BUILTIN_ROUTINES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setCurrentRoutine(r)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left text-sm ${
                    currentRoutine.id === r.id
                      ? 'border-kegel-primary bg-[color:var(--color-kegel-surface)] ring-1 ring-kegel-primary/30'
                      : 'border-kegel-border bg-kegel-surface/50'
                  }`}
                >
                  <span className="font-headline font-semibold">{r.name}</span>
                  <span className="text-kegel-muted text-xs">
                    {r.holdTime}s / {r.relaxTime}s × {r.reps}
                  </span>
                  {currentRoutine.id === r.id && <Check className="w-4 h-4 text-kegel-primary" />}
                </button>
              ))}
              <button
                ref={customTriggerRef}
                type="button"
                onClick={() => setShowCustom(true)}
                className="w-full flex items-center gap-2 p-3 rounded-2xl border border-dashed border-kegel-border text-left text-sm font-headline font-semibold"
              >
                <Plus className="w-4 h-4" />
                Custom routine
              </button>
            </div>
          )}

          {view.phase === 'DONE' && (
            <button
              type="button"
              onClick={() => onLog({ goToProgress: true })}
              className="w-full py-4 rounded-2xl bg-kegel-secondary text-white font-headline text-lg font-bold shadow-md hover:opacity-90"
            >
              Log this session to progress
            </button>
          )}
          {!running && view.phase === 'DONE' && (
            <button
              type="button"
              onClick={onStart}
              className="w-full py-4 rounded-2xl bg-kegel-primary text-white font-headline text-lg font-bold shadow-md hover:opacity-90"
            >
              Start again
            </button>
          )}
          {running && (
            <button
              type="button"
              onClick={stop}
              className="w-full py-4 rounded-2xl bg-kegel-on text-white font-headline text-lg font-bold"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="bg-kegel-white rounded-2xl border border-kegel-border p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-kegel-muted">Device feedback</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm" id="kegel-label-sound">
            <Volume2 className="w-4 h-4 text-kegel-muted" />
            <span>Sound</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={audio}
            aria-labelledby="kegel-label-sound"
            onClick={() => setAudio((a) => !a)}
            className={`w-11 h-6 rounded-full relative ${audio ? 'bg-kegel-secondary' : 'bg-kegel-border'}`}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ left: audio ? 22 : 2 }}
            />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm" id="kegel-label-haptic">
            <Smartphone className="w-4 h-4 text-kegel-muted" />
            <span>Vibration</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={haptic}
            aria-labelledby="kegel-label-haptic"
            onClick={() => setHaptic((h) => !h)}
            className={`w-11 h-6 rounded-full relative ${haptic ? 'bg-kegel-secondary' : 'bg-kegel-border'}`}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ left: haptic ? 22 : 2 }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCustom && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-kegel-on/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-kegel-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-lg font-bold" id="kegel-custom-routine-title">
                  Custom routine
                </h2>
                <button
                  type="button"
                  onClick={closeCustom}
                  className="p-2 rounded-full hover:bg-kegel-surface"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                className="space-y-3"
                aria-labelledby="kegel-custom-routine-title"
                onSubmit={(e) => {
                  e.preventDefault()
                  const next: Routine = { ...custom, id: 'custom', name: 'Custom' }
                  saveCustomRoutine(custom)
                  setCurrentRoutine(next)
                  closeCustom()
                }}
              >
                <label className="block text-sm text-kegel-muted">
                  Hold (sec)
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={custom.holdTime}
                    onChange={(e) => setCustom((c) => ({ ...c, holdTime: Number(e.target.value) || 1 }))}
                    className="mt-1 w-full p-2 rounded-xl border border-kegel-border"
                  />
                </label>
                <label className="block text-sm text-kegel-muted">
                  Relax (sec)
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={custom.relaxTime}
                    onChange={(e) => setCustom((c) => ({ ...c, relaxTime: Number(e.target.value) || 1 }))}
                    className="mt-1 w-full p-2 rounded-xl border border-kegel-border"
                  />
                </label>
                <label className="block text-sm text-kegel-muted">
                  Reps
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={custom.reps}
                    onChange={(e) => setCustom((c) => ({ ...c, reps: Number(e.target.value) || 1 }))}
                    className="mt-1 w-full p-2 rounded-xl border border-kegel-border"
                  />
                </label>
                <button type="submit" className="w-full py-3 rounded-xl bg-kegel-primary text-white font-headline font-bold">
                  Use & close
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const WorkoutPanel = memo(WorkoutPanelContent)
export default WorkoutPanel
