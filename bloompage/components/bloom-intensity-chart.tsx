"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ProcessedBloomData } from "@/lib/data-processor"

interface BloomIntensityChartProps {
  data: ProcessedBloomData[]
  title?: string
}

export function BloomIntensityChart({ data, title = "Bloom Intensity Distribution" }: BloomIntensityChartProps) {
  // Aggregate by month and intensity
  const monthlyData = data.reduce(
    (acc, d) => {
      const month = new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      if (!acc[month]) {
        acc[month] = { month, Mild: 0, Moderate: 0, Peak: 0 }
      }
      acc[month][d.bloomIntensity]++
      return acc
    },
    {} as Record<string, { month: string; Mild: number; Moderate: number; Peak: number }>,
  )

  const chartData = Object.values(monthlyData)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Monthly bloom intensity frequency</p>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis dataKey="month" stroke="#718096" style={{ fontSize: "12px" }} />
            <YAxis stroke="#718096" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e2e",
                border: "1px solid #2a2a3e",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="Mild" fill="#718096" />
            <Bar dataKey="Moderate" fill="#ed8936" />
            <Bar dataKey="Peak" fill="#38b2ac" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
