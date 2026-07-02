// Card de compartilhamento 1080×1350 desenhado direto no canvas (sem libs).
// Não expõe o salário desejado — só o valor da hora e stats secundários.

const W = 1080
const H = 1350

export async function gerarCard({ hora, horaComMargem, ferias, horasDia }) {
  await document.fonts.load('900 200px "Archivo Black"').catch(() => {})
  await document.fonts.load('700 48px "Archivo"').catch(() => {})

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // fundo
  ctx.fillStyle = '#0e0e12'
  ctx.fillRect(0, 0, W, H)

  // formas gráficas de fundo
  ctx.fillStyle = 'rgba(216,255,62,0.08)'
  ctx.beginPath()
  ctx.arc(W, 0, 460, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(216,255,62,0.25)'
  ctx.lineWidth = 3
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.arc(-60, H + 40, 140 + i * 90, 0, Math.PI * 2)
    ctx.stroke()
  }

  const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR')

  // header
  ctx.fillStyle = '#d8ff3e'
  ctx.font = '700 44px "Archivo", sans-serif'
  ctx.fillText('QUANTO COBRAR?', 80, 130)

  // copy correta: é a meta calculada, não o preço praticado
  ctx.fillStyle = '#a9a9b5'
  ctx.font = '400 40px "Archivo", sans-serif'
  ctx.fillText('minha hora de trabalho precisa valer', 80, 360)

  // número herói com unidade /h
  let size = 230
  const setHero = () => (ctx.font = `900 ${size}px "Archivo Black", "Archivo", sans-serif`)
  const suffixW = () => {
    setHero()
    const main = ctx.measureText(brl(hora)).width
    ctx.font = `900 ${Math.round(size * 0.34)}px "Archivo Black", "Archivo", sans-serif`
    return main + 16 + ctx.measureText('/h').width
  }
  while (suffixW() > W - 160 && size > 90) size -= 10
  const heroY = 400 + size
  // glow suave atrás do número
  ctx.shadowColor = 'rgba(216,255,62,0.45)'
  ctx.shadowBlur = 70
  ctx.fillStyle = '#d8ff3e'
  setHero()
  ctx.fillText(brl(hora), 80, heroY)
  const heroW = ctx.measureText(brl(hora)).width
  ctx.shadowBlur = 0
  ctx.fillStyle = '#a9a9b5'
  ctx.font = `900 ${Math.round(size * 0.34)}px "Archivo Black", "Archivo", sans-serif`
  ctx.fillText('/h', 80 + heroW + 16, heroY)

  ctx.fillStyle = '#f6f4ef'
  ctx.font = '400 40px "Archivo", sans-serif'
  ctx.fillText(`com margem de negociação: ${brl(horaComMargem)}/h`, 80, heroY + 90)

  // stats secundários
  const stats = [
    { label: 'semanas de descanso/ano', valor: String(ferias) },
    { label: 'horas produtivas/dia', valor: `${horasDia}h` },
  ]
  const boxY = 900
  const boxW = (W - 160 - 40) / 2
  stats.forEach((s, i) => {
    const x = 80 + i * (boxW + 40)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    roundRect(ctx, x, boxY, boxW, 220, 32)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'
    ctx.lineWidth = 2
    roundRect(ctx, x, boxY, boxW, 220, 32)
    ctx.stroke()
    ctx.fillStyle = '#d8ff3e'
    ctx.font = '900 96px "Archivo Black", "Archivo", sans-serif'
    ctx.fillText(s.valor, x + 40, boxY + 128)
    ctx.fillStyle = '#a9a9b5'
    ctx.font = '400 30px "Archivo", sans-serif'
    ctx.fillText(s.label, x + 40, boxY + 182)
  })

  // rodapé: CTA é a parte mais importante — destaque em lime
  ctx.fillStyle = '#a9a9b5'
  ctx.font = '700 36px "Archivo", sans-serif'
  const cta1 = 'descubra a sua ➜ '
  ctx.fillText(cta1, 80, H - 80)
  ctx.fillStyle = '#d8ff3e'
  ctx.fillText('quanto-cobro.vercel.app', 80 + ctx.measureText(cta1).width, H - 80)

  return new Promise((res) => canvas.toBlob(res, 'image/png'))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function baixarCard(blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'quanto-cobrar.png'
  a.click()
  URL.revokeObjectURL(url)
}

export async function compartilharCard(blob) {
  const file = new File([blob], 'quanto-cobrar.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Quanto Cobrar?',
        text: 'Descobri quanto minha hora precisa valer 👇',
      })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
    }
  }
  baixarCard(blob)
}
