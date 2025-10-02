import type { BloomData } from "./types"

export interface ProcessedBloomData extends BloomData {
  ndviSlope: number
  ndviRollingAvg: number
  eviRollingAvg: number
  temperatureAnomaly: number
  precipitationAnomaly: number
}

export function normalizeNDVI(ndvi: number): number {
  // Normalize NDVI from -1 to 1 range to 0 to 1
  return (ndvi + 1) / 2
}

export function calculateRollingAverage(values: number[], windowSize = 3): number[] {
  const result: number[] = []

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2))
    const end = Math.min(values.length, i + Math.ceil(windowSize / 2))
    const window = values.slice(start, end)
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length
    result.push(avg)
  }

  return result
}

export function calculateSlope(values: number[]): number[] {
  const slopes: number[] = []

  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      slopes.push(0)
    } else {
      slopes.push(values[i] - values[i - 1])
    }
  }

  return slopes
}

export function detectAnomalies(values: number[]): number[] {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)

  return values.map((val) => (val - mean) / stdDev)
}

export function processBloomData(rawData: BloomData[]): ProcessedBloomData[] {
  // Sort by date
  const sortedData = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract time series
  const ndviValues = sortedData.map((d) => d.ndvi)
  const eviValues = sortedData.map((d) => d.evi)
  const tempValues = sortedData.map((d) => d.temperature)
  const precipValues = sortedData.map((d) => d.precipitation)

  // Calculate features
  const ndviSlopes = calculateSlope(ndviValues)
  const ndviRollingAvgs = calculateRollingAverage(ndviValues, 5)
  const eviRollingAvgs = calculateRollingAverage(eviValues, 5)
  const tempAnomalies = detectAnomalies(tempValues)
  const precipAnomalies = detectAnomalies(precipValues)

  // Combine processed data
  return sortedData.map((data, i) => ({
    ...data,
    ndviSlope: ndviSlopes[i],
    ndviRollingAvg: ndviRollingAvgs[i],
    eviRollingAvg: eviRollingAvgs[i],
    temperatureAnomaly: tempAnomalies[i],
    precipitationAnomaly: precipAnomalies[i],
  }))
}

export function aggregateByRegion(data: ProcessedBloomData[]): Map<string, ProcessedBloomData[]> {
  const regionMap = new Map<string, ProcessedBloomData[]>()

  for (const item of data) {
    if (!regionMap.has(item.region)) {
      regionMap.set(item.region, [])
    }
    regionMap.get(item.region)!.push(item)
  }

  return regionMap
}

export function filterByDateRange(
  data: ProcessedBloomData[],
  startDate: string,
  endDate: string,
): ProcessedBloomData[] {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  return data.filter((item) => {
    const itemDate = new Date(item.date).getTime()
    return itemDate >= start && itemDate <= end
  })
}

export function filterByBloomStage(data: ProcessedBloomData[], stages: string[]): ProcessedBloomData[] {
  return data.filter((item) => stages.includes(item.bloomStage))
}

export function calculateBloomStatistics(data: ProcessedBloomData[]) {
  const stageCount = new Map<string, number>()
  const intensityCount = new Map<string, number>()

  let totalNDVI = 0
  let totalEVI = 0
  let totalSoilMoisture = 0

  for (const item of data) {
    stageCount.set(item.bloomStage, (stageCount.get(item.bloomStage) || 0) + 1)
    intensityCount.set(item.bloomIntensity, (intensityCount.get(item.bloomIntensity) || 0) + 1)

    totalNDVI += item.ndvi
    totalEVI += item.evi
    totalSoilMoisture += item.soilMoisture
  }

  const count = data.length

  return {
    stageDistribution: Object.fromEntries(stageCount),
    intensityDistribution: Object.fromEntries(intensityCount),
    averages: {
      ndvi: totalNDVI / count,
      evi: totalEVI / count,
      soilMoisture: totalSoilMoisture / count,
    },
    totalRecords: count,
  }
}

export function exportToCSV(data: ProcessedBloomData[]): string {
  const headers = [
    "date",
    "lat",
    "lon",
    "ndvi",
    "evi",
    "soilMoisture",
    "temperature",
    "precipitation",
    "bloomStage",
    "bloomIntensity",
    "region",
    "ndviSlope",
    "ndviRollingAvg",
  ]

  const rows = data.map((item) => [
    item.date,
    item.lat,
    item.lon,
    item.ndvi,
    item.evi,
    item.soilMoisture,
    item.temperature,
    item.precipitation,
    item.bloomStage,
    item.bloomIntensity,
    item.region,
    item.ndviSlope,
    item.ndviRollingAvg,
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}
