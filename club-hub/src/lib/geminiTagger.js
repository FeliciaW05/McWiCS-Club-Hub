import fs from "fs/promises";

// ====== CONFIG ======
const INPUT = "data/ssmu_clubs_by_category.json";
const OUT_CLUBS = "data/clubs_formatted.json";
const OUT_CATEGORIES = "data/categories_formatted.json";

// Toggle Gemini on/off
const USE_GEMINI = false;

// If using Gemini, set env var:
// export GEMINI_API_KEY="..."
// Also ensure you have a valid model name for your account.
const GEMINI_MODEL = "gemini-2.5-flash";

// ====== APPROVED LISTS (from your prompt) ======
const APPROVED_TAGS = [
  "coding","engineering","robotics","data","finance","business","entrepreneurship","startups","career",
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

// ====== HELPERS ======
function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/’/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function normalize(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function cleanDescription(desc) {
  let d = normalize(desc);
  // remove trailing platform words if they show up as leftover text
  d = d.replace(/\b(Instagram|YouTube|LinkedIn|Facebook|Website|Email|Twitter)\b\s*$/gi, "");
  d = d.replace(/\s+/g, " ").trim();
  return d;
}

function extractLinksFromSocial(social = []) {
  const links = {};
  for (const item of social) {
    const href = (item?.href || "").trim();
    if (!href) continue;
    const h = href.toLowerCase();

    if (h.startsWith("mailto:")) links.email = href;
    else if (h.includes("instagram.com")) links.instagram = href;
    else if (h.includes("facebook.com")) links.facebook = href;
    else if (h.includes("twitter.com") || h.includes("x.com")) links.twitter = href;
    else if (h.includes("youtube.com") || h.includes("youtu.be")) links.youtube = href;
    else if (h.includes("linkedin.com")) links.linkedin = href;
    else if (!links.website && href.startsWith("http")) links.website = href;
  }
  return links;
}

// ====== OPTION A: RULE-BASED TAGGING (fast fallback) ======
const KEYWORDS = [
  // sports/fitness
  ["badminton", ["badminton","sports","fitness"]],
  ["running", ["running","sports","fitness"]],
  ["yoga", ["yoga","wellness","mindfulness"]],
  ["climb", ["sports","outdoors","fitness"]],
  ["hike", ["hiking","outdoors"]],
  ["outdoor", ["outdoors"]],
  ["sport", ["sports"]],
  ["fitness", ["fitness"]],

  // tech/cs
  ["hack", ["hackathons","tech","projects"]],
  ["coding", ["coding","tech"]],
  ["software", ["coding","tech"]],
  ["ai", ["ai","tech"]],
  ["robot", ["robotics","engineering"]],
  ["engineer", ["engineering"]],
  ["data", ["data","tech"]],
  ["blockchain", ["tech","innovation"]],
  ["research", ["research","innovation"]],
  ["workshop", ["workshops"]],
  ["project", ["projects"]],

  // business/career
  ["finance", ["finance","career"]],
  ["trading", ["finance"]],
  ["business", ["business","career"]],
  ["entrepreneur", ["entrepreneurship","startups","career"]],
  ["startup", ["startups","entrepreneurship"]],
  ["network", ["networking","career"]],
  ["leadership", ["career","networking"]],

  // social/community
  ["community", ["community","social"]],
  ["friends", ["friendship","social"]],
  ["volunteer", ["volunteering","community"]],
  ["mentor", ["mentorship","career"]],
  ["diversity", ["diversity","community"]],
  ["culture", ["culture","community"]],
  ["international", ["international","community"]],
  ["language", ["languages","culture"]],
  ["french", ["languages","culture"]],

  // fun
  ["game", ["gaming","social"]],
  ["board", ["board-games","social"]],
  ["food", ["food","social"]],
  ["free food", ["free-food","food","social"]],
  ["music", ["music","creative"]],
  ["dance", ["dance","creative"]],
  ["art", ["art","creative"]],
  ["design", ["design","creative"]],
  ["film", ["film","creative"]],
  ["photo", ["photography","creative"]],
  ["write", ["writing","creative"]],
  ["comedy", ["comedy","social"]],
];

function ruleTagsAndVibes({ name, categoryTitle, description }) {
  const text = `${name} ${categoryTitle} ${description}`.toLowerCase();

  const tags = new Set();
  // category seed
  const cat = categoryTitle.toLowerCase();
  if (cat.includes("athletic") || cat.includes("sports")) tags.add("sports");
  if (cat.includes("networking") || cat.includes("leadership")) { tags.add("career"); tags.add("networking"); }
  if (cat.includes("charity") || cat.includes("volunteer")) tags.add("volunteering");
  if (cat.includes("language")) tags.add("languages");
  if (cat.includes("culture")) tags.add("culture");
  if (cat.includes("health") || cat.includes("wellness")) tags.add("wellness");
  if (cat.includes("art") || cat.includes("dance") || cat.includes("performance")) tags.add("creative");

  for (const [kw, add] of KEYWORDS) {
    if (text.includes(kw)) add.forEach((t) => tags.add(t));
  }

  // keep only approved + limit 6
  const finalTags = [...tags].filter((t) => APPROVED_TAGS.includes(t)).slice(0, 6);

  // vibe rules
  const vibe = new Set();
  if (text.includes("beginner") || text.includes("no experience")) vibe.add("beginner-friendly");
  if (text.includes("competitive") || text.includes("tournament") || text.includes("league")) vibe.add("competitive");
  if (text.includes("workshop") || text.includes("hands-on") || text.includes("build")) vibe.add("hands-on");
  if (text.includes("network") || text.includes("career") || text.includes("resume")) vibe.add("career-focused");
  if (text.includes("community") || text.includes("friends") || text.includes("social")) vibe.add("social-heavy");
  if (vibe.size === 0) vibe.add("casual");

  const finalVibe = [...vibe].filter((v) => APPROVED_VIBES.includes(v)).slice(0, 3);

  // Ensure at least 3 tags if possible
  if (finalTags.length < 3) {
    // add safe general tags if relevant
    if (text.includes("club") && !finalTags.includes("community")) finalTags.push("community");
    if (!finalTags.includes("social")) finalTags.push("social");
  }

  return { tags: finalTags.slice(0, 6), vibe: finalVibe };
}

// ====== OPTION B: GEMINI TAGGING (uses your exact prompt) ======
async function geminiTagsAndVibes({ name, description }) {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are an assistant that categorizes university clubs.

Given a club name and description, assign:
1) 3–6 relevant tags
2) 1–3 vibe labels

RULES:
- Use ONLY tags from the approved list below.
- Do NOT invent new tags.
- Choose the most specific tags possible.
- If unsure, choose fewer tags rather than guessing.
- Vibes should reflect the social and commitment style of the club.
- Do NOT include explanations, comments, or markdown.
- Output JSON ONLY.

APPROVED TAGS:
${APPROVED_TAGS.join(", ")}

APPROVED VIBES:
${APPROVED_VIBES.join(", ")}

OUTPUT FORMAT (JSON ONLY):
{
  "tags": ["tag1", "tag2", "tag3"],
  "vibe": ["vibe1", "vibe2"]
}

CLUB NAME:
${name}

CLUB DESCRIPTION:
${description}
`;

  const resp = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
          vibe: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 }
        },
        required: ["tags", "vibe"]
      }
    }
  });

  let parsed;
  try {
    parsed = JSON.parse(resp.text);
  } catch {
    // fallback: return rule-based if model output isn't parseable
    return null;
  }

  // hard filter to approved lists
  const tags = (parsed.tags || []).filter((t) => APPROVED_TAGS.includes(t)).slice(0, 6);
  const vibe = (parsed.vibe || []).filter((v) => APPROVED_VIBES.includes(v)).slice(0, 3);

  if (tags.length === 0 || vibe.length === 0) return null;

  return { tags, vibe };
}

// ====== MAIN ======
async function main() {
  const raw = await fs.readFile(INPUT, "utf8");
  const data = JSON.parse(raw);

  const categories = [];
  const clubsOut = [];

  for (const entry of data.categories || []) {
    const cat = entry.category;
    const categorySlug = slugify(cat.title);

    categories.push({
      slug: categorySlug,
      title: cat.title,
      excerpt: cat.excerpt,
      href: cat.href
    });

    for (const club of entry.clubs || []) {
      const description = cleanDescription(club.description);
      const links = extractLinksFromSocial(club.social);

      // tags + vibe
      let tv = null;

      if (USE_GEMINI) {
        tv = await geminiTagsAndVibes({ name: club.name, description });
      }
      if (!tv) {
        tv = ruleTagsAndVibes({ name: club.name, categoryTitle: cat.title, description });
      }

      clubsOut.push({
        name: club.name,
        slug: slugify(club.name) || club.clubId,
        clubId: club.clubId || null,

        category: {
          slug: categorySlug,
          title: cat.title,
          href: cat.href
        },

        description,
        imageUrl: club.imageUrl || null,
        sourceUrl: club.sourceUrl || cat.href,

        links,
        tags: tv.tags,
        vibe: tv.vibe,

        updatedAt: new Date().toISOString()
      });
    }
  }

  // write outputs
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(OUT_CATEGORIES, JSON.stringify(categories, null, 2), "utf8");
  await fs.writeFile(OUT_CLUBS, JSON.stringify(clubsOut, null, 2), "utf8");

  console.log("Done!");
  console.log("Categories:", categories.length, "->", OUT_CATEGORIES);
  console.log("Clubs:", clubsOut.length, "->", OUT_CLUBS);
  console.log("Gemini used:", USE_GEMINI);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});