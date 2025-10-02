"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TimeSlider } from "@/components/time-slider"
import { NDVIChart } from "@/components/ndvi-chart"
import { BloomIntensityChart } from "@/components/bloom-intensity-chart"
import { ClimateHeatmap } from "@/components/climate-heatmap"
import { DataExport } from "@/components/data-export"
import { fetchBloomData } from "@/lib/nasa-api"
import { processBloomData, filterByDateRange } from "@/lib/data-processor"
import type { ProcessedBloomData } from "@/lib/data-processor"

export default function AnalyticsPage() {
  const [bloomData, setBloomData] = useState<ProcessedBloomData[]>([])
  const [currentDate, setCurrentDate] = useState("2024-06-01")
  const [loading, setLoading] = useState(true)

  const startDate = "2024-01-01"
  const endDate = "2024-12-31"

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const rawData = await fetchBloomData("Nile Delta", startDate, endDate)
        const processed = processBloomData(rawData)
        setBloomData(processed)
      } catch (error) {
        console.error("[v0] Error loading bloom data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter data up to current date for time slider
  const filteredData = filterByDateRange(bloomData, startDate, currentDate)

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading data..." : `Analyzing ${filteredData.length} bloom events`}
              </p>
            </div>
            <DataExport data={filteredData} filename={`bloom_analytics_${currentDate}.csv`} />
          </div>
        </div>

        <div className="space-y-6 p-8">
          <TimeSlider
            startDate={startDate}
            endDate={endDate}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            step={7}
          />

          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <>
              <NDVIChart data={filteredData} />

              <div className="grid gap-6 lg:grid-cols-2">
                <BloomIntensityChart data={filteredData} />
                <ClimateHeatmap data={filteredData} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
