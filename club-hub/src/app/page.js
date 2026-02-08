"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// --- SUB-COMPONENTS ---

const ClubCard = ({ title, color }) => (
  <div className={`club-card ${color}`}>
    <div className="text-4xl mb-2">🎈</div>
    <span className="club-card-title">{title}</span>
    <div className="w-full h-2 bg-club-dark/10 mt-4 rounded-full"></div>
    <div className="w-2/3 h-2 bg-club-dark/10 mt-2 rounded-full"></div>
  </div>
);

const Navbar = () => (
  <nav className="nav-container">
    <div className="text-2xl font-black text-club-dark md:hidden">CLUBHUB</div>
    <div className="nav-links">
      <Link href="/" className="nav-link-item">
        Home
      </Link>
      <Link href="#" className="nav-link-item">
        About
      </Link>
      <Link href="/browse" className="nav-link-item">
        Browse Clubs
      </Link>
      <Link href="#" className="nav-link-item">
        Calendar
      </Link>
    </div>
<<<<<<< HEAD
<Link href="/signup">
  <button className="nav-signup-btn">
    sign up your club
  </button>
</Link>


=======
    <button className="nav-signup-btn">sign up your club</button>
>>>>>>> origin/main
  </nav>
);

// SEARCH BAR (now interactive)

const HeroSearch = ({ value, onChange, onSubmit, loading }) => {
  
  const fullText = "Hello! I’m your attentive club assistant. Tell me your interests and I’ll find your perfect match!";
  const [displayText, setDisplayText] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stop newline
      if (!loading) onSubmit();
    }
  };
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-search-container">
      
      {/* Typing Line */}
      <div className="mb-3 text-white/90 text-lg font-medium drop-shadow min-h-[28px]">
        {displayText}
      </div>

      <div className="hero-search-box">
        <textarea
          placeholder="Tell us a bit about yourself, your interests..."
          rows="2"
          className="hero-search-input resize-none py-3 leading-tight"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="hero-search-btn" onClick={onSubmit} disabled={loading}>
          {loading ? "Finding..." : "Find Club"}
        </button>
      </div>
    </div>
  );
};

const IconGlobe = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15 15 0 0 1 0 20" />
    <path d="M12 2a15 15 0 0 0 0 20" />
  </svg>
);

const IconFacebook = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.1V12h2.1V9.8c0-2.1 1.3-3.3 3.2-3.3.9 0 1.9.2 1.9.2v2.1h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12z" />
  </svg>
);

const IconInstagram = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const IconMail = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 6h16v12H4z" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);


function RecommendationCard({ r }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-club-dark">{r.name}</div>
          <div className="text-sm opacity-70">{r.category}</div>
        </div>
        {typeof r.score === "number" && (
          <div className="text-xs opacity-60">score: {r.score.toFixed?.(1) ?? r.score}</div>
        )}
      </div>

      {r.description && (
        <p className="mt-2 text-sm text-club-dark/80">
          {r.description}
          {r.description.length >= 220 ? "..." : ""}
        </p>
      )}

      {/* tags + vibe */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(r.tags || []).slice(0, 10).map((t) => (
          <span
            key={t}
            className="rounded-full bg-black/5 px-3 py-1 text-xs text-club-dark"
          >
            #{t}
          </span>
        ))}
        {(r.vibe || []).slice(0, 5).map((v) => (
          <span
            key={v}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-900"
          >
            {v}
          </span>
        ))}
      </div>

      {/* links */}
      <div className="mt-4 flex flex-wrap gap-2">
        {r.links?.website && (
          <a
            className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 text-sm text-club-dark hover:bg-black/10 transition"
            href={r.links.website}
            target="_blank"
            rel="noreferrer"
            aria-label="Website"
            title="Website"
          >
            <IconGlobe />
            <span className="hidden sm:inline">Website</span>
          </a>
        )}

        {r.links?.facebook && (
          <a
            className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 text-sm text-club-dark hover:bg-black/10 transition"
            href={r.links.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            title="Facebook"
          >
            <IconFacebook />
            <span className="hidden sm:inline">Facebook</span>
          </a>
        )}

        {r.links?.instagram && (
          <a
            className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 text-sm text-club-dark hover:bg-black/10 transition"
            href={r.links.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            title="Instagram"
          >
            <IconInstagram />
            <span className="hidden sm:inline">Instagram</span>
          </a>
        )}

        {r.links?.email && (
          <a
            className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 text-sm text-club-dark hover:bg-black/10 transition"
            href={r.links.email}
            target="_blank"
            rel="noreferrer"
            aria-label="Email"
            title="Email"
          >
            <IconMail />
            <span className="hidden sm:inline">Email</span>
          </a>
        )}
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function Home() {
  const clubs = [
    { title: "Science Club", color: "bg-white" },
    { title: "Art Society", color: "bg-club-cream" },
    { title: "Robotics", color: "bg-club-light" },
    { title: "Debate Team", color: "bg-club-white" },
    { title: "Chess Club", color: "bg-club-cream" },
    { title: "Music Band", color: "bg-club-light" },
  ];

  // ====== NEW STATE ======
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [userProfile, setUserProfile] = useState(null); // {tags, vibe}
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  async function handleFindClub() {
    const text = message.trim();
    if (!text || loading) return;

    setLoading(true);
    setError("");
    setRecommendations([]);
    setUserProfile(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => null);

      if (!data) {
        setError("Server returned invalid JSON.");
        return;
      }

      if (!res.ok || !data.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }

      setUserProfile(data.user || null);
      setRecommendations(data.recommendations || []);

      if ((data.recommendations || []).length === 0) {
        // show warning from backend if it exists
        setError(data.warning || "No recommendations found. Check DB / tags.");
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans">
      {/* GLOBAL NAVBAR */}
      <Navbar />

      {/* === SECTION 1: SPLASH SCREEN (Full Height) === */}
      <section className="splash-container relative flex flex-col items-center justify-center h-screen w-full overflow-hidden">
        {/* Background Image (Absolute) */}
        <img
          src="background_mcgill.png"
          alt="University Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/20 z-0"></div>

        {/* Center Content: Logo + Search Bar */}
        <div className="z-10 flex flex-col items-center gap-6 w-full px-4">
          <img
            src="CLUB.png"
            alt="ClubHub Logo"
            className="w-80 md:w-96 drop-shadow-2xl mb-2"
          />

          <HeroSearch
            value={message}
            onChange={setMessage}
            onSubmit={handleFindClub}
            loading={loading}
            
          />

          {/* status line under the search box */}
          <div className="w-full max-w-3xl">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-red-800 text-sm">
                {error}
              </div>
            )}

            {userProfile && (
              <div className="mt-3 rounded-lg bg-white/90 px-4 py-3 text-sm text-club-dark">
                <div className="font-semibold">Your inferred profile</div>
                <div className="mt-1 opacity-80">
                  <span className="font-semibold">Tags:</span>{" "}
                  {(userProfile.tags || []).join(", ") || "none"}
                </div>
                <div className="opacity-80">
                  <span className="font-semibold">Vibe:</span>{" "}
                  {(userProfile.vibe || []).join(", ") || "none"}
                </div>
                <div className="opacity-80">
                  <span className="font-semibold">Scroll down to see recommendations!</span>{" "}
                </div>
                <a
                  href="#recommendations"
                  className="mt-3 inline-block rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-club-dark hover:bg-white transition"
                >
                  Jump to matches ↓
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* === SECTION 2: ORIGINAL HOMEPAGE CONTENT === */}
      <div className="min-h-screen bg-club-white relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        <main className="main-grid">
          {/* LEFT: Info Text */}
          <div className="space-y-10 pt-10 md:pt-20 pl-8">
            <div className="space-y-6">
              <h2 className="info-heading mt-0 text-5xl font-bold text-club-blue">
                What is Club Hub?
              </h2>

              <div className="info-text-group space-y-4 text-xl text-club-dark/80">
                <p className="info-text-item border-l-4 border-club-orange pl-4">
                  The central hub for all McGill student life.
                </p>
                <p className="info-text-item border-l-4 border-club-blue pl-4">
                  Find your community & new friends instantly.
                </p>
                <p className="info-text-item border-l-4 border-club-green pl-4">
                  Never miss a campus event again.
                </p>
              </div>

              <Link href="/browse">
                <button className="cta-button mt-6 px-8 py-3 bg-club-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                  Browse All Clubs →
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT: Moving Posters Animation */}
          <div className="poster-container h-[600px] overflow-hidden relative">
            <div className="flex justify-center gap-6 h-full p-6 bg-club-dark/5">
              <div className="poster-scroll-column space-y-6 animate-scroll-up">
                {[...clubs, ...clubs].map((club, i) => (
                  <ClubCard key={`col1-${i}`} {...club} />
                ))}
              </div>

              <div
                className="poster-scroll-column space-y-6 animate-scroll-down"
                style={{ animationDuration: "28s" }}
              >
                {[...clubs, ...clubs].reverse().map((club, i) => (
                  <ClubCard key={`col2-${i}`} {...club} />
                ))}
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/80 via-transparent to-white/80 h-full"></div>
          </div>
        </main>

        {/* === NEW SECTION 3: Recommendations List === */}
        <section id="recommendations" className="max-w-5xl mx-auto px-6 pb-20">
          <h3 className="text-2xl font-extrabold text-club-dark mt-6">
            Your club matches
          </h3>
          <p className="text-club-dark/70 mt-1">
            Enter your interests above and we’ll recommend clubs.
          </p>

          {loading && (
            <div className="mt-6 rounded-lg bg-black/5 px-4 py-3 text-sm">
              Loading recommendations...
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <div className="mt-6 rounded-lg bg-black/5 px-4 py-3 text-sm">
              No results yet. Try: “I like hiking, meeting people, and chill clubs.”
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((r, idx) => (
                <RecommendationCard key={`${r.slug || r.name}-${idx}`} r={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
/*
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.js file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
    
  );
}
*/

