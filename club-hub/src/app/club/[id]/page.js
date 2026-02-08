import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// --- SUB-COMPONENTS ---
const Navbar = () => (
  <nav className="nav-container">
    <div className="text-2xl font-black text-club-dark md:hidden">CLUBHUB</div>
    <div className="nav-links">
      <Link href="/" className="nav-link-item">Home</Link>
      <Link href="#" className="nav-link-item">About</Link>
      <Link href="/browse" className="nav-link-item">Browse Clubs</Link>
      <Link href="#" className="nav-link-item">Calendar</Link>
    </div>
    <button className="nav-signup-btn">sign up your club</button>
  </nav>
);

const Tag = ({ text }) => (
  <span className="px-4 py-2 rounded-full font-bold text-sm bg-club-light/20 text-club-dark border-2 border-club-dark/5">
    {text}
  </span>
);

const SocialLink = ({ platform, icon, link }) => (
  <a href={link} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-transparent hover:border-club-blue/20 hover:shadow-lg transition-all group">
    <div className="w-10 h-10 rounded-full bg-club-light/20 flex items-center justify-center text-club-blue group-hover:bg-club-blue group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="font-bold text-club-dark group-hover:text-club-blue">{platform}</span>
  </a>
);

// --- 1. DATA FETCHING FUNCTION ---
async function getClubData(name) {
  const baseUrl = 'http://localhost:3000'; // replace with your domain in production
  try {
    const res = await fetch(`${baseUrl}/api/clubs/details?name=${name}`, {
      cache: 'no-store',
    });

    if (!res.ok) return undefined;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch club:", error);
    return undefined;
  }
}

// --- 2. ASYNC PAGE COMPONENT ---
export default async function ClubDetails({ params }) {
  // Await params in Next.js 13+
  const { id } = await params;

  // Fetch club data
  const club = await getClubData(id);

  if (!club) {
    return notFound();
  }

  // Split vibe array into separate words/tags
  const vibeTags = Array.isArray(club.vibe) ? club.vibe.flatMap(v => v.split("-")) : [];

  return (
    <div className="min-h-screen bg-club-white font-sans selection:bg-club-orange/30">
      <Navbar />

      {/* HEADER */}
      <div className="relative pt-20">
        <div className="h-64 md:h-80 w-full overflow-hidden relative">
          <img 
            src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1600&q=80" 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-club-dark/20"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative -mt-20 md:-mt-24 mb-12">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            {/* Club Icon */}
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-3xl shadow-2xl p-4 flex items-center justify-center border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-6xl">🎈</span>
            </div>

            {/* Title & Vibe */}
            <div className="flex-grow pb-2 md:pb-8 text-center md:text-left">
              {/* Club Name with white background */}
              <h1 className="inline-block bg-white px-4 py-2 rounded-md text-4xl md:text-6xl font-black text-club-dark drop-shadow-sm mb-4">
                {club.name}
              </h1>

              {/* Vibe Tags */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                {vibeTags.length > 0 
                  ? vibeTags.map((tag, i) => <Tag key={i} text={tag} />)
                  : <span className="text-xl font-bold text-club-blue opacity-90">Student Community</span>
                }
              </div>
            </div>

            {/* Join Button */}
            <div className="pb-2 md:pb-8 w-full md:w-auto">
              <a href={club.link} target="_blank">
                <button className="w-full md:w-auto px-8 py-4 bg-club-orange hover:bg-orange-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all">
                  Join Club
                </button>
              </a>
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
              {club.description}
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-club-white border-2 border-club-dark/10 p-6 rounded-3xl">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {club.tags && club.tags.map((tag, i) => <Tag key={i} text={tag} />)}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2 px-2">Connect</h3>
            <SocialLink 
              platform="Website / Join" 
              link={club.link}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
