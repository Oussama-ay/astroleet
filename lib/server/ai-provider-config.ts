export const DEFAULT_AI_CLIMATE_MODEL = "gpt-5.6-luna"

export type AIProvider = "OpenAI" | "OpenRouter"

type AIEnvironment = Readonly<Record<string, string | undefined>>

export interface AIProviderConfig {
  provider: AIProvider
  model: string
  apiKey?: string
}

export function resolveAIProviderConfig(
  environment: AIEnvironment = process.env,
): AIProviderConfig {
  const model =
    environment.AI_MODEL?.trim() ||
    environment.OPENAI_MODEL?.trim() ||
    DEFAULT_AI_CLIMATE_MODEL
  const provider = resolveProvider(environment.AI_PROVIDER, model)
  const genericKey = environment.AI_API_KEY?.trim()

  return {
    provider,
    model,
    apiKey:
      genericKey ||
      (provider === "OpenRouter"
        ? environment.OPENROUTER_API_KEY?.trim() || environment.OPENAI_API_KEY?.trim()
        : environment.OPENAI_API_KEY?.trim()),
  }
}

export function isAIExplanationConfigured(environment: AIEnvironment = process.env) {
  return Boolean(resolveAIProviderConfig(environment).apiKey)
}

function resolveProvider(value: string | undefined, model: string): AIProvider {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "openrouter") return "OpenRouter"
  if (normalized === "openai") return "OpenAI"

  // OpenRouter model slugs use the provider/model form. This also keeps the legacy
  // OPENAI_* variable names working for existing local environments.
  return model.includes("/") ? "OpenRouter" : "OpenAI"
}
