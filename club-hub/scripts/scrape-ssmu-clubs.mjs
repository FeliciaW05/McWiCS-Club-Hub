import * as cheerio from "cheerio";
import fs from "fs/promises";

const BASE = "https://ssmu.ca";
const START = "https://ssmu.ca/student-life/clubs-services-isg/";

// polite delay so you don’t hammer their server
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ClubHubHackathon/1.0 (educational project)"
    }
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

async function getCategoryLinks() {
  const html = await fetchHtml(START);
  const $ = cheerio.load(html);

  // Find all links that contain "/clubs/" from the main page
  // (these correspond to the "View all" category pages)
  const links = new Set();
  $("a[href*='/clubs/']").each((_, a) => {
    const href = $(a).attr("href");
    if (href && href.startsWith("https://ssmu.ca/clubs/")) links.add(href);
  });

  return [...links];
}

function normalizeText(s) {
  return (s || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

async function scrapeCategory(url) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const category = normalizeText($("h1").first().text()) || url;

  // On category pages, club entries are introduced with "#### Club Name"
  // which becomes <h4> in HTML.
  const clubs = [];
  const h4s = $("h4");

  h4s.each((i, el) => {
    const name = normalizeText($(el).text());
    if (!name) return;

    // Collect description + links until the next h4
    let descParts = [];
    let links = [];

    let node = $(el).next();
    while (node.length && node[0].tagName !== "h4") {
      // collect paragraphs
      if (node[0].tagName === "p") {
        const t = normalizeText(node.text());
        if (t) descParts.push(t);
      }

      // collect anchors (instagram/website/etc.)
      node.find("a").each((_, a) => {
        const href = $(a).attr("href");
        const label = normalizeText($(a).text());
        if (href) links.push({ label: label || "link", href });
      });

      node = node.next();
    }

    const description = normalizeText(descParts.join(" "));

    // simple tag seed from category (you can enrich later with Gemini)
    const tags = category
      .toLowerCase()
      .replace(/clubs?/g, "")
      .split(/[^a-z]+/)
      .filter(Boolean);

    clubs.push({
      name,
      category,
      description,
      links,
      tags,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
    });
  });

  return clubs;
}

async function main() {
  console.log("Getting category links...");
  const categoryLinks = await getCategoryLinks();
  console.log("Found category pages:", categoryLinks.length);

  let all = [];
  for (const url of categoryLinks) {
    console.log("Scraping:", url);
    const clubs = await scrapeCategory(url);
    console.log(`  -> ${clubs.length} clubs`);
    all = all.concat(clubs);
    await sleep(400); // be polite
  }

  // Deduplicate by name + category
  const seen = new Set();
  const deduped = [];
  for (const c of all) {
    const key = `${c.category}::${c.name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/ssmu_clubs.json", JSON.stringify(deduped, null, 2), "utf8");
  console.log("Wrote data/ssmu_clubs.json with", deduped.length, "clubs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});