"use server"

export interface HistoricalDataPoint {
  year: number
  month: number
  value: number
  region: string
}

// Generate historical data from 2018-2023 for Africa regions
export async function getHistoricalData(
  feature: "agriculture" | "pollen" | "desertification",
  region: string,
): Promise<HistoricalDataPoint[]> {
  const data: HistoricalDataPoint[] = []

  // Generate monthly data for each year from 2018 to 2023
  for (let year = 2018; year <= 2023; year++) {
    for (let month = 1; month <= 12; month++) {
      let value: number

      if (feature === "agriculture") {
        // NDVI values (0-1 range) with seasonal variation
        const baseValue = 0.45 + Math.random() * 0.25
        const seasonalEffect = Math.sin((month / 12) * Math.PI * 2) * 0.15
        const yearTrend = (year - 2018) * 0.02 // Slight improvement over years
        value = Math.max(0.2, Math.min(0.9, baseValue + seasonalEffect + yearTrend))
      } else if (feature === "pollen") {
        // Pollen concentration (grains/m³)
        const baseValue = 40 + Math.random() * 40
        const seasonalEffect = Math.sin((month / 12) * Math.PI * 2) * 30
        value = Math.max(10, baseValue + seasonalEffect)
      } else {
        // Desertification risk index (0-10)
        const baseValue = 4 + Math.random() * 3
        const yearTrend = (year - 2018) * 0.15 // Increasing risk over years
        value = Math.min(10, baseValue + yearTrend)
      }

      data.push({
        year,
        month,
        value: Number.parseFloat(value.toFixed(2)),
        region,
      })
    }
  }

  return data
}
