import * as cheerio from "cheerio";
import fs from "fs/promises";

const START_URL = "https://ssmu.ca/student-life/clubs-services-isg/";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalize(s) {
  return (s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDescription(s) {
  let d = normalize(s);

  // Remove trailing “platform words” that often remain after scraping
  // Example: "... create a memorable summer for everyone. Instagram"
  d = d.replace(
    /\b(Instagram|YouTube|LinkedIn|Facebook|Twitter|X|Website|Email)\b\s*$/gi,
    ""
  );

  return normalize(d);
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ClubHubHackathon/1.0 (educational)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

/**
 * MAIN PAGE PARSER
 * Matches exactly:
 * div.gallery.gallery--gated.cta-gallery.clubs > div.cta
 * Extracts: title, excerpt, href
 */
async function scrapeCategories() {
  const html = await fetchHtml(START_URL);
  const $ = cheerio.load(html);

  const categories = [];

  $("div.gallery.gallery--gated.cta-gallery.clubs div.cta").each((_, cta) => {
    const title = normalize($(cta).find("h3.cta-title").first().text());
    const excerpt = normalize($(cta).find("p.walker-excerpt").first().text());
    const href = $(cta).find("a[href]").first().attr("href");

    if (title && href) {
      categories.push({
        title,
        excerpt,
        href,
      });
    }
  });

  return categories;
}

/**
 * CATEGORY PAGE PARSER
 * Matches exactly:
 * article.clubs-category
 * Extracts: category title/desc + each club's name/desc/social/img
 */
async function scrapeCategoryPage(category) {
  const html = await fetchHtml(category.href);
  const $ = cheerio.load(html);

  const categoryTitle = normalize($("section h1").first().text()) || category.title;
  const categoryDescription =
    normalize($("section span p").first().text()) || category.excerpt;

  const clubs = [];

  $("article.clubs-category").each((_, article) => {
    const $article = $(article);

    const $h4 = $article.find(".clubs-category-description h4").first();
    const name = normalize($h4.text());
    const clubId = $h4.attr("id") || null;

    // Description container: the block directly under h4
    const descBlock = $article.find(".clubs-category-description > div").first();

    // 1) Grab links INSIDE descBlock (Instagram often lives here)
    const descLinks = [];
    descBlock.find("a[href]").each((_, a) => {
      const href = $(a).attr("href")?.trim();
      const label = normalize($(a).text()) || "link";
      if (href) descLinks.push({ label, href });
    });

    // 2) Social links from ul.clubs-category-social
    const socialLinks = [];
    $article.find("ul.clubs-category-social li a[href]").each((_, a) => {
      const href = $(a).attr("href")?.trim();
      const label = normalize($(a).text()) || "link";
      if (href) socialLinks.push({ label, href });
    });

    // 3) Build description text but REMOVE anchor text so we don’t get trailing “Instagram”
    // Clone to avoid modifying original DOM
    const descClone = descBlock.clone();
    descClone.find("a").remove(); // remove links so their text doesn't pollute description

    // Prefer paragraphs, fallback to full text
    const paragraphs = [];
    descClone.find("p").each((_, p) => {
      const t = normalize($(p).text());
      if (t) paragraphs.push(t);
    });

    const rawDescription = paragraphs.length
      ? paragraphs.join(" ")
      : normalize(descClone.text());

    const description = cleanDescription(rawDescription);

    // 4) Merge + dedupe links by href (so instagram isn’t lost)
    const combined = [...descLinks, ...socialLinks];
    const seen = new Set();
    const social = [];
    for (const item of combined) {
      if (!item?.href) continue;
      const key = item.href.trim();
      if (seen.has(key)) continue;
      seen.add(key);
      social.push({
        label: item.label || "link",
        href: item.href,
      });
    }

    // Image: inside div.clubs-category-img img
    const imageUrl = $article.find(".clubs-category-img img").first().attr("src") || null;

    if (name) {
      clubs.push({
        name,
        clubId,
        description,
        social,
        imageUrl,
        sourceUrl: category.href,
      });
    }
  });

  return {
    category: {
      title: categoryTitle,
      excerpt: categoryDescription,
      href: category.href,
    },
    clubs,
  };
}

async function main() {
  console.log("Scraping categories from:", START_URL);
  const categories = await scrapeCategories();
  console.log(`Found ${categories.length} categories`);

  const result = {
    scrapedAt: new Date().toISOString(),
    source: START_URL,
    categories: [],
  };

  for (const cat of categories) {
    console.log("Scraping category:", cat.title, "-", cat.href);
    const categoryData = await scrapeCategoryPage(cat);
    console.log(`  -> ${categoryData.clubs.length} clubs`);
    result.categories.push(categoryData);

    await sleep(400); // polite delay
  }

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(
    "data/ssmu_clubs_by_category.json",
    JSON.stringify(result, null, 2),
    "utf8"
  );

  console.log("Saved: data/ssmu_clubs_by_category.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});