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

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      // be polite; also helps avoid some anti-bot behavior
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
  const categoryDescription = normalize($("section span p").first().text()) || category.excerpt;

  const clubs = [];

  $("article.clubs-category").each((_, article) => {
    const $article = $(article);

    const name = normalize(
      $article.find(".clubs-category-description h4").first().text()
    );

    const clubId = $article.find(".clubs-category-description h4").first().attr("id") || null;

    // Description: all text inside the first ".clubs-category-description > div" (the block under h4)
    const descBlock = $article.find(".clubs-category-description > div").first();

    // Keep it readable: join paragraph texts (ignore empty)
    const paragraphs = [];
    descBlock.find("p").each((_, p) => {
      const t = normalize($(p).text());
      if (t) paragraphs.push(t);
    });

    // Fallback if no <p> found: use overall text
    const description = paragraphs.length
      ? normalize(paragraphs.join(" "))
      : normalize(descBlock.text());

    // Social links: exactly ul.clubs-category-social > li > a
    const social = [];
    $article.find("ul.clubs-category-social li a").each((_, a) => {
      const href = $(a).attr("href");
      const label = normalize($(a).text());
      if (href) social.push({ label: label || "link", href });
    });

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
  await fs.writeFile("data/ssmu_clubs_by_category.json", JSON.stringify(result, null, 2), "utf8");

  console.log("Saved: data/ssmu_clubs_by_category.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});