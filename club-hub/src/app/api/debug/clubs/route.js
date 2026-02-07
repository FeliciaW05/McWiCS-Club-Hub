import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("clubhub");
    const clubs = await db.collection("clubs").find({}).limit(5).toArray();
    return Response.json({ ok: true, count: clubs.length, clubs });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}