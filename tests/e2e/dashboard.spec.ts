import { expect, test } from "@playwright/test"

test("dashboard loads its core monitoring experience", async ({ page }) => {
  const climateRequests: string[] = []
  const radiusRequests: string[] = []
  await page.route("**/api/climate/power/radius?**", async (route) => {
    radiusRequests.push(route.request().url())
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(radiusPowerResponse),
    })
  })
  await page.route("**/api/climate/power?**", async (route) => {
    climateRequests.push(route.request().url())
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
  await page.getByLabel("Latitude").fill("91")
  await expect(page.getByRole("button", { name: "Apply point" })).toBeDisabled()
  await expect(page.getByText("Latitude must be a number between −90 and 90.")).toBeVisible()
  await page.getByLabel("Latitude").fill("33.57")
  await page.getByLabel("Longitude").fill("-7.59")
  await page.getByRole("button", { name: "Apply point" }).click()
  await expect(page.getByText("Monthly climate observations for Exact point 33.5700, -7.5900.")).toBeVisible()
  await expect.poll(() => climateRequests.at(-1)).toContain("latitude=33.57&longitude=-7.59")
  await page.getByRole("button", { name: "Analyze radius" }).click()
  await expect(
    page.getByText("Monthly climate observations for a 100 km radius around 33.5700, -7.5900."),
  ).toBeVisible()
  await expect.poll(() => radiusRequests.at(-1)).toContain(
    "latitude=33.57&longitude=-7.59&radiusKm=100",
  )
  await expect(page.getByText("Derived radius mean")).toBeVisible()
  await expect(page.getByText("Derived mean of 5 samples across a 100 km radius")).toBeVisible()
  await page.getByRole("button", { name: "Use regional centroid" }).click()
  await expect(
    page.getByText("Monthly climate observations for the Marrakech-Safi regional centroid."),
  ).toBeVisible()
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

const radiusPowerResponse = {
  data: {
    series: powerResponse.data.series.map((series) => ({
      ...series,
      coverage: {
        type: "radius",
        label: "100 km radius around 33.57, -7.59",
        center: { latitude: 33.57, longitude: -7.59 },
        radiusKm: 100,
        sampleCount: 5,
      },
      status: "derived",
      values: series.values.map((value) => ({
        ...value,
        quality: {
          status: "estimated",
          flags: ["radius-mean", "five-point-sample"],
          notes: ["Arithmetic mean of five point samples"],
        },
      })),
    })),
  },
  meta: {
    provider: "NASA POWER",
    method: "five-point-radius-mean",
    sampleCount: 5,
    cacheTtlSeconds: 86400,
  },
}
