/* Sons de UI sintetizados via Web Audio — zero assets.
   O AudioContext só é criado no primeiro gesto do usuário (política de autoplay). */

let ctx = null
let master = null
let muted = localStorage.getItem('qc-mute') === '1'

const ensure = () => {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.12 // volume geral baixo de propósito — é feedback, não música
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const blip = (freq, dur = 0.06, type = 'sine', vol = 1) => {
  if (muted) return
  const c = ensure()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(vol, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  o.connect(g)
  g.connect(master)
  o.start()
  o.stop(c.currentTime + dur)
}

export const sfx = {
  /* toque em botão/seleção */
  tap: () => blip(880, 0.05, 'triangle', 0.6),
  /* tick de slider — t (0..1) sobe o pitch conforme o valor cresce */
  tick: (t = 0.5) => blip(500 + t * 500, 0.03, 'square', 0.22),
  /* revelação do resultado: arpejo C-E-G curtinho */
  success: () => {
    blip(523.25, 0.1, 'sine', 0.8)
    setTimeout(() => blip(659.25, 0.1, 'sine', 0.8), 100)
    setTimeout(() => blip(783.99, 0.18, 'sine', 0.9), 200)
  },
  get muted() {
    return muted
  },
  setMuted(v) {
    muted = v
    localStorage.setItem('qc-mute', v ? '1' : '0')
  },
}
