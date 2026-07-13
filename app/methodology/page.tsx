import type { Metadata } from "next"
import MethodologyClient from "@/components/methodology-client"

export const metadata: Metadata = {
  title: "Methodology & Data Sources — Astroleet",
  description:
    "How Astroleet derives vegetation, soil moisture and land surface temperature indicators: sensors, processing pipeline, uncertainty and open data sources.",
}

export default function MethodologyPage() {
  return <MethodologyClient />
}
