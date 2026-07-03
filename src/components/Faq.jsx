// FAQ: conteúdo textual para SEO/AdSense + rich results (schema FAQPage no index.html).
// IMPORTANTE: as respostas aqui devem bater com o JSON-LD do index.html.

export const FAQS = [
  {
    q: 'Como calcular o valor da minha hora como freelancer?',
    a: 'Some o salário líquido que você quer receber, seus custos fixos mensais (internet, software, equipamento) e os impostos do seu regime. Depois divida pelo número de horas realmente produtivas no mês — descontando férias e dias de folga. É exatamente essa conta que a calculadora faz por você em menos de 1 minuto.',
  },
  {
    q: 'Por que férias e folgas entram no cálculo?',
    a: 'Freelancer não tem férias remuneradas: quem paga suas semanas de descanso é você. Se você tira 4 semanas por ano, seu faturamento precisa ser gerado em 48 semanas — então cada hora trabalhada tem que valer mais para cobrir o período sem trabalhar.',
  },
  {
    q: 'O que são "horas produtivas"?',
    a: 'São as horas que você efetivamente fatura. Um dia de 8 horas raramente tem 8 horas cobráveis: reuniões, propostas, e-mails e administração consomem boa parte. A maioria dos freelancers tem entre 4 e 6 horas produtivas por dia — por isso o padrão da calculadora é 5.',
  },
  {
    q: 'Quais impostos devo considerar: MEI, Simples Nacional ou informal?',
    a: 'MEI paga um valor fixo mensal (o DAS, cerca de R$ 86 em 2026), com teto de faturamento de R$ 81 mil por ano. No Simples Nacional você paga um percentual sobre o faturamento (a partir de ~6%). Trabalhando informalmente, sem CNPJ, estimamos ~11% para INSS e imposto de renda. A calculadora suporta os três regimes.',
  },
  {
    q: 'Por que cobrar com margem em vez do valor exato?',
    a: 'O valor exato cobre apenas o cenário perfeito: sem imprevistos, sem inadimplência, sem semanas fracas. Uma margem de segurança de 15% dá espaço para negociar desconto sem sair no prejuízo e absorve meses mais devagar.',
  },
  {
    q: 'A calculadora é gratuita?',
    a: 'Sim, 100% gratuita e sem cadastro. Você preenche 4 passos e vê na hora quanto precisa cobrar por hora e por dia. O resultado gera um link que você pode salvar ou compartilhar.',
  },
]

export default function Faq() {
  return (
    <section aria-labelledby="faq-titulo" className="w-full max-w-lg mx-auto pb-16">
      <h2 id="faq-titulo" className="num-display text-lime text-sm tracking-wide mb-4">
        perguntas frequentes
      </h2>
      <div className="flex flex-col gap-2">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group rounded-xl bg-paper/5 open:bg-paper/10 transition">
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 text-paper/90 font-semibold text-sm">
              {q}
              <span aria-hidden="true" className="text-mut transition group-open:rotate-45 shrink-0 text-lg leading-none">
                +
              </span>
            </summary>
            <p className="px-4 pb-4 text-mut text-sm leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
