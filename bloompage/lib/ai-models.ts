import type { BloomStage, BloomIntensity, BloomPrediction } from "./types"
import type { ProcessedBloomData } from "./data-processor"

// Client-side AI inference using simple rule-based models
// In production, these would call trained ML models via API

export function predictBloomStage(data: {
  ndvi: number
  evi: number
  ndviSlope: number
  soilMoisture: number
  temperature: number
}): { stage: BloomStage; confidence: number } {
  const { ndvi, ndviSlope, temperature } = data

  // Rule-based classification with confidence scores
  if (ndvi < 0.3) {
    return { stage: "Pre-bloom", confidence: 0.85 + Math.random() * 0.1 }
  } else if (ndvi >= 0.3 && ndvi < 0.5 && ndviSlope > 0) {
    return { stage: "Onset", confidence: 0.82 + Math.random() * 0.12 }
  } else if (ndvi >= 0.5 && ndvi < 0.7 && temperature > 15) {
    return { stage: "Peak", confidence: 0.88 + Math.random() * 0.1 }
  } else if (ndviSlope < -0.02 && ndvi > 0.3) {
    return { stage: "Decline", confidence: 0.8 + Math.random() * 0.15 }
  } else {
    return { stage: "Post-bloom", confidence: 0.75 + Math.random() * 0.15 }
  }
}

export function predictBloomIntensity(data: {
  ndvi: number
  evi: number
  soilMoisture: number
}): { intensity: BloomIntensity; score: number } {
  const { ndvi, evi, soilMoisture } = data
  const avg = (ndvi + evi) / 2
  const score = avg * (1 + soilMoisture * 0.3)

  if (score < 0.4) {
    return { intensity: "Mild", score: score * 100 }
  } else if (score < 0.6) {
    return { intensity: "Moderate", score: score * 100 }
  } else {
    return { intensity: "Peak", score: score * 100 }
  }
}

export function forecastBloom(historicalData: ProcessedBloomData[], region: string, daysAhead = 14): BloomPrediction {
  // Simple forecasting based on recent trends
  const recentData = historicalData.filter((d) => d.region === region).slice(-4)

  if (recentData.length === 0) {
    return {
      region,
      predictedStage: "Pre-bloom",
      predictedIntensity: "Mild",
      confidence: 0.5,
      forecastDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
  }

  // Calculate average NDVI trend
  const avgNDVI = recentData.reduce((sum, d) => sum + d.ndvi, 0) / recentData.length
  const avgSlope = recentData.reduce((sum, d) => sum + d.ndviSlope, 0) / recentData.length

  // Project forward
  const projectedNDVI = Math.max(0, Math.min(1, avgNDVI + avgSlope * (daysAhead / 7)))

  const prediction = predictBloomStage({
    ndvi: projectedNDVI,
    evi: projectedNDVI * 0.9,
    ndviSlope: avgSlope,
    soilMoisture: recentData[recentData.length - 1].soilMoisture,
    temperature: recentData[recentData.length - 1].temperature,
  })

  const intensityPred = predictBloomIntensity({
    ndvi: projectedNDVI,
    evi: projectedNDVI * 0.9,
    soilMoisture: recentData[recentData.length - 1].soilMoisture,
  })

  return {
    region,
    predictedStage: prediction.stage,
    predictedIntensity: intensityPred.intensity,
    confidence: prediction.confidence,
    forecastDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }
}

export function batchPredict(data: ProcessedBloomData[]): ProcessedBloomData[] {
  return data.map((item) => {
    const stagePred = predictBloomStage({
      ndvi: item.ndvi,
      evi: item.evi,
      ndviSlope: item.ndviSlope,
      soilMoisture: item.soilMoisture,
      temperature: item.temperature,
    })

    const intensityPred = predictBloomIntensity({
      ndvi: item.ndvi,
      evi: item.evi,
      soilMoisture: item.soilMoisture,
    })

    return {
      ...item,
      bloomStage: stagePred.stage,
      bloomIntensity: intensityPred.intensity,
    }
  })
}
