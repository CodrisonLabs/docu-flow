export type ProviderId = "openai" | "anthropic" | "gemini" | "groq" | "openrouter";

export type ModelOption = {
  provider: ProviderId;
  providerLabel: string;
  model: string;
  label: string;
  description?: string;
};

export type ModelGroup = {
  provider: ProviderId;
  providerLabel: string;
  models: ModelOption[];
};

export const MODEL_GROUPS: ModelGroup[] = [
  {
    provider: "openai",
    providerLabel: "OpenAI",
    models: [
      {
        provider: "openai",
        providerLabel: "OpenAI",
        model: "gpt-4.1",
        label: "GPT-4.1",
        description: "Best general-purpose reasoning",
      },
      {
        provider: "openai",
        providerLabel: "OpenAI",
        model: "gpt-4o",
        label: "GPT-4o",
        description: "Fast multimodal model",
      },
      {
        provider: "openai",
        providerLabel: "OpenAI",
        model: "gpt-4.1-mini",
        label: "GPT-4.1 Mini",
        description: "Lightweight and fast",
      },
    ],
  },
  {
    provider: "anthropic",
    providerLabel: "Anthropic",
    models: [
      {
        provider: "anthropic",
        providerLabel: "Anthropic",
        model: "claude-sonnet-4",
        label: "Claude Sonnet 4",
        description: "Balanced, strong writing",
      },
      {
        provider: "anthropic",
        providerLabel: "Anthropic",
        model: "claude-haiku-3.5",
        label: "Claude Haiku 3.5",
        description: "Fast and efficient",
      },
    ],
  },
  {
    provider: "gemini",
    providerLabel: "Google / Gemini",
    models: [
      {
        provider: "gemini",
        providerLabel: "Google / Gemini",
        model: "gemini-2.5-pro",
        label: "Gemini 2.5 Pro",
        description: "High-capability reasoning",
      },
      {
        provider: "gemini",
        providerLabel: "Google / Gemini",
        model: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        description: "Fast and cost-friendly",
      },
    ],
  },
  {
    provider: "groq",
    providerLabel: "Groq",
    models: [
      {
        provider: "groq",
        providerLabel: "Groq",
        model: "llama-3.3-70b-versatile",
        label: "Llama 3.3 70B",
        description: "High throughput",
      },
      {
        provider: "groq",
        providerLabel: "Groq",
        model: "llama-3.1-8b-instant",
        label: "Llama 3.1 8B",
        description: "Ultra fast",
      },
    ],
  },
  {
    provider: "openrouter",
    providerLabel: "OpenRouter",
    models: [
      {
        provider: "openrouter",
        providerLabel: "OpenRouter",
        model: "openai/gpt-4o",
        label: "OpenAI / GPT-4o",
        description: "Routed through OpenRouter",
      },
      {
        provider: "openrouter",
        providerLabel: "OpenRouter",
        model: "anthropic/claude-sonnet-4",
        label: "Anthropic / Claude Sonnet 4",
        description: "Routed through OpenRouter",
      },
      {
        provider: "openrouter",
        providerLabel: "OpenRouter",
        model: "google/gemini-2.5-pro",
        label: "Google / Gemini 2.5 Pro",
        description: "Routed through OpenRouter",
      },
    ],
  },
];

export const CHAT_PROVIDER_IDS: ProviderId[] = [
  "openai",
  "anthropic",
  "gemini",
  "groq",
  "openrouter",
];

export function getAvailableModelProviders(keys: string[]) {
  const normalized = new Set(keys.map((key) => key.toLowerCase()));
  return CHAT_PROVIDER_IDS.filter((provider) => normalized.has(provider));
}

export function isModelEnabled(model: ModelOption, availableProviders: string[]) {
  const normalized = new Set(availableProviders.map((key) => key.toLowerCase()));
  return normalized.has(model.provider);
}

export function getFirstAvailableModel(availableProviders: string[]) {
  for (const group of MODEL_GROUPS) {
    if (availableProviders.includes(group.provider)) {
      return group.models[0] ?? null;
    }
  }

  return null;
}

export function findModel(provider: string, model: string) {
  return (
    MODEL_GROUPS.flatMap((group) => group.models).find(
      (item) => item.provider === provider && item.model === model
    ) ?? null
  );
}