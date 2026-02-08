// src/app/api/chat/route.js
import clientPromise from "@/lib/mongodb";

/**
 * Complete updated /api/chat
 * - NEVER crashes on Gemini quota / JSON parse
 * - Always returns recommendations (no empty) by pulling a broader candidate set
 * - Expands fallback tags with simple synonyms (friendship -> community, etc.)
 * - Scores by tag overlap + vibe overlap + text fallback (name/description)
 */

// ====== APPROVED LISTS ======
const APPROVED_TAGS = [
  "ai","coding","engineering","robotics","data","finance","business","entrepreneurship","startups","career",
  "tech","projects","hackathons","workshops","research","innovation",
  "creative","art","design","music","dance","photography","film","writing",
  "sports","fitness","badminton","running","yoga","outdoors","hiking",
  "wellness","mental-health","mindfulness","self-care",
  "social","friendship","community","volunteering","mentorship","networking",
  "culture","languages","international","diversity",
  "gaming","board-games","comedy","food","free-food"
];

const APPROVED_VIBES = [
  "beginner-friendly","competitive","casual","chill","hands-on","collaborative","social-heavy","career-focused"
];

// ====== FALLBACK keyword mapping ======
const KEYWORDS = [
  // outdoors/sports
  ["hiking", ["hiking","outdoors"]],
  ["hike", ["hiking","outdoors"]],
  ["outdoor", ["outdoors"]],
  ["cycling", ["sports","fitness","outdoors"]],
  ["bike", ["sports","fitness","outdoors"]],
  ["run", ["running","sports","fitness"]],
  ["running", ["running","sports","fitness"]],
  ["badminton", ["badminton","sports","fitness"]],
  ["yoga", ["yoga","wellness","mindfulness"]],
  ["sport", ["sports"]],
  ["fitness", ["fitness"]],
  ["dragon boat", ["sports","fitness","community"]],
  ["dragonboat", ["sports","fitness","community"]],
  ["paddl", ["sports","fitness","outdoors"]],

  // tech
  ["ai", ["ai","tech"]],
  ["machine learning", ["ai","data","tech"]],
  ["coding", ["coding","tech"]],
  ["program", ["coding","tech"]],
  ["robot", ["robotics","engineering"]],
  ["engineer", ["engineering"]],
  ["hack", ["hackathons","projects","tech"]],
  ["research", ["research","innovation"]],
  ["workshop", ["workshops"]],

  // business/career
  ["finance", ["finance","career"]],
  ["trading", ["finance"]],
  ["entrepreneur", ["entrepreneurship","startups","career"]],
  ["startup", ["startups","entrepreneurship"]],
  ["network", ["networking","career"]],
  ["resume", ["career"]],
  ["leadership", ["career","networking"]],

  // social/community
  ["friend", ["friendship","social"]],
  ["friends", ["friendship","social"]],
  ["community", ["community","social"]],
  ["volunteer", ["volunteering","community"]],
  ["mentor", ["mentorship","career"]],
  ["international", ["international","community"]],
  ["culture", ["culture"]],
  ["language", ["languages","culture"]],
  ["diversity", ["diversity","community"]],

  // fun
  ["game", ["gaming","social"]],
  ["board", ["board-games","social"]],
  ["comedy", ["comedy","social"]],
  ["food", ["food","social"]],
  ["free food", ["free-food","food","social"]],
  ["music", ["music","creative"]],
  ["dance", ["dance","creative"]],
  ["art", ["art","creative"]],
  ["design", ["design","creative"]],
  ["film", ["film","creative"]],
  ["photo", ["photography","creative"]],
  ["write", ["writing","creative"]],
];

function normalize(s) {
  return (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
}

function fallbackUserProfile(message = "") {
  const text = normalize(message);
  const tags = new Set();
  const vibe = new Set();

  for (const [kw, add] of KEYWORDS) {
    if (text.includes(kw)) add.forEach(t => tags.add(t));
  }

  // vibes (heuristics)
  if (text.includes("beginner") || text.includes("new") || text.includes("no experience")) vibe.add("beginner-friendly");
  if (text.includes("chill") || text.includes("relax")) vibe.add("chill");
  if (text.includes("competitive") || text.includes("tournament")) vibe.add("competitive");
  if (text.includes("career") || text.includes("resume") || text.includes("network")) vibe.add("career-focused");
  if (text.includes("friends") || text.includes("social") || text.includes("meet people")) vibe.add("social-heavy");
  if (text.includes("build") || text.includes("hands-on") || text.includes("project")) vibe.add("hands-on");

  // minimum defaults
  if (tags.size === 0) {
    tags.add("community");
    tags.add("social");
  }
  if (vibe.size === 0) vibe.add("casual");

  return {
    tags: [...tags].filter(t => APPROVED_TAGS.includes(t)).slice(0, 6),
    vibe: [...vibe].filter(v => APPROVED_VIBES.includes(v)).slice(0, 3),
  };
}

function expandTags(tags) {
  const set = new Set((tags || []).filter(t => APPROVED_TAGS.includes(t)));

  // synonyms / smoothing so you don’t get empty results
  if (set.has("friendship")) set.add("community");
  if (set.has("community")) set.add("social");
  if (set.has("hiking")) set.add("outdoors");
  if (set.has("outdoors")) set.add("sports");
  if (set.has("mental-health")) set.add("wellness");
  if (set.has("self-care")) set.add("wellness");
  if (set.has("mindfulness")) set.add("wellness");

  return [...set].slice(0, 8);
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function tryGemini(message) {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You map a student's message to tags and vibes.

RULES:
- Use ONLY tags from approved list.
- Use ONLY vibes from approved list.
- Choose 3–6 tags and 1–3 vibes.
- Output JSON only. No markdown.

APPROVED TAGS:
${APPROVED_TAGS.join(", ")}

APPROVED VIBES:
${APPROVED_VIBES.join(", ")}

OUTPUT FORMAT (JSON ONLY):
{ "tags": ["tag1","tag2"], "vibe": ["vibe1"] }

USER MESSAGE:
${message}
`;

  const resp = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });

  const parsed = safeJsonParse(resp.text);
  if (!parsed) throw new Error("Gemini returned non-JSON");

  const tags = (parsed.tags || []).filter(t => APPROVED_TAGS.includes(t)).slice(0, 6);
  const vibe = (parsed.vibe || []).filter(v => APPROVED_VIBES.includes(v)).slice(0, 3);

  if (!tags.length) throw new Error("Gemini returned no valid tags");
  if (!vibe.length) vibe.push("casual");

  return { tags, vibe };
}
function tokenize(s) {
  return normalize(s)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function allTokensInText(tokens, text) {
  return tokens.every(t => text.includes(t));
}

function nameMatchBoost(userMsg, clubName) {
  const q = normalize(userMsg);
  const name = normalize(clubName);

  if (!q || q.length < 2 || !name) return 0;

  // exact or near-exact
  if (name === q) return 40;
  if (name.includes(q)) return 30;

  // token-based match (e.g., "dragon boat" in "Dragon Boat Z")
  const qTokens = tokenize(q);
  if (qTokens.length >= 2 && allTokensInText(qTokens, name)) return 24;

  // partial token overlap
  const nameTokens = new Set(tokenize(name));
  let overlap = 0;
  for (const t of qTokens) if (nameTokens.has(t)) overlap++;
  if (overlap >= 2) return 14;
  if (overlap === 1) return 6;

  return 0;
}

function scoreClub(club, userTags, userVibes, userMessage) {
  let score = 0;

  const clubTags = Array.isArray(club.tags) ? club.tags : [];
  const clubVibes = Array.isArray(club.vibe) ? club.vibe : [];
  const text = normalize(`${club.name || ""} ${club.description || ""}`);

  score += nameMatchBoost(userMessage, club.name);

  // tag overlap: strong
  for (const t of userTags) {
    if (clubTags.includes(t)) score += 4;
    else {
      const token = t.replace("-", " ");
      if (token && text.includes(token)) score += 1;
    }
  }

  // vibe overlap: medium
  for (const v of userVibes) if (clubVibes.includes(v)) score += 2;

  // small boosts
  if (club.links?.instagram) score += 1;
  if (club.imageUrl) score += 0.5;

  return score;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body?.message || "";

    const msgNorm = normalize(message);
    const looksLikeDirectSearch =
        msgNorm.split(" ").length <= 4 && !msgNorm.includes("i like") && !msgNorm.includes("interested");

    // --- Profile: Gemini if possible, otherwise fallback
    let mode = "fallback";
    let userProfile = fallbackUserProfile(message);

    if (process.env.GEMINI_API_KEY) {
      try {
        userProfile = await tryGemini(message);
        mode = "gemini";
      } catch {
        mode = "fallback";
      }
    }

    const userTags = looksLikeDirectSearch
        ? (userProfile.tags || []) // keep as-is
        : expandTags(userProfile.tags || []);
    const userVibes = (userProfile.vibe || []).filter(v => APPROVED_VIBES.includes(v)).slice(0, 3);

    // --- Mongo
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB;
    const db = client.db(dbName);

    // IMPORTANT: do NOT pre-filter too hard — pull a broader set, then score locally.
    // This prevents empty recommendations when tags don’t overlap perfectly.
    const candidates = await db.collection("clubs").find({}).limit(1200).toArray();

    // If DB is wrong / empty, surface that clearly
    if (!candidates.length) {
      return Response.json({
        ok: true,
        mode,
        user: { tags: userTags, vibe: userVibes },
        recommendations: [],
        warning: `No clubs found in Mongo. Check DB=${dbName} collection=clubs.`
      });
    }

    // --- rank
    const ranked = candidates
        .map(c => ({ c, score: scoreClub(c, userTags, userVibes, message) }))
        .sort((a, b) => b.score - a.score);

    // pick top 5 with score>0 if possible, else just top 5
    let top = ranked.filter(x => x.score > 0).slice(0, 6);
    if (top.length < 6) top = ranked.slice(0, 6);

    const recommendations = top.map(({ c, score }) => ({
      name: c.name,
      slug: c.slug,
      category: c.category?.title || c.category || "",
      description: (c.description || "").slice(0, 220),
      tags: c.tags || [],
      vibe: c.vibe || [],
      links: c.links || {},
      imageUrl: c.imageUrl || null,
      score
    }));

    return Response.json({
      ok: true,
      mode,
      user: { tags: userTags, vibe: userVibes },
      recommendations
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}