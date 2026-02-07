import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  const { tags } = await req.json(); // tags: string[]
  if (!Array.isArray(tags) || tags.length === 0) {
    return Response.json({ clubs: [] });
  }

  const client = await clientPromise;
  const db = client.db("clubhub");
  const clubs = await db
    .collection("clubs")
    .find({ tags: { $in: tags.map(t => t.toLowerCase()) } })
    .limit(12)
    .toArray();

  return Response.json({ clubs });
}