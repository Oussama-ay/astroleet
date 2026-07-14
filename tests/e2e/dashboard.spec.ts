import { expect, test } from "@playwright/test"

test("dashboard loads its core monitoring experience", async ({ page }) => {
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
  await expect(page.getByText("Validate with in-situ sampling")).toBeVisible()
})
