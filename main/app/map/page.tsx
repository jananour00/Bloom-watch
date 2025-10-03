"use client"

import { useState, useEffect } from "react"
import { AfricaMap } from "@/components/africa-map"
import { MapControls } from "@/components/map-controls"

export default function MapPage() {
  const [selectedFeature, setSelectedFeature] = useState<"agriculture" | "pollen" | "desertification">("agriculture")
  const [selectedRegion, setSelectedRegion] = useState("all")

  // For simplicity, regions can be hardcoded or fetched from an API if available
  const regions = ["all", "Sahel", "East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa"]

  const handleFeatureChange = (feature: "agriculture" | "pollen" | "desertification") => {
    setSelectedFeature(feature)
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
  }

  return (
    <div className="flex h-screen flex-col p-8">
      <h1 className="text-2xl font-semibold mb-4">Africa Interactive Map</h1>
      <div className="flex gap-6 flex-1">
        <div className="w-64">
          <MapControls
            selectedFeature={selectedFeature}
            onFeatureChange={handleFeatureChange}
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            regions={regions}
          />
        </div>
        <div className="flex-1 rounded-lg border border-border bg-card p-4">
          <AfricaMap feature={selectedFeature} selectedRegion={selectedRegion} />
        </div>
      </div>
    </div>
  )
}
