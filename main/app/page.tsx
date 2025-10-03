"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComprehensiveDashboard } from "@/components/comprehensive-dashboard"
import { Sprout, Heart, Mountain } from "lucide-react"

export default function BloomWatchPage() {
  const [activeFeature, setActiveFeature] = useState<"agriculture" | "pollen" | "desertification">("agriculture")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">BloomWatch Africa Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive Earth observation data and predictive analytics for African ecosystems (2018-2023)
          </p>
        </div>

        {/* Feature Tabs */}
        <Tabs value={activeFeature} onValueChange={(v) => setActiveFeature(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="agriculture" className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              <span>Agriculture</span>
            </TabsTrigger>
            <TabsTrigger value="pollen" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>Pollen & Health</span>
            </TabsTrigger>
            <TabsTrigger value="desertification" className="flex items-center gap-2">
              <Mountain className="h-4 w-4" />
              <span>Desertification</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agriculture" className="mt-0">
            <ComprehensiveDashboard feature="agriculture" />
          </TabsContent>

          <TabsContent value="pollen" className="mt-0">
            <ComprehensiveDashboard feature="pollen" />
          </TabsContent>

          <TabsContent value="desertification" className="mt-0">
            <ComprehensiveDashboard feature="desertification" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
