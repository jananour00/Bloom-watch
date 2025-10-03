"use client"

interface MapControlsProps {
  selectedFeature: "agriculture" | "pollen" | "desertification"
  onFeatureChange: (feature: "agriculture" | "pollen" | "desertification") => void
  selectedRegion: string
  onRegionChange: (region: string) => void
  regions: string[]
}

export function MapControls({
  selectedFeature,
  onFeatureChange,
  selectedRegion,
  onRegionChange,
  regions,
}: MapControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Select Feature</h2>
        <select
          value={selectedFeature}
          onChange={(e) => onFeatureChange(e.target.value as "agriculture" | "pollen" | "desertification")}
          className="w-full rounded border border-border bg-background p-2"
        >
          <option value="agriculture">Agriculture</option>
          <option value="pollen">Pollen</option>
          <option value="desertification">Desertification</option>
        </select>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Select Region</h2>
        <select
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full rounded border border-border bg-background p-2"
        >
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
