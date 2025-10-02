"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Activity, TrendingUp, MapPin, Droplets, Leaf } from "lucide-react"
import { BloomMap } from "@/components/bloom-map"
import { MapControls } from "@/components/map-controls"
import { TimeSlider } from "@/components/time-slider"
import { NDVIChart } from "@/components/ndvi-chart"
import { BloomIntensityChart } from "@/components/bloom-intensity-chart"
import { ClimateHeatmap } from "@/components/climate-heatmap"
import { DataExport } from "@/components/data-export"
import { PredictionCard } from "@/components/prediction-card"
import { PredictionTimeline } from "@/components/prediction-timeline"
import { PredictionForm } from "@/components/prediction-form"
import { fetchBloomData } from "@/lib/nasa-api"
import { processBloomData, filterByDateRange } from "@/lib/data-processor"
import { forecastBloom, predictBloomStage, predictBloomIntensity } from "@/lib/ai-models"
import type { BloomData, BloomPrediction } from "@/lib/types"
import type { ProcessedBloomData } from "@/lib/data-processor"

export default function HomePage() {
  const [bloomData, setBloomData] = useState<BloomData[]>([])
  const [processedData, setProcessedData] = useState<ProcessedBloomData[]>([])
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["bloom-stage", "bloom-intensity"])
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [regions, setRegions] = useState<string[]>([])
  const [currentDate, setCurrentDate] = useState("2024-06-01")
  const [predictions, setPredictions] = useState<BloomPrediction[]>([])
  const [customPrediction, setCustomPrediction] = useState<{
    stage: string
    intensity: string
    stageConfidence: number
    intensityScore: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const startDate = "2024-01-01"
  const endDate = "2024-12-31"

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
        const allProcessed: ProcessedBloomData[] = []

        for (const region of regionNames) {
          const data = await fetchBloomData(region, startDate, endDate)
          allData.push(...data)
          const processed = processBloomData(data)
          allProcessed.push(...processed)
        }

        setBloomData(allData)
        setProcessedData(allProcessed)
        setRegions(regionNames)

        // Generate forecasts
        const forecasts = regionNames.map((region) => forecastBloom(allProcessed, region, 14))
        setPredictions(forecasts)
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

  const handleCustomPredict = (data: {
    ndvi: number
    evi: number
    soilMoisture: number
    temperature: number
    precipitation: number
  }) => {
    const stagePred = predictBloomStage({
      ndvi: data.ndvi,
      evi: data.evi,
      ndviSlope: 0,
      soilMoisture: data.soilMoisture,
      temperature: data.temperature,
    })

    const intensityPred = predictBloomIntensity({
      ndvi: data.ndvi,
      evi: data.evi,
      soilMoisture: data.soilMoisture,
    })

    setCustomPrediction({
      stage: stagePred.stage,
      intensity: intensityPred.intensity,
      stageConfidence: stagePred.confidence,
      intensityScore: intensityPred.score,
    })
  }

  const filteredMapData = selectedRegion === "all" ? bloomData : bloomData.filter((d) => d.region === selectedRegion)
  const filteredAnalyticsData = filterByDateRange(processedData, startDate, currentDate)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-primary/20 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary via-accent to-purple-600 p-2.5 shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                NASA Bloom Detection
              </h1>
              <p className="text-sm text-muted-foreground">Agricultural Monitoring Dashboard</p>
            </div>
          </div>
          <select className="rounded-lg border-2 border-primary/30 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12">
        {/* Overview Section */}
        <section id="overview" className="mb-16">
          <div className="mb-8">
            <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent">
              Overview
            </h2>
            <p className="mt-2 text-muted-foreground">Real-time agricultural bloom monitoring</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary/80">Active Blooms</p>
                  <p className="mt-2 text-3xl font-bold text-primary">1,247</p>
                  <p className="mt-1 text-xs font-semibold text-accent">+12.5% from last week</p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-primary to-pink-600 p-3 shadow-md">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="border-2 border-accent/20 bg-gradient-to-br from-purple-50 to-violet-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent/80">Avg NDVI</p>
                  <p className="mt-2 text-3xl font-bold text-accent">0.68</p>
                  <p className="mt-1 text-xs font-semibold text-purple-600">Peak vegetation health</p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-accent to-purple-600 p-3 shadow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="border-2 border-pink-300/30 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-fuchsia-600/80">Regions Monitored</p>
                  <p className="mt-2 text-3xl font-bold text-fuchsia-600">48</p>
                  <p className="mt-1 text-xs font-semibold text-pink-600">Across 12 countries</p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 p-3 shadow-md">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="border-2 border-purple-300/30 bg-gradient-to-br from-violet-50 to-purple-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600/80">Soil Moisture</p>
                  <p className="mt-2 text-3xl font-bold text-purple-600">34%</p>
                  <p className="mt-1 text-xs font-semibold text-violet-600">Optimal range</p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-purple-500 to-violet-600 p-3 shadow-md">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-lg">
              <h3 className="bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-lg font-semibold text-transparent">
                Bloom Stage Distribution
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">Current bloom stages across monitored regions</p>

              <div className="mt-6 space-y-4">
                {[
                  { stage: "Peak", count: 487, color: "bg-gradient-to-r from-primary to-pink-600", percentage: 39 },
                  { stage: "Onset", count: 356, color: "bg-gradient-to-r from-accent to-purple-600", percentage: 29 },
                  {
                    stage: "Decline",
                    count: 245,
                    color: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                    percentage: 20,
                  },
                  {
                    stage: "Pre-bloom",
                    count: 159,
                    color: "bg-gradient-to-r from-purple-400 to-violet-500",
                    percentage: 12,
                  },
                ].map((item) => (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{item.stage}</span>
                      <span className="font-medium text-muted-foreground">{item.count} regions</span>
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
                      <div
                        className={`h-full ${item.color} shadow-sm transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-2 border-accent/20 bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-lg">
              <h3 className="bg-gradient-to-r from-accent to-purple-600 bg-clip-text text-lg font-semibold text-transparent">
                Recent Predictions
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">AI-powered bloom forecasts</p>

              <div className="mt-6 space-y-4">
                {[
                  { region: "Nile Delta", stage: "Peak", confidence: 94, date: "Mar 15-22", color: "primary" },
                  {
                    region: "Ethiopian Highlands",
                    stage: "Onset",
                    confidence: 87,
                    date: "Mar 20-27",
                    color: "accent",
                  },
                  {
                    region: "Kenya Rift Valley",
                    stage: "Pre-bloom",
                    confidence: 91,
                    date: "Apr 1-8",
                    color: "purple-600",
                  },
                ].map((prediction, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between rounded-lg border-2 border-primary/20 bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{prediction.region}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Predicted: <span className={`font-semibold text-${prediction.color}`}>{prediction.stage}</span>{" "}
                        • {prediction.date}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold text-accent">{prediction.confidence}%</p>
                      <p className="text-xs text-muted-foreground">confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Map Section */}
        <section id="map" className="mb-16">
          <div className="mb-8">
            <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent">
              Interactive Map
            </h2>
            <p className="mt-2 text-muted-foreground">
              {loading ? "Loading bloom data..." : `Showing ${filteredMapData.length} bloom events`}
            </p>
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center rounded-xl border-2 border-primary/20 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Loading map data...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <MapControls
                  selectedLayers={selectedLayers}
                  onLayerToggle={handleLayerToggle}
                  selectedRegion={selectedRegion}
                  onRegionChange={setSelectedRegion}
                  regions={regions}
                />
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-primary/20 bg-card shadow-lg">
                <BloomMap data={filteredMapData} selectedLayers={selectedLayers} onLayerToggle={handleLayerToggle} />
              </div>
            </div>
          )}
        </section>

        {/* Analytics Section */}
        <section id="analytics" className="mb-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="bg-gradient-to-r from-accent to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
                Analytics
              </h2>
              <p className="mt-2 text-muted-foreground">
                {loading ? "Loading data..." : `Analyzing ${filteredAnalyticsData.length} bloom events`}
              </p>
            </div>
            <DataExport data={filteredAnalyticsData} filename={`bloom_analytics_${currentDate}.csv`} />
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center rounded-xl border-2 border-accent/20 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <TimeSlider
                startDate={startDate}
                endDate={endDate}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                step={7}
              />

              <NDVIChart data={filteredAnalyticsData} />

              <div className="grid gap-6 lg:grid-cols-2">
                <BloomIntensityChart data={filteredAnalyticsData} />
                <ClimateHeatmap data={filteredAnalyticsData} />
              </div>
            </div>
          )}
        </section>

        {/* AI Predictions Section */}
        <section id="predictions" className="mb-16">
          <div className="mb-8">
            <h2 className="bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              AI Predictions
            </h2>
            <p className="mt-2 text-muted-foreground">
              {loading ? "Generating forecasts..." : `${predictions.length} bloom forecasts available`}
            </p>
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center rounded-xl border-2 border-purple-300/30 bg-gradient-to-br from-fuchsia-50 to-purple-50">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-600 border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Generating AI predictions...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <PredictionForm onPredict={handleCustomPredict} />

                {customPrediction && (
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-lg">
                    <h3 className="bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-lg font-semibold text-transparent">
                      Prediction Result
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">Based on your input parameters</p>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-pink-50 to-rose-50 p-4 shadow-sm">
                        <div className="text-sm font-medium text-primary/80">Predicted Bloom Stage</div>
                        <div className="mt-2 text-2xl font-bold text-primary">{customPrediction.stage}</div>
                        <div className="mt-1 text-xs font-semibold text-accent">
                          {(customPrediction.stageConfidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>

                      <div className="rounded-lg border-2 border-accent/30 bg-gradient-to-br from-purple-50 to-violet-50 p-4 shadow-sm">
                        <div className="text-sm font-medium text-accent/80">Predicted Intensity</div>
                        <div className="mt-2 text-2xl font-bold text-accent">{customPrediction.intensity}</div>
                        <div className="mt-1 text-xs font-semibold text-purple-600">
                          Score: {customPrediction.intensityScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <PredictionTimeline predictions={predictions} />

              <div>
                <h3 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-semibold text-transparent">
                  Regional Forecasts
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">14-day bloom predictions for monitored regions</p>

                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {predictions.map((pred, i) => (
                    <PredictionCard key={i} prediction={pred} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-primary/20 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 py-8">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">NASA Bloom Detection Dashboard</span>
            </div>
            <div className="text-sm font-medium text-muted-foreground">Data from NASA Earthdata • 2018-2024</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
