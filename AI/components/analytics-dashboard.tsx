import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getVegetationData,
  getPollenData,
  getDesertificationData,
  predictCropHealth,
  predictBloomTiming,
  detectSoilStress,
  predictPollenConcentration,
  mapPollenHotspots,
  predictAllergyRisk,
  detectVegetationLoss,
  calculateDesertificationRisk,
  recommendRestoration,
} from "@/app/actions/nasa-data"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface AnalyticsDashboardProps {
  feature: "agriculture" | "pollen" | "desertification"
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function AgricultureAnalytics() {
  const vegetationData = await getVegetationData()
  const cropHealthPredictions = await predictCropHealth()
  const bloomPredictions = await predictBloomTiming()
  const soilStressAlerts = await detectSoilStress()

  return (
    <div className="space-y-6">
      {/* Model Predictions */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">AI Model Predictions</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Crop Health Classification */}
          {cropHealthPredictions.map((prediction, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{prediction.location}</CardTitle>
                <CardDescription>Vegetation Health Classification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Health Status</span>
                  <Badge
                    variant={
                      prediction.status === "Healthy"
                        ? "default"
                        : prediction.status === "Moderate"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {prediction.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">NDVI</span>
                    <span className="font-medium text-foreground">{prediction.ndvi.toFixed(2)}</span>
                  </div>
                  <Progress value={prediction.ndvi * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">EVI</span>
                    <span className="font-medium text-foreground">{prediction.evi.toFixed(2)}</span>
                  </div>
                  <Progress value={prediction.evi * 100} className="h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {prediction.trend === "increasing" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : prediction.trend === "decreasing" ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-muted-foreground capitalize">{prediction.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bloom Timing Predictions */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Bloom Timing Forecast</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {bloomPredictions.map((bloom, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{bloom.species}</CardTitle>
                <CardDescription>{bloom.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Predicted Bloom Date</span>
                  <span className="font-semibold text-primary">{bloom.predictedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="font-medium text-foreground">{bloom.confidence}%</span>
                </div>
                <Progress value={bloom.confidence} className="h-2" />
                <p className="text-sm text-muted-foreground">{bloom.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Soil & Water Stress Alerts */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Soil & Water Stress Detection</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {soilStressAlerts.map((alert, idx) => (
            <Card key={idx} className={alert.alertLevel !== "Normal" ? "border-destructive" : ""}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  {alert.alertLevel !== "Normal" && <AlertTriangle className="h-5 w-5 text-destructive" />}
                  {alert.location}
                </CardTitle>
                <CardDescription>Soil Stress Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alert Level</span>
                  <Badge variant={alert.alertLevel === "Normal" ? "default" : "destructive"}>{alert.alertLevel}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Soil Moisture</span>
                    <span className="font-medium text-foreground">{alert.soilMoisture}%</span>
                  </div>
                  <Progress value={alert.soilMoisture} className="h-2" />
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{alert.recommendation}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

async function PollenAnalytics() {
  const pollenData = await getPollenData()
  const concentrationPredictions = await predictPollenConcentration()
  const hotspots = await mapPollenHotspots()
  const allergyRisks = await predictAllergyRisk()

  return (
    <div className="space-y-6">
      {/* Pollen Concentration Model */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Pollen Concentration Predictions</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {concentrationPredictions.map((prediction, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{prediction.region}</CardTitle>
                <CardDescription>ML-Based Concentration Model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Concentration Level</span>
                  <Badge
                    variant={
                      prediction.level === "Low"
                        ? "default"
                        : prediction.level === "Moderate"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {prediction.level}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pollen Count</span>
                    <span className="font-medium text-foreground">{prediction.count} grains/m³</span>
                  </div>
                  <Progress value={(prediction.count / 150) * 100} className="h-2" />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Dominant Species: </span>
                  <span className="font-medium text-foreground">{prediction.dominantSpecies.join(", ")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pollen Hotspot Mapping */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Pollen Hotspot Mapping</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {hotspots.map((hotspot, idx) => (
            <Card key={idx} className={hotspot.riskLevel === "High" ? "border-destructive" : ""}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  {hotspot.riskLevel === "High" && <AlertTriangle className="h-5 w-5 text-destructive" />}
                  {hotspot.location}
                </CardTitle>
                <CardDescription>Spatial Interpolation Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <Badge variant={hotspot.riskLevel === "High" ? "destructive" : "secondary"}>
                    {hotspot.riskLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Flowering Density</span>
                    <span className="font-medium text-foreground">{hotspot.floweringDensity}%</span>
                  </div>
                  <Progress value={hotspot.floweringDensity} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">{hotspot.forecast}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Allergy Risk Prediction */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Allergy Risk Assessment</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allergyRisks.map((risk, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{risk.region}</CardTitle>
                <CardDescription>Rule-Based Risk Model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <Badge
                    variant={
                      risk.riskLevel === "Low" ? "default" : risk.riskLevel === "Medium" ? "secondary" : "destructive"
                    }
                  >
                    {risk.riskLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="font-medium text-foreground">{risk.score}/10</span>
                  </div>
                  <Progress value={risk.score * 10} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">{risk.recommendation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

async function DesertificationAnalytics() {
  const desertificationData = await getDesertificationData()
  const vegetationLoss = await detectVegetationLoss()
  const riskIndices = await calculateDesertificationRisk()
  const restorationPlans = await recommendRestoration()

  return (
    <div className="space-y-6">
      {/* Vegetation Loss Detection */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Vegetation Loss Detection</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vegetationLoss.map((loss, idx) => (
            <Card key={idx} className={loss.severity === "Critical" ? "border-destructive" : ""}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  {loss.severity === "Critical" && <AlertTriangle className="h-5 w-5 text-destructive" />}
                  {loss.area}
                </CardTitle>
                <CardDescription>Change Detection Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Severity</span>
                  <Badge
                    variant={
                      loss.severity === "Low" ? "default" : loss.severity === "Moderate" ? "secondary" : "destructive"
                    }
                  >
                    {loss.severity}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vegetation Loss</span>
                    <span className="font-medium text-foreground">{loss.lossPercentage}%</span>
                  </div>
                  <Progress value={loss.lossPercentage} className="h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-muted-foreground">NDVI Change: {loss.ndviChange}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desertification Risk Index */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Desertification Risk Index</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {riskIndices.map((risk, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{risk.area}</CardTitle>
                <CardDescription>ML-Based Risk Assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <Badge
                    variant={
                      risk.riskLevel === "Low" ? "default" : risk.riskLevel === "Moderate" ? "secondary" : "destructive"
                    }
                  >
                    {risk.riskLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Index</span>
                    <span className="font-medium text-foreground">{risk.index.toFixed(1)}/10</span>
                  </div>
                  <Progress value={risk.index * 10} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Soil Moisture: </span>
                    <span className="font-medium text-foreground">{risk.soilMoisture}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rainfall: </span>
                    <span className="font-medium text-foreground">{risk.rainfall}mm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Restoration Recommendations */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Restoration Recommendations</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restorationPlans.map((plan, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {plan.area}
                </CardTitle>
                <CardDescription>Expert System Recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <Badge variant={plan.priority === "High" ? "destructive" : "secondary"}>{plan.priority}</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {plan.actions.map((action, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground italic">{plan.expectedOutcome}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AnalyticsDashboard({ feature }: AnalyticsDashboardProps) {
  return (
    <div className="w-full">
      <Suspense fallback={<DashboardSkeleton />}>
        {feature === "agriculture" && <AgricultureAnalytics />}
        {feature === "pollen" && <PollenAnalytics />}
        {feature === "desertification" && <DesertificationAnalytics />}
      </Suspense>
    </div>
  )
}
