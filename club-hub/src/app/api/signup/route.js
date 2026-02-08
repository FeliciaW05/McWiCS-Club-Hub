import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, tags = [], vibe = [], link } = body;

    if (!name || !description) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("clubhub"); // Replace with your actual DB name
    const clubs = db.collection("clubs");

    const result = await clubs.insertOne({
      name,
      description,
      tags,
      vibe,
      link,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ ok: true, clubId: result.insertedId }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
