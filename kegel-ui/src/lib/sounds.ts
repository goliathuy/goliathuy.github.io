let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return ctx
}

/** Same spirit as `script.js`: 880 = hold, 440 = relax, short beep. */
export function playPhaseSound(isHold: boolean, audioEnabled: boolean) {
  if (!audioEnabled) return
  try {
    const audioContext = getCtx()
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const freq = isHold ? 880 : 440
    osc.frequency.setValueAtTime(freq, audioContext.currentTime)
    gain.gain.setValueAtTime(0.08, audioContext.currentTime)
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.start()
    setTimeout(() => {
      try {
        osc.stop()
        osc.disconnect()
        gain.disconnect()
      } catch {
        /* noop */
      }
    }, 200)
  } catch {
    /* ignore */
  }
}

export function triggerVibration(pattern: number | number[], hapticEnabled: boolean) {
  if (!hapticEnabled || !navigator.vibrate) return
  navigator.vibrate(pattern)
}
