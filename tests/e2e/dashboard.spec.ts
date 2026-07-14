import { expect, test } from "@playwright/test"

test("dashboard loads its core monitoring experience", async ({ page }) => {
  await page.route("**/api/climate/power?**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(powerResponse),
    })
  })

  await page.goto("/dashboard")

  await expect(
    page.getByRole("heading", { name: "Morocco environmental monitor" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Morocco map explorer" }),
  ).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Select region" })).toHaveValue(
    "Marrakech-Safi",
  )
  await expect(
    page.getByRole("heading", { name: "Observed climate from NASA POWER" }),
  ).toBeVisible()
  await expect(page.getByLabel("Air temperature observed value")).toContainText("12.30°C")
  await expect(page.getByText("Cached observed data")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Demonstration satellite indicators" }),
  ).toBeVisible()
  await expect(page.getByText("Validate with in-situ sampling")).toBeVisible()
})

const baseSeries = {
  schemaVersion: "1.0",
  coverage: {
    type: "point",
    label: "31.6, -8",
    latitude: 31.6,
    longitude: -8,
  },
  period: {
    start: "2025-01-01T00:00:00.000Z",
    end: "2025-12-31T23:59:59.999Z",
    aggregation: "monthly",
  },
  source: {
    provider: "NASA POWER",
    product: "POWER Monthly and Annual API",
    version: "v2.9.7",
    documentation: "https://power.larc.nasa.gov/docs/services/api/temporal/monthly/",
  },
  resolution: {
    spatial: "0.5° latitude × 0.625° longitude meteorological grid",
    temporal: "Monthly average",
  },
  processedAt: "2026-01-02T00:00:00.000Z",
  status: "cached",
}

const quality = { status: "valid", flags: [], notes: [] }

const powerResponse = {
  data: {
    series: [
      {
        ...baseSeries,
        parameter: "air_temperature",
        unit: "°C",
        values: [{ observedAt: "2025-12-01T00:00:00.000Z", value: 12.3, quality }],
      },
      {
        ...baseSeries,
        parameter: "precipitation",
        unit: "mm/day",
        values: [{ observedAt: "2025-12-01T00:00:00.000Z", value: 1.2, quality }],
      },
      {
        ...baseSeries,
        parameter: "relative_humidity",
        unit: "%",
        values: [{ observedAt: "2025-12-01T00:00:00.000Z", value: 58.4, quality }],
      },
    ],
  },
  meta: {
    provider: "NASA POWER",
    cacheTtlSeconds: 86400,
  },
}
