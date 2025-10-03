"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

const COLORS = ["#e11d48", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6"]

interface RegionalComparisonProps {
  feature: "agriculture" | "pollen" | "desertification"
}

export function RegionalComparison({ feature }: RegionalComparisonProps) {
  const regionalData = [
    { region: "Sahel", value: 0.52, risk: 7.2, trend: -2.3 },
    { region: "East Africa", value: 0.68, risk: 4.5, trend: 1.8 },
    { region: "West Africa", value: 0.61, risk: 5.8, trend: -0.5 },
    { region: "Southern Africa", value: 0.45, risk: 6.9, trend: -3.1 },
    { region: "North Africa", value: 0.38, risk: 8.1, trend: -1.9 },
    { region: "Central Africa", value: 0.72, risk: 3.2, trend: 2.5 },
  ]

  const radarData = regionalData.map((d) => ({
    region: d.region.split(" ")[0],
    value: d.value * 100,
    risk: d.risk * 10,
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Comparison</CardTitle>
          <CardDescription>Compare metrics across all African regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Current Value">
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment by Region</CardTitle>
          <CardDescription>Multi-dimensional regional analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="region" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Value" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                <Radar name="Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Regional Trends</CardTitle>
          <CardDescription>Year-over-year change by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="region" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="trend" name="% Change">
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.trend > 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
