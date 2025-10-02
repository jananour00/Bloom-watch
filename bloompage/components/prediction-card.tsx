"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target, AlertCircle } from "lucide-react"
import type { BloomPrediction } from "@/lib/types"

interface PredictionCardProps {
  prediction: BloomPrediction
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Pre-bloom":
        return "bg-muted text-muted-foreground"
      case "Onset":
        return "bg-accent/20 text-accent"
      case "Peak":
        return "bg-chart-1/20 text-chart-1"
      case "Decline":
        return "bg-chart-3/20 text-chart-3"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "Mild":
        return "bg-muted text-muted-foreground"
      case "Moderate":
        return "bg-chart-3/20 text-chart-3"
      case "Peak":
        return "bg-accent/20 text-accent"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const confidenceColor =
    prediction.confidence >= 0.9
      ? "text-accent"
      : prediction.confidence >= 0.75
        ? "text-chart-3"
        : "text-muted-foreground"

  return (
    <Card className="p-6 transition-all hover:border-primary/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{prediction.region}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Forecast for{" "}
            {new Date(prediction.forecastDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${confidenceColor}`}>{(prediction.confidence * 100).toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">Confidence</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            Predicted Stage
          </div>
          <Badge className={`mt-2 ${getStageColor(prediction.predictedStage)}`}>{prediction.predictedStage}</Badge>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Predicted Intensity
          </div>
          <Badge className={`mt-2 ${getIntensityColor(prediction.predictedIntensity)}`}>
            {prediction.predictedIntensity}
          </Badge>
        </div>
      </div>

      {prediction.confidence < 0.75 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Lower confidence due to limited historical data or unusual climate patterns
          </p>
        </div>
      )}
    </Card>
  )
}
