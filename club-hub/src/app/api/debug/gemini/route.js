import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Say ONLY: ok" }] }],
    });

    return Response.json({ ok: true, reply: result.text?.trim() });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}