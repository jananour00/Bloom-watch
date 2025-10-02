"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToCSV } from "@/lib/data-processor"
import type { ProcessedBloomData } from "@/lib/data-processor"

interface DataExportProps {
  data: ProcessedBloomData[]
  filename?: string
}

export function DataExport({ data, filename = "bloom_data.csv" }: DataExportProps) {
  const handleExport = () => {
    const csv = exportToCSV(data)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 bg-transparent">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
