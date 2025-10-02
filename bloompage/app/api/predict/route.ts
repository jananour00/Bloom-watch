import { NextResponse } from "next/server"
import { predictBloomStage, predictBloomIntensity } from "@/lib/ai-models"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const stagePrediction = predictBloomStage(data)
    const intensityPrediction = predictBloomIntensity(data)

    return NextResponse.json({
      stage: stagePrediction.stage,
      stageConfidence: stagePrediction.confidence,
      intensity: intensityPrediction.intensity,
      intensityScore: intensityPrediction.score,
    })
  } catch (error) {
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
