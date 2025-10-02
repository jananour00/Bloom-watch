"use client"

import { Card } from "@/components/ui/card"
import type { ProcessedBloomData } from "@/lib/data-processor"

interface ClimateHeatmapProps {
  data: ProcessedBloomData[]
  title?: string
}

export function ClimateHeatmap({ data, title = "Climate Impact Heatmap" }: ClimateHeatmapProps) {
  // Create a grid of temperature vs soil moisture with bloom intensity
  const gridSize = 10
  const grid: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0))

  data.forEach((d) => {
    const tempBin = Math.min(gridSize - 1, Math.floor((d.temperature / 40) * gridSize))
    const moistureBin = Math.min(gridSize - 1, Math.floor(d.soilMoisture * gridSize))
    grid[tempBin][moistureBin] += (d.ndvi + d.evi) / 2
  })

  // Normalize
  const maxValue = Math.max(...grid.flat())
  const normalizedGrid = grid.map((row) => row.map((val) => (maxValue > 0 ? val / maxValue : 0)))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Temperature vs Soil Moisture correlation with bloom intensity
      </p>

      <div className="mt-6">
        <div className="grid grid-cols-10 gap-1">
          {normalizedGrid.map((row, i) =>
            row.map((value, j) => {
              const intensity = Math.floor(value * 255)
              const color = `rgb(${255 - intensity}, ${intensity}, 50)`
              return (
                <div
                  key={`${i}-${j}`}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: color }}
                  title={`Temp: ${(i * 4).toFixed(0)}°C, Moisture: ${(j * 10).toFixed(0)}%`}
                />
              )
            }),
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <div className="font-medium">Temperature</div>
            <div>0°C → 40°C</div>
          </div>
          <div className="text-right">
            <div className="font-medium">Soil Moisture</div>
            <div>0% → 100%</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Low Intensity</span>
          <div className="flex h-4 flex-1 rounded">
            <div className="flex-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
          </div>
          <span className="text-xs text-muted-foreground">High Intensity</span>
        </div>
      </div>
    </Card>
  )
}
