// Lógica de cálculo — fórmulas do briefing

export const REGIMES = {
  mei: {
    id: 'mei',
    nome: 'MEI',
    desc: 'Você paga um valor fixo por mês (o DAS), independente de quanto fatura.',
    dasPadrao: 86, // 2026: 5% do mínimo (R$ 81,05) + R$ 5 ISS ≈ R$ 86,05
  },
  simples: {
    id: 'simples',
    nome: 'Simples Nacional',
    desc: 'Você paga um percentual sobre tudo que fatura. Comum para quem tem CNPJ além do MEI.',
    aliqPadrao: 0.06,
  },
  informal: {
    id: 'informal',
    nome: 'Informal / sem CNPJ',
    desc: 'Sem empresa aberta. Estimamos ~11% para INSS e IR de forma simplificada.',
    aliqPadrao: 0.11,
  },
}

// Teto de faturamento do MEI (2026): R$ 81.000/ano
export const MEI_LIMITE_MENSAL = 81000 / 12
// Tolerância: até 20% acima (R$ 97.200/ano) gera DAS complementar e migração
// para ME em janeiro; acima disso, desenquadramento retroativo com juros/multa.
export const MEI_TOLERANCIA_MENSAL = (81000 * 1.2) / 12

export const CUSTOS_PADRAO = [
  { id: 'internet', nome: 'Internet', valor: 120 },
  { id: 'software', nome: 'Software e assinaturas', valor: 150 },
  { id: 'equipamento', nome: 'Equipamento (reserva mensal)', valor: 200 },
  { id: 'coworking', nome: 'Coworking / espaço', valor: 0 },
  { id: 'contador', nome: 'Contador', valor: 0 },
]

/**
 * @param {object} p
 * @param {number} p.salario  salário líquido mensal desejado (S)
 * @param {number} p.ferias   semanas de descanso por ano (F)
 * @param {number} p.horasDia horas produtivas por dia (H)
 * @param {number} p.diasSemana dias de trabalho por semana (D)
 * @param {number} p.custos   soma dos custos fixos mensais (C)
 * @param {'mei'|'simples'|'informal'} p.regime
 * @param {number} p.das      valor fixo mensal (MEI)
 * @param {number} p.aliq     alíquota decimal (Simples/Informal)
 */
export function calcular({ salario, ferias, horasDia, diasSemana, custos, regime, das, aliq }) {
  const horasAno = (52 - ferias) * diasSemana * horasDia
  const horasMes = horasAno / 12

  let faturamento, impostos
  if (regime === 'mei') {
    faturamento = salario + custos + das
    impostos = das
  } else {
    faturamento = (salario + custos) / (1 - aliq)
    impostos = faturamento * aliq
  }

  const horaExata = horasMes > 0 ? faturamento / horasMes : 0
  const hora = Math.ceil(horaExata) // arredonda p/ cima em múltiplos de R$ 1
  const horaComMargem = Math.ceil(horaExata * 1.15) // margem sobre o valor exato
  const dia = hora * horasDia

  return { horasAno, horasMes, faturamento, impostos, hora, horaComMargem, dia }
}

/** Cálculo inverso: dado o que a pessoa cobra hoje, qual o salário real? */
export function salarioReal({ horaAtual, horasMes, custos, regime, das, aliq }) {
  const fatAtual = horaAtual * horasMes
  if (regime === 'mei') return fatAtual - custos - das
  return fatAtual * (1 - aliq) - custos
}

export const fmtBRL = (v, digits = 0) =>
  (isFinite(v) ? v : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
