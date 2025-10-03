"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { HistoricalDataPoint } from "@/app/actions/historical-data"

interface FeatureChartsProps {
  feature: "agriculture" | "pollen" | "desertification"
  data: HistoricalDataPoint[]
}

const COLORS = ["#e11d48", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"]

export function FeatureCharts({ feature, data }: FeatureChartsProps) {
  // Aggregate data by year
  const yearlyData = data.reduce(
    (acc, point) => {
      const existing = acc.find((item) => item.year === point.year)
      if (existing) {
        existing.total += point.value
        existing.count += 1
        existing.max = Math.max(existing.max, point.value)
        existing.min = Math.min(existing.min, point.value)
      } else {
        acc.push({
          year: point.year,
          total: point.value,
          count: 1,
          max: point.value,
          min: point.value,
        })
      }
      return acc
    },
    [] as Array<{ year: number; total: number; count: number; max: number; min: number }>,
  )

  const chartData = yearlyData.map((item) => ({
    year: item.year.toString(),
    average: Number.parseFloat((item.total / item.count).toFixed(2)),
    max: Number.parseFloat(item.max.toFixed(2)),
    min: Number.parseFloat(item.min.toFixed(2)),
    range: Number.parseFloat((item.max - item.min).toFixed(2)),
  }))

  // Monthly data for the most recent year
  const recentYearData = data
    .filter((d) => d.year === 2023)
    .map((d) => ({
      month: new Date(2023, d.month - 1).toLocaleString("default", { month: "short" }),
      value: Number.parseFloat(d.value.toFixed(2)),
    }))

  // Seasonal aggregation
  const seasonalData = data.reduce(
    (acc, point) => {
      const season =
        point.month <= 2 || point.month === 12
          ? "Winter"
          : point.month <= 5
            ? "Spring"
            : point.month <= 8
              ? "Summer"
              : "Autumn"
      const existing = acc.find((item) => item.season === season)
      if (existing) {
        existing.total += point.value
        existing.count += 1
      } else {
        acc.push({ season, total: point.value, count: 1 })
      }
      return acc
    },
    [] as Array<{ season: string; total: number; count: number }>,
  )

  const seasonalChartData = seasonalData.map((item) => ({
    season: item.season,
    average: Number.parseFloat((item.total / item.count).toFixed(2)),
  }))

  // Distribution data (value ranges)
  const distributionData = [
    { range: "Very Low", count: data.filter((d) => d.value < 0.3 || d.value < 30).length },
    {
      range: "Low",
      count: data.filter((d) => (d.value >= 0.3 && d.value < 0.5) || (d.value >= 30 && d.value < 50)).length,
    },
    {
      range: "Medium",
      count: data.filter((d) => (d.value >= 0.5 && d.value < 0.7) || (d.value >= 50 && d.value < 70)).length,
    },
    {
      range: "High",
      count: data.filter((d) => (d.value >= 0.7 && d.value < 0.85) || (d.value >= 70 && d.value < 85)).length,
    },
    { range: "Very High", count: data.filter((d) => d.value >= 0.85 || d.value >= 85).length },
  ]

  // Year-over-year comparison
  const yoyData = chartData.slice(1).map((item, index) => ({
    year: item.year,
    current: item.average,
    previous: chartData[index].average,
    change: Number.parseFloat(
      (((item.average - chartData[index].average) / chartData[index].average) * 100).toFixed(2),
    ),
  }))

  // Radar chart data for multi-metric analysis
  const radarData = [
    { metric: "Average", value: chartData[chartData.length - 1].average },
    { metric: "Peak", value: chartData[chartData.length - 1].max },
    { metric: "Low", value: chartData[chartData.length - 1].min },
    { metric: "Stability", value: 100 - chartData[chartData.length - 1].range * 10 },
    { metric: "Trend", value: yoyData[yoyData.length - 1]?.change > 0 ? 80 : 40 },
  ]

  // Scatter plot data for correlation analysis
  const scatterData = data.map((d) => ({
    month: d.month,
    value: d.value,
    year: d.year,
  }))

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="average"
                fill="#e11d48"
                fillOpacity={0.3}
                stroke="#e11d48"
                name="Average"
              />
              <Bar dataKey="max" fill="#22c55e" name="Maximum" />
              <Bar dataKey="min" fill="#ef4444" name="Minimum" />
              <Line type="monotone" dataKey="average" stroke="#e11d48" strokeWidth={3} name="Trend" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="trends" className="space-y-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="max" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="Maximum" />
              <Area
                type="monotone"
                dataKey="average"
                stroke="#e11d48"
                fillOpacity={1}
                fill="url(#colorAvg)"
                name="Average"
              />
              <Area type="monotone" dataKey="min" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Minimum" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="seasonal" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" name="Seasonal Average">
                  {seasonalChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seasonalChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ season, average }) => `${season}: ${average.toFixed(2)}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="average"
                >
                  {seasonalChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="distribution" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="range" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Frequency">
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="comparison" className="space-y-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="previous" fill="#94a3b8" name="Previous Year" />
              <Bar dataKey="current" fill="#e11d48" name="Current Year" />
              <Line type="monotone" dataKey="change" stroke="#f97316" strokeWidth={2} name="% Change" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="analysis" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="#e11d48" fill="#e11d48" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" name="Month" />
                <YAxis dataKey="value" name="Value" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter name="2018-2023 Data" data={scatterData} fill="#e11d48" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
