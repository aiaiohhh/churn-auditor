import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { type Result, ok, err } from "@/lib/errors";

export type ModelTier = "flash" | "pro";

const MODEL_IDS: Record<ModelTier, string> = {
  flash: "gemini-2.0-flash",
  pro: "gemini-2.5-pro",
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

export interface GenerateOptions {
  model: ModelTier;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}

export interface StructuredOptions<T> extends GenerateOptions {
  responseSchema: Record<string, unknown>;
  parse: (raw: unknown) => T;
}

export async function generate(
  opts: GenerateOptions
): Promise<Result<string>> {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_IDS[opts.model],
      contents: opts.prompt,
      config: {
        systemInstruction: opts.systemInstruction,
        temperature: opts.temperature,
      },
    });
    const text = response.text;
    if (!text) return err("Empty response from Gemini");
    return ok(text);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Unknown Gemini error");
  }
}

export async function generateStructured<T>(
  opts: StructuredOptions<T>
): Promise<Result<T>> {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_IDS[opts.model],
      contents: opts.prompt,
      config: {
        systemInstruction: opts.systemInstruction,
        temperature: opts.temperature,
        responseMimeType: "application/json",
        responseSchema: opts.responseSchema,
      },
    });
    const text = response.text;
    if (!text) return err("Empty response from Gemini");
    const parsed = opts.parse(JSON.parse(text));
    return ok(parsed);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Unknown Gemini error");
  }
}

export async function* generateStream(
  opts: GenerateOptions
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  const response = await client.models.generateContentStream({
    model: MODEL_IDS[opts.model],
    contents: opts.prompt,
    config: {
      systemInstruction: opts.systemInstruction,
      temperature: opts.temperature,
    },
  });
  for await (const chunk of response) {
    const text = chunk.text;
    if (text) yield text;
  }
}

export async function generateWithTools(
  opts: GenerateOptions & {
    tools: Record<string, unknown>[];
  }
): Promise<Result<GenerateContentResponse>> {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_IDS[opts.model],
      contents: opts.prompt,
      config: {
        systemInstruction: opts.systemInstruction,
        temperature: opts.temperature,
        tools: [{ functionDeclarations: opts.tools }],
      },
    });
    return ok(response);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Unknown Gemini error");
  }
}
