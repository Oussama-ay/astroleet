import type { Metadata } from "next"
import MethodologyClient from "@/components/methodology-client"

export const metadata: Metadata = {
  title: "Methodology & Data Sources — Astroleat",
  description:
    "How Astroleat derives vegetation, soil moisture and land surface temperature indicators: sensors, processing pipeline, uncertainty and open data sources.",
}

export default function MethodologyPage() {
  return <MethodologyClient />
}
