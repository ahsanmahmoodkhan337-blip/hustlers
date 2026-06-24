'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts'

type UserStat = {
  id: string
  caseName: string
  wpm: number
  accuracy: number
  passed: boolean
  createdAt: string
}

interface StatsChartsProps {
  stats: UserStat[]
}

export default function StatsCharts({ stats }: StatsChartsProps) {
  if (stats.length === 0) return null

  // Prepare data for the charts, reversing to show chronological order
  const data = [...stats]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((stat, index) => ({
      session: `Test ${index + 1}`,
      wpm: stat.wpm,
      accuracy: stat.accuracy,
      fullDate: new Date(stat.createdAt).toLocaleString(),
      case: stat.caseName
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      {/* WPM Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
          <span>Words Per Minute Trend</span>
          <span className="text-[10px] text-slate-400 font-mono">Benchmark: 40 WPM</span>
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="session" 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false}
                domain={[0, (dataMax: number) => Math.max(60, Math.ceil(dataMax / 10) * 10)]}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="wpm" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWpm)" 
                animationDuration={1500}
              />
              {/* Reference line for 40 WPM baseline */}
              <Line 
                type="monotone" 
                dataKey={() => 40} 
                stroke="#94a3b8" 
                strokeDasharray="5 5" 
                dot={false}
                activeDot={false}
                name="Scribe Baseline"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
          <span>Accuracy Trend (%)</span>
          <span className="text-[10px] text-slate-400 font-mono">Target: 95%+</span>
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="session" 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false}
                domain={[70, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
