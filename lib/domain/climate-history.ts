export const CLIMATE_HISTORY_YEAR_OPTIONS = [1, 3, 5, 10] as const
export type ClimateHistoryYears = (typeof CLIMATE_HISTORY_YEAR_OPTIONS)[number]

export interface ClimateHistoryPeriod {
  start: number
  end: number
}

export function getCompletedClimateHistoryPeriod(
  years: ClimateHistoryYears,
  now = new Date(),
): ClimateHistoryPeriod {
  const end = now.getUTCFullYear() - 1
  return { start: end - years + 1, end }
}
