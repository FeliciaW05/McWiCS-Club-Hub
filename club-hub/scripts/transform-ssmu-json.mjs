import fs from "fs/promises";

const INPUT = "data/ssmu_clubs_by_category.json";
const OUT_CATS = "data/categories_out.json";
const OUT_CLUBS = "data/clubs_out.json";

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/’/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalize(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function cleanDescription(desc) {
  let d = normalize(desc);
  // remove trailing platform words if they appear as leftover text
  d = d.replace(/\b(Instagram|YouTube|LinkedIn|Facebook|Website|Email|Twitter)\b\s*$/gi, "");
  d = d.replace(/\s+/g, " ").trim();
  return d;
}

function extractLinks(social = []) {
  const links = {};
  for (const item of social) {
    const href = item?.href || "";
    const h = href.toLowerCase();

    if (h.startsWith("mailto:")) links.email = href;
    else if (h.includes("instagram.com")) links.instagram = href;
    else if (h.includes("facebook.com")) links.facebook = href;
    else if (h.includes("twitter.com") || h.includes("x.com")) links.twitter = href;
    else if (h.includes("youtube.com") || h.includes("youtu.be")) links.youtube = href;
    else if (h.includes("linkedin.com")) links.linkedin = href;
    else {
      // heuristics: if label says Website, use it; else keep first unknown as website
      const label = (item?.label || "").toLowerCase();
      if (label.includes("website")) links.website = href;
      else if (!links.website && href.startsWith("http")) links.website = href;
    }
  }
  return links;
}

// Category → base tags (simple heuristic)
function categoryTags(title) {
  const t = title.toLowerCase();
  const tags = new Set();

  if (t.includes("athletic") || t.includes("sports")) tags.add("sports");
  if (t.includes("recreational") || t.includes("hobby")) tags.add("recreation");
  if (t.includes("charity") || t.includes("volunteer")) tags.add("volunteering");
  if (t.includes("environment") || t.includes("sustainable")) tags.add("sustainability");
  if (t.includes("fine art") || t.includes("dance") || t.includes("performance")) tags.add("arts");
  if (t.includes("health") || t.includes("wellness")) tags.add("wellness");
  if (t.includes("language") || t.includes("publications")) tags.add("writing");
  if (t.includes("networking") || t.includes("leadership")) tags.add("career");
  if (t.includes("political") || t.includes("activism")) tags.add("activism");
  if (t.includes("religion") || t.includes("culture")) tags.add("culture");

  return [...tags];
}

// Keyword dictionary for club-level tags
const KEYWORD_TAGS = [
  ["badminton", ["badminton", "sports"]],
  ["climbing", ["climbing", "outdoors", "sports"]],
  ["cycling", ["cycling", "outdoors", "sports"]],
  ["dragon boat", ["rowing", "sports", "team"]],
  ["football", ["football", "sports", "team"]],
  ["soccer", ["soccer", "sports", "team"]],
  ["tennis", ["tennis", "sports"]],
  ["table tennis", ["table-tennis", "sports"]],
  ["powerlifting", ["powerlifting", "fitness", "strength"]],
  ["ski", ["skiing", "outdoors", "sports"]],
  ["snowboard", ["snowboarding", "outdoors", "sports"]],
  ["esports", ["gaming", "esports", "social"]],
  ["quidditch", ["quidditch", "sports", "community"]],
  ["karate", ["martial-arts", "fitness", "sports"]],
  ["naginata", ["martial-arts", "culture"]],
];

function clubTags({ name, description, categoryBaseTags }) {
  const text = `${name} ${description}`.toLowerCase();
  const tags = new Set(categoryBaseTags);

  // generic vibe inference
  if (text.includes("beginner")) tags.add("beginner-friendly");
  if (text.includes("social") || text.includes("friends") || text.includes("community")) tags.add("social");
  if (text.includes("competitive")) tags.add("competitive");
  if (text.includes("tournament") || text.includes("league")) tags.add("competition");

  for (const [kw, tgs] of KEYWORD_TAGS) {
    if (text.includes(kw)) tgs.forEach((x) => tags.add(x));
  }

  return [...tags];
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf8");
  const data = JSON.parse(raw);

  const categories = [];
  const clubs = [];

  for (const entry of data.categories || []) {
    const cat = entry.category;
    const catSlug = slugify(cat.title);

    const catDoc = {
      slug: catSlug,
      title: cat.title,
      excerpt: cat.excerpt,
      href: cat.href,
      tags: categoryTags(cat.title),
      updatedAt: new Date().toISOString(),
    };
    categories.push(catDoc);

    const baseTags = catDoc.tags;

    for (const club of entry.clubs || []) {
      const desc = cleanDescription(club.description);
      const links = extractLinks(club.social);

      const clubDoc = {
        name: club.name,
        slug: slugify(club.name) || club.clubId || null,
        clubId: club.clubId || null,

        categorySlug: catSlug,
        categoryTitle: cat.title,

        description: desc,
        imageUrl: club.imageUrl || null,
        sourceUrl: club.sourceUrl || cat.href,

        links,
        tags: clubTags({ name: club.name, description: desc, categoryBaseTags: baseTags }),
        updatedAt: new Date().toISOString(),
      };

      clubs.push(clubDoc);
    }
  }

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(OUT_CATS, JSON.stringify(categories, null, 2), "utf8");
  await fs.writeFile(OUT_CLUBS, JSON.stringify(clubs, null, 2), "utf8");

  console.log("Wrote", OUT_CATS, "categories:", categories.length);
  console.log("Wrote", OUT_CLUBS, "clubs:", clubs.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});