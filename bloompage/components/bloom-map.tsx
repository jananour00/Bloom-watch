"use client"

import { useEffect, useRef, useState } from "react"
import type { BloomData } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Layers, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BloomMapProps {
  data: BloomData[]
  selectedLayers: string[]
  onLayerToggle: (layer: string) => void
}

export function BloomMap({ data, selectedLayers, onLayerToggle }: BloomMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState({ lat: 0, lon: 20 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#2a2a3e"
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Project lat/lon to canvas coordinates
    const project = (lat: number, lon: number) => {
      const x = ((lon - center.lon + 180) / 360) * canvas.width * zoom + canvas.width / 2
      const y = ((center.lat - lat + 90) / 180) * canvas.height * zoom + canvas.height / 2
      return { x, y }
    }

    // Draw bloom points
    data.forEach((point) => {
      const { x, y } = project(point.lat, point.lon)

      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return

      // Color based on bloom stage
      let color = "#4a5568"
      if (selectedLayers.includes("bloom-stage")) {
        switch (point.bloomStage) {
          case "Pre-bloom":
            color = "#718096"
            break
          case "Onset":
            color = "#48bb78"
            break
          case "Peak":
            color = "#38b2ac"
            break
          case "Decline":
            color = "#ed8936"
            break
          case "Post-bloom":
            color = "#e53e3e"
            break
        }
      }

      // Size based on intensity
      let radius = 4
      if (selectedLayers.includes("bloom-intensity")) {
        switch (point.bloomIntensity) {
          case "Mild":
            radius = 3
            break
          case "Moderate":
            radius = 5
            break
          case "Peak":
            radius = 7
            break
        }
      }

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Add glow effect for peak blooms
      if (point.bloomStage === "Peak") {
        ctx.beginPath()
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.3
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // Draw NDVI heatmap overlay if selected
    if (selectedLayers.includes("ndvi")) {
      ctx.globalAlpha = 0.4
      data.forEach((point) => {
        const { x, y } = project(point.lat, point.lon)
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return

        const intensity = Math.floor(point.ndvi * 255)
        ctx.fillStyle = `rgb(${255 - intensity}, ${intensity}, 50)`
        ctx.fillRect(x - 10, y - 10, 20, 20)
      })
      ctx.globalAlpha = 1
    }
  }, [data, selectedLayers, zoom, center])

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full rounded-lg" />

      {/* Zoom controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
          className="bg-card/90 backdrop-blur"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
          className="bg-card/90 backdrop-blur"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 bg-card/90 p-4 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="h-4 w-4" />
          Bloom Stages
        </div>
        <div className="mt-3 space-y-2">
          {[
            { stage: "Pre-bloom", color: "#718096" },
            { stage: "Onset", color: "#48bb78" },
            { stage: "Peak", color: "#38b2ac" },
            { stage: "Decline", color: "#ed8936" },
            { stage: "Post-bloom", color: "#e53e3e" },
          ].map((item) => (
            <div key={item.stage} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.stage}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
