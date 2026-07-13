import type { Metadata } from "next"
import DashboardClient from "@/components/dashboard/dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard — Astroleat",
  description:
    "Interactive geospatial dashboard of vegetation, soil moisture and land surface temperature across the regions of Morocco.",
}

export default function DashboardPage() {
  return <DashboardClient />
}
