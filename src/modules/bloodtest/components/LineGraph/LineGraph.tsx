import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useRef, useState } from 'react'

export type LineGraphPoint = {
  x: string
  y: number
  tooltipLabel?: string
}

type Props = {
  data: LineGraphPoint[]
  height?: number
  stroke?: string
  showDots?: boolean
  showValueLabels?: boolean
  yDomain?: [number, number] | ['auto' | number, 'auto' | number]
}

function YAxisTick(props: { x?: number; y?: number; payload?: { value?: unknown } }) {
  const x = typeof props.x === 'number' ? props.x : 0
  const y = typeof props.y === 'number' ? props.y : 0
  const value = props.payload?.value

  return (
    <text
      x={Math.max(0, x - 42)}
      y={y}
      dy={4}
      textAnchor="start"
      fill="#828282"
      fontSize={13}
      fontFamily="Poppins, sans-serif"
    >
      {typeof value === 'number' ? value : String(value ?? '')}
    </text>
  )
}

export function LineGraph({
  data,
  height = 196,
  stroke = '#8B5CF6',
  showDots = true,
  showValueLabels = false,
  yDomain = ['auto', 'auto'],
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const updateWidth = () => setWidth(Math.max(0, Math.floor(el.getBoundingClientRect().width)))
    updateWidth()
    const ro = new ResizeObserver(updateWidth)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!Number.isFinite(height) || height <= 0) {
    return <div style={{ width: '100%', height: 196, minHeight: 196, minWidth: 0 }} />
  }
  const dense = data.length > 4
  const hasDrawableWidth = width > 0
  return (
    <div ref={hostRef} style={{ width: '100%', height, minHeight: height, minWidth: 1 }}>
      {hasDrawableWidth ? (
        <LineChart width={width} height={height} data={data} margin={{ top: 8, right: 10, bottom: dense ? 22 : 14, left: 6 }}>
          <CartesianGrid stroke="#E7E1FF" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="x"
            axisLine={false}
            tickLine={false}
            height={dense ? 42 : 28}
            tickMargin={dense ? 12 : 8}
            angle={dense ? -35 : 0}
            textAnchor={dense ? 'end' : 'middle'}
            tick={{ fill: '#828282', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            width={50}
            tickMargin={0}
            tick={<YAxisTick />}
          />
          <Tooltip
            cursor={{ stroke: '#E7E1FF', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #E7E1FF',
              boxShadow: '0px 4px 27.3px rgba(0,0,0,0.08)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
            }}
            labelStyle={{ color: '#161616', fontWeight: 600 }}
            labelFormatter={(label: unknown, payload: Array<{ payload?: LineGraphPoint }> = []) => {
              const tooltipLabel = payload[0]?.payload?.tooltipLabel
              return tooltipLabel || String(label ?? '')
            }}
            formatter={(v: unknown) => (typeof v === 'number' ? v : String(v))}
          />
          <Line
            type="linear"
            dataKey="y"
            stroke={stroke}
            strokeWidth={2}
            dot={showDots ? { r: 4, strokeWidth: 2, fill: stroke } : false}
            activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
          >
            {showValueLabels && (
              <LabelList
                dataKey="y"
                position="top"
                offset={8}
                formatter={(v: unknown) => (typeof v === 'number' ? String(v) : String(v ?? ''))}
                style={{ fill: '#414141', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
              />
            )}
          </Line>
        </LineChart>
      ) : null}
    </div>
  )
}

