"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  MapPin,
  Activity,
  Layers,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { EnhancedAfricaMap } from "@/components/enhanced-africa-map"
import { FeatureCharts } from "@/components/feature-charts"
import { RegionalComparison } from "@/components/regional-comparison"
import { DataTable } from "@/components/data-table"
import { predictFromUserInput } from "@/app/actions/nasa-data"
import { getHistoricalData, type HistoricalDataPoint } from "@/app/actions/historical-data"

interface ComprehensiveDashboardProps {
  feature: "agriculture" | "pollen" | "desertification"
}

export function ComprehensiveDashboard({ feature }: ComprehensiveDashboardProps) {
  const [showDescription, setShowDescription] = useState(true)

  const [selectedRegion, setSelectedRegion] = useState("sahel")
  const [startDate, setStartDate] = useState("2023-01-01")
  const [endDate, setEndDate] = useState("2023-12-31")
  const [cropType, setCropType] = useState("")
  const [soilType, setSoilType] = useState("")
  const [pollenType, setPollenType] = useState("")
  const [allergySensitivity, setAllergySensitivity] = useState("")
  const [landUseType, setLandUseType] = useState("")
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState<string[]>(["vegetation"])

  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true)
      const data = await getHistoricalData(feature, selectedRegion)
      setHistoricalData(data)
      setDataLoading(false)
    }
    loadData()
  }, [feature, selectedRegion])

  const handlePredict = async () => {
    if (!selectedRegion || !startDate || !endDate) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const parameter = feature === "agriculture" ? cropType : feature === "pollen" ? pollenType : landUseType
      const result = await predictFromUserInput({
        feature,
        region: selectedRegion,
        startDate,
        endDate,
        parameter,
      })
      setPrediction(result)
    } catch (error) {
      console.error("Prediction error:", error)
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
        return {
          title: "Agriculture Monitoring System",
          overview:
            "Monitor crop health, vegetation patterns, and agricultural productivity across Africa using NASA satellite data. Track NDVI (Normalized Difference Vegetation Index), soil moisture, temperature, and rainfall patterns to optimize farming practices and predict yields.",
          features: [
            "Vegetation Health Classification: Real-time assessment of crop health using multispectral satellite imagery",
            "Bloom Timing Prediction: Forecast flowering periods based on temperature, rainfall, and historical patterns",
            "Soil & Water Stress Detection: Identify areas experiencing drought or water stress conditions",
            "Yield Prediction: AI-powered crop yield forecasting using historical data and current conditions",
          ],
          dataSource: "NASA MODIS, Landsat 8/9, and SMAP satellite missions providing daily to weekly observations",
          usage:
            "Select your region, crop type, and date range to view detailed analytics. The interactive map shows vegetation health with color-coded heatmaps, while charts display historical trends from 2018-2023.",
          cropInfo: {
            title: "Monitored Crops & Agriculture Data",
            crops: [
              {
                name: "Maize (Corn)",
                regions: ["Sahel", "East Africa", "Southern Africa"],
                dataAvailable: true,
                metrics: ["NDVI", "Soil Moisture", "Temperature", "Rainfall"],
                growingSeason: "March - August",
                status: "Data Available",
              },
              {
                name: "Wheat",
                regions: ["North Africa", "East Africa"],
                dataAvailable: true,
                metrics: ["NDVI", "Temperature", "Rainfall"],
                growingSeason: "November - May",
                status: "Data Available",
              },
              {
                name: "Sorghum",
                regions: ["Sahel", "West Africa", "East Africa"],
                dataAvailable: true,
                metrics: ["NDVI", "Soil Moisture", "Rainfall"],
                growingSeason: "May - October",
                status: "Data Available",
              },
              {
                name: "Millet",
                regions: ["Sahel", "West Africa"],
                dataAvailable: true,
                metrics: ["NDVI", "Soil Moisture", "Temperature"],
                growingSeason: "June - October",
                status: "Data Available",
              },
              {
                name: "Cassava",
                regions: ["West Africa", "Central Africa", "East Africa"],
                dataAvailable: true,
                metrics: ["NDVI", "Soil Moisture", "Temperature"],
                growingSeason: "Year-round",
                status: "Data Available",
              },
              {
                name: "Rice",
                regions: ["West Africa", "East Africa"],
                dataAvailable: true,
                metrics: ["NDVI", "Soil Moisture", "Rainfall", "Temperature"],
                growingSeason: "May - November",
                status: "Data Available",
              },
            ],
            dataNeeds: [
              {
                category: "High-Resolution Imagery",
                status: "Needed",
                description: "Sub-meter resolution for small-scale farms",
              },
              {
                category: "Real-Time Soil Data",
                status: "Needed",
                description: "Ground-based soil sensors for validation",
              },
              {
                category: "Pest & Disease Data",
                status: "Needed",
                description: "Integration with agricultural extension services",
              },
            ],
          },
        }

      case "pollen":
        return {
          title: "Pollen & Health Tracking System",
          overview:
            "Track pollen concentrations, flowering patterns, and allergy risk levels across African regions. Combine satellite vegetation data with meteorological conditions to predict pollen dispersal and health impacts.",
          features: [
            "Pollen Concentration Model: Estimate airborne pollen levels based on flowering vegetation and wind patterns",
            "Pollen Hotspot Mapping: Identify areas with high pollen production from grass, trees, and weeds",
            "Allergy Risk Prediction: Forecast allergy severity levels for sensitive populations",
            "Trend Analysis: Monitor seasonal patterns and long-term changes in pollen distribution",
          ],
          dataSource:
            "NASA Earth observations combined with wind data and vegetation indices to model pollen dispersal",
          usage:
            "Choose your region and pollen type to see concentration maps and risk assessments. The system provides daily forecasts and historical comparisons to help manage allergy symptoms.",
        }
      case "desertification":
        return {
          title: "Desertification Analysis System",
          overview:
            "Monitor land degradation, vegetation loss, and desertification risk across Africa. Track changes in land cover, soil quality, and ecosystem health to support conservation and restoration efforts.",
          features: [
            "Vegetation Loss Detection: Identify areas experiencing significant decline in plant cover",
            "Desertification Risk Index: Calculate risk scores based on vegetation trends, rainfall, and land use",
            "Land Use Impact Model: Assess how agricultural practices and development affect land degradation",
            "Restoration Recommendation: AI-generated suggestions for land rehabilitation and conservation",
          ],
          dataSource: "Multi-decade satellite records from NASA Landsat and MODIS missions tracking land cover changes",
          usage:
            "Select regions and land use types to analyze desertification trends. The dashboard shows risk levels, vegetation changes over time, and provides actionable recommendations for land management.",
        }
    }
  }

  const description = getFeatureDescription()

  const getFeatureMetric = () => {
    switch (feature) {
      case "agriculture":
        return "NDVI"
      case "pollen":
        return "Pollen Concentration"
      case "desertification":
        return "Risk Index"
    }
  }

  const currentYearData = historicalData.filter((d) => d.year === 2023)
  const avgValue =
    currentYearData.length > 0 ? currentYearData.reduce((sum, d) => sum + d.value, 0) / currentYearData.length : 0

  const previousYearData = historicalData.filter((d) => d.year === 2022)
  const prevAvgValue =
    previousYearData.length > 0 ? previousYearData.reduce((sum, d) => sum + d.value, 0) / previousYearData.length : 0

  const changePercent = prevAvgValue > 0 ? ((avgValue - prevAvgValue) / prevAvgValue) * 100 : 0

  const maxValue = Math.max(...historicalData.map((d) => d.value))
  const minValue = Math.min(...historicalData.map((d) => d.value))

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">{description.title}</CardTitle>
                <CardDescription>Powered by NASA Earth Observation Data</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className="text-primary"
            >
              {showDescription ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showDescription && (
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description.overview}</p>
            </div>

            {feature === "agriculture" && description.cropInfo && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    {description.cropInfo.title}
                  </h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    {description.cropInfo.crops.map((crop, index) => (
                      <div key={index} className="p-3 rounded-lg border border-primary/20 bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{crop.name}</h4>
                          <Badge variant={crop.dataAvailable ? "default" : "secondary"} className="text-xs">
                            {crop.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>
                            <span className="font-medium text-foreground">Regions:</span> {crop.regions.join(", ")}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Season:</span> {crop.growingSeason}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Metrics:</span> {crop.metrics.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Additional Data Needed
                  </h4>
                  <div className="space-y-2">
                    {description.cropInfo.dataNeeds.map((need, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5 text-xs border-amber-500/30 text-amber-700">
                          {need.status}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{need.category}</p>
                          <p className="text-xs text-muted-foreground">{need.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-foreground mb-2">Key Features</h3>
              <ul className="space-y-2">
                {description.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Data Source
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description.dataSource}</p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  How to Use
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description.usage}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">About the Data</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This dashboard displays historical trends from 2018-2023 using NASA Earth observation satellites.
                    The interactive map shows real-time heatmaps with animated layers. Use the control panel to filter
                    by region, date range, and specific parameters. AI-powered predictions provide insights based on
                    historical patterns and current conditions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current {getFeatureMetric()}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">2023 Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year-over-Year Change</CardTitle>
            {changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs 2022</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">2018-2023</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Region</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{selectedRegion.replace("-", " ")}</div>
            <p className="text-xs text-muted-foreground">Africa</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Map with Layer Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">{getFeatureTitle()} - Interactive Map</CardTitle>
                  <CardDescription>Real-time heatmap with animated layers showing changes over time</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{activeLayer.length} layers active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedAfricaMap
                feature={feature}
                selectedRegion={selectedRegion}
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
              />
            </CardContent>
          </Card>

          {/* Feature-Specific Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Detailed Analytics</CardTitle>
              <CardDescription>Comprehensive metrics and trends for {selectedRegion.replace("-", " ")}</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <FeatureCharts feature={feature} data={historicalData} />
              )}
            </CardContent>
          </Card>

          {/* Regional Comparison Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Regional Comparison</CardTitle>
              <CardDescription>Compare data across different regions</CardDescription>
            </CardHeader>
            <CardContent>
              <RegionalComparison feature={feature} />
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Historical Data Table (2018-2023)</CardTitle>
              <CardDescription>Yearly breakdown of {getFeatureMetric()} values</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable data={historicalData} feature={feature} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Controls & Predictions */}
        <div className="space-y-6">
          {/* User Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Control Panel</CardTitle>
              <CardDescription>Configure parameters and generate predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                  <TabsTrigger value="predict">Predict</TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="space-y-4 mt-4">
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
                    <Label htmlFor="date-range" className="text-foreground">
                      Date Range
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-foreground"
                      />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-foreground"
                      />
                    </div>
                  </div>

                  {/* Agriculture-specific filters */}
                  {feature === "agriculture" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="crop-type" className="text-foreground">
                          Crop Type
                        </Label>
                        <Select value={cropType} onValueChange={setCropType}>
                          <SelectTrigger id="crop-type">
                            <SelectValue placeholder="Select crop type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maize">Maize</SelectItem>
                            <SelectItem value="wheat">Wheat</SelectItem>
                            <SelectItem value="sorghum">Sorghum</SelectItem>
                            <SelectItem value="millet">Millet</SelectItem>
                            <SelectItem value="cassava">Cassava</SelectItem>
                            <SelectItem value="rice">Rice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="soil-type" className="text-foreground">
                          Soil Type
                        </Label>
                        <Select value={soilType} onValueChange={setSoilType}>
                          <SelectTrigger id="soil-type">
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="loam">Loam</SelectItem>
                            <SelectItem value="silt">Silt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Pollen-specific filters */}
                  {feature === "pollen" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="pollen-type" className="text-foreground">
                          Pollen Type
                        </Label>
                        <Select value={pollenType} onValueChange={setPollenType}>
                          <SelectTrigger id="pollen-type">
                            <SelectValue placeholder="Select pollen type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grass">Grass</SelectItem>
                            <SelectItem value="tree">Tree</SelectItem>
                            <SelectItem value="weed">Weed</SelectItem>
                            <SelectItem value="acacia">Acacia</SelectItem>
                            <SelectItem value="olive">Olive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allergy-sensitivity" className="text-foreground">
                          Allergy Sensitivity
                        </Label>
                        <Select value={allergySensitivity} onValueChange={setAllergySensitivity}>
                          <SelectTrigger id="allergy-sensitivity">
                            <SelectValue placeholder="Select sensitivity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Desertification-specific filters */}
                  {feature === "desertification" && (
                    <div className="space-y-2">
                      <Label htmlFor="land-use" className="text-foreground">
                        Land Use Type
                      </Label>
                      <Select value={landUseType} onValueChange={setLandUseType}>
                        <SelectTrigger id="land-use">
                          <SelectValue placeholder="Select land use" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cropland">Cropland</SelectItem>
                          <SelectItem value="grassland">Grassland</SelectItem>
                          <SelectItem value="forest">Forest</SelectItem>
                          <SelectItem value="savanna">Savanna</SelectItem>
                          <SelectItem value="shrubland">Shrubland</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="predict" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Generate AI-powered predictions based on your selected parameters and historical data.
                    </p>

                    <Button onClick={handlePredict} disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Prediction"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
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
                <CardDescription>AI-generated insights for {selectedRegion.replace("-", " ")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      prediction.status === "Healthy" || prediction.status === "Low" || prediction.status === "Stable"
                        ? "default"
                        : prediction.status === "Moderate" || prediction.status === "At Risk"
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
                    {prediction.trend === "increasing" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-muted-foreground capitalize">{prediction.trend}</span>
                  </div>
                )}

                {prediction.recommendation && (
                  <div className="rounded-lg bg-primary/10 p-3">
                    <p className="text-sm text-foreground">{prediction.recommendation}</p>
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

          {/* Alerts Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Active Alerts
              </CardTitle>
              <CardDescription>High-risk areas requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {feature === "agriculture" && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Crop Stress Detected</p>
                      <p className="text-xs text-muted-foreground">Sahel Region - Low soil moisture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Bloom Period Starting</p>
                      <p className="text-xs text-muted-foreground">East Africa - Next 2 weeks</p>
                    </div>
                  </div>
                </>
              )}

              {feature === "pollen" && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">High Pollen Concentration</p>
                      <p className="text-xs text-muted-foreground">West Africa - Grass pollen</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Moderate Allergy Risk</p>
                      <p className="text-xs text-muted-foreground">North Africa - Tree pollen</p>
                    </div>
                  </div>
                </>
              )}

              {feature === "desertification" && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Critical Vegetation Loss</p>
                      <p className="text-xs text-muted-foreground">Sahel Region - 15% decline</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Moderate Risk Area</p>
                      <p className="text-xs text-muted-foreground">Southern Africa - Monitoring required</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
