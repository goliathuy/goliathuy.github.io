import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useKegelTimer } from './useKegelTimer'

vi.mock('../lib/sounds', () => ({
  playPhaseSound: vi.fn(),
  triggerVibration: vi.fn(),
}))

const tinyRoutine = {
  id: 't',
  name: 'T',
  holdTime: 1,
  relaxTime: 1,
  reps: 1,
}

describe('useKegelTimer', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts in READY', () => {
    const { result } = renderHook(() => useKegelTimer())
    expect(result.current.view.phase).toBe('READY')
  })

  it('enters PREP after start', () => {
    const { result } = renderHook(() => useKegelTimer())
    act(() => {
      result.current.start(tinyRoutine, false, false)
    })
    expect(result.current.view.phase).toBe('PREP')
  })

  it('returns to READY after stop', () => {
    const { result } = renderHook(() => useKegelTimer())
    act(() => {
      result.current.start(tinyRoutine, false, false)
    })
    act(() => {
      result.current.stop()
    })
    expect(result.current.view.phase).toBe('READY')
    expect(result.current.view.instruction).toBe('Select a routine, then start.')
  })
})
