import { useState } from 'react'
import { Slider, Button, CurrencyInput, haptic } from './ui.jsx'
import { REGIMES, fmtBRL } from '../calc.js'

/* ---------- Etapa 1: Salário desejado ---------- */
export function StepSalario({ dados, set, avancar }) {
  return (
    <div className="stagger">
      {/* marca + proposta de valor: quem chega por link frio entende o que é e pra quem é.
          discreto de propósito — o destaque em lime é código visual reservado às perguntas */}
      <p className="num-display text-lime text-sm tracking-wide mb-2">quanto cobro?</p>
      <p className="text-mut text-sm mb-10 text-balance">
        Descubra em 4 passos quanto você precisa cobrar por hora pra viver do seu trabalho
        por conta própria — férias, impostos e custos já entram na conta.
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-10 text-balance">
        Quanto você quer ganhar por mês, <span className="text-lime">livre na sua mão?</span>
      </h1>
      <CurrencyInput
        big
        autoFocus
        id="salario"
        label="Salário líquido mensal desejado"
        value={dados.salarioCents}
        onChange={(v) => set({ salarioCents: v })}
      />
      <p className="text-mut text-sm mt-6">Pensa no que você quer que sobre depois de tudo pago.</p>
      <Button className="w-full mt-10" onClick={avancar} disabled={dados.salarioCents < 100}>
        Continuar →
      </Button>
      {dados.salarioCents < 100 && (
        <p className="text-mut text-xs text-center mt-3" aria-live="polite">
          Digite um valor acima pra continuar
        </p>
      )}
    </div>
  )
}

/* ---------- Etapa 2: Descanso ---------- */
const feedbackFerias = (f) => {
  if (f === 0) return { txt: 'Sério? Ninguém aguenta isso por muito tempo.', tom: 'text-red-400' }
  if (f <= 1) return { txt: 'Bem pouco. Descanso também é produtividade.', tom: 'text-orange-300' }
  if (f <= 3) return { txt: 'Um respiro razoável ao longo do ano.', tom: 'text-paper' }
  if (f === 4) return { txt: 'Igual às férias da CLT 👍', tom: 'text-lime' }
  if (f <= 6) return { txt: 'Boa! Quem é dono da agenda pode se dar esse luxo.', tom: 'text-lime' }
  return { txt: 'Modo qualidade de vida ativado 🏖️', tom: 'text-lime' }
}

export function StepFerias({ dados, set, avancar }) {
  const fb = feedbackFerias(dados.ferias)
  return (
    <div className="stagger">
      <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-10 text-balance">
        Quantas semanas de <span className="text-lime">descanso</span> você quer por ano?
      </h1>
      <div className="num-display text-7xl text-center mb-8" aria-live="polite">
        {dados.ferias}
        <span className="text-2xl text-mut ml-2">sem.</span>
      </div>
      <Slider
        id="ferias"
        label="Semanas de descanso por ano"
        min={0}
        max={8}
        value={dados.ferias}
        onChange={(v) => set({ ferias: v })}
      />
      <p className={`text-sm mt-5 min-h-5 transition-colors ${fb.tom}`} aria-live="polite">{fb.txt}</p>
      <Button className="w-full mt-10" onClick={avancar}>Continuar →</Button>
    </div>
  )
}

/* ---------- Etapa 3: Horas produtivas ---------- */
export function StepHoras({ dados, set, avancar }) {
  return (
    <div className="stagger">
      <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-10 text-balance">
        Quantas horas por dia você <span className="text-lime">realmente produz</span> (fatura)?
      </h1>
      <div className="num-display text-7xl text-center mb-8" aria-live="polite">
        {dados.horasDia}
        <span className="text-2xl text-mut ml-2">h/dia</span>
      </div>
      <Slider
        id="horas"
        label="Horas produtivas por dia"
        min={2}
        max={10}
        value={dados.horasDia}
        onChange={(v) => set({ horasDia: v })}
      />
      <p className="text-mut text-sm mt-5">
        Quase ninguém fatura 8h por dia. Entre reuniões, propostas e admin, a média real de um
        freelancer fica entre 4 e 6 horas.
      </p>
      {/* pergunta com o mesmo peso visual das demais — não esconder num rodapé de card */}
      <div className="mt-12">
        <h2 className="font-bold mb-1">
          E quantos <span className="text-lime">dias por semana</span> você trabalha?
        </h2>
        <p className="text-mut text-sm mb-4">Conte só os dias em que você fatura.</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-label="Dias de trabalho por semana">
          {[3, 4, 5, 6].map((d) => (
            <button
              key={d}
              aria-pressed={dados.diasSemana === d}
              onClick={() => { haptic(8); set({ diasSemana: d }) }}
              className={`h-12 rounded-xl font-bold transition active:scale-95 ${
                dados.diasSemana === d
                  ? 'bg-lime text-dark sel-glow pulse-once'
                  : 'bg-paper/10 text-paper hover:bg-paper/20'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <Button className="w-full mt-10" onClick={avancar}>Continuar →</Button>
    </div>
  )
}

/* ---------- Etapa 4: Custos e regime ---------- */
export function StepCustos({ dados, set, avancar }) {
  const [novoNome, setNovoNome] = useState('')
  const totalCustos = dados.custos.reduce((s, c) => s + c.valor, 0)

  const setCusto = (id, valor) =>
    set({ custos: dados.custos.map((c) => (c.id === id ? { ...c, valor } : c)) })
  const removeCusto = (id) => set({ custos: dados.custos.filter((c) => c.id !== id) })
  const addCusto = () => {
    if (!novoNome.trim()) return
    set({ custos: [...dados.custos, { id: `c${Date.now()}`, nome: novoNome.trim(), valor: 0 }] })
    setNovoNome('')
  }

  return (
    <div className="stagger">
      <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-8 text-balance">
        Quais seus <span className="text-lime">custos fixos</span> mensais de trabalho?
      </h1>

      <ul className="space-y-2 mb-3">
        {dados.custos.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-paper/5 px-4 py-3">
            <span className="flex-1 text-sm">{c.nome}</span>
            <CurrencyInputInline value={c.valor} onChange={(v) => setCusto(c.id, v)} label={c.nome} />
            <button
              aria-label={`Remover ${c.nome}`}
              onClick={() => { haptic(8); removeCusto(c.id) }}
              className="text-mut hover:text-red-400 transition text-lg leading-none p-2 -m-1 min-w-9 min-h-9"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mb-6">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCusto()}
          placeholder="Adicionar outro custo…"
          aria-label="Nome do novo custo"
          className="flex-1 rounded-2xl bg-paper/5 px-4 py-3 text-sm placeholder:text-mut focus:outline-none focus:ring-2 focus:ring-lime/60"
        />
        <Button variant="ghost" onClick={addCusto} className="!px-4 border border-paper/10">+</Button>
      </div>
      <p className="text-mut text-sm mb-8">Total: <strong className="text-paper">{fmtBRL(totalCustos)}</strong>/mês</p>

      <h2 className="font-bold mb-4">Como você paga imposto?</h2>
      <div className="grid gap-3 mb-4" role="radiogroup" aria-label="Regime tributário">
        {Object.values(REGIMES).map((r) => (
          <button
            key={r.id}
            role="radio"
            aria-checked={dados.regime === r.id}
            onClick={() => { haptic(8); set({ regime: r.id }) }}
            className={`text-left rounded-2xl px-5 py-4 border transition active:scale-[0.98] ${
              dados.regime === r.id
                ? 'border-lime bg-lime/15 sel-glow'
                : 'border-paper/10 bg-paper/5 hover:border-paper/25'
            }`}
          >
            {/* check explícito: seleção legível de relance, na mesma linguagem das pills */}
            <span className="font-bold flex items-center justify-between gap-3">
              {r.nome}
              {dados.regime === r.id && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-lime shrink-0">
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-mut text-sm">{r.desc}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-paper/5 px-5 py-4 mb-2">
        <div className="flex items-center justify-between gap-4">
          {dados.regime === 'mei' ? (
            <>
              <label htmlFor="das" className="text-sm">DAS mensal</label>
              <CurrencyInputInline id="das" value={dados.das} onChange={(v) => set({ das: v })} label="Valor do DAS mensal" />
            </>
          ) : (
            <>
              <label htmlFor="aliq" className="text-sm">Alíquota sobre o faturamento</label>
              <div className="flex items-center gap-1 rounded-lg bg-paper/10 px-3 py-1.5 focus-within:ring-2 focus-within:ring-lime/60">
                <input
                  id="aliq"
                  inputMode="numeric"
                  className="no-spin w-12 bg-transparent text-right num-display text-lg focus:outline-none caret-lime"
                  value={Math.round(dados.aliq * 1000) / 10}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value.replace(',', '.'))
                    set({ aliq: isFinite(n) ? Math.min(Math.max(n, 0), 60) / 100 : 0 })
                  }}
                />
                <span className="text-mut">%</span>
              </div>
            </>
          )}
        </div>
        <p className="text-mut text-xs mt-2">
          {dados.regime === 'mei'
            ? 'Ajuste se o seu DAS for diferente.'
            : 'Ajuste conforme a sua faixa do Simples.'}
        </p>
      </div>

      <Button className="w-full mt-8" onClick={avancar}>Ver meu resultado ✦</Button>
    </div>
  )
}

/* input de moeda compacto (inteiro, sem centavos) */
function CurrencyInputInline({ value, onChange, label, id }) {
  return (
    <div className="flex items-baseline gap-1 rounded-lg bg-paper/10 px-3 py-1.5 focus-within:ring-2 focus-within:ring-lime/60">
      <span className="text-mut text-sm">R$</span>
      <input
        id={id}
        aria-label={label}
        inputMode="numeric"
        className="no-spin w-16 bg-transparent text-right num-display text-lg placeholder:text-mut focus:outline-none caret-lime"
        value={value ? value.toLocaleString('pt-BR') : ''}
        placeholder="0"
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          onChange(digits ? Math.min(Number(digits), 9999999) : 0)
        }}
      />
    </div>
  )
}
