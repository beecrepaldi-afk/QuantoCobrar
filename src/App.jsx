import { useEffect, useState } from 'react'
import { StepSalario, StepFerias, StepHoras, StepCustos } from './components/Steps.jsx'
import Resultado from './components/Resultado.jsx'
import { CUSTOS_PADRAO, REGIMES } from './calc.js'
import { sfx } from './sound.js'

const ETAPAS = [StepSalario, StepFerias, StepHoras, StepCustos]

const estadoInicial = () => {
  // estado linkável via query params (?h=valor da hora só é derivado; persistimos inputs)
  const q = new URLSearchParams(location.search)
  const n = (k, d) => (q.has(k) && isFinite(+q.get(k)) ? +q.get(k) : d)
  const temResultado = q.has('s')
  return {
    dados: {
      salarioCents: n('s', 0),
      ferias: n('f', 4),
      horasDia: n('h', 5),
      diasSemana: n('d', 5),
      // link compartilhado traz o total de custos em ?c= — restaura como item único
      custos:
        q.has('c') && isFinite(+q.get('c'))
          ? [{ id: 'link', nome: 'Custos fixos', valor: +q.get('c') }]
          : CUSTOS_PADRAO.map((c) => ({ ...c })),
      regime: ['mei', 'simples', 'informal'].includes(q.get('r')) ? q.get('r') : 'mei',
      das: n('das', REGIMES.mei.dasPadrao),
      aliq: n('a', REGIMES.simples.aliqPadrao * 100) / 100,
    },
    etapa: temResultado ? ETAPAS.length : 0, // ETAPAS.length = resultado
  }
}

export default function App() {
  const [{ dados, etapa }, setState] = useState(estadoInicial)
  const [saindo, setSaindo] = useState(false)
  const [mudo, setMudo] = useState(sfx.muted)

  const set = (patch) => setState((s) => ({ ...s, dados: { ...s.dados, ...patch } }))

  const irPara = (nova) => {
    setSaindo(true)
    setTimeout(() => {
      setState((s) => ({ ...s, etapa: nova }))
      setSaindo(false)
      window.scrollTo({ top: 0 })
    }, 220)
  }

  // persistir na URL quando chega no resultado (linkável)
  useEffect(() => {
    if (etapa === ETAPAS.length) {
      const q = new URLSearchParams({
        s: dados.salarioCents, f: dados.ferias, h: dados.horasDia, d: dados.diasSemana,
        r: dados.regime, das: dados.das, a: Math.round(dados.aliq * 100),
        c: dados.custos.reduce((s, c) => s + c.valor, 0),
      })
      history.replaceState(null, '', `?${q}`)
    } else if (etapa === 0 && location.search) {
      history.replaceState(null, '', location.pathname)
    }
  }, [etapa, dados])

  // navegação por teclado: Esc volta
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && etapa > 0) irPara(etapa - 1) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [etapa])

  const noResultado = etapa === ETAPAS.length
  const Etapa = ETAPAS[etapa]

  return (
    // etapas: coluna estreita centrada; resultado: container mais largo pro grid de 2 colunas no desktop
    <div className={`min-h-dvh flex flex-col mx-auto px-5 sm:px-8 w-full ${noResultado ? 'max-w-5xl' : 'max-w-lg'}`}>
      {/* topo: voltar + progresso + contador de passos */}
      <header className="flex items-center gap-4 pt-6 pb-2 min-h-16">
        {etapa > 0 && !noResultado && (
          <button
            onClick={() => irPara(etapa - 1)}
            aria-label="Voltar"
            className="text-mut hover:text-paper transition text-xl leading-none -ml-2 p-2 min-w-11 min-h-11 flex items-center justify-center"
          >
            ←
          </button>
        )}
        {!noResultado && (
          <>
            <div
              className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={ETAPAS.length}
              aria-valuenow={etapa + 1}
              aria-label={`Passo ${etapa + 1} de ${ETAPAS.length}`}
            >
              <div
                className="h-full bg-lime rounded-full transition-all duration-500"
                style={{ width: `${((etapa + 1) / (ETAPAS.length + 1)) * 100}%` }}
              />
            </div>
            <span className="text-mut text-xs tabular-nums shrink-0" aria-hidden="true">
              {etapa + 1}/{ETAPAS.length}
            </span>
          </>
        )}
        {noResultado && <span className="num-display text-lime">quanto cobro?</span>}
        <button
          onClick={() => { sfx.setMuted(!mudo); setMudo(!mudo); if (mudo) sfx.tap() }}
          aria-label={mudo ? 'Ativar sons' : 'Silenciar sons'}
          aria-pressed={mudo}
          className="text-mut hover:text-paper transition -mr-2 p-2 min-w-11 min-h-11 flex items-center justify-center"
        >
          {mudo ? '🔇' : '🔊'}
        </button>
      </header>

      <main className={`flex-1 flex flex-col justify-center py-8 ${saindo ? 'step-exit' : 'step-enter'}`} key={etapa}>
        {noResultado ? (
          <Resultado dados={dados} set={set} voltar={() => irPara(0)} />
        ) : (
          <div className="w-full max-w-lg mx-auto">
            <Etapa dados={dados} set={set} avancar={() => irPara(etapa + 1)} />
          </div>
        )}
      </main>
    </div>
  )
}
