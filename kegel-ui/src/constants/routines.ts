import type { Routine } from '../hooks/useKegelTimer'

export const BUILTIN_ROUTINES: Routine[] = [
  { id: 'basic', name: 'Basic Routine', holdTime: 5, relaxTime: 5, reps: 10 },
  { id: 'long', name: 'Long Holds', holdTime: 10, relaxTime: 10, reps: 10 },
  { id: 'quick', name: 'Quick Reps', holdTime: 1, relaxTime: 1, reps: 20 },
]

export const DEFAULT_CUSTOM: Routine = {
  id: 'custom',
  name: 'Custom',
  holdTime: 5,
  relaxTime: 5,
  reps: 10,
}
