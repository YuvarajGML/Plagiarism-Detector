import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList
} from 'recharts'

export default function BenchmarkChart() {
  const [metric, setMetric] = useState('time') // 'time' | 'nodes'

  const data = [
    {
      name: 'Naive',
      time: 2340,
      nodes: 980000,
      color: '#94A3B8', // Gray-400
    },
    {
      name: 'KMP',
      time: 340,
      nodes: 124000,
      color: '#EA580C', // Orange-600
    },
    {
      name: 'Horspool',
      time: 48,
      nodes: 18000,
      color: '#028090', // Teal
    }
  ]

  const formatValue = (val) => {
    if (metric === 'time') {
      return `${val} ms`
    }
    return val.toLocaleString()
  }

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-slate-800 text-white p-2.5 rounded-lg text-xs shadow-md border border-slate-700">
          <p className="font-semibold mb-1">{dataPoint.name} Algorithm</p>
          <p className="text-slate-300">
            {metric === 'time' ? 'Execution Time' : 'Nodes Explored'}:{' '}
            <span className="text-white font-medium">
              {formatValue(dataPoint[metric])}
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Metric Selector Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Algorithm Benchmark
        </h3>
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button
            onClick={() => setMetric('time')}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
              metric === 'time'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Time (ms)
          </button>
          <button
            onClick={() => setMetric('nodes')}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
              metric === 'nodes'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Nodes Explored
          </button>
        </div>
      </div>

      {/* Horizontal Bar Chart Container */}
      <div className="h-44 w-full select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, metric === 'time' ? 2500 : 1000000]}
              tick={{ fontSize: 9, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 10, fontWeight: 600, fill: '#0F172A' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC', opacity: 0.5 }} />
            <Bar
              dataKey={metric}
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey={metric}
                position="right"
                formatter={formatValue}
                style={{ fontSize: '10px', fontWeight: 600, fill: '#64748B' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
