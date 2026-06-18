/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef, useState } from 'react'
import { PublicLayout } from '@/components/layout'

// ─── Color constants ───────────────────────────────────────────────────────────
const US = '#2563EB'
const CN = '#DC2626'

// ─── Types ─────────────────────────────────────────────────────────────────────
type Side = 'us' | 'cn'
type DataPoint = { n: string; s: Side; x: number; p: number }
type Dimension = {
  title: string
  src: string
  xlabel: string
  xmin: number
  xmax: number
  pts: DataPoint[]
}
type DimensionKey = 'index' | 'coding' | 'agent' | 'science'
type CellData = { v: string; src: string; win?: boolean; cnwin?: boolean }
type BenchmarkRow = {
  label: string
  sub: string
  usVals: CellData[]
  cnVals: CellData[]
  children?: BenchmarkRow[]
}
type RenderBenchmarkRow = BenchmarkRow & { isChild?: boolean }

const US_MODELS = ['Claude Opus 4.8', 'GPT-5.5', 'Gemini 3.1 Pro']
const CN_MODELS = ['Qwen 3.7 Max', 'DeepSeek V4-Pro', 'GLM-5.1']

// ─── Benchmark data ────────────────────────────────────────────────────────────
const DATA: Record<DimensionKey, Dimension> = {
  index: {
    title: '综合能力 · AA 智能指数 v4.1',
    src: '来源：Artificial Analysis（独立复测）',
    xlabel: 'AA 智能指数 → 越右越强',
    xmin: 38,
    xmax: 58,
    pts: [
      { n: 'Claude Opus 4.8', s: 'us', x: 56, p: 25 },
      { n: 'GPT-5.5', s: 'us', x: 55, p: 30 },
      { n: 'Gemini 3.1 Pro', s: 'us', x: 46, p: 12 },
      { n: 'Qwen 3.7 Max', s: 'cn', x: 46, p: 1.5 },
      { n: 'DeepSeek V4-Pro', s: 'cn', x: 44, p: 0.87 },
      { n: 'GLM-5.1', s: 'cn', x: 40, p: 3.08 },
    ],
  },
  coding: {
    title: '编程 · SciCode（AA）',
    src: '来源：Artificial Analysis · SciCode',
    xlabel: 'SciCode（%）→ 越右越强',
    xmin: 42,
    xmax: 62,
    pts: [
      { n: 'Gemini 3.1 Pro', s: 'us', x: 59, p: 12 },
      { n: 'GPT-5.5', s: 'us', x: 56, p: 30 },
      { n: 'Claude Opus 4.8', s: 'us', x: 53, p: 25 },
      { n: 'DeepSeek V4-Pro', s: 'cn', x: 50, p: 0.87 },
      { n: 'Qwen 3.7 Max', s: 'cn', x: 49, p: 1.5 },
      { n: 'GLM-5.1', s: 'cn', x: 44, p: 3.08 },
    ],
  },
  agent: {
    title: '智能体 · Terminal-Bench v2.1（AA）',
    src: '来源：Artificial Analysis · Terminal-Bench v2.1',
    xlabel: 'Terminal-Bench v2.1（%）→ 越右越强',
    xmin: 58,
    xmax: 88,
    pts: [
      { n: 'Claude Opus 4.8', s: 'us', x: 85, p: 25 },
      { n: 'GPT-5.5', s: 'us', x: 84, p: 30 },
      { n: 'Qwen 3.7 Max', s: 'cn', x: 75, p: 1.5 },
      { n: 'Gemini 3.1 Pro', s: 'us', x: 74, p: 12 },
      { n: 'DeepSeek V4-Pro', s: 'cn', x: 64, p: 0.87 },
      { n: 'GLM-5.1', s: 'cn', x: 62, p: 3.08 },
    ],
  },
  science: {
    title: '科学·生物 · GPQA Diamond（AA）',
    src: '来源：Artificial Analysis · GPQA Diamond',
    xlabel: 'GPQA Diamond（%）→ 越右越强',
    xmin: 85,
    xmax: 96,
    pts: [
      { n: 'GPT-5.5', s: 'us', x: 94, p: 30 },
      { n: 'Gemini 3.1 Pro', s: 'us', x: 94, p: 12 },
      { n: 'Claude Opus 4.8', s: 'us', x: 92, p: 25 },
      { n: 'Qwen 3.7 Max', s: 'cn', x: 92, p: 1.5 },
      { n: 'DeepSeek V4-Pro', s: 'cn', x: 89, p: 0.87 },
      { n: 'GLM-5.1', s: 'cn', x: 87, p: 3.08 },
    ],
  },
}

const BENCHMARK_ROWS: BenchmarkRow[] = [
  {
    label: '综合能力',
    sub: 'Artificial Analysis 智能指数 v4.1',
    usVals: [
      { v: '56', src: 'AA · 本组#1', win: true },
      { v: '55', src: 'AA' },
      { v: '46', src: 'AA' },
    ],
    cnVals: [
      { v: '46', src: 'AA · 国产最高' },
      { v: '44', src: 'AA' },
      { v: '40', src: 'AA' },
    ],
    children: [
      {
        label: '编程',
        sub: 'SciCode · 真实科研编程 %',
        usVals: [
          { v: '53', src: 'AA' },
          { v: '56', src: 'AA' },
          { v: '59', src: 'AA · 本组#1', win: true },
        ],
        cnVals: [
          { v: '49', src: 'AA' },
          { v: '50', src: 'AA' },
          { v: '44', src: 'AA' },
        ],
      },
      {
        label: '智能体',
        sub: 'Terminal-Bench v2.1 · 自主操作 %',
        usVals: [
          { v: '85', src: 'AA · 本组#1', win: true },
          { v: '84', src: 'AA' },
          { v: '74', src: 'AA' },
        ],
        cnVals: [
          { v: '75', src: 'AA · 国产最高' },
          { v: '64', src: 'AA' },
          { v: '62', src: 'AA' },
        ],
      },
      {
        label: '科学 · 生物',
        sub: 'GPQA Diamond · 研究生级生化物 %',
        usVals: [
          { v: '92', src: 'AA' },
          { v: '94', src: 'AA · 并列#1', win: true },
          { v: '94', src: 'AA · 并列#1', win: true },
        ],
        cnVals: [
          { v: '92', src: 'AA · 国产最高' },
          { v: '89', src: 'AA' },
          { v: '87', src: 'AA' },
        ],
      },
    ],
  },
  {
    label: '价格',
    sub: '输出 · 美元 / 百万 token',
    usVals: [
      { v: '$25', src: '官方' },
      { v: '$30', src: '官方' },
      { v: '$12', src: '官方' },
    ],
    cnVals: [
      { v: '$1.5', src: '官方·qwen3-max' },
      { v: '$0.87', src: '官方·折扣价', cnwin: true },
      { v: '$3.08', src: '官方' },
    ],
  },
]

// ─── Chart layout helpers (ported from original) ───────────────────────────────
type LabelBox = { l: number; r: number; t: number; b: number }
type PlacedItem = { name: LabelBox; stat: LabelBox }
type LayoutItem = {
  pt: DataPoint
  cx: number
  cy: number
  lx: number
  nameY: number
  statY: number
  anchor: 'middle' | 'start' | 'end'
  leader: boolean
}

function textBox(lx: number, ly: number, text: string, anchor: 'middle' | 'start' | 'end', isSub: boolean): LabelBox {
  const fs = isSub ? 5.8 : 6.8
  const w = Math.max(text.length * fs, 36)
  const left = anchor === 'middle' ? lx - w / 2 : anchor === 'end' ? lx - w : lx
  return { l: left, r: left + w, t: ly - (isSub ? 10 : 11.5), b: ly + 3 }
}

function hit(a: LabelBox, b: LabelBox, gap = 6) {
  return !(a.r + gap < b.l || b.r + gap < a.l || a.b + gap < b.t || b.b + gap < a.t)
}

function layoutLabels(
  pts: DataPoint[],
  sx: (x: number) => number,
  sy: (p: number) => number,
  padT: number,
  plotH: number,
): LayoutItem[] {
  const items: LayoutItem[] = pts.map((pt) => ({
    pt,
    cx: sx(pt.x),
    cy: sy(pt.p),
    lx: 0,
    nameY: 0,
    statY: 0,
    anchor: 'middle',
    leader: false,
  }))
  items.sort((a, b) => a.cy - b.cy || a.cx - b.cx)
  const placed: PlacedItem[] = []

  items.forEach((it) => {
    const preferTop = it.cy < padT + plotH * 0.42
    const slots: { side: string; nameDy: number; statDy: number; anchor: 'middle' | 'start' | 'end'; dx?: number }[] = [
      { side: 'top', nameDy: -18, statDy: -30, anchor: 'middle' },
      { side: 'bottom', nameDy: 22, statDy: 34, anchor: 'middle' },
      { side: 'top-right', nameDy: -16, statDy: -28, anchor: 'start', dx: 8 },
      { side: 'top-left', nameDy: -16, statDy: -28, anchor: 'end', dx: -8 },
      { side: 'bottom-right', nameDy: 20, statDy: 32, anchor: 'start', dx: 8 },
      { side: 'bottom-left', nameDy: 20, statDy: 32, anchor: 'end', dx: -8 },
      { side: 'right', nameDy: 4, statDy: 16, anchor: 'start', dx: 12 },
      { side: 'left', nameDy: 4, statDy: 16, anchor: 'end', dx: -12 },
    ]
    if (preferTop) {
      slots.sort((a, b) => {
        const rank = (s: string) => (s.startsWith('top') ? 0 : s === 'right' || s === 'left' ? 1 : 2)
        return rank(a.side) - rank(b.side)
      })
    }

    let pick = slots[0]
    for (const sl of slots) {
      const dx = sl.dx ?? 0
      const lx = it.cx + dx
      const ny = it.cy + sl.nameDy
      const sy2 = it.cy + sl.statDy
      const nb = textBox(lx, ny, it.pt.n, sl.anchor, false)
      const sb = textBox(lx, sy2, `${it.pt.x} · $${it.pt.p}`, sl.anchor, true)
      let ok = true
      for (const p of placed) {
        if (hit(nb, p.name) || hit(sb, p.name) || hit(nb, p.stat) || hit(sb, p.stat)) {
          ok = false
          break
        }
      }
      if (ok) { pick = sl; break }
    }

    const dx2 = pick.dx ?? 0
    it.lx = it.cx + dx2
    it.nameY = it.cy + pick.nameDy
    it.statY = it.cy + pick.statDy
    it.anchor = pick.anchor
    it.leader = Math.abs(dx2) > 2 || Math.abs(pick.nameDy) > 22
    placed.push({
      name: textBox(it.lx, it.nameY, it.pt.n, it.anchor, false),
      stat: textBox(it.lx, it.statY, `${it.pt.x} · $${it.pt.p}`, it.anchor, true),
    })
  })

  return items
}

// ─── Scatter chart ─────────────────────────────────────────────────────────────
function buildChartSvg(key: DimensionKey, mobile: boolean): string {
  const d = DATA[key]
  const W = mobile ? 390 : 960
  const H = mobile ? 380 : 460
  const padL = mobile ? 42 : 72
  const padR = mobile ? 24 : 44
  const padT = mobile ? 44 : 52
  const padB = mobile ? 54 : 64
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const pmax = 32

  const xs = d.pts.map((p) => p.x)
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  const span = Math.max(hi - lo, (d.xmax - d.xmin) * 0.12)
  const m = Math.max(span * 0.06, 0.4)
  const xmin = Math.max(d.xmin, lo - m)
  const xmax = Math.min(d.xmax, hi + m)

  const sx = (x: number) => padL + ((x - xmin) / (xmax - xmin)) * plotW
  const sy = (p: number) => padT + plotH - (p / pmax) * plotH

  const fs = mobile ? 8.8 : 10.5
  const fsAxis = mobile ? 9.5 : 12
  const fsName = mobile ? 9.4 : 11.5

  const esc = (t: string | number) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const modelLabel = (name: string) => {
    if (!mobile) return name
    return name
      .replace('Claude Opus 4.8', 'Claude')
      .replace('Gemini 3.1 Pro', 'Gemini')
      .replace('Qwen 3.7 Max', 'Qwen')
      .replace('DeepSeek V4-Pro', 'DeepSeek')
  }

  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.title)}" style="display:block;width:100%;height:auto;font-family:ui-monospace,monospace">`
  s += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="currentColor" stroke-opacity="0.15"/>`
  s += `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="currentColor" stroke-opacity="0.15"/>`

  for (const p of [0, 8, 16, 24, 32]) {
    const y = sy(p)
    s += `<line x1="${padL}" y1="${y}" x2="${padL + plotW}" y2="${y}" stroke="currentColor" stroke-opacity="0.07"/>`
    s += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="currentColor" fill-opacity="0.45" font-size="${fs}">$${p}</text>`
  }

  const xticks = [xmin, (xmin + xmax) / 2, xmax]
  for (const v of xticks) {
    const x = sx(v)
    s += `<text x="${x}" y="${padT + plotH + 18}" text-anchor="middle" fill="currentColor" fill-opacity="0.45" font-size="${fs}">${Math.round(v * 10) / 10}</text>`
  }

  s += `<text x="${padL + plotW / 2}" y="${H - 12}" text-anchor="middle" fill="currentColor" fill-opacity="0.6" font-size="${fsAxis}">${esc(d.xlabel)}</text>`
  s += `<text x="${padL - 42}" y="${padT - 12}" fill="currentColor" fill-opacity="0.6" font-size="${fsAxis}">价格 $/M ↑</text>`

  const items = layoutLabels(d.pts, sx, sy, padT, plotH)
  for (const it of items) {
    const c = it.pt.s === 'us' ? US : CN
    const r = it.pt.s === 'us' ? (mobile ? 7 : 8) : (mobile ? 6 : 7)
    if (it.leader) {
      s += `<line x1="${it.cx}" y1="${it.cy}" x2="${it.lx}" y2="${it.nameY}" stroke="${c}" stroke-opacity=".35" stroke-width="1"/>`
    }
    s += `<circle cx="${it.cx}" cy="${it.cy}" r="${r}" fill="${c}" fill-opacity=".9" stroke="white" stroke-opacity="0.8" stroke-width="1.5"/>`
    s += `<text x="${it.lx}" y="${it.nameY}" text-anchor="${it.anchor}" fill="${c}" font-size="${fsName}" font-weight="700">${esc(modelLabel(it.pt.n))}</text>`
    s += `<text x="${it.lx}" y="${it.statY}" text-anchor="${it.anchor}" fill="currentColor" fill-opacity="0.5" font-size="${fs}">${it.pt.x} · $${it.pt.p}</text>`
  }

  s += '</svg>'
  return s
}

function ScatterChart({ activeKey }: { activeKey: DimensionKey }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const render = () => {
      const mobile = window.innerWidth <= 767
      setSvg(buildChartSvg(activeKey, mobile))
    }
    render()
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(timer); timer = setTimeout(render, 120) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
  }, [activeKey])

  return (
    <div
      ref={containerRef}
      className='w-full overflow-hidden'
    >
      <div
        className='w-full'
        // Data is fully hardcoded, no user input — safe use of dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}

// ─── Table ─────────────────────────────────────────────────────────────────────
function DataTable() {
  const [showChildren, setShowChildren] = useState(true)
  const rows: RenderBenchmarkRow[] = BENCHMARK_ROWS.flatMap((row) => {
    const childRows = showChildren ? row.children ?? [] : []

    return [
      { ...row, isChild: false },
      ...childRows.map((child) => ({ ...child, isChild: true })),
    ]
  })

  return (
    <div
      className='hidden overflow-hidden rounded-2xl border border-border/60 shadow-sm lg:block'
    >
      <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed', fontSize: '13.5px' }}>
        <colgroup>
          <col style={{ width: '23%' }} />
          <col style={{ width: '15.36%' }} />
          <col style={{ width: '8.89%' }} />
          <col style={{ width: '14.05%' }} />
          <col style={{ width: '13.44%' }} />
          <col style={{ width: '16.06%' }} />
          <col style={{ width: '9.2%' }} />
        </colgroup>
        <caption style={{ captionSide: 'bottom', textAlign: 'left', fontSize: '12px', padding: '13px 16px', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
          六个型号四维度均取自 Artificial Analysis 独立复测（智能指数 v4.1 及其分项 SciCode、Terminal-Bench v2.1、GPQA Diamond），采集于 2026 年 6 月，口径统一。价格为各厂商官方输出价（美元/百万 token，人民币按 1 USD≈6.76 CNY 折算）：Qwen 取 qwen3-max，DeepSeek V4-Pro 为官网折扣价，GLM-5.1 为国际站美元报价。
        </caption>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', background: 'color-mix(in oklch, var(--muted) 30%, transparent)', padding: '13px 12px', borderBottom: '1px solid var(--border)', fontSize: '12.5px', fontWeight: 700 }} rowSpan={2} />
            <th colSpan={3} style={{ color: US, padding: '13px 12px 10px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, background: 'color-mix(in oklch, var(--muted) 20%, transparent)' }}>
              <span style={{ display: 'inline-block', borderBottom: `2px solid ${US}`, paddingBottom: '7px' }}>
                美国前沿
              </span>
            </th>
            <th colSpan={3} style={{ color: CN, padding: '13px 12px 10px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, background: 'color-mix(in oklch, var(--muted) 20%, transparent)' }}>
              <span style={{ display: 'inline-block', borderBottom: `2px solid ${CN}`, paddingBottom: '7px' }}>
                国产主力
              </span>
            </th>
          </tr>
          <tr>
            {US_MODELS.map((m) => (
              <th key={m} style={{ color: US, borderBottom: '1px solid var(--border)', padding: '13px 12px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, background: 'color-mix(in oklch, var(--muted) 20%, transparent)' }}>{m}</th>
            ))}
            {CN_MODELS.map((m) => (
              <th key={m} style={{ color: CN, borderBottom: '1px solid var(--border)', padding: '13px 12px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, background: 'color-mix(in oklch, var(--muted) 20%, transparent)' }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <TableRow
              key={`${row.label}-${row.sub}`}
              childrenExpanded={showChildren}
              hasChildren={Boolean(row.children?.length)}
              onToggleChildren={row.children?.length ? () => setShowChildren((prev) => !prev) : undefined}
              {...row}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BenchmarkTabs({
  activeIndex,
  onChange,
}: {
  activeIndex: number
  onChange: (index: number) => void
}) {
  const activeRow = BENCHMARK_ROWS[activeIndex]

  return (
    <div className='lg:hidden'>
      <div className='-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0' role='tablist'>
        {BENCHMARK_ROWS.map((row, index) => (
          <button
            aria-controls='benchmark-panel'
            aria-selected={activeIndex === index}
            className='min-h-[44px] shrink-0 cursor-pointer rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-150'
            id={`benchmark-tab-${index}`}
            key={row.label}
            onClick={() => onChange(index)}
            role='tab'
            style={
              activeIndex === index
                ? { background: 'var(--foreground)', color: 'var(--background)', borderColor: 'var(--foreground)' }
                : { background: 'transparent', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
            }
          >
            {row.label}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`benchmark-tab-${activeIndex}`}
        className='overflow-hidden rounded-2xl border border-border/60 bg-muted/20'
        id='benchmark-panel'
        role='tabpanel'
      >
        <div className='border-b border-border/50 px-4 py-3'>
          <h3 className='text-sm font-bold text-foreground'>{activeRow.label}</h3>
          <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
            {activeRow.sub}
          </p>
        </div>
        <div className='grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0'>
          <MobileMetricGroup
            accent={US}
            cells={activeRow.usVals}
            models={US_MODELS}
            title='美国前沿'
          />
          <MobileMetricGroup
            accent={CN}
            cells={activeRow.cnVals}
            models={CN_MODELS}
            title='国产主力'
          />
        </div>
      </section>
    </div>
  )
}

function MobileMetricGroup({
  accent,
  cells,
  models,
  title,
}: {
  accent: string
  cells: CellData[]
  models: string[]
  title: string
}) {
  return (
    <div className='p-3.5'>
      <div className='mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground'>
        <span className='inline-block size-2 rounded-full' style={{ background: accent }} />
        {title}
      </div>
      <div className='space-y-2'>
        {cells.map((cell, index) => {
          const isWinner = cell.win || cell.cnwin

          return (
            <div
              key={models[index]}
              className='grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-background/65 px-3 py-2.5'
            >
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold text-foreground'>
                  {models[index]}
                </p>
                <p className='mt-0.5 text-[11px] text-muted-foreground'>
                  {cell.src}
                </p>
              </div>
              <span
                className='font-mono text-base font-bold'
                style={{ color: isWinner ? accent : 'var(--foreground)' }}
              >
                {cell.v}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TableRow({
  label,
  sub,
  usVals,
  cnVals,
  isChild = false,
  hasChildren = false,
  childrenExpanded = false,
  onToggleChildren,
}: {
  label: string
  sub: string
  usVals: CellData[]
  cnVals: CellData[]
  isChild?: boolean
  hasChildren?: boolean
  childrenExpanded?: boolean
  onToggleChildren?: () => void
}) {
  const cellBase: React.CSSProperties = { padding: '13px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)' }
  const isPrice = label === '价格'
  const isHighlightedParent = label === '综合能力'
  const highlightedRowBackground = 'color-mix(in oklch, var(--muted) 48%, transparent)'
  const headerBackground = isPrice || isHighlightedParent
    ? 'transparent'
    : isChild
      ? 'color-mix(in oklch, var(--muted) 8%, transparent)'
      : 'color-mix(in oklch, var(--muted) 15%, transparent)'
  const usBackground = 'transparent'
  const cnBackground = 'transparent'

  return (
    <tr style={{ background: isPrice || isHighlightedParent ? highlightedRowBackground : undefined }}>
      <th style={{ position: 'relative', textAlign: 'left', fontWeight: isChild ? 600 : 700, background: headerBackground, width: '180px', fontSize: '13px', padding: isChild ? '13px 12px 13px 28px' : hasChildren ? '13px 12px 26px' : '13px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{label}</span>
        </div>
        {hasChildren ? (
          <button
            aria-expanded={childrenExpanded}
            onClick={onToggleChildren}
            style={{ position: 'absolute', right: '12px', bottom: '-12px', zIndex: 1, cursor: 'pointer', borderRadius: '999px', border: '1px solid var(--border)', background: 'var(--background)', boxShadow: '0 1px 3px color-mix(in oklch, black 10%, transparent)', padding: '4px 9px', fontSize: '10.5px', fontWeight: 600, color: 'var(--muted-foreground)' }}
            type='button'
          >
            细分领域 {childrenExpanded ? '−' : '+'}
          </button>
        ) : null}
        <small style={{ display: 'block', color: 'var(--muted-foreground)', fontWeight: 400, fontSize: '10.5px', marginTop: '2px' }}>{sub}</small>
      </th>
      {usVals.map((cell, i) => (
        <td key={i} style={{ ...cellBase, background: usBackground }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '15px', fontWeight: 700, color: cell.win ? US : 'inherit' }}>{cell.v}</span>
          <span style={{ display: 'block', fontFamily: 'ui-monospace,monospace', fontSize: '9.5px', color: 'var(--muted-foreground)', marginTop: '1px' }}>{cell.src}</span>
        </td>
      ))}
      {cnVals.map((cell, i) => (
        <td key={i} style={{ ...cellBase, background: cnBackground }}>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: '15px', fontWeight: 700, color: cell.cnwin ? CN : 'inherit' }}>{cell.v}</span>
          <span style={{ display: 'block', fontFamily: 'ui-monospace,monospace', fontSize: '9.5px', color: 'var(--muted-foreground)', marginTop: '1px' }}>{cell.src}</span>
        </td>
      ))}
    </tr>
  )
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: '为什么使用 Artificial Analysis 作为评分排列标准？',
    a: (
      <p>
        因为 AA <strong>独立复测、口径统一、覆盖全部对比型号</strong>，四个维度同源才可横比；若混用厂商自测或不同榜，各家脚手架不同会各说各话。
        <br /><br />
        <strong>AA 智能指数 v4.1</strong> 由 9 个评测加权组成（GDPval-AA v2、τ³-Banking、Terminal-Bench v2.1、SciCode、AA-LCR、AA-Omniscience、HLE、GPQA Diamond、CritPt），普遍用 <code>pass@1</code> 计分，将智能体（34%）、编程（24%）、科学推理（24%）、通用（18%）四大类按权重合成。本页把代表性分项单独列出：编程 = <strong>SciCode</strong>、智能体 = <strong>Terminal-Bench v2.1</strong>、科学 = <strong>GPQA Diamond</strong>、综合能力 = 智能指数总分。详见{' '}
        <a href='https://artificialanalysis.ai/methodology/intelligence-benchmarking' target='_blank' rel='noreferrer' style={{ color: US }}>AA 方法论</a>。
      </p>
    ),
    defaultOpen: true,
  },
  {
    q: 'AA 和 Scale / Arena 对比谁更权威？',
    a: (
      <div>
        <p><strong>三家各测什么？</strong><br />
        <strong style={{ color: US }}>AA</strong> — 独立第三方复测与聚合（本页数据来源）<br />
        <strong>Scale SEAL</strong> — 防污染私有榜（题目不公开、防刷分）<br />
        <strong>Arena</strong> — 人类盲投偏好（Bradley-Terry 算分）</p>
        <p><strong>为什么表格只用 AA？</strong><br />
        四维度需同源、同口径才可横比。Scale / Arena 对本页六个型号覆盖不全，硬做进表会出现空位；二者仅作方法论佐证，不进数据行。</p>
      </div>
    ),
  },
  {
    q: '编程为什么用 SciCode，不用 SWE-bench？',
    a: (
      <p>
        <strong>SWE-bench Verified 已被 OpenAI 于 2026 年弃用</strong>（基准饱和 + 训练污染）；<strong>SWE-bench Pro 口径不统一</strong>（同模型不同脚手架差 20–35 分，且标准化榜未覆盖本组全部型号）。<strong>SciCode</strong> 是 AA 标准化、独立复测、覆盖全部型号的科研编程评测，可横比；智能体/终端能力另用 <strong>Terminal-Bench v2.1</strong> 衡量。两者都是 AA 智能指数 v4.1 的组成项。
      </p>
    ),
  },
  {
    q: '为什么对比这六个模型？',
    a: (
      <p>
        本页对比的是最常用的旗舰模型，且要求四维度均有 AA 独立复测数据以保证同源可横比。<strong style={{ color: CN }}>豆包（Doubao Seed）未被 Artificial Analysis 此组评测收录</strong>，四个维度都无 AA 数据——若强行用厂商自测数据填入，会与其余六列口径不一致、不可直接横比，故暂未纳入。
      </p>
    ),
  },
]

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: React.ReactNode; defaultOpen?: boolean }) {
  const contentClassName =
    'border-t border-border/40 px-5 py-4 text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs [&_p]:mb-3 [&_p:last-child]:mb-0'

  return (
    <>
      <article className='hidden overflow-hidden rounded-xl border border-border/60 bg-muted/20 md:block'>
        <h3 className='px-5 py-4 text-sm font-semibold text-foreground'>
          {q}
        </h3>
        <div className={contentClassName}>{a}</div>
      </article>

      <details
        open={defaultOpen}
        className='group overflow-hidden rounded-xl border border-border/60 bg-muted/20 md:hidden'
      >
        <summary className='flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden'>
          {q}
          <span className='shrink-0 font-mono text-lg font-normal text-muted-foreground group-open:hidden'>+</span>
          <span className='hidden shrink-0 font-mono text-lg font-normal text-muted-foreground group-open:block'>−</span>
        </summary>
        <div className={contentClassName}>{a}</div>
      </details>
    </>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
const TABS: { key: DimensionKey; label: string }[] = [
  { key: 'index', label: '综合能力' },
  { key: 'coding', label: '编程' },
  { key: 'agent', label: '智能体' },
  { key: 'science', label: '科学·生物' },
]

export function CnUsCompare() {
  const [activeTab, setActiveTab] = useState<DimensionKey>('index')
  const [activeBenchmark, setActiveBenchmark] = useState(0)

  return (
    <PublicLayout>
      <div className='mx-auto w-full max-w-[1040px] px-0 sm:px-5'>

        {/* Header */}
        <header className='border-b border-border/50 py-10 sm:py-12'>
          <p className='mb-3 font-mono text-[11px] tracking-[.2em] uppercase text-muted-foreground'>
            Artificial Analysis · 中美模型对比 · 2026年6月
          </p>
          <h1 className='text-[clamp(1.6rem,4.2vw,2.5rem)] font-extrabold leading-[1.14] tracking-tight text-foreground mb-4'>
            主流大模型评测数据对比
          </h1>
          <p className='text-[15px] text-muted-foreground max-w-[68ch]'>
            六个主力型号的四个维度统一采用 Artificial Analysis 独立复测；价格为各厂商官方输出价。
          </p>
          {/* Legend */}
          <div className='mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground'>
            <span className='flex items-center gap-2'>
              <span className='inline-block size-2.5 rounded-full' style={{ background: US }} />
              美国前沿
            </span>
            <span className='flex items-center gap-2'>
              <span className='inline-block size-2.5 rounded-full' style={{ background: CN }} />
              国产主力
            </span>
          </div>
        </header>

        {/* Table section */}
        <section className='border-b border-border/50 py-9 sm:py-11'>
          <h2 className='text-[clamp(1.2rem,2.5vw,1.6rem)] font-bold tracking-tight text-foreground mb-1.5'>
            硬指标对照
          </h2>
          <p className='mb-6 text-sm text-muted-foreground'>
            四个维度同源、同口径，可直接横向比较。
          </p>
          <BenchmarkTabs
            activeIndex={activeBenchmark}
            onChange={setActiveBenchmark}
          />
          <DataTable />
        </section>

        {/* Chart section */}
        <section className='border-b border-border/50 py-9 sm:py-11'>
          <h2 className='text-[clamp(1.2rem,2.5vw,1.6rem)] font-bold tracking-tight text-foreground mb-1.5'>
            各维度和价格对比分析
          </h2>
          <p className='text-sm text-muted-foreground mb-5'>
            切换维度查看分数分布：横轴越右越强，纵轴越低越省。
          </p>

          {/* Tabs */}
          <div className='-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0' role='tablist'>
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                role='tab'
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className='min-h-[44px] shrink-0 cursor-pointer rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-150'
                style={
                  activeTab === key
                    ? { background: 'var(--foreground)', color: 'var(--background)', borderColor: 'var(--foreground)' }
                    : { background: 'transparent', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Chart card */}
          <div className='-mx-4 border-y border-border/60 bg-muted/20 p-3 sm:mx-0 sm:rounded-2xl sm:border sm:p-5'>
            <div className='flex flex-wrap items-baseline justify-between gap-3 mb-2'>
              <h3 className='text-base font-bold text-foreground'>{DATA[activeTab].title}</h3>
              <span className='font-mono text-[11px] text-muted-foreground'>{DATA[activeTab].src}</span>
            </div>
            <ScatterChart activeKey={activeTab} />
          </div>
        </section>

        {/* FAQ section */}
        <section className='border-b border-border/50 py-9 sm:py-11'>
          <h2 className='text-[clamp(1.2rem,2.5vw,1.6rem)] font-bold tracking-tight text-foreground mb-5'>
            常见问题
          </h2>
          <div className='grid gap-2.5 md:grid-cols-2'>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={item.defaultOpen} />
            ))}
          </div>
        </section>

        {/* Sources footer */}
        <footer className='py-9 pb-16 sm:py-10'>
          <div className='-mx-4 border-y border-border/60 bg-muted/20 p-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-5'>
            <p className='text-xs font-bold uppercase tracking-wider text-foreground mb-4'>数据来源</p>
            <div className='grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground'>
              <div className='flex flex-col gap-1'>
                <span className='font-mono text-[10.5px] tracking-widest uppercase text-muted-foreground/70'>四维度</span>
                <span className='leading-relaxed'>
                  Artificial Analysis 独立复测（智能指数 v4.1、SciCode、Terminal-Bench v2.1、GPQA Diamond）·{' '}
                  <a href='https://artificialanalysis.ai/leaderboards/models' target='_blank' rel='noreferrer' className='text-foreground underline underline-offset-2'>
                    artificialanalysis.ai
                  </a>
                </span>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-mono text-[10.5px] tracking-widest uppercase text-muted-foreground/70'>方法论佐证</span>
                <span className='leading-relaxed'>
                  Scale SEAL ·{' '}
                  <a href='https://scale.com/leaderboard' target='_blank' rel='noreferrer' className='text-foreground underline underline-offset-2'>scale.com/leaderboard</a>
                  <br />
                  LMArena / Arena ·{' '}
                  <a href='https://lmarena.ai/' target='_blank' rel='noreferrer' className='text-foreground underline underline-offset-2'>lmarena.ai</a>
                </span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </PublicLayout>
  )
}
