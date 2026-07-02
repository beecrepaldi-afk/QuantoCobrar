import { useMemo, useState } from 'react'
import { Slider, Button, CountUp } from './ui.jsx'
import { calcular, salarioReal, fmtBRL, MEI_LIMITE_MENSAL } from '../calc.js'
import { gerarCard, baixarCard, compartilharCard } from '../shareCard.js'

export default function Resultado({ dados, set, voltar }) {
  const r = useMemo(() => calcular(paramsDe(dados)), [dados])
  const [horaAtualCents, setHoraAtualCents] = useState(0)
  const [sharing, setSharing] = useState(false)

  const salario = dados.salarioCents / 100
  const custos = dados.custos.reduce((s, c) => s + c.valor, 0)

  const segs = [
    { nome: 'Seu salário', valor: salario, cor: '#d8ff3e' },
    { nome: 'Impostos', valor: r.impostos, cor: '#ff6b6b' },
    { nome: 'Custos fixos', valor: custos, cor: '#6ba8ff' },
  ]
  const totalSeg = segs.reduce((s, x) => s + x.valor, 0) || 1

  const horaAtual = horaAtualCents / 100
  const salReal = horaAtual > 0 ? salarioReal({ horaAtual, horasMes: r.horasMes, custos, regime: dados.regime, das: dados.das, aliq: dados.aliq }) : null

  const onShare = async (baixar = false) => {
    setSharing(true)
    try {
      const blob = await gerarCard({ hora: r.hora, ferias: dados.ferias, horasDia: dados.horasDia, horaComMargem: r.horaComMargem })
      if (baixar || !navigator.share) baixarCard(blob)
      else await compartilharCard(blob)
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="pop-in pb-16">
      {/* desktop: hero + breakdown à esquerda, simulação + comparativo à direita */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start">
        <div>
          {/* número herói */}
          <p className="text-mut text-sm uppercase tracking-widest mb-3">Sua hora precisa valer</p>
          <div className="num-display text-[clamp(4rem,18vw,7.5rem)] lg:text-8xl leading-none text-lime mb-2" aria-live="polite">
            <CountUp value={r.hora} format={(v) => fmtBRL(v)} />
          </div>
          <p className="text-mut text-sm mb-8">
            Com margem de negociação: <strong className="text-paper">{fmtBRL(r.horaComMargem)}/h</strong>
          </p>

          <div className="grid grid-cols-2 gap-3 mb-10">
            <Stat label="Por dia" valor={fmtBRL(r.dia)} />
            <Stat label="Faturar por mês" valor={fmtBRL(r.faturamento)} />
          </div>

          {/* aviso: faturamento estoura o teto do MEI */}
          {dados.regime === 'mei' && r.faturamento > MEI_LIMITE_MENSAL && (
            <div className="rounded-2xl border border-orange-300/40 bg-orange-300/10 px-5 py-4 mb-10 text-sm" role="alert">
              <strong className="text-orange-300 block mb-1">⚠️ Acima do limite do MEI</strong>
              <span className="text-paper/80">
                Faturando {fmtBRL(r.faturamento)}/mês você passa do teto do MEI
                ({fmtBRL(MEI_LIMITE_MENSAL)}/mês, R$ 81 mil/ano). Considere migrar para o
                Simples Nacional — dá pra simular trocando o regime na etapa de custos.
              </span>
            </div>
          )}

          {/* breakdown */}
          <h2 className="font-bold mb-4">Pra onde vai o que você fatura</h2>
          <div className="flex h-8 rounded-xl overflow-hidden mb-3" role="img" aria-label="Distribuição do faturamento entre salário, impostos e custos">
            {segs.map((s) => (
              <div key={s.nome} className="bar-seg" style={{ width: `${(s.valor / totalSeg) * 100}%`, background: s.cor }} />
            ))}
          </div>
          <ul className="space-y-1 mb-12 lg:mb-0">
            {segs.map((s) => (
              <li key={s.nome} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: s.cor }} />
                <span className="flex-1 text-mut">{s.nome}</span>
                <span className="num-display">{fmtBRL(s.valor)}</span>
                <span className="text-mut w-12 text-right">{Math.round((s.valor / totalSeg) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {/* barra sticky: mantém o valor recalculado visível enquanto mexe nos sliders (mobile) */}
          <div className="sticky top-0 z-10 -mx-5 px-5 py-3 bg-ink/95 backdrop-blur border-b border-white/10 flex items-baseline justify-between lg:hidden">
            <span className="text-mut text-xs uppercase tracking-widest">Sua hora</span>
            <span className="num-display text-2xl text-lime" aria-live="polite">
              <CountUp value={r.hora} format={(v) => fmtBRL(v)} />
            </span>
          </div>

          {/* simulação em tempo real */}
          <h2 className="font-bold mb-1 mt-4 lg:mt-0">E se…?</h2>
          <p className="text-mut text-sm mb-6">Mexa nos controles e veja o valor da hora recalcular na hora.</p>
          <div className="space-y-5 rounded-3xl bg-white/5 p-6 mb-12">
            <SimSlider
              label="Salário desejado"
              display={fmtBRL(salario)}
              min={1000} max={50000} step={500}
              value={salario}
              onChange={(v) => set({ salarioCents: v * 100 })}
            />
            <SimSlider
              label="Semanas de descanso"
              display={`${dados.ferias} sem.`}
              min={0} max={8}
              value={dados.ferias}
              onChange={(v) => set({ ferias: v })}
            />
            <SimSlider
              label="Horas produtivas/dia"
              display={`${dados.horasDia}h`}
              min={2} max={10}
              value={dados.horasDia}
              onChange={(v) => set({ horasDia: v })}
            />
          </div>

          {/* comparativo */}
          <h2 className="font-bold mb-1">Quanto você cobra hoje?</h2>
          <p className="text-mut text-sm mb-4">Compare com o valor que você precisa cobrar.</p>
          <div className="rounded-3xl bg-white/5 p-6 mb-12 lg:mb-0">
            <div className="flex items-baseline gap-2 border-b border-white/10 pb-3 mb-4 focus-within:border-lime/60 transition-colors">
              <span className="text-mut num-display">R$</span>
              <input
                inputMode="numeric"
                aria-label="Quanto você cobra hoje por hora"
                placeholder="0,00"
                className="no-spin flex-1 min-w-0 bg-transparent num-display text-2xl sm:text-3xl placeholder:text-paper/25 focus:outline-none caret-lime"
                value={horaAtualCents ? (horaAtualCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, '')
                  setHoraAtualCents(d ? Number(d) : 0)
                }}
              />
              <span className="text-mut">/h</span>
            </div>
            {salReal !== null ? (
              <p className="text-sm" aria-live="polite">
                Cobrando <strong>{fmtBRL(horaAtual, 2)}/h</strong>, seu salário real é{' '}
                <strong className={salReal >= salario ? 'text-lime' : 'text-red-400'}>
                  {fmtBRL(salReal)}/mês
                </strong>{' '}
                {salReal >= salario ? '— acima da sua meta 🎉' : `— ${fmtBRL(salario - salReal)} abaixo da meta.`}
              </p>
            ) : (
              <p className="text-mut text-sm">Digite seu valor atual pra ver a diferença.</p>
            )}
          </div>
        </div>
      </div>

      {/* ações */}
      <div className="max-w-lg mx-auto lg:mt-14">
        <Button className="w-full" onClick={() => onShare(false)} disabled={sharing}>
          {sharing ? 'Gerando…' : 'Compartilhar meu resultado'}
        </Button>
        <button
          onClick={() => onShare(true)}
          className="w-full mt-3 text-mut text-sm hover:text-paper transition py-3 min-h-11"
        >
          ↓ Baixar imagem
        </button>
        <button onClick={voltar} className="w-full mt-2 text-mut text-sm hover:text-paper transition py-3 min-h-11">
          ← Refazer minhas respostas
        </button>

        <p className="text-mut text-xs mt-8 text-center">
          Valores de impostos são estimativas simplificadas — confirme com seu contador.
        </p>
      </div>
    </div>
  )
}

export const paramsDe = (dados) => ({
  salario: dados.salarioCents / 100,
  ferias: dados.ferias,
  horasDia: dados.horasDia,
  diasSemana: dados.diasSemana,
  custos: dados.custos.reduce((s, c) => s + c.valor, 0),
  regime: dados.regime,
  das: dados.das,
  aliq: dados.aliq,
})

function Stat({ label, valor }) {
  return (
    <div className="rounded-2xl bg-white/5 px-5 py-4">
      <p className="text-mut text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="num-display text-2xl">{valor}</p>
    </div>
  )
}

function SimSlider({ label, display, ...slider }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <label className="text-sm text-mut">{label}</label>
        <span className="num-display text-lg">{display}</span>
      </div>
      <Slider label={label} {...slider} />
    </div>
  )
}
