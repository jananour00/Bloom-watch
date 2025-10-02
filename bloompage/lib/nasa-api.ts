import type { BloomData, VegetationIndex, ClimateData } from "./types"

const APPEEARS_API = "https://lpdaacsvc.cr.usgs.gov/appeears/api"

export async function fetchNDVIData(
  bbox: [number, number, number, number],
  startDate: string,
  endDate: string,
): Promise<VegetationIndex[]> {
  // Mock data for demonstration - in production, this would call AppEEARS API
  const mockData: VegetationIndex[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
    mockData.push({
      date: d.toISOString().split("T")[0],
      value: 0.3 + Math.random() * 0.5,
      type: "NDVI",
    })
  }

  return mockData
}

export async function fetchClimateData(
  bbox: [number, number, number, number],
  startDate: string,
  endDate: string,
): Promise<ClimateData[]> {
  // Mock data for demonstration
  const mockData: ClimateData[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
    mockData.push({
      date: d.toISOString().split("T")[0],
      temperature: 15 + Math.random() * 15,
      precipitation: Math.random() * 50,
      soilMoisture: 0.2 + Math.random() * 0.3,
    })
  }

  return mockData
}

export async function fetchBloomData(region: string, startDate: string, endDate: string): Promise<BloomData[]> {
  try {
    const params = new URLSearchParams({ region, startDate, endDate })
    const response = await fetch(`/api/bloom-data?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch bloom data: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching bloom data:", error)
    return []
  }
}

export function classifyBloomStage(ndvi: number, ndviSlope: number): string {
  if (ndvi < 0.3) return "Pre-bloom"
  if (ndvi >= 0.3 && ndvi < 0.5 && ndviSlope > 0) return "Onset"
  if (ndvi >= 0.5 && ndvi < 0.7) return "Peak"
  if (ndviSlope < 0 && ndvi > 0.3) return "Decline"
  return "Post-bloom"
}

export function calculateBloomIntensity(ndvi: number, evi: number): string {
  const avg = (ndvi + evi) / 2
  if (avg < 0.4) return "Mild"
  if (avg < 0.6) return "Moderate"
  return "Peak"
}
