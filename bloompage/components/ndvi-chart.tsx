"use client"

import { Card } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ProcessedBloomData } from "@/lib/data-processor"

interface NDVIChartProps {
  data: ProcessedBloomData[]
  title?: string
}

export function NDVIChart({ data, title = "NDVI Trend Over Time" }: NDVIChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    NDVI: Number(d.ndvi.toFixed(3)),
    EVI: Number(d.evi.toFixed(3)),
    "Rolling Avg": Number(d.ndviRollingAvg.toFixed(3)),
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Vegetation indices tracking bloom health</p>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis dataKey="date" stroke="#718096" style={{ fontSize: "12px" }} />
            <YAxis stroke="#718096" style={{ fontSize: "12px" }} domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e2e",
                border: "1px solid #2a2a3e",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line type="monotone" dataKey="NDVI" stroke="#4299e1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="EVI" stroke="#48bb78" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="Rolling Avg"
              stroke="#ed8936"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
