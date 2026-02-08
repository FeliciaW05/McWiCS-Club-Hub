// src/app/browse/page.js
import clientPromise from "@/lib/mongodb";
import BrowseClient from "./browseClient";

export const dynamic = "force-dynamic";

async function getClubsSafe() {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB;
    if (!dbName) {
      return { clubs: [], error: "Missing env var MONGODB_DB" };
    }

    const db = client.db(dbName);

    const raw = await db
      .collection("clubs")
      .find({})
      .project({
        name: 1,
        slug: 1,
        tags: 1,
        category: 1,
        imageUrl: 1,
      })
      .limit(5000)
      .toArray();

    const clubs = raw.map((c) => ({
      ...c,
      _id: c._id.toString(),
      tags: Array.isArray(c.tags) ? c.tags : [],
    }));

    return { clubs, error: null };
  } catch (e) {
    return { clubs: [], error: e?.message || String(e) };
  }
}

export default async function BrowsePage() {
  const { clubs, error } = await getClubsSafe();
  return <BrowseClient clubs={clubs} serverError={error} />;
}