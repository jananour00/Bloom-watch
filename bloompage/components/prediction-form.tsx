"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"

interface PredictionFormProps {
  onPredict: (data: {
    ndvi: number
    evi: number
    soilMoisture: number
    temperature: number
    precipitation: number
  }) => void
}

export function PredictionForm({ onPredict }: PredictionFormProps) {
  const [formData, setFormData] = useState({
    ndvi: 0.5,
    evi: 0.45,
    soilMoisture: 0.3,
    temperature: 20,
    precipitation: 25,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPredict(formData)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Custom Prediction</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Enter environmental parameters to predict bloom stage</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="ndvi">NDVI</Label>
            <Input
              id="ndvi"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.ndvi}
              onChange={(e) => setFormData({ ...formData, ndvi: Number.parseFloat(e.target.value) })}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Range: 0.0 - 1.0</p>
          </div>

          <div>
            <Label htmlFor="evi">EVI</Label>
            <Input
              id="evi"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.evi}
              onChange={(e) => setFormData({ ...formData, evi: Number.parseFloat(e.target.value) })}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Range: 0.0 - 1.0</p>
          </div>

          <div>
            <Label htmlFor="soilMoisture">Soil Moisture</Label>
            <Input
              id="soilMoisture"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.soilMoisture}
              onChange={(e) => setFormData({ ...formData, soilMoisture: Number.parseFloat(e.target.value) })}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Range: 0.0 - 1.0</p>
          </div>

          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: Number.parseFloat(e.target.value) })}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Typical: 10-35°C</p>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="precipitation">Precipitation (mm)</Label>
            <Input
              id="precipitation"
              type="number"
              step="0.1"
              min="0"
              value={formData.precipitation}
              onChange={(e) => setFormData({ ...formData, precipitation: Number.parseFloat(e.target.value) })}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Typical: 0-100mm</p>
          </div>
        </div>

        <Button type="submit" className="w-full gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Prediction
        </Button>
      </form>
    </Card>
  )
}
