import { NextResponse } from "next/server";
import clubs from "@/lib/clubs.json";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  // Validate input
  if (!name) {
    return NextResponse.json(
      { error: "Missing club name" },
      { status: 400 }
    );
  }

  // Find club by name (case-insensitive)
  const club = clubs.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );

  // Club not found
  if (!club) {
    return NextResponse.json(
      { error: "Club not found" },
      { status: 404 }
    );
  }

  // Success
  return NextResponse.json({
    name: club.name,
    description: club.description,
    tags: club.tags,
    vibe: club.vibe,
    link: club.link
  });
}
