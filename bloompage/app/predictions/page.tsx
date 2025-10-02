"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PredictionCard } from "@/components/prediction-card"
import { PredictionTimeline } from "@/components/prediction-timeline"
import { PredictionForm } from "@/components/prediction-form"
import { Card } from "@/components/ui/card"
import { fetchBloomData } from "@/lib/nasa-api"
import { processBloomData } from "@/lib/data-processor"
import { forecastBloom, predictBloomStage, predictBloomIntensity } from "@/lib/ai-models"
import type { BloomPrediction } from "@/lib/types"
import type { ProcessedBloomData } from "@/lib/data-processor"

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<BloomPrediction[]>([])
  const [customPrediction, setCustomPrediction] = useState<{
    stage: string
    intensity: string
    stageConfidence: number
    intensityScore: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPredictions() {
      setLoading(true)
      try {
        const regions = [
          "Nile Delta",
          "Ethiopian Highlands",
          "Kenya Rift Valley",
          "Nigerian Savanna",
          "South African Highveld",
        ]
        const allData: ProcessedBloomData[] = []

        for (const region of regions) {
          const rawData = await fetchBloomData(region, "2024-01-01", "2024-12-31")
          const processed = processBloomData(rawData)
          allData.push(...processed)
        }

        // Generate forecasts for each region
        const forecasts = regions.map((region) => forecastBloom(allData, region, 14))

        setPredictions(forecasts)
      } catch (error) {
        console.error("[v0] Error loading predictions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPredictions()
  }, [])

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

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-auto">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">AI Predictions</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Generating forecasts..." : `${predictions.length} bloom forecasts available`}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-sm text-muted-foreground">Generating AI predictions...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <PredictionForm onPredict={handleCustomPredict} />

                {customPrediction && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground">Prediction Result</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Based on your input parameters</p>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-lg border border-border p-4">
                        <div className="text-sm text-muted-foreground">Predicted Bloom Stage</div>
                        <div className="mt-2 text-2xl font-bold text-primary">{customPrediction.stage}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {(customPrediction.stageConfidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>

                      <div className="rounded-lg border border-border p-4">
                        <div className="text-sm text-muted-foreground">Predicted Intensity</div>
                        <div className="mt-2 text-2xl font-bold text-accent">{customPrediction.intensity}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Score: {customPrediction.intensityScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <PredictionTimeline predictions={predictions} />

              <div>
                <h2 className="text-xl font-semibold text-foreground">Regional Forecasts</h2>
                <p className="mt-1 text-sm text-muted-foreground">14-day bloom predictions for monitored regions</p>

                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {predictions.map((pred, i) => (
                    <PredictionCard key={i} prediction={pred} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
