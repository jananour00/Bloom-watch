import { type NextRequest, NextResponse } from "next/server"
import type { BloomData } from "@/lib/types"

const NASA_TOKEN = process.env.NASA_TOKEN

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const region = searchParams.get("region")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  if (!region || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    // In production, this would call the actual NASA AppEEARS API
    // For now, we generate mock data server-side
    const mockData = generateMockBloomData(region, startDate, endDate)
    return NextResponse.json(mockData)
  } catch (error) {
    console.error("[v0] Error fetching bloom data:", error)
    return NextResponse.json({ error: "Failed to fetch bloom data" }, { status: 500 })
  }
}

function generateMockBloomData(region: string, startDate: string, endDate: string): BloomData[] {
  const mockData: BloomData[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  const stages: Array<"Pre-bloom" | "Onset" | "Peak" | "Decline" | "Post-bloom"> = [
    "Pre-bloom",
    "Onset",
    "Peak",
    "Decline",
    "Post-bloom",
  ]
  const intensities: Array<"Mild" | "Moderate" | "Peak"> = ["Mild", "Moderate", "Peak"]

  const regionCoords: Record<string, { lat: number; lon: number }> = {
    "Nile Delta": { lat: 30.0, lon: 31.2 },
    "Ethiopian Highlands": { lat: 9.0, lon: 38.7 },
    "Kenya Rift Valley": { lat: -0.5, lon: 36.0 },
    "Nigerian Savanna": { lat: 9.0, lon: 8.0 },
    "South African Highveld": { lat: -26.2, lon: 28.0 },
  }

  const coords = regionCoords[region] || { lat: 0, lon: 20 }

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
    mockData.push({
      date: d.toISOString().split("T")[0],
      lat: coords.lat + (Math.random() - 0.5) * 2,
      lon: coords.lon + (Math.random() - 0.5) * 2,
      ndvi: 0.3 + Math.random() * 0.5,
      evi: 0.2 + Math.random() * 0.4,
      soilMoisture: 0.2 + Math.random() * 0.3,
      temperature: 15 + Math.random() * 15,
      precipitation: Math.random() * 50,
      bloomStage: stages[Math.floor(Math.random() * stages.length)],
      bloomIntensity: intensities[Math.floor(Math.random() * intensities.length)],
      region,
    })
  }

  return mockData
}
