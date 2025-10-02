"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

interface TimeSliderProps {
  startDate: string
  endDate: string
  currentDate: string
  onDateChange: (date: string) => void
  step?: number // days
}

export function TimeSlider({ startDate, endDate, currentDate, onDateChange, step = 7 }: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000) // ms per step

  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const current = new Date(currentDate).getTime()

  const totalSteps = Math.floor((end - start) / (step * 24 * 60 * 60 * 1000))
  const currentStep = Math.floor((current - start) / (step * 24 * 60 * 60 * 1000))

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      const nextStep = currentStep + 1
      if (nextStep > totalSteps) {
        setIsPlaying(false)
        return
      }

      const nextDate = new Date(start + nextStep * step * 24 * 60 * 60 * 1000)
      onDateChange(nextDate.toISOString().split("T")[0])
    }, speed)

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, totalSteps, start, step, speed, onDateChange])

  const handleSliderChange = (value: number[]) => {
    const newDate = new Date(start + value[0] * step * 24 * 60 * 60 * 1000)
    onDateChange(newDate.toISOString().split("T")[0])
  }

  const handleStepBack = () => {
    const prevStep = Math.max(0, currentStep - 1)
    const prevDate = new Date(start + prevStep * step * 24 * 60 * 60 * 1000)
    onDateChange(prevDate.toISOString().split("T")[0])
  }

  const handleStepForward = () => {
    const nextStep = Math.min(totalSteps, currentStep + 1)
    const nextDate = new Date(start + nextStep * step * 24 * 60 * 60 * 1000)
    onDateChange(nextDate.toISOString().split("T")[0])
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Time Control</h3>
          <p className="text-sm text-muted-foreground">Animate bloom progression over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={handleStepBack} disabled={currentStep === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="outline" onClick={handleStepForward} disabled={currentStep === totalSteps}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{startDate}</span>
          <span className="font-mono font-semibold text-primary">{currentDate}</span>
          <span className="text-muted-foreground">{endDate}</span>
        </div>
        <Slider value={[currentStep]} max={totalSteps} step={1} onValueChange={handleSliderChange} className="w-full" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {totalSteps + 1}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="rounded border border-input bg-background px-2 py-1 text-xs"
          >
            <option value={2000}>0.5x</option>
            <option value={1000}>1x</option>
            <option value={500}>2x</option>
            <option value={250}>4x</option>
          </select>
        </div>
      </div>
    </Card>
  )
}
