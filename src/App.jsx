import { useEffect, useRef, useState } from 'react'
import { StepSalario, StepFerias, StepHoras, StepCustos } from './components/Steps.jsx'
import Resultado from './components/Resultado.jsx'
import Faq from './components/Faq.jsx'
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
    // whoosh na direção do movimento (o resultado tem sua própria fanfarra)
    if (nova < ETAPAS.length) sfx.whoosh(nova > etapa ? 1 : -1)
    setSaindo(true)
    setTimeout(() => {
      setState((s) => ({ ...s, etapa: nova }))
      setSaindo(false)
      window.scrollTo({ top: 0 })
      // escadinha de progresso: cada etapa concluída soa um degrau mais agudo
      if (nova > etapa && nova < ETAPAS.length) sfx.tick(nova / ETAPAS.length)
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
      <ParallaxGlow />
      {/* topo: voltar + progresso + contador de passos */}
      <header className="flex items-center gap-4 pt-6 pb-2 min-h-16">
        {!noResultado && (
          // slot sempre presente (invisible na etapa 1): progresso não pula de lugar entre telas
          <button
            onClick={() => irPara(etapa - 1)}
            aria-label="Voltar"
            aria-hidden={etapa === 0}
            tabIndex={etapa === 0 ? -1 : 0}
            className={`text-mut hover:text-paper transition text-xl leading-none -ml-2 p-2 min-w-11 min-h-11 flex items-center justify-center ${
              etapa === 0 ? 'invisible' : ''
            }`}
          >
            ←
          </button>
        )}
        {!noResultado && (
          <>
            <div
              className="flex-1 h-1 rounded-full bg-paper/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={ETAPAS.length}
              aria-valuenow={etapa + 1}
              aria-label={`Passo ${etapa + 1} de ${ETAPAS.length}`}
            >
              <div
                className="h-full bg-lime rounded-full transition-all"
                style={{
                  width: `${((etapa + 1) / (ETAPAS.length + 1)) * 100}%`,
                  // mola: passa um tiquinho do ponto e assenta
                  transitionDuration: '600ms',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.7, 0.64, 1)',
                }}
              />
            </div>
            <span className="text-mut text-xs tabular-nums shrink-0" aria-hidden="true">
              {etapa + 1}/{ETAPAS.length}
            </span>
          </>
        )}
        {/* flex-1 empurra o botão de som pra borda direita, alinhado com as etapas */}
        {noResultado && <span className="num-display text-lime text-sm tracking-wide flex-1">quanto cobro?</span>}
        <button
          onClick={() => { sfx.setMuted(!mudo); setMudo(!mudo); if (mudo) sfx.tap() }}
          aria-label={mudo ? 'Ativar sons' : 'Silenciar sons'}
          aria-pressed={mudo}
          className="text-mut hover:text-paper transition -mr-2 p-2 min-w-11 min-h-11 flex items-center justify-center"
        >
          {/* ícone SVG no lugar de emoji: consistente com o resto da UI custom */}
          <SoundIcon mudo={mudo} />
        </button>
      </header>

      {/* etapas: pb maior que pt sobe o bloco pro centro óptico (o geométrico deixava
          espaço morto demais no topo, com o conteúdo abaixo da linha do olhar) */}
      <main
        className={`flex-1 flex flex-col justify-center pt-6 ${noResultado ? 'py-8' : 'pb-[14vh]'} ${saindo ? 'step-exit' : 'step-enter'}`}
        key={etapa}
      >
        {noResultado ? (
          <Resultado dados={dados} set={set} voltar={() => irPara(0)} />
        ) : (
          <div className="w-full max-w-lg mx-auto">
            <Etapa dados={dados} set={set} avancar={() => irPara(etapa + 1)} />
          </div>
        )}
      </main>

      {/* FAQ só na tela inicial: conteúdo p/ SEO sem poluir o fluxo do wizard */}
      {etapa === 0 && <Faq />}
    </div>
  )
}

/* alto-falante com ondas (ou barrado quando mudo) */
function SoundIcon({ mudo }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 5 6.5 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3.5L11 19V5Z"
        fill="currentColor"
      />
      {mudo ? (
        <path d="m15 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <>
          <path d="M14.5 9.5a4 4 0 0 1 0 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 7a7.5 7.5 0 0 1 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

/* glow de fundo com parallax: segue o mouse no desktop e o giroscópio no Android.
   iOS exige prompt de permissão pra gyro — lá fica estático, sem prompt feio.
   Respeita prefers-reduced-motion. */
function ParallaxGlow() {
  const ref = useRef(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf, tx = 0, ty = 0, cx = 0, cy = 0
    const loop = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      if (ref.current) ref.current.style.transform = `translate(${cx}px, ${cy}px)`
      raf = requestAnimationFrame(loop)
    }
    const mouse = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 60
      ty = (e.clientY / window.innerHeight - 0.5) * 60
    }
    const gyro = (e) => {
      if (e.gamma == null || typeof DeviceOrientationEvent.requestPermission === 'function') return
      tx = Math.max(-1, Math.min(1, e.gamma / 30)) * 40
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * 40
    }
    window.addEventListener('mousemove', mouse)
    window.addEventListener('deviceorientation', gyro)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', mouse)
      window.removeEventListener('deviceorientation', gyro)
    }
  }, [])
  return <div ref={ref} aria-hidden="true" className="parallax-glow" />
}
