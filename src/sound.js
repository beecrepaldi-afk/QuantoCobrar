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
    master.gain.value = 0.22 // feedback, não música — mas audível em caixa de desktop
    master.connect(ctx.destination)
  }
  return ctx
}

/* desbloqueia o áudio no primeiro gesto em qualquer lugar da página —
   no desktop o Chrome cria o contexto "suspended" e o resume é assíncrono,
   então garantir isso cedo evita engolir os primeiros blips */
window.addEventListener('pointerdown', () => { ensure()?.resume() }, { once: true, capture: true })

/* pan espacial: o tap segue a posição horizontal do toque na tela —
   clicar à esquerda soa à esquerda, à direita soa à direita, em qualquer tela */
let pointerPan = 0
window.addEventListener(
  'pointerdown',
  (e) => { pointerPan = ((e.clientX / window.innerWidth) * 2 - 1) * 0.8 },
  { capture: true, passive: true }
)

/* pan: -1 (esquerda) a 1 (direita); 0 = centro */
const blip = (freq, dur = 0.06, type = 'sine', vol = 1, pan = 0) => {
  if (muted) return
  const c = ensure()
  if (!c) return
  const play = () => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(vol, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    o.connect(g)
    // StereoPanner nem sempre existe (Safari antigo) — sem ele, toca no centro
    if (pan && c.createStereoPanner) {
      const p = c.createStereoPanner()
      p.pan.value = pan
      g.connect(p)
      p.connect(master)
    } else {
      g.connect(master)
    }
    o.start()
    o.stop(c.currentTime + dur)
  }
  // contexto suspenso: toca só depois do resume completar (senão o blip se perde)
  if (c.state === 'suspended') c.resume().then(play).catch(() => {})
  else play()
}

export const sfx = {
  /* toque em botão/seleção — pan segue onde o usuário tocou */
  tap: () => blip(880, 0.06, 'triangle', 0.7, pointerPan),
  /* tick de slider — t (0..1): pitch sobe e o som acompanha a bolinha no estéreo
     (pan limitado a ±0.8 pra não ficar 100% num ouvido só, o que soa duro em fone) */
  tick: (t = 0.5) => blip(500 + t * 500, 0.035, 'square', 0.3, (t * 2 - 1) * 0.8),
  /* revelação do resultado: arpejo C-E-G varrendo da esquerda pra direita */
  success: () => {
    blip(523.25, 0.1, 'sine', 0.8, -0.6)
    setTimeout(() => blip(659.25, 0.1, 'sine', 0.8, 0), 100)
    setTimeout(() => blip(783.99, 0.18, 'sine', 0.9, 0.6), 200)
  },
  /* roleta: ticks que desaceleram e sobem de pitch junto com o CountUp visual
     (mesmo easing cúbico), varrendo o estéreo, e travam no arpejo final */
  countUp: (duration = 900) => {
    if (muted) return
    const steps = 14
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setTimeout(
        () => blip(400 + ease * 800, 0.03, 'square', 0.25, (ease * 2 - 1) * 0.5),
        ease * duration
      )
    }
    setTimeout(() => sfx.success(), duration + 80)
  },
  get muted() {
    return muted
  },
  setMuted(v) {
    muted = v
    localStorage.setItem('qc-mute', v ? '1' : '0')
  },
}
