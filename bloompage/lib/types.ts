export type BloomStage = "Pre-bloom" | "Onset" | "Peak" | "Decline" | "Post-bloom"
export type BloomIntensity = "Mild" | "Moderate" | "Peak"

export interface BloomData {
  date: string
  lat: number
  lon: number
  ndvi: number
  evi: number
  soilMoisture: number
  temperature: number
  precipitation: number
  bloomStage: BloomStage
  bloomIntensity: BloomIntensity
  region: string
}

export interface VegetationIndex {
  date: string
  value: number
  type: "NDVI" | "EVI"
}

export interface ClimateData {
  date: string
  temperature: number
  precipitation: number
  soilMoisture: number
}

export interface BloomPrediction {
  region: string
  predictedStage: BloomStage
  predictedIntensity: BloomIntensity
  confidence: number
  forecastDate: string
}
