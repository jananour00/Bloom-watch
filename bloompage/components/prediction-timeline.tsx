"use client"

import { Card } from "@/components/ui/card"
import type { BloomPrediction } from "@/lib/types"

interface PredictionTimelineProps {
  predictions: BloomPrediction[]
  title?: string
}

export function PredictionTimeline({ predictions, title = "Bloom Forecast Timeline" }: PredictionTimelineProps) {
  const sortedPredictions = [...predictions].sort(
    (a, b) => new Date(a.forecastDate).getTime() - new Date(b.forecastDate).getTime(),
  )

  const getStagePosition = (stage: string) => {
    const stages = ["Pre-bloom", "Onset", "Peak", "Decline", "Post-bloom"]
    return (stages.indexOf(stage) / (stages.length - 1)) * 100
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Predicted bloom progression across regions</p>

      <div className="mt-8 space-y-6">
        {sortedPredictions.map((pred, i) => (
          <div key={i} className="relative">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{pred.region}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(pred.forecastDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>

            <div className="relative h-8 overflow-hidden rounded-full bg-secondary">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-accent/30 to-chart-1/30" />

              {/* Stage indicator */}
              <div
                className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-lg"
                style={{ left: `${getStagePosition(pred.predictedStage)}%` }}
              />

              {/* Stage labels */}
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-muted-foreground">
                <span>Pre</span>
                <span>Onset</span>
                <span>Peak</span>
                <span>Decline</span>
                <span>Post</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Stage: {pred.predictedStage}</span>
              <span className="text-primary">{(pred.confidence * 100).toFixed(0)}% confidence</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
