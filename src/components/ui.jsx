import { useEffect, useRef, useState } from 'react'
import { sfx } from '../sound.js'

/* Slider com trilha preenchida */
export function Slider({ value, min, max, step = 1, onChange, label, id }) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <input
      id={id}
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      style={{ '--fill': `${fill}%` }}
      onChange={(e) => {
        const v = Number(e.target.value)
        // batida mais firme ao encostar nos limites — dá sensação de "fim de curso"
        if (navigator.vibrate) navigator.vibrate(v === min || v === max ? 20 : 3)
        sfx.tick((v - min) / (max - min))
        onChange(v)
      }}
      onPointerUp={() => navigator.vibrate && navigator.vibrate(8)}
    />
  )
}

/* Número que anima em contagem até o valor */
export function CountUp({ value, format, duration = 900, className }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef()

  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    cancelAnimationFrame(rafRef.current)
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * ease)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <span className={className}>{format(display)}</span>
}

/* feedback de toque: vibração curta + tap sonoro — ignorados onde não há suporte */
export const haptic = (ms = 8) => {
  if (navigator.vibrate) navigator.vibrate(ms)
  sfx.tap()
}

/* Botão primário */
export function Button({ children, onClick, disabled, variant = 'primary', className = '', ...rest }) {
  const base =
    'rounded-2xl px-6 py-4 min-h-14 font-bold text-base transition active:scale-[0.97] disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime'
  const styles = {
    // desabilitado vira cinza de verdade (não só opacidade) pra ninguém achar que dá pra clicar
    primary: 'bg-lime text-dark hover:bg-lime-deep disabled:bg-paper/10 disabled:text-mut btn-glow',
    ghost: 'bg-transparent text-mut hover:text-paper',
  }
  return (
    <button
      onClick={(e) => { haptic(10); onClick?.(e) }}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* Input de moeda BRL que formata enquanto digita */
export function CurrencyInput({ value, onChange, autoFocus, big = false, id, label }) {
  const [focused, setFocused] = useState(false)
  // versão grande (tela inicial): sem centavos — ninguém sonha com salário quebrado
  const format = (cents) =>
    big
      ? Math.round(cents / 100).toLocaleString('pt-BR')
      : (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const handle = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    const n = digits ? Number(digits) : 0
    onChange(Math.min(big ? n * 100 : n, 99999999999))
  }

  if (!big)
    return (
      <div className="flex items-baseline gap-2">
        <span className="num-display text-mut text-base">R$</span>
        <input
          id={id}
          aria-label={label}
          inputMode="numeric"
          className="no-spin bg-transparent caret-lime text-paper focus:outline-none num-display text-lg text-right w-28"
          value={value ? format(value) : ''}
          placeholder="0"
          onChange={handle}
        />
      </div>
    )

  /* versão grande: cursor nativo fica bugado em fonte gigante centralizada
     (desalinhado + Chrome para de piscar) — usamos um cursor customizado */
  return (
    // sublinhado dá affordance de campo editável (o texto solto não parecia clicável);
    // acende em lime no foco como feedback de onde a digitação vai cair
    <div
      className={`flex items-baseline gap-2 justify-center border-b-2 pb-3 mx-auto w-fit min-w-48 px-6 transition-colors ${
        focused ? 'border-lime' : 'border-paper/15'
      }`}
    >
      <span className="num-display text-mut text-3xl">R$</span>
      <div className="relative inline-grid num-display text-6xl sm:text-7xl">
        {/* espelho invisível: dimensiona o grid pro tamanho exato do texto */}
        <span className="invisible col-start-1 row-start-1 whitespace-pre" aria-hidden="true">
          {value ? format(value) : '0'}
        </span>
        <input
          id={id}
          aria-label={label}
          inputMode="numeric"
          autoFocus={autoFocus}
          size={1}
          className="no-spin absolute inset-0 w-full min-w-0 bg-transparent text-center text-paper placeholder:text-paper/40 focus:outline-none caret-transparent"
          value={value ? format(value) : ''}
          placeholder="0"
          onChange={handle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {focused && <span aria-hidden="true" className="fake-caret" />}
      </div>
    </div>
  )
}
