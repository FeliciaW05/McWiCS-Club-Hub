// src/app/api/clubs/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name");   // optional
    const limit = Number(searchParams.get("limit") || 200);
    const skip = Number(searchParams.get("skip") || 0);

    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB; // make sure this exists
    const db = client.db(dbName);
    const col = db.collection("clubs");

    // If no name parameter is passed, return a list (for Browse page)
    if (!name) {
      const clubs = await col
        .find(
          {},
          {
            projection: {
              _id: 0,
              name: 1,
              slug: 1,
              description: 1,
              tags: 1,
              vibe: 1,
              links: 1,
              imageUrl: 1,
              category: 1,
            },
          }
        )
        .skip(skip)
        .limit(Math.min(limit, 500)) // safety cap
        .toArray();

      return NextResponse.json(clubs, { status: 200 });
    }

    // ---- Find club by name (case-insensitive) ----
    // 1) Try exact match with collation (best)
    let club = await col.findOne(
      { name },
      {
        projection: {
          _id: 0,
          name: 1,
          slug: 1,
          description: 1,
          tags: 1,
          vibe: 1,
          links: 1,
          imageUrl: 1,
          category: 1,
        },
        collation: { locale: "en", strength: 2 }, // case-insensitive
      }
    );

    // 2) If no exact match, try "contains" match
    if (!club) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex
      club = await col.findOne(
        { name: { $regex: escaped, $options: "i" } },
        {
          projection: {
            _id: 0,
            name: 1,
            slug: 1,
            description: 1,
            tags: 1,
            vibe: 1,
            links: 1,
            imageUrl: 1,
            category: 1,
          },
        }
      );
    }

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        name: club.name,
        slug: club.slug,
        description: club.description,
        tags: club.tags || [],
        vibe: club.vibe || [],
        links: club.links || {},
        imageUrl: club.imageUrl || null,
        category: club.category || null,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}