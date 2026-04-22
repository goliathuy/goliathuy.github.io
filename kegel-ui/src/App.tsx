import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Activity, BookOpen, Dumbbell, Timer } from 'lucide-react'
import { loadProgress, logSessionLegacy } from './lib/progressStorage'
import WorkoutPanel from './components/WorkoutPanel'

const LearnView = lazy(async () => {
  const m = await import('./content/learnContent')
  return { default: m.LearnView }
})

type Tab = 'workout' | 'learn' | 'progress'

export default function App() {
  const [tab, setTab] = useState<Tab>('workout')
  const [progress, setProgress] = useState({ todayCount: 0, streak: 0 })

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  useEffect(() => {
    if (tab === 'progress') {
      setProgress(loadProgress())
    }
  }, [tab])

  const onLog = useCallback((opts?: { goToProgress?: boolean }) => {
    setProgress(logSessionLegacy())
    if (opts?.goToProgress) {
      setTab('progress')
    }
  }, [])

  return (
    <div className="min-h-dvh flex flex-col max-w-3xl mx-auto w-full">
      <header className="shrink-0 border-b border-kegel-border bg-kegel-white/90 backdrop-blur px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Dumbbell className="w-7 h-7 text-kegel-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="font-headline text-lg font-bold text-kegel-on truncate">Kegel timer</h1>
            <p className="text-xs text-kegel-muted truncate">
              Today {progress.todayCount} · Streak {progress.streak}
            </p>
          </div>
        </div>
        <a href="../index.html" className="text-xs font-medium text-kegel-primary hover:underline shrink-0">
          Portfolio
        </a>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div hidden={tab !== 'workout'}>
          <WorkoutPanel onLog={onLog} />
        </div>

        {tab === 'learn' && (
          <Suspense
            fallback={
              <div className="max-w-md mx-auto px-4 py-12 text-center text-sm text-kegel-muted" aria-busy="true">
                Loading…
              </div>
            }
          >
            <LearnView />
          </Suspense>
        )}

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
              onClick={() => onLog()}
              className="w-full py-3 rounded-2xl bg-kegel-secondary text-white font-headline font-semibold"
            >
              Log completed session
            </button>
            <p className="text-xs text-kegel-muted text-center leading-relaxed">
              Storage is compatible with the classic app (<code className="bg-kegel-surface px-1 rounded">todayCount</code>,{' '}
              <code className="bg-kegel-surface px-1 rounded">streak</code>, <code className="bg-kegel-surface px-1 rounded">lastDate</code>
              ). This build also uses <code className="bg-kegel-surface px-1 rounded">kegel_sessionDay</code> so “today” resets on a new
              calendar day.
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
    </div>
  )
}
