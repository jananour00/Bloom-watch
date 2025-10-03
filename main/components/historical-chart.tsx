"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { HistoricalDataPoint } from "@/app/actions/historical-data"

interface HistoricalChartProps {
  data: HistoricalDataPoint[]
  metric: string
}

export function HistoricalChart({ data, metric }: HistoricalChartProps) {
  // Group data by year and month for better visualization
  const chartData = data.reduce(
    (acc, point) => {
      const key = `${point.year}-${String(point.month).padStart(2, "0")}`
      if (!acc[key]) {
        acc[key] = {
          date: key,
          value: point.value,
          year: point.year,
        }
      }
      return acc
    },
    {} as Record<string, { date: string; value: number; year: number }>,
  )

  const sortedData = Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => {
            const [year, month] = value.split("-")
            return `${month}/${year.slice(2)}`
          }}
        />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 3 }}
          activeDot={{ r: 5 }}
          name={metric}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
