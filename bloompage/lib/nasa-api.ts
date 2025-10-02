import type { BloomData, VegetationIndex, ClimateData } from "./types"

const NASA_POWER_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

export async function fetchNDVIData(
  bbox: [number, number, number, number],
  startDate: string,
  endDate: string,
): Promise<VegetationIndex[]> {
  // Calculate center of bbox for point query
  const lat = (bbox[0] + bbox[2]) / 2
  const lon = (bbox[1] + bbox[3]) / 2

  const params = {
    start: startDate.replace(/-/g, ''),
    end: endDate.replace(/-/g, ''),
    latitude: lat.toString(),
    longitude: lon.toString(),
    parameters: "NDVI",
    community: "AG",
    format: "JSON"
  }

  try {
    const response = await fetch(`${NASA_POWER_BASE_URL}?${new URLSearchParams(params)}`)
    if (!response.ok) {
      throw new Error(`NASA POWER API error: ${response.status}`)
    }

    const data = await response.json()
    const ndviData: VegetationIndex[] = []

    for (const [date, value] of Object.entries(data.properties.parameter.NDVI)) {
      ndviData.push({
        date: date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
        value: value as number,
        type: "NDVI",
      })
    }

    return ndviData
  } catch (error) {
    console.error("Error fetching NDVI data:", error)
    return []
  }
}

export async function fetchClimateData(
  bbox: [number, number, number, number],
  startDate: string,
  endDate: string,
): Promise<ClimateData[]> {
  // Calculate center of bbox for point query
  const lat = (bbox[0] + bbox[2]) / 2
  const lon = (bbox[1] + bbox[3]) / 2

  const params = {
    start: startDate.replace(/-/g, ''),
    end: endDate.replace(/-/g, ''),
    latitude: lat.toString(),
    longitude: lon.toString(),
    parameters: "T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M",
    community: "AG",
    format: "JSON"
  }

  try {
    const response = await fetch(`${NASA_POWER_BASE_URL}?${new URLSearchParams(params)}`)
    if (!response.ok) {
      throw new Error(`NASA POWER API error: ${response.status}`)
    }

    const data = await response.json()
    const climateData: ClimateData[] = []

    const dates = Object.keys(data.properties.parameter.T2M_MAX)
    for (const date of dates) {
      climateData.push({
        date: date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
        temperature: data.properties.parameter.T2M_MAX[date],
        precipitation: data.properties.parameter.PRECTOTCORR[date],
        soilMoisture: 0.25, // Not available in POWER, placeholder
      })
    }

    return climateData
  } catch (error) {
    console.error("Error fetching climate data:", error)
    return []
  }
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
