"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, LineChart, Brain, Settings, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Interactive Map", href: "/map", icon: Map },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "AI Predictions", href: "/predictions", icon: Brain },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Leaf className="h-6 w-6 text-accent" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">NASA Bloom</span>
          <span className="text-xs text-muted-foreground">Detection Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-muted-foreground">Data from NASA Earthdata</p>
          <p className="mt-1 text-xs font-mono text-sidebar-foreground">2018-2024</p>
        </div>
      </div>
    </div>
  )
}
