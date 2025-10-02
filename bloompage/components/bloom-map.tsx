"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import type { BloomData } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Layers, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface BloomMapProps {
  data: BloomData[]
  selectedLayers: string[]
  onLayerToggle: (layer: string) => void
}

export function BloomMap({ data, selectedLayers, onLayerToggle }: BloomMapProps) {
  const [L, setL] = useState<any>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Load Leaflet only on client side
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  if (!L) {
    return <div className="h-full w-full flex items-center justify-center">Loading map...</div>
  }

  // Custom icon for bloom markers
  const createBloomIcon = (stage: string, intensity: string) => {
    let color = "#4a5568"
    if (selectedLayers.includes("bloom-stage")) {
      switch (stage) {
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

    let size = 8
    if (selectedLayers.includes("bloom-intensity")) {
      switch (intensity) {
        case "Mild":
          size = 6
          break
        case "Moderate":
          size = 10
          break
        case "Peak":
          size = 12
          break
      }
    }

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
      className: 'custom-bloom-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    })
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {data.map((point, index) => (
          <Marker
            key={index}
            position={[point.lat, point.lon]}
            icon={createBloomIcon(point.bloomStage, point.bloomIntensity)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{point.region}</h3>
                <p><strong>Date:</strong> {point.date}</p>
                <p><strong>Stage:</strong> {point.bloomStage}</p>
                <p><strong>Intensity:</strong> {point.bloomIntensity}</p>
                <p><strong>NDVI:</strong> {point.ndvi.toFixed(3)}</p>
                <p><strong>EVI:</strong> {point.evi.toFixed(3)}</p>
                <p><strong>Temperature:</strong> {point.temperature.toFixed(1)}°C</p>
                <p><strong>Precipitation:</strong> {point.precipitation.toFixed(1)}mm</p>
                <p><strong>Soil Moisture:</strong> {point.soilMoisture.toFixed(3)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Zoom controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => mapRef.current?.leafletElement.zoomIn()}
          className="bg-card/90 backdrop-blur"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => mapRef.current?.leafletElement.zoomOut()}
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
