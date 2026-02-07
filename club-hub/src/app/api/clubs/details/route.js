import { NextResponse } from "next/server";
import clubs from "@/lib/clubs.json";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  // Make sure this is not an empty query (if it is, return bad request error code)
  if (!name) {
    return NextResponse.json(
      { error: "Empty query" },
      { status: 400 }
    );
  }

  // Find club by name from database (case-insensitive)
  const club = clubs.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );

  // Club not found in database (return not found error code)
  if (!club) {
    return NextResponse.json(
      { error: "Club not found" },
      { status: 404 }
    );
  }

  // Success returns the club info fetched from database
  return NextResponse.json({
    name: club.name,
    description: club.description,
    tags: club.tags,
    vibe: club.vibe,
    link: club.link
  });
}
