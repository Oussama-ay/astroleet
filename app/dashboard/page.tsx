import type { Metadata } from "next"
import DashboardClient from "@/components/dashboard/dashboard-client"
import {
  parseDashboardShareSearchParams,
  type DashboardSearchParams,
} from "@/lib/domain/dashboard-share"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Interactive geospatial dashboard of vegetation, soil moisture and land surface temperature across the regions of Morocco.",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>
}) {
  const initialShareState = parseDashboardShareSearchParams(await searchParams)
  return <DashboardClient initialShareState={initialShareState} />
}
