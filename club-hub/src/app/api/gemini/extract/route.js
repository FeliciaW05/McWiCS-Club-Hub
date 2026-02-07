import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are helping match a student to clubs.
Extract EXACTLY 5 lowercase tags from the user's message.
Also write 1 sentence describing the user's vibe (e.g., social, beginner-friendly, career-focused).
Return ONLY valid JSON in this format:
{
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "vibe": "one short sentence",
  "explanation": "one short sentence explaining the match"
}
User message: ${JSON.stringify(text)}
`;

  const result = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const raw = result.text?.trim() || "";
  // Simple JSON extraction (hackathon-safe)
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return Response.json({ error: "Gemini did not return JSON", raw }, { status: 500 });
  }

  const jsonText = raw.slice(start, end + 1);
  const parsed = JSON.parse(jsonText);

  // normalize tags
  parsed.tags = (parsed.tags || []).map(t => String(t).toLowerCase());
  return Response.json(parsed);
}