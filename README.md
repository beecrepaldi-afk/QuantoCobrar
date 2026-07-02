# Quanto Cobrar?

Simulador de precificação para freelancers e autônomos brasileiros. Responde: **"quanto eu preciso cobrar por hora para ter o salário que eu quero de verdade?"** — considerando férias, impostos, horas produtivas e custos fixos.

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy (Vercel)

```bash
npm run build   # gera dist/
```

Importe o repositório na Vercel — ela detecta Vite automaticamente. Sem backend, sem banco: tudo roda no client. O resultado é linkável via query params (`?s=&f=&h=&d=&r=`).

## Estrutura

- `src/calc.js` — lógica de cálculo pura (fórmulas do briefing) e formatação BRL
- `src/App.jsx` — fluxo de etapas, progresso, estado, persistência na URL
- `src/components/Steps.jsx` — etapas 1–4 (salário, descanso, horas, custos/regime)
- `src/components/Resultado.jsx` — número herói, breakdown, sliders "e se", comparativo
- `src/shareCard.js` — geração do card 1080×1350 via Canvas (sem libs)
- `src/components/ui.jsx` — Slider, CountUp, Button, CurrencyInput

## Pendências

- Substituir `quantocobrar.app` no card (`src/shareCard.js`) e a `og:image` (`index.html`) pela URL/imagem finais
- Nome definitivo do produto
