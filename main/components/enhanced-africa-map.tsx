"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface EnhancedAfricaMapProps {
  feature: "agriculture" | "pollen" | "desertification"
  selectedRegion: string
  activeLayer: string[]
  onLayerChange: (layers: string[]) => void
}

export function EnhancedAfricaMap({ feature, selectedRegion, activeLayer, onLayerChange }: EnhancedAfricaMapProps) {
  const [mounted, setMounted] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    setMounted(true)
    generateHeatmapData()

    // Animation loop
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentFrame((prev) => (prev + 1) % 12) // 12 months animation
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [feature, isPlaying])

  const generateHeatmapData = () => {
    const points = []
    const regions = [
      { name: "Sahel", lat: 15, lng: 0, intensity: 0.8 },
      { name: "East Africa", lat: 0, lng: 35, intensity: 0.6 },
      { name: "West Africa", lat: 10, lng: -5, intensity: 0.7 },
      { name: "Southern Africa", lat: -25, lng: 25, intensity: 0.5 },
      { name: "North Africa", lat: 30, lng: 10, intensity: 0.4 },
      { name: "Central Africa", lat: -5, lng: 20, intensity: 0.65 },
    ]

    regions.forEach((region) => {
      for (let i = 0; i < 15; i++) {
        points.push({
          lat: region.lat + (Math.random() - 0.5) * 10,
          lng: region.lng + (Math.random() - 0.5) * 10,
          intensity: region.intensity + (Math.random() - 0.5) * 0.2,
          name: region.name,
          ndvi: (0.3 + Math.random() * 0.5).toFixed(2),
          soilMoisture: (20 + Math.random() * 40).toFixed(0),
          temperature: (20 + Math.random() * 15).toFixed(1),
          rainfall: (50 + Math.random() * 150).toFixed(0),
        })
      }
    })

    setHeatmapData(points)
  }

  if (!mounted) {
    return <Skeleton className="h-[600px] w-full" />
  }

  const getMarkerColor = (intensity: number) => {
    if (feature === "agriculture") {
      return intensity > 0.7 ? "#22c55e" : intensity > 0.4 ? "#eab308" : "#ef4444"
    } else if (feature === "pollen") {
      return intensity > 0.7 ? "#ef4444" : intensity > 0.4 ? "#f59e0b" : "#22c55e"
    } else {
      return intensity > 0.7 ? "#dc2626" : intensity > 0.4 ? "#f59e0b" : "#10b981"
    }
  }

  const getFeatureLabel = (intensity: number) => {
    if (feature === "agriculture") {
      return intensity > 0.7 ? "Healthy" : intensity > 0.4 ? "Moderate" : "Stressed"
    } else if (feature === "pollen") {
      return intensity > 0.7 ? "High Risk" : intensity > 0.4 ? "Moderate" : "Low Risk"
    } else {
      return intensity > 0.7 ? "Critical" : intensity > 0.4 ? "At Risk" : "Stable"
    }
  }

  const toggleLayer = (layer: string) => {
    if (activeLayer.includes(layer)) {
      onLayerChange(activeLayer.filter((l) => l !== layer))
    } else {
      onLayerChange([...activeLayer, layer])
    }
  }

  const availableLayers = {
    agriculture: ["vegetation", "soil-moisture", "temperature", "rainfall"],
    pollen: ["flowering", "pollen-concentration", "wind", "temperature"],
    desertification: ["vegetation-loss", "soil-degradation", "land-use", "risk-zones"],
  }

  return (
    <div className="space-y-4">
      {/* Layer Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <h4 className="text-sm font-medium mb-2 text-foreground">Map Layers</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableLayers[feature].map((layer) => (
              <div key={layer} className="flex items-center space-x-2">
                <Checkbox id={layer} checked={activeLayer.includes(layer)} onCheckedChange={() => toggleLayer(layer)} />
                <Label htmlFor={layer} className="text-sm capitalize cursor-pointer">
                  {layer.replace("-", " ")}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pause" : "Play"} Animation
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[600px] w-full rounded-lg overflow-hidden border border-border">
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          <Card className="bg-card/90 backdrop-blur-sm px-3 py-2 border border-border">
            <p className="text-sm font-medium text-foreground">
              {new Date(2024, currentFrame).toLocaleString("default", { month: "long" })} 2023
            </p>
          </Card>

          {/* Legend */}
          <Card className="bg-card/90 backdrop-blur-sm p-3 border border-border">
            <h4 className="text-xs font-semibold mb-2 text-foreground">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-foreground">
                  {feature === "agriculture" ? "Healthy" : feature === "pollen" ? "Low Risk" : "Stable"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-foreground">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-foreground">
                  {feature === "agriculture" ? "Stressed" : feature === "pollen" ? "High Risk" : "Critical"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <MapContainer
          center={[0, 20]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Satellite Layer */}
          {activeLayer.includes("vegetation") && (
            <TileLayer
              attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
              url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
              opacity={0.3}
            />
          )}

          {/* Heatmap markers with animation */}
          {heatmapData.map((point, idx) => {
            const animatedIntensity = point.intensity + Math.sin((currentFrame + idx) * 0.5) * 0.1
            const radius = 8 + animatedIntensity * 12

            return (
              <CircleMarker
                key={idx}
                center={[point.lat, point.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: getMarkerColor(animatedIntensity),
                  fillOpacity: 0.6,
                  color: getMarkerColor(animatedIntensity),
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Popup>
                  <div className="text-sm space-y-2 min-w-[200px]">
                    <div>
                      <p className="font-semibold text-foreground text-base">{point.name}</p>
                      <Badge
                        variant={
                          getFeatureLabel(animatedIntensity) === "Healthy" ||
                          getFeatureLabel(animatedIntensity) === "Low Risk" ||
                          getFeatureLabel(animatedIntensity) === "Stable"
                            ? "default"
                            : getFeatureLabel(animatedIntensity) === "Moderate"
                              ? "secondary"
                              : "destructive"
                        }
                        className="mt-1"
                      >
                        {getFeatureLabel(animatedIntensity)}
                      </Badge>
                    </div>

                    <div className="space-y-1 pt-2 border-t">
                      {feature === "agriculture" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">NDVI:</span>
                            <span className="font-medium">{point.ndvi}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Soil Moisture:</span>
                            <span className="font-medium">{point.soilMoisture}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Temperature:</span>
                            <span className="font-medium">{point.temperature}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rainfall:</span>
                            <span className="font-medium">{point.rainfall}mm</span>
                          </div>
                        </>
                      )}

                      {feature === "pollen" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pollen Level:</span>
                            <span className="font-medium">{(animatedIntensity * 100).toFixed(0)} grains/m³</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Flowering:</span>
                            <span className="font-medium">{point.ndvi > 0.5 ? "Active" : "Low"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Temperature:</span>
                            <span className="font-medium">{point.temperature}°C</span>
                          </div>
                        </>
                      )}

                      {feature === "desertification" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Index:</span>
                            <span className="font-medium">{(animatedIntensity * 10).toFixed(1)}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vegetation Loss:</span>
                            <span className="font-medium">
                              {((1 - Number.parseFloat(point.ndvi)) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Soil Moisture:</span>
                            <span className="font-medium">{point.soilMoisture}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
