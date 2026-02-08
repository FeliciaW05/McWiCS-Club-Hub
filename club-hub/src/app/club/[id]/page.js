// src/app/club/[id]/page.js
import Link from "next/link";
import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// ----------------- SUB-COMPONENTS -----------------

const Navbar = () => (
  <nav className="nav-container">
    <div className="text-2xl font-black text-club-dark md:hidden">CLUBHUB</div>
    <div className="nav-links">
      <Link href="/" className="nav-link-item">Home</Link>
      <Link href="#" className="nav-link-item">About</Link>
      <Link href="/browse" className="nav-link-item">Browse Clubs</Link>
      <Link href="#" className="nav-link-item">Calendar</Link>
    </div>
    <button className="nav-signup-btn">
      sign up your club
    </button>
  </nav>
);

const Tag = ({ text }) => (
  <span className="px-4 py-2 rounded-full font-bold text-sm bg-club-light/20 text-club-dark border-2 border-club-dark/5">
    {text}
  </span>
);

const SocialLink = ({ platform, icon, href }) => {
  if (!href) return null;

  const isMail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMail ? "_self" : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-transparent hover:border-club-blue/20 hover:shadow-lg transition-all group"
    >
      <div className="w-10 h-10 rounded-full bg-club-light/20 flex items-center justify-center text-club-blue group-hover:bg-club-blue group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="font-bold text-club-dark group-hover:text-club-blue">
        {platform}
      </span>
    </a>
  );
};

// ----------------- ICONS -----------------

const IconGlobe = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.5 2.8 4 6.1 4 9s-1.5 6.2-4 9c-2.5-2.8-4-6.1-4-9s1.5-6.2 4-9z" />
  </svg>
);

const IconInstagram = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5Zm4.25 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
  </svg>
);

const IconFacebook = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 22v-8h2.7l.5-3h-3.2V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.4-.1-1.6-.2-3-.2-3 0-5.1 1.8-5.1 5.2V11H6v3h2.9v8h4.6Z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9Z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
  </svg>
);

// ----------------- DB FETCH (✅ defined!) -----------------

async function getClubBySlug(slug) {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB;
  if (!dbName) throw new Error("Missing env var MONGODB_DB");

  const db = client.db(dbName);

  return db.collection("clubs").findOne(
    { slug },
    {
      projection: {
        _id: 0,
        name: 1,
        slug: 1,
        clubId: 1,
        category: 1,
        description: 1,
        imageUrl: 1,
        sourceUrl: 1,
        links: 1,
        tags: 1,
        vibe: 1,
      },
    }
  );
}

// ----------------- PAGE -----------------

export default async function ClubDetails({ params }) {
  const { id } = await params;                 // /club/[id]
  const slug = decodeURIComponent(id);   // safe with URL encoding

  const club = await getClubBySlug(slug);
  if (!club) return notFound();

  const joinUrl =
    club?.links?.website ||
    club?.sourceUrl ||
    club?.category?.href ||
    null;

  const vibeText =
    Array.isArray(club.vibe) && club.vibe.length
      ? club.vibe.join(", ")
      : "Student Community";

  const tags = Array.isArray(club.tags) ? club.tags : [];
  const links = club.links || {};

  return (
    <div className="min-h-screen bg-club-white font-sans selection:bg-club-orange/30">
      <Navbar />

      {/* HEADER */}
      <div className="relative pt-20">
        <div className="h-64 md:h-80 w-full overflow-hidden relative">
          <img
            src="/background_mcgill.png"
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-club-dark/20"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative -mt-20 md:-mt-24 mb-12">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-3xl shadow-2xl p-4 flex items-center justify-center border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
              {club.imageUrl ? (
                <img
                  src={club.imageUrl}
                  alt={`${club.name} logo`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-6xl">🎈</span>
              )}
            </div>

            <div className="flex-grow pb-2 md:pb-8 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-club-dark drop-shadow-sm mb-2">
                {club.name}
              </h1>

              <p className="text-xl font-bold text-club-blue opacity-90">
                {vibeText}
              </p>

              {club.category?.title && (
                <p className="mt-2 text-sm font-bold text-club-dark/60">
                  Category: {club.category.title}
                </p>
              )}
            </div>

            <div className="pb-2 md:pb-8 w-full md:w-auto">
              {joinUrl ? (
                <a href={joinUrl} target="_blank" rel="noreferrer">
                  <button className="w-full md:w-auto px-8 py-4 bg-club-orange hover:bg-orange-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all">
                    Visit / Join
                  </button>
                </a>
              ) : (
                <button
                  disabled
                  className="w-full md:w-auto px-8 py-4 bg-gray-300 text-gray-600 font-black text-lg rounded-2xl"
                >
                  No Join Link
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-club-dark/5">
            <h2 className="text-2xl font-black text-club-dark mb-4 flex items-center gap-2">
              About Us <div className="h-1 w-20 bg-club-blue rounded-full"></div>
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 font-medium">
              {club.description || "No description provided."}
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-club-white border-2 border-club-dark/10 p-6 rounded-3xl">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length ? tags.map((t, i) => <Tag key={`${t}-${i}`} text={t} />) : (
                <span className="text-sm text-gray-400">No tags yet</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2 px-2">Connect</h3>

            <SocialLink platform="Website" href={links.website} icon={<IconGlobe />} />
            <SocialLink platform="Instagram" href={links.instagram} icon={<IconInstagram />} />
            <SocialLink platform="Facebook" href={links.facebook} icon={<IconFacebook />} />
            <SocialLink platform="LinkedIn" href={links.linkedin} icon={<IconLinkedIn />} />
            <SocialLink platform="Email" href={links.email} icon={<IconMail />} />

            {!links.website && !links.instagram && !links.facebook && !links.linkedin && !links.email && (
              <div className="text-sm text-gray-400 px-2">No social links provided.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
