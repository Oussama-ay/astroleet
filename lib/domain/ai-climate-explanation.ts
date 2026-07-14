import { z } from "zod"
import { environmentalSeriesSchema } from "./environment"

export const AI_CLIMATE_MAX_MONTHLY_OBSERVATIONS = 120

export const aiClimateExplainRequestSchema = z
  .strictObject({
    series: z.array(environmentalSeriesSchema).length(3),
  })
  .superRefine(({ series }, context) => {
    const parameters = series.map((candidate) => candidate.parameter)
    const expected = ["air_temperature", "precipitation", "relative_humidity"]
    const coverage = JSON.stringify(series[0]?.coverage)

    for (const parameter of expected) {
      if (parameters.filter((candidate) => candidate === parameter).length !== 1) {
        context.addIssue({
          code: "custom",
          path: ["series"],
          message: `Exactly one ${parameter} series is required`,
        })
      }
    }

    series.forEach((candidate, index) => {
      if (
        candidate.source.provider !== "NASA POWER" ||
        candidate.period.aggregation !== "monthly"
      ) {
        context.addIssue({
          code: "custom",
          path: ["series", index],
          message: "AI explanations require monthly NASA POWER series",
        })
      }

      if (JSON.stringify(candidate.coverage) !== coverage) {
        context.addIssue({
          code: "custom",
          path: ["series", index, "coverage"],
          message: "Every climate series must describe the same geographic coverage",
        })
      }

      if (candidate.values.length > AI_CLIMATE_MAX_MONTHLY_OBSERVATIONS) {
        context.addIssue({
          code: "too_big",
          origin: "array",
          maximum: AI_CLIMATE_MAX_MONTHLY_OBSERVATIONS,
          inclusive: true,
          path: ["series", index, "values"],
          message: `At most ${AI_CLIMATE_MAX_MONTHLY_OBSERVATIONS} monthly observations are allowed`,
        })
      }
    })
  })

export const aiClimateExplanationSchema = z.strictObject({
  headline: z.string().min(1).max(120),
  overview: z.string().min(1).max(600),
  signalExplanations: z
    .array(
      z.strictObject({
        signalId: z.string().min(1).max(80),
        meaning: z.string().min(1).max(320),
        whyItMatters: z.string().min(1).max(320),
        verifyNext: z.string().min(1).max(240),
      }),
    )
    .min(1)
    .max(5),
  caveats: z.array(z.string().min(1).max(240)).min(2).max(4),
})

export type AIClimateExplanation = z.infer<typeof aiClimateExplanationSchema>

export const aiClimateExplainResponseSchema = z.strictObject({
  data: z.strictObject({
    explanation: aiClimateExplanationSchema,
  }),
  meta: z.strictObject({
    provider: z.literal("OpenAI"),
    model: z.string().min(1),
    generatedAt: z.iso.datetime({ offset: true }),
  }),
})

export type AIClimateExplainResponse = z.infer<typeof aiClimateExplainResponseSchema>
