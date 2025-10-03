"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, AlertTriangle } from "lucide-react"
import { AfricaMap } from "@/components/africa-map"
import { predictFromUserInput } from "@/app/actions/nasa-data"

interface AfricaMapDashboardProps {
  feature: "agriculture" | "pollen" | "desertification"
}

export function AfricaMapDashboard({ feature }: AfricaMapDashboardProps) {
  const [selectedRegion, setSelectedRegion] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [parameter, setParameter] = useState("")
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    if (!selectedRegion || !startDate || !endDate) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const result = await predictFromUserInput({
        feature,
        region: selectedRegion,
        startDate,
        endDate,
        parameter,
      })
      setPrediction(result)
    } catch (error) {
      console.error("[v0] Prediction error:", error)
      alert("Failed to generate prediction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getFeatureTitle = () => {
    switch (feature) {
      case "agriculture":
        return "Agriculture Monitoring"
      case "pollen":
        return "Pollen & Health Tracking"
      case "desertification":
        return "Desertification Analysis"
    }
  }

  const getFeatureDescription = () => {
    switch (feature) {
      case "agriculture":
        return "Monitor crop health, predict bloom timing, and detect soil stress across African agricultural regions"
      case "pollen":
        return "Track pollen concentrations, identify hotspots, and predict allergy risks for African populations"
      case "desertification":
        return "Detect vegetation loss, assess desertification risk, and recommend restoration strategies"
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Map Section - Takes 2 columns */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-foreground">{getFeatureTitle()} - Africa</CardTitle>
            <CardDescription>{getFeatureDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <AfricaMap feature={feature} selectedRegion={selectedRegion} />
          </CardContent>
        </Card>
      </div>

      {/* Input Form & Predictions - Takes 1 column */}
      <div className="space-y-6">
        {/* User Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Prediction Parameters</CardTitle>
            <CardDescription>Enter parameters to generate AI predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region" className="text-foreground">
                Region
              </Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sahel">Sahel Region</SelectItem>
                  <SelectItem value="east-africa">East Africa</SelectItem>
                  <SelectItem value="west-africa">West Africa</SelectItem>
                  <SelectItem value="southern-africa">Southern Africa</SelectItem>
                  <SelectItem value="north-africa">North Africa</SelectItem>
                  <SelectItem value="central-africa">Central Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-foreground">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-foreground">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-foreground"
              />
            </div>

            {feature === "agriculture" && (
              <div className="space-y-2">
                <Label htmlFor="crop-type" className="text-foreground">
                  Crop Type (Optional)
                </Label>
                <Select value={parameter} onValueChange={setParameter}>
                  <SelectTrigger id="crop-type">
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="sorghum">Sorghum</SelectItem>
                    <SelectItem value="millet">Millet</SelectItem>
                    <SelectItem value="cassava">Cassava</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {feature === "pollen" && (
              <div className="space-y-2">
                <Label htmlFor="pollen-type" className="text-foreground">
                  Pollen Type (Optional)
                </Label>
                <Select value={parameter} onValueChange={setParameter}>
                  <SelectTrigger id="pollen-type">
                    <SelectValue placeholder="Select pollen type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grass">Grass</SelectItem>
                    <SelectItem value="tree">Tree</SelectItem>
                    <SelectItem value="weed">Weed</SelectItem>
                    <SelectItem value="acacia">Acacia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {feature === "desertification" && (
              <div className="space-y-2">
                <Label htmlFor="land-use" className="text-foreground">
                  Land Use Type (Optional)
                </Label>
                <Select value={parameter} onValueChange={setParameter}>
                  <SelectTrigger id="land-use">
                    <SelectValue placeholder="Select land use" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cropland">Cropland</SelectItem>
                    <SelectItem value="grassland">Grassland</SelectItem>
                    <SelectItem value="forest">Forest</SelectItem>
                    <SelectItem value="savanna">Savanna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handlePredict} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Prediction...
                </>
              ) : (
                "Generate Prediction"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Prediction Results
              </CardTitle>
              <CardDescription>AI-generated insights for {selectedRegion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    prediction.status === "Healthy" || prediction.status === "Low"
                      ? "default"
                      : prediction.status === "Moderate"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {prediction.status}
                </Badge>
              </div>

              {prediction.metrics && (
                <div className="space-y-2">
                  {Object.entries(prediction.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="font-medium text-foreground">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}

              {prediction.trend && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp
                    className={`h-4 w-4 ${prediction.trend === "increasing" ? "text-green-600" : "text-red-600"}`}
                  />
                  <span className="text-muted-foreground capitalize">{prediction.trend}</span>
                </div>
              )}

              {prediction.recommendation && (
                <div className="rounded-lg bg-primary/10 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{prediction.recommendation}</p>
                  </div>
                </div>
              )}

              {prediction.confidence && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Confidence: </span>
                  <span className="font-semibold text-primary">{prediction.confidence}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
