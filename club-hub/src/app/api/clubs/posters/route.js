import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const clubs = await db
      .collection("clubs")
      .find({}, { projection: { _id: 0, name: 1, imageUrl: 1 } })
      .limit(12)
      .toArray();

    return Response.json({
      ok: true,
      clubs,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}