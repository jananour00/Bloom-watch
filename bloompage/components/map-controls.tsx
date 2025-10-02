"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MapControlsProps {
  selectedLayers: string[]
  onLayerToggle: (layer: string) => void
  selectedRegion: string
  onRegionChange: (region: string) => void
  regions: string[]
}

export function MapControls({
  selectedLayers,
  onLayerToggle,
  selectedRegion,
  onRegionChange,
  regions,
}: MapControlsProps) {
  const layers = [
    { id: "bloom-stage", label: "Bloom Stages", description: "Color-coded bloom lifecycle" },
    { id: "bloom-intensity", label: "Bloom Intensity", description: "Size indicates intensity" },
    { id: "ndvi", label: "NDVI Heatmap", description: "Vegetation health overlay" },
    { id: "soil-moisture", label: "Soil Moisture", description: "Moisture levels" },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">Map Layers</h3>
      <p className="mt-1 text-sm text-muted-foreground">Toggle data layers on the map</p>

      <div className="mt-6 space-y-4">
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-start justify-between">
            <div className="flex-1">
              <Label htmlFor={layer.id} className="text-sm font-medium text-foreground">
                {layer.label}
              </Label>
              <p className="text-xs text-muted-foreground">{layer.description}</p>
            </div>
            <Switch
              id={layer.id}
              checked={selectedLayers.includes(layer.id)}
              onCheckedChange={() => onLayerToggle(layer.id)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <Label htmlFor="region-select" className="text-sm font-medium text-foreground">
          Region Filter
        </Label>
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger id="region-select" className="mt-2">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  )
}
