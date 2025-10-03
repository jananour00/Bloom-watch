"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false })
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const LayersControl = dynamic(() => import("react-leaflet").then((mod) => mod.LayersControl), { ssr: false })

interface AfricaMapProps {
  feature: "agriculture" | "pollen" | "desertification"
  selectedRegion: string
}

export function AfricaMap({ feature, selectedRegion }: AfricaMapProps) {
  const [mounted, setMounted] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [heatmapData, setHeatmapData] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    // Generate heatmap data based on feature
    generateHeatmapData()

    // Animation loop
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 12) // 12 months animation
    }, 1000)

    return () => clearInterval(interval)
  }, [feature])

  const generateHeatmapData = () => {
    // Generate sample heatmap points for Africa
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
      // Add multiple points around each region for heatmap effect
      for (let i = 0; i < 10; i++) {
        points.push({
          lat: region.lat + (Math.random() - 0.5) * 10,
          lng: region.lng + (Math.random() - 0.5) * 10,
          intensity: region.intensity + (Math.random() - 0.5) * 0.2,
          name: region.name,
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

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden border border-border">
      <div className="absolute top-4 right-4 z-[1000] bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
        <p className="text-sm font-medium text-foreground">
          Month: {new Date(2024, currentFrame).toLocaleString("default", { month: "long" })}
        </p>
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

        {/* Satellite Layer Option */}
        <TileLayer
          attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
          opacity={0.3}
        />

        {/* Heatmap markers with animation */}
        {heatmapData.map((point, idx) => {
          // Animate intensity based on current frame
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
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{point.name}</p>
                  <p className="text-muted-foreground">
                    Status: <span className="font-medium">{getFeatureLabel(animatedIntensity)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Intensity: <span className="font-medium">{(animatedIntensity * 100).toFixed(0)}%</span>
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
