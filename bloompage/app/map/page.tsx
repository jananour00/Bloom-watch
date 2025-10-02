"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { BloomMap } from "@/components/bloom-map"
import { MapControls } from "@/components/map-controls"
import { fetchBloomData } from "@/lib/nasa-api"
import type { BloomData } from "@/lib/types"

export default function MapPage() {
  const [bloomData, setBloomData] = useState<BloomData[]>([])
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["bloom-stage", "bloom-intensity"])
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const regionNames = [
          "Nile Delta",
          "Ethiopian Highlands",
          "Kenya Rift Valley",
          "Nigerian Savanna",
          "South African Highveld",
        ]
        const allData: BloomData[] = []

        for (const region of regionNames) {
          const data = await fetchBloomData(region, "2024-01-01", "2024-12-31")
          allData.push(...data)
        }

        setBloomData(allData)
        setRegions(regionNames)
      } catch (error) {
        console.error("[v0] Error loading bloom data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLayerToggle = (layer: string) => {
    setSelectedLayers((prev) => (prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]))
  }

  const filteredData = selectedRegion === "all" ? bloomData : bloomData.filter((d) => d.region === selectedRegion)

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Interactive Map</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading bloom data..." : `Showing ${filteredData.length} bloom events`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden p-8">
          <div className="w-80 flex-shrink-0 overflow-auto">
            <MapControls
              selectedLayers={selectedLayers}
              onLayerToggle={handleLayerToggle}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              regions={regions}
            />
          </div>

          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-card">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="mt-4 text-sm text-muted-foreground">Loading map data...</p>
                </div>
              </div>
            ) : (
              <BloomMap data={filteredData} selectedLayers={selectedLayers} onLayerToggle={handleLayerToggle} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
