import { expect, test } from "@playwright/test"

test("dashboard loads its core monitoring experience", async ({ page }) => {
  const climateRequests: string[] = []
  const radiusRequests: string[] = []
  const explanationRequests: unknown[] = []
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined })
  })
  await page.route("**/api/climate/power/radius?**", async (route) => {
    radiusRequests.push(route.request().url())
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(radiusPowerResponse),
    })
  })
  await page.route("**/api/climate/power?**", async (route) => {
    climateRequests.push(route.request().url())
    const requestUrl = new URL(route.request().url())
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        requestUrl.searchParams.get("start") === String(historicalStartYear)
          ? historicalPowerResponse
          : powerResponse,
      ),
    })
  })
  await page.route("**/api/climate/explain", async (route) => {
    explanationRequests.push(route.request().postDataJSON())
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(aiExplanationResponse),
    })
  })
  await page.route(/https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/, (route) =>
    route.abort(),
  )

  const healthResponse = await page.request.get("/api/health")
  expect(healthResponse.ok()).toBe(true)
  expect(healthResponse.headers()["x-request-id"]).toBeTruthy()
  await expect(healthResponse.json()).resolves.toMatchObject({
    status: "ok",
    services: { nasaPower: "route_available" },
  })

  await page.goto("/dashboard")

  await expect(
    page.getByRole("heading", { name: "Morocco environmental atlas" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Morocco map explorer" }),
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Interactive map restricted to Morocco" }),
  ).toBeVisible()
  await expect(page.locator(".leaflet-container")).toBeVisible()
  await expect(page.locator(".leaflet-control-attribution")).toContainText("OpenStreetMap")
  await expect(page.getByRole("combobox", { name: "Select region" })).toHaveValue(
    "Marrakech-Safi",
  )
  await expect(
    page.getByRole("heading", { name: "Climate record" }),
  ).toBeVisible()
  await expect(page.getByLabel("Air temperature observed value")).toContainText("12.30°C")
  await expect(page.getByText("Cached observed data")).toBeVisible()
  await page.getByRole("combobox", { name: "History" }).selectOption("5")
  await expect.poll(() => climateRequests.at(-1)).toContain(
    `start=${historicalStartYear}&end=${latestCompleteYear}`,
  )
  await expect(page.getByText("5-year history")).toBeVisible()
  await expect(
    page.getByText(`60 monthly observations · ${historicalStartYear}–${latestCompleteYear}`),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Observed signals" }),
  ).toBeVisible()
  await expect(page.getByText("Warmer than seasonal baseline")).toBeVisible()
  await expect(page.getByText("Deterministic screening")).toBeVisible()
  await page.getByRole("button", { name: "Explain with AI" }).click()
  await expect(page.getByRole("heading", { name: "AI-assisted interpretation" })).toBeVisible()
  await expect(page.getByText("A warmer month deserves local verification")).toBeVisible()
  expect(explanationRequests).toHaveLength(1)
  expect(explanationRequests[0]).toMatchObject({
    series: expect.arrayContaining([
      expect.objectContaining({ parameter: "air_temperature" }),
      expect.objectContaining({ parameter: "precipitation" }),
      expect.objectContaining({ parameter: "relative_humidity" }),
    ]),
  })
  await page.getByRole("button", { name: "Precipitation" }).click()
  await expect(page.getByRole("button", { name: "Precipitation" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  await page.getByRole("combobox", { name: "History" }).selectOption("1")
  await expect(page.getByText("1-year history")).toBeVisible()
  await expect(page.getByText("Longer history required")).toBeVisible()
  await expect(page.getByRole("button", { name: "Explain with AI" })).toHaveCount(0)
  await page.getByLabel("Latitude").fill("91")
  await expect(page.getByRole("button", { name: "Apply point" })).toBeDisabled()
  await expect(page.getByText("Latitude must be a number between −90 and 90.")).toBeVisible()
  await page.getByLabel("Latitude").fill("40")
  await page.getByLabel("Longitude").fill("-8")
  await expect(page.getByRole("button", { name: "Apply point" })).toBeDisabled()
  await expect(page.getByText("Select a point inside Morocco's mapped regions.")).toBeVisible()
  await page.getByLabel("Latitude").fill("33.57")
  await page.getByLabel("Longitude").fill("-7.59")
  await page.getByRole("button", { name: "Apply point" }).click()
  await expect(page.getByText("Monthly climate observations for Exact point 33.5700, -7.5900.")).toBeVisible()
  await expect.poll(() => climateRequests.at(-1)).toContain("latitude=33.57&longitude=-7.59")
  await expect(page.getByLabel("Selected analysis point")).toBeVisible()
  await page.getByRole("button", { name: "Analyze radius" }).click()
  await expect(
    page.getByText("Monthly climate observations for a 100 km radius around 33.5700, -7.5900."),
  ).toBeVisible()
  await expect.poll(() => radiusRequests.at(-1)).toContain(
    "latitude=33.57&longitude=-7.59&radiusKm=100",
  )
  await expect(page.getByText("Derived radius mean")).toBeVisible()
  await expect(page.getByText("Derived mean of 5 samples across a 100 km radius")).toBeVisible()
  await expect(page.getByLabel("100 km analysis radius")).toBeVisible()
  await expect(page.getByText("Dashed outline · 100 km radius")).toBeVisible()
  await page.getByRole("combobox", { name: "History" }).selectOption("5")
  await page.locator('button[value="lst"]').click()
  await page.getByRole("button", { name: "Share analysis" }).click()
  await expect(page.getByText("Analysis link copied")).toBeVisible()

  const sharedUrl = page.url()
  const sharedParams = new URL(sharedUrl).searchParams
  expect(sharedParams.get("view")).toBe("1")
  expect(sharedParams.get("region")).toBe("Casablanca-Settat")
  expect(sharedParams.get("metric")).toBe("lst")
  expect(sharedParams.get("history")).toBe("5")
  expect(sharedParams.get("mode")).toBe("radius")
  expect(sharedParams.get("radius")).toBe("100")
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(sharedUrl)

  await page.goto(sharedUrl)
  await expect(page.getByRole("combobox", { name: "Select region" })).toHaveValue(
    "Casablanca-Settat",
  )
  await expect(page.getByRole("combobox", { name: "History" })).toHaveValue("5")
  await expect(page.locator('button[value="lst"]')).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.getByText("Monthly climate observations for a 100 km radius around 33.5700, -7.5900."),
  ).toBeVisible()
  await expect(page.getByLabel("100 km analysis radius")).toBeVisible()
  await expect.poll(() => radiusRequests.at(-1)).toContain(
    `radiusKm=100&start=${historicalStartYear}&end=${latestCompleteYear}`,
  )
  const csvDownloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export CSV" }).click()
  const csvDownload = await csvDownloadPromise
  expect(csvDownload.suggestedFilename()).toBe(
    `astroleet-climate-radius-${latestCompleteYear}.csv`,
  )
  await expect(page.getByText("CSV export downloaded")).toBeVisible()

  const jsonDownloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export JSON" }).click()
  const jsonDownload = await jsonDownloadPromise
  expect(jsonDownload.suggestedFilename()).toBe(
    `astroleet-climate-radius-${latestCompleteYear}.json`,
  )
  await expect(page.getByText("JSON export downloaded")).toBeVisible()
  await page.getByRole("button", { name: "Use regional centroid" }).click()
  await expect(
    page.getByText("Monthly climate observations for the Casablanca-Settat regional centroid."),
  ).toBeVisible()
  await page.getByRole("button", { name: "Point select" }).click()
  await page.locator('[data-region-name="Marrakech-Safi"]').evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    element.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + bounds.height / 2,
      }),
    )
  })
  await expect(page.getByText(/Monthly climate observations for Exact point/)).toBeVisible()
  await expect(page.getByLabel("Selected analysis point")).toBeVisible()
  await expect.poll(() => climateRequests.at(-1)).toContain("/api/climate/power?latitude=")
  await expect(
    page.getByRole("heading", { name: "Satellite layer laboratory" }),
  ).toBeVisible()
  await expect(page.getByText("Validate with in-situ sampling")).toBeVisible()
  expect(browserErrors).toEqual([])
})

const latestCompleteYear = new Date().getUTCFullYear() - 1
const historicalStartYear = latestCompleteYear - 4

const baseSeries = {
  schemaVersion: "1.0",
  coverage: {
    type: "point",
    label: "31.6, -8",
    latitude: 31.6,
    longitude: -8,
  },
  period: {
    start: `${latestCompleteYear}-01-01T00:00:00.000Z`,
    end: `${latestCompleteYear}-12-31T23:59:59.999Z`,
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
  processedAt: `${latestCompleteYear + 1}-01-02T00:00:00.000Z`,
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
        values: [{ observedAt: `${latestCompleteYear}-12-01T00:00:00.000Z`, value: 12.3, quality }],
      },
      {
        ...baseSeries,
        parameter: "precipitation",
        unit: "mm/day",
        values: [{ observedAt: `${latestCompleteYear}-12-01T00:00:00.000Z`, value: 1.2, quality }],
      },
      {
        ...baseSeries,
        parameter: "relative_humidity",
        unit: "%",
        values: [{ observedAt: `${latestCompleteYear}-12-01T00:00:00.000Z`, value: 58.4, quality }],
      },
    ],
  },
  meta: {
    provider: "NASA POWER",
    cacheTtlSeconds: 86400,
  },
}

const historicalPowerResponse = {
  data: {
    series: powerResponse.data.series.map((series, seriesIndex) => ({
      ...series,
      period: {
        ...series.period,
        start: `${historicalStartYear}-01-01T00:00:00.000Z`,
      },
      values: Array.from({ length: 60 }, (_, index) => {
        const year = historicalStartYear + Math.floor(index / 12)
        const month = (index % 12) + 1
        return {
          observedAt: `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`,
          value: Number((10 + seriesIndex * 20 + index * 0.1).toFixed(2)),
          quality,
        }
      }),
    })),
  },
  meta: powerResponse.meta,
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

const aiExplanationResponse = {
  data: {
    explanation: {
      headline: "A warmer month deserves local verification",
      overview:
        "The latest monthly temperature is above its same-month historical baseline, while this remains a screening result rather than a forecast.",
      signalExplanations: [
        {
          signalId: "warmer-than-baseline",
          meaning: "The configured temperature threshold was exceeded.",
          whyItMatters: "Elevated monthly averages can help prioritize where to inspect conditions.",
          verifyNext: "Compare with local station readings and inspect heat-sensitive areas.",
        },
      ],
      caveats: [
        "Monthly averages can hide daily extremes.",
        "NASA POWER is gridded data and should be checked locally.",
      ],
    },
  },
  meta: {
    provider: "OpenAI",
    model: "gpt-5.6-luna",
    generatedAt: "2026-07-14T16:00:00.000Z",
    requestId: "ad2fb018-43df-4b1d-892e-560cd6614c1d",
  },
}
