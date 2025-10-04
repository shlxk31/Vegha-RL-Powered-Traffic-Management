'use client'

import { BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  time: string
  predicted: number
  current: number
}

interface TrafficFlowChartProps {
  data: ChartData[]
}

export default function TrafficFlowChart({ data }: TrafficFlowChartProps) {
  return (
    <div className="xl:col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <BarChart3 className="w-5 h-5 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Traffic Flow Trend
        </h3>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-700" 
            />
            <XAxis 
              dataKey="time" 
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis className="text-gray-600 dark:text-gray-400" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgb(31 41 55)',
                border: '1px solid rgb(75 85 99)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#6B7280"
              strokeWidth={2}
              dot={{ fill: '#6B7280', strokeWidth: 2, r: 4 }}
              name="Current Flow"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Predicted Flow"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}