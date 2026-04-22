import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, BookOpen, Check, Dumbbell, Plus, Timer, Volume2, Smartphone, X } from 'lucide-react'
import { useKegelTimer, type Routine } from './hooks/useKegelTimer'
import { BUILTIN_ROUTINES, DEFAULT_CUSTOM } from './constants/routines'
import { LearnView } from './content/learnContent'
import { loadProgress, logSessionLegacy } from './lib/progressStorage'

type Tab = 'workout' | 'learn' | 'progress'

const C = 2 * Math.PI * 160

function TimerRing({ progress01, holdPhase }: { progress01: number; holdPhase: boolean }) {
  const offset = C * (1 - Math.min(1, progress01))
  return (
    <svg className="w-[min(100vw-3rem,22rem)] h-[min(100vw-3rem,22rem)] -rotate-90" viewBox="0 0 360 360">
      <circle cx="180" cy="180" r="160" fill="none" stroke="var(--color-kegel-border)" strokeWidth="14" />
      <motion.circle
        cx="180"
        cy="180"
        r="160"
        fill="none"
        stroke={holdPhase ? 'var(--color-kegel-primary)' : 'var(--color-kegel-secondary)'}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={C}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('workout')
  const { view, start, stop } = useKegelTimer()
  const [currentRoutine, setCurrentRoutine] = useState<Routine>(BUILTIN_ROUTINES[0])
  const [custom, setCustom] = useState<Routine>(DEFAULT_CUSTOM)
  const [audio, setAudio] = useState(true)
  const [haptic, setHaptic] = useState(true)
  const [progress, setProgress] = useState({ todayCount: 0, streak: 0 })
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  const running = view.phase === 'PREP' || view.phase === 'HOLD' || view.phase === 'RELAX'
  const canPickRoutine = view.phase === 'READY' || view.phase === 'DONE'
  const showRing =
    view.phase === 'PREP' || view.phase === 'HOLD' || view.phase === 'RELAX' || view.phase === 'READY' || view.phase === 'DONE'

  const onStart = useCallback(() => {
    start(currentRoutine, audio, haptic)
  }, [start, currentRoutine, audio, haptic])

  const onLog = useCallback(() => {
    setProgress(logSessionLegacy())
  }, [])

  return (
    <div className="min-h-dvh flex flex-col max-w-3xl mx-auto w-full">
      <header className="shrink-0 border-b border-kegel-border bg-kegel-white/90 backdrop-blur px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Dumbbell className="w-7 h-7 text-kegel-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="font-headline text-lg font-bold text-kegel-on truncate">Kegel timer</h1>
            <p className="text-xs text-kegel-muted truncate">Pelvic floor sessions</p>
          </div>
        </div>
        <a href="../index.html" className="text-xs font-medium text-kegel-primary hover:underline shrink-0">
          Portfolio
        </a>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {tab === 'workout' && (
          <div className="space-y-6">
            <div className="bg-kegel-white rounded-3xl border border-kegel-border p-6 flex flex-col items-center shadow-sm">
              <div className="relative flex items-center justify-center">
                {showRing && (
                  <TimerRing
                    progress01={
                      view.phase === 'PREP' ? (3 - view.remaining) / 3 : view.progress01
                    }
                    holdPhase={view.phase === 'HOLD' || view.phase === 'PREP' || (view.phase === 'DONE' && view.isHolding)}
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                  <p className="text-xs font-bold tracking-widest text-kegel-muted uppercase mb-1">
                    {view.phase === 'READY' && 'Ready'}
                    {view.phase === 'PREP' && 'Prep'}
                    {view.phase === 'HOLD' && 'Hold'}
                    {view.phase === 'RELAX' && 'Relax'}
                    {view.phase === 'DONE' && 'Done'}
                  </p>
                  <p
                    className={`font-headline text-5xl sm:text-6xl font-extrabold text-kegel-primary ${
                      (view.blinkLastThree && running) || view.phase === 'PREP' ? 'animate-pulse' : ''
                    }`}
                    aria-live="polite"
                  >
                    {view.phase === 'READY' && '—'}
                    {view.phase === 'PREP' && view.remaining}
                    {view.phase === 'HOLD' && view.remaining}
                    {view.phase === 'RELAX' && view.remaining}
                    {view.phase === 'DONE' && '✓'}
                  </p>
                  {running && (
                    <p className="mt-2 text-sm font-semibold text-kegel-secondary">
                      Rep {view.repDisplay} / {view.totalReps}
                    </p>
                  )}
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
                      type="button"
                      onClick={() => setShowCustom(true)}
                      className="w-full flex items-center gap-2 p-3 rounded-2xl border border-dashed border-kegel-border text-left text-sm font-headline font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Custom routine
                    </button>
                  </div>
                )}

                {!running && (view.phase === 'READY' || view.phase === 'DONE') && (
                  <button
                    type="button"
                    onClick={onStart}
                    className="w-full py-4 rounded-2xl bg-kegel-primary text-white font-headline text-lg font-bold shadow-md hover:opacity-90"
                  >
                    {view.phase === 'DONE' ? 'Start again' : 'Start session'}
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
                <div className="flex items-center gap-2 text-sm">
                  <Volume2 className="w-4 h-4 text-kegel-muted" />
                  <span>Sound</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={audio}
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
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4 text-kegel-muted" />
                  <span>Vibration</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={haptic}
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
          </div>
        )}

        {tab === 'learn' && <LearnView />}

        {tab === 'progress' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-kegel-white rounded-2xl border border-kegel-border p-6 text-center">
              <p className="text-4xl font-headline font-bold text-kegel-on">{progress.todayCount}</p>
              <p className="text-sm text-kegel-muted">Sessions logged today</p>
            </div>
            <div className="bg-kegel-white rounded-2xl border border-kegel-border p-6 text-center">
              <p className="text-4xl font-headline font-bold text-kegel-secondary">{progress.streak}</p>
              <p className="text-sm text-kegel-muted">Day streak (legacy rules)</p>
            </div>
            <button
              type="button"
              onClick={onLog}
              className="w-full py-3 rounded-2xl bg-kegel-secondary text-white font-headline font-semibold"
            >
              Log completed session
            </button>
            <p className="text-xs text-kegel-muted text-center">
              Same keys as the classic app: <code className="bg-kegel-surface px-1 rounded">todayCount</code>,{' '}
              <code className="bg-kegel-surface px-1 rounded">streak</code>, <code className="bg-kegel-surface px-1 rounded">lastDate</code>
            </p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-kegel-border bg-kegel-white/95 backdrop-blur z-20 safe-area-pb">
        <div className="max-w-3xl mx-auto flex">
          {(
            [
              { id: 'workout' as const, label: 'Workout', icon: Timer },
              { id: 'learn' as const, label: 'Learn', icon: BookOpen },
              { id: 'progress' as const, label: 'Progress', icon: Activity },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold ${
                tab === id ? 'text-kegel-primary' : 'text-kegel-muted'
              }`}
            >
              <Icon className="w-6 h-6 mb-0.5" />
              {label}
            </button>
          ))}
        </div>
      </nav>

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
                <h2 className="font-headline text-lg font-bold">Custom routine</h2>
                <button type="button" onClick={() => setShowCustom(false)} className="p-2 rounded-full hover:bg-kegel-surface" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  setCurrentRoutine({ ...custom, id: 'custom', name: 'Custom' })
                  setShowCustom(false)
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
