import { OpenAI } from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing credentials. Please pass an apiKey, or set the OPENAI_API_KEY environment variable.",
      );
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    const client = getOpenAI();
    const v = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof v === "function") return (v as (...args: unknown[]) => unknown).bind(client);
    return v;
  },
});
