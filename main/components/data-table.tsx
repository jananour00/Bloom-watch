"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { HistoricalDataPoint } from "@/app/actions/historical-data"

interface DataTableProps {
  data: HistoricalDataPoint[]
  feature: "agriculture" | "pollen" | "desertification"
}

export function DataTable({ data, feature }: DataTableProps) {
  // Group by year and calculate averages
  const yearlyData = data.reduce(
    (acc, point) => {
      if (!acc[point.year]) {
        acc[point.year] = {
          year: point.year,
          values: [],
          count: 0,
        }
      }
      acc[point.year].values.push(point.value)
      acc[point.year].count++
      return acc
    },
    {} as Record<number, { year: number; values: number[]; count: number }>,
  )

  const tableData = Object.values(yearlyData)
    .map((yearData) => ({
      year: yearData.year,
      average: yearData.values.reduce((sum, v) => sum + v, 0) / yearData.count,
      min: Math.min(...yearData.values),
      max: Math.max(...yearData.values),
      count: yearData.count,
    }))
    .sort((a, b) => b.year - a.year)

  const getStatusBadge = (value: number) => {
    if (feature === "agriculture") {
      if (value > 0.7) return <Badge variant="default">Healthy</Badge>
      if (value > 0.5) return <Badge variant="secondary">Moderate</Badge>
      return <Badge variant="destructive">Stressed</Badge>
    } else if (feature === "pollen") {
      if (value > 80) return <Badge variant="destructive">Very High</Badge>
      if (value > 50) return <Badge variant="secondary">High</Badge>
      return <Badge variant="default">Low</Badge>
    } else {
      if (value > 7) return <Badge variant="destructive">Critical</Badge>
      if (value > 5) return <Badge variant="secondary">At Risk</Badge>
      return <Badge variant="default">Stable</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Average</TableHead>
            <TableHead>Min</TableHead>
            <TableHead>Max</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Data Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.year}>
              <TableCell className="font-medium">{row.year}</TableCell>
              <TableCell>{row.average.toFixed(2)}</TableCell>
              <TableCell>{row.min.toFixed(2)}</TableCell>
              <TableCell>{row.max.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(row.average)}</TableCell>
              <TableCell className="text-right">{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
