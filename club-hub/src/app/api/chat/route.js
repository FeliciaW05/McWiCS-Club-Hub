// src/app/api/chat/route.js
import clientPromise from "@/lib/mongodb";

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

// ====== KEYWORD → TAGS (fallback extraction) ======
const KEYWORDS = [
  // outdoors/sports
  ["hiking", ["hiking","outdoors"]],
  ["hike", ["hiking","outdoors"]],
  ["outdoor", ["outdoors"]],
  ["cycling", ["sports","fitness","outdoors"]],
  ["bike", ["sports","fitness","outdoors"]],
  ["biking", ["sports","fitness","outdoors"]],
  ["run", ["running","sports","fitness"]],
  ["jog", ["running","sports","fitness"]],
  ["running", ["running","sports","fitness"]],
  ["badminton", ["badminton","sports","fitness"]],
  ["yoga", ["yoga","wellness","mindfulness"]],
  ["sport", ["sports"]],
  ["fitness", ["fitness"]],
  ["dragon boat", ["sports","fitness","community"]],
  ["dragonboat", ["sports","fitness","community"]],
  ["paddl", ["sports","fitness","outdoors"]],
  ["ski", ["sports","outdoors","fitness"]],
  ["snow", ["sports","outdoors"]],
  ["winter", ["sports","outdoors"]],

  // tech
  ["ai", ["ai","tech"]],
  ["machine learning", ["ai","data","tech"]],
  ["ml", ["ai","data","tech"]],
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
  ["chess", ["board-games","social"]],
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

// ====== QUERY SYNONYMS (search-mode expansion) ======
const QUERY_SYNONYMS = {
  "ski": ["skiing", "snow", "snow sports", "winter sports", "winter"],
  "skiing": ["ski", "snow", "winter sports"],
  "snowboard": ["snowboarding", "snow", "winter sports"],
  "snowboarding": ["snowboard", "snow", "winter sports"],

  "dragon boat": ["dragonboat", "paddling", "paddle", "boat"],
  "dragonboat": ["dragon boat", "paddling", "paddle", "boat"],
  "paddle": ["paddling", "dragon boat", "canoe", "kayak"],

  "bike": ["biking", "cycling", "cyclist"],
  "biking": ["bike", "cycling"],
  "cycling": ["bike", "biking"],

  "run": ["running", "jogging"],
  "running": ["run", "jogging"],
  "jogging": ["run", "running"],
};

// ====== TRUE BACKUP DEFAULTS (works even if Mongo is empty) ======
// IMPORTANT: these are NOT fetched from DB; they prevent blank UI when DB is empty/misconfigured.
// Replace names/links with ones you want.
const DEFAULTS = [
  {
    name: "McGill Outdoors / Hiking",
    slug: "default-outdoors-hiking",
    category: "Outdoors",
    description: "Love fresh air? Find hiking buddies and weekend adventures.",
    tags: ["hiking", "outdoors", "community"],
    vibe: ["casual", "chill"],
    links: { website: "https://www.mcgill.ca/" }
  },
  {
    name: "Beginner-Friendly Sports Club",
    slug: "default-sports-beginners",
    category: "Sports",
    description: "Low-pressure, beginner-friendly ways to stay active and meet people.",
    tags: ["sports", "fitness", "social"],
    vibe: ["beginner-friendly", "casual"],
    links: { website: "https://www.mcgill.ca/" }
  },
  {
    name: "Coding & Projects Hub",
    slug: "default-coding-projects",
    category: "Tech",
    description: "Build projects, learn coding, and find teammates for hackathons.",
    tags: ["coding", "projects", "tech"],
    vibe: ["hands-on", "collaborative"],
    links: { website: "https://www.mcgill.ca/" }
  },
  {
    name: "Career & Networking Circle",
    slug: "default-career-networking",
    category: "Career",
    description: "Meet people, polish your resume, and find mentorship.",
    tags: ["career", "networking", "mentorship"],
    vibe: ["career-focused", "collaborative"],
    links: { website: "https://www.mcgill.ca/" }
  },
  {
    name: "Creative Arts & Design",
    slug: "default-creative-arts",
    category: "Creative",
    description: "Art, design, and creative hangouts — bring your ideas.",
    tags: ["creative", "art", "design"],
    vibe: ["chill", "casual"],
    links: { website: "https://www.mcgill.ca/" }
  },
  {
    name: "Board Games & Social Night",
    slug: "default-board-games",
    category: "Social",
    description: "Board games and low-key social nights — great for making friends.",
    tags: ["board-games", "social", "friendship"],
    vibe: ["social-heavy", "casual"],
    links: { website: "https://www.mcgill.ca/" }
  },
];

// ==================== HELPERS ====================

function toStringArray(x) {
  if (Array.isArray(x)) return x.filter(Boolean).map(String);
  if (typeof x === "string") return x.split(",").map(s => s.trim()).filter(Boolean);
  return [];
}

function normalize(s) {
  return (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(s) {
  return normalize(s)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function escapeRegex(s) {
  return (s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

// ==================== FUZZY (NO DEPS) ====================

function levenshtein(a, b) {
  a = normalize(a);
  b = normalize(b);
  if (!a) return b.length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;

  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;

    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n];
}

function similarity(a, b) {
  a = normalize(a);
  b = normalize(b);
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const denom = Math.max(a.length, b.length);
  return denom ? 1 - dist / denom : 0;
}

// ==================== SEARCH MODE DETECTION ====================

function isLikelyDirectSearch(message) {
  const t = normalize(message);
  const tokens = tokenize(t);
  if (tokens.length <= 4) return true;

  const recHints = ["i like", "interested", "looking for", "meet people", "friends", "beginner", "career", "resume"];
  if (recHints.some(h => t.includes(h))) return false;

  return false;
}

// ==================== USER PROFILE EXTRACTION ====================

function fallbackUserProfile(message = "", opts = { allowDefault: true }) {
  const text = normalize(message);
  const tags = new Set();
  const vibe = new Set();

  for (const [kw, add] of KEYWORDS) {
    if (text.includes(kw)) add.forEach(t => tags.add(t));
  }

  if (text.includes("beginner") || text.includes("new") || text.includes("no experience")) vibe.add("beginner-friendly");
  if (text.includes("chill") || text.includes("relax")) vibe.add("chill");
  if (text.includes("competitive") || text.includes("tournament")) vibe.add("competitive");
  if (text.includes("career") || text.includes("resume") || text.includes("network")) vibe.add("career-focused");
  if (text.includes("friends") || text.includes("social") || text.includes("meet people")) vibe.add("social-heavy");
  if (text.includes("build") || text.includes("hands-on") || text.includes("project")) vibe.add("hands-on");

  if (opts.allowDefault) {
    if (tags.size === 0) { tags.add("community"); tags.add("social"); }
    if (vibe.size === 0) vibe.add("casual");
  }

  return {
    tags: [...tags].filter(t => APPROVED_TAGS.includes(t)).slice(0, 6),
    vibe: [...vibe].filter(v => APPROVED_VIBES.includes(v)).slice(0, 3),
  };
}

function expandTags(tags) {
  const set = new Set((tags || []).filter(t => APPROVED_TAGS.includes(t)));
  if (set.has("friendship")) set.add("community");
  if (set.has("community")) set.add("social");
  if (set.has("hiking")) set.add("outdoors");
  if (set.has("outdoors")) set.add("sports");
  if (set.has("mental-health")) set.add("wellness");
  if (set.has("self-care")) set.add("wellness");
  if (set.has("mindfulness")) set.add("wellness");
  return [...set].slice(0, 10);
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

OUTPUT (JSON ONLY):
{ "tags": ["tag1","tag2"], "vibe": ["vibe1"] }

MESSAGE:
${message}
`;

  const resp = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });

  const parsed = safeJsonParse(resp.text);
  if (!parsed) throw new Error("Gemini returned non-JSON");

  const tags = toStringArray(parsed.tags).filter(t => APPROVED_TAGS.includes(t)).slice(0, 6);
  const vibe = toStringArray(parsed.vibe).filter(v => APPROVED_VIBES.includes(v)).slice(0, 3);

  if (!tags.length) throw new Error("Gemini returned no valid tags");
  if (!vibe.length) vibe.push("casual");

  return { tags, vibe };
}

// ==================== QUERY EXPANSION ====================

function expandSearchQuery(raw) {
  const q = normalize(raw);
  const tokens = tokenize(q);
  const expanded = new Set([q, ...tokens]);

  for (const [k, vals] of Object.entries(QUERY_SYNONYMS)) {
    if (q.includes(k)) vals.forEach(v => expanded.add(normalize(v)));
  }

  for (const t of tokens) {
    const vals = QUERY_SYNONYMS[t];
    if (vals) vals.forEach(v => expanded.add(normalize(v)));
  }

  return [...expanded].filter(Boolean).slice(0, 12);
}

function getJoinUrl(c) {
  return c?.links?.website || c?.sourceUrl || c?.category?.href || null;
}

function isWeakMatch(topRanked, mode) {
  if (!topRanked?.length) return true;
  const best = topRanked[0]?.score ?? 0;
  if (mode === "search") return best < 18;
  return best < 10;
}

// ==================== DB CANDIDATE FETCH ====================

async function fetchSearchCandidates(db, userMessage, limit = 150) {
  const terms = expandSearchQuery(userMessage);

  let textHits = [];
  try {
    const textQuery = terms.join(" ");
    textHits = await db.collection("clubs")
      .find({ $text: { $search: textQuery } }, { projection: { _id: 0 } })
      .limit(limit)
      .toArray();
  } catch {
    textHits = [];
  }

  const regexAny = new RegExp(terms.map(escapeRegex).join("|"), "i");

  const baseTokens = tokenize(userMessage);
  const looseRegex = baseTokens.length
    ? new RegExp(baseTokens.map(t => escapeRegex(t)).join(".*"), "i")
    : regexAny;

  let regexHits = [];
  if (textHits.length < 20) {
    regexHits = await db.collection("clubs")
      .find(
        { $or: [{ name: regexAny }, { slug: regexAny }, { description: looseRegex }] },
        { projection: { _id: 0 } }
      )
      .limit(limit)
      .toArray();
  }

  const map = new Map();
  for (const c of [...textHits, ...regexHits]) {
    const key = c.slug || c.clubId || c.name;
    if (!map.has(key)) map.set(key, c);
  }
  return [...map.values()];
}

async function fetchRecommendationCandidates(db, limit = 1500) {
  return db.collection("clubs")
    .find({}, { projection: { _id: 0 } })
    .limit(limit)
    .toArray();
}

async function fetchTrendingClubs(db, limit = 12) {
  const rest = await db.collection("clubs").aggregate([
    {
      $addFields: {
        _hasInstagram: { $cond: [{ $ifNull: ["$links.instagram", false] }, 1, 0] },
        _hasImage: { $cond: [{ $ifNull: ["$imageUrl", false] }, 1, 0] },
        _tagCount: { $size: { $ifNull: ["$tags", []] } },
        _updated: { $ifNull: ["$updatedAt", new Date(0)] },
      }
    },
    {
      $sort: {
        _hasInstagram: -1,
        _hasImage: -1,
        _tagCount: -1,
        _updated: -1,
        name: 1,
      }
    },
    { $limit: limit + 20 },
    { $project: { _id: 0, _hasInstagram: 0, _hasImage: 0, _tagCount: 0, _updated: 0 } }
  ]).toArray();

  const map = new Map();
  for (const c of rest) {
    const key = c.slug || c.clubId || c.name;
    if (!map.has(key)) map.set(key, c);
    if (map.size >= limit) break;
  }
  return [...map.values()];
}

// ==================== SCORING ====================

function nameAndTextBoost(userMsg, club) {
  const qRaw = normalize(userMsg);
  if (!qRaw || qRaw.length < 2) return 0;

  const clubName = normalize(club?.name);
  const clubSlug = normalize(club?.slug);
  const clubText = normalize(`${club?.name || ""} ${club?.description || ""}`);

  if (clubName === qRaw) return 90;
  if (clubName.includes(qRaw)) return 65;
  if (clubSlug && (clubSlug === qRaw || clubSlug.includes(qRaw))) return 55;
  if (clubText.includes(qRaw)) return 35;

  const qTokens = tokenize(qRaw);
  const textTokens = tokenize(clubText);
  const textSet = new Set(textTokens);

  let overlap = 0;
  for (const t of qTokens) if (textSet.has(t)) overlap++;

  let prefixHits = 0;
  for (const t of qTokens) {
    if (t.length < 3) continue;
    if (textTokens.some(x => x.startsWith(t) || t.startsWith(x))) prefixHits++;
  }

  let score = overlap * 10 + prefixHits * 6;

  if (qTokens.length <= 4) {
    const simName = similarity(qRaw, clubName);
    const simSlug = clubSlug ? similarity(qRaw, clubSlug.replace(/-/g, " ")) : 0;
    const sim = Math.max(simName, simSlug);
    if (sim >= 0.88) score += 45;
    else if (sim >= 0.80) score += 28;
    else if (sim >= 0.72) score += 16;
  }

  return score;
}

function scoreClub(club, userTags, userVibes, userMessage, mode) {
  let score = 0;
  const clubTags = toStringArray(club.tags);
  const clubVibes = toStringArray(club.vibe);
  const text = normalize(`${club.name || ""} ${club.description || ""}`);

  if (mode === "search") {
    score += nameAndTextBoost(userMessage, club);
    for (const t of userTags) {
      if (clubTags.includes(t)) score += 3;
      else if (t && text.includes(t.replace("-", " "))) score += 1;
    }
  } else {
    score += nameAndTextBoost(userMessage, club) * 0.4;
    for (const t of userTags) {
      if (clubTags.includes(t)) score += 5;
      else if (t && text.includes(t.replace("-", " "))) score += 1;
    }
    for (const v of userVibes) if (clubVibes.includes(v)) score += 3;
  }

  if (club.links?.instagram) score += 1;
  if (club.imageUrl) score += 0.5;

  return score;
}

// ==================== ROUTE ====================

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body?.message || "";
    const directSearch = isLikelyDirectSearch(message);

    // profile
    let modeLLM = "fallback";
    let userProfile = fallbackUserProfile(message, { allowDefault: true });

    if (process.env.GEMINI_API_KEY && !directSearch) {
      try {
        userProfile = await tryGemini(message);
        modeLLM = "gemini";
      } catch {
        modeLLM = "fallback";
      }
    }

    const userTags = directSearch ? (userProfile.tags || []) : expandTags(userProfile.tags || []);
    const userVibes = (userProfile.vibe || []).filter(v => APPROVED_VIBES.includes(v)).slice(0, 3);

    // mongo
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB;

    // If env missing, still respond with a friendly fallback
    if (!dbName) {
      const recommendations = DEFAULTS.slice(0, 6).map((c, idx) => ({
        ...c,
        tags: toStringArray(c.tags),
        vibe: toStringArray(c.vibe),
        links: c.links || {},
        imageUrl: c.imageUrl || null,
        joinUrl: getJoinUrl(c),
        score: 0,
        rank: idx + 1,
        reason: "default",
      }));

      return Response.json({
        ok: true,
        mode: modeLLM,
        kind: directSearch ? "search" : "recommend",
        user: { tags: userTags, vibe: userVibes },
        recommendations,
        fallback: "hardcoded-default",
        note: "I’m having trouble connecting to the club database right now — here are a few diverse starter picks. Tell me what you like and I’ll refine it!"
      });
    }

    const db = client.db(dbName);

    const kind = directSearch ? "search" : "recommend";
    const candidates = directSearch
      ? await fetchSearchCandidates(db, message, 150)
      : await fetchRecommendationCandidates(db, 1500);

    // If DB empty => return hardcoded defaults (guaranteed non-empty)
    if (!candidates.length) {
      const recommendations = DEFAULTS.slice(0, 6).map((c, idx) => ({
        ...c,
        tags: toStringArray(c.tags),
        vibe: toStringArray(c.vibe),
        links: c.links || {},
        imageUrl: c.imageUrl || null,
        joinUrl: getJoinUrl(c),
        score: 0,
        rank: idx + 1,
        reason: "default",
      }));

      return Response.json({
        ok: true,
        mode: modeLLM,
        kind,
        user: { tags: userTags, vibe: userVibes },
        recommendations,
        fallback: "hardcoded-default",
        note: "I can’t see the full club list right now, but here are 6 diverse picks to get you started. Tell me 2–3 interests and I’ll narrow it down!"
      });
    }

    const ranked = candidates
      .map(c => ({ c, score: scoreClub(c, userTags, userVibes, message, kind) }))
      .sort((a, b) => b.score - a.score);

    let top = ranked.filter(x => x.score > 0).slice(0, 6);

    // Fill with trending if weak or not enough
    if (!top.length || isWeakMatch(top, kind) || top.length < 6) {
      const trending = await fetchTrendingClubs(db, 12);
      const used = new Set(top.map(x => x.c.slug || x.c.clubId || x.c.name));

      for (const c of trending) {
        const key = c.slug || c.clubId || c.name;
        if (!used.has(key)) {
          top.push({ c, score: 0, reason: "trending" });
          used.add(key);
        }
        if (top.length >= 6) break;
      }
    }

    // Fill from ranked if still short
    if (top.length < 6) {
      const used = new Set(top.map(t => t.c.slug || t.c.clubId || t.c.name));
      for (const x of ranked) {
        const key = x.c.slug || x.c.clubId || x.c.name;
        if (!used.has(key)) {
          top.push({ c: x.c, score: x.score, reason: "fill" });
          used.add(key);
        }
        if (top.length >= 6) break;
      }
    }

    // Final guarantee: 6 items (fallback to hardcoded if DB tiny)
    if (top.length < 6) {
      const used = new Set(top.map(t => t.c.slug || t.c.clubId || t.c.name));
      for (const c of DEFAULTS) {
        const key = c.slug || c.name;
        if (!used.has(key)) {
          top.push({ c, score: 0, reason: "default" });
          used.add(key);
        }
        if (top.length >= 6) break;
      }
    }

    top = top.slice(0, 6);

    const recommendations = top.map(({ c, score, reason }, idx) => ({
      name: c.name,
      slug: c.slug,
      category: c.category?.title || c.category || "",
      description: (c.description || "").slice(0, 240),
      tags: toStringArray(c.tags),
      vibe: toStringArray(c.vibe),
      links: c.links || {},
      imageUrl: c.imageUrl || null,
      joinUrl: getJoinUrl(c),
      score: Math.round((Number(score) || 0) * 10) / 10,
      rank: idx + 1,
      reason: reason || "match",
    }));

        return Response.json({
      ok: true,
      mode: modeLLM,
      kind,
      user: { tags: userTags, vibe: userVibes },
      recommendations,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
