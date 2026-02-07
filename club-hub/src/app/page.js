import React from 'react';
import Link from 'next/link';

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

// SEARCH BAR
const HeroSearch = () => (
  <div className="hero-search-container">
    <div className="hero-search-box">
      {/* Search Icon */}
      {/*<div className="pl-4 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>*/}

      {/* Input */}
      {/* Input - Changed to Textarea for multi-line support */}
      <textarea 
        placeholder="Tell us a bit about yourself, your interests, and we'll find the perfect club!" 
        rows="2"
        className="hero-search-input resize-none py-3 leading-tight flex items-center" 
      />

      {/* Button */}
      <button className="hero-search-btn">
        Find Club
      </button>
    </div>
  </div>
);

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
        <div className="z-10 flex flex-col items-center gap-8 w-full">
            <img
              src="CLUB.png"
              alt="ClubHub Logo"
              className="w-80 md:w-96 drop-shadow-2xl mb-4"
            />
            
            <HeroSearch />
        </div>
      </section>

      {/* === SECTION 2: ORIGINAL HOMEPAGE CONTENT === */}
      {/* GAP FIX: Added -mt-1 to pull it up slightly or ensure no margin collapse */}
      <div className="min-h-screen bg-club-white relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        
        <main className="main-grid">
          
          {/* LEFT: Info Text */}
          <div className="space-y-10 pt-10 md:pt-20 pl-8"> {/* Adjusted padding */}
            <div className="space-y-6">
              {/* GAP FIX: Added mt-0 to remove default browser margin */}
              <h2 className="info-heading mt-0 text-5xl font-bold text-club-blue">
                  What is Club Hub?
              </h2>
              
              <div className="info-text-group space-y-4 text-xl text-club-dark/80">
                <p className="info-text-item border-l-4 border-club-orange pl-4">The central hub for all McGill student life.</p>
                <p className="info-text-item border-l-4 border-club-blue pl-4">Find your community & new friends instantly.</p>
                <p className="info-text-item border-l-4 border-club-green pl-4">Never miss a campus event again.</p>
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
              {/* Inner wrapper for spacing/background */}
              <div className="flex justify-center gap-6 h-full p-6 bg-club-dark/5">
                  
                  {/* Column 1 */}
                  <div className="poster-scroll-column space-y-6 animate-scroll-up">
                      {[...clubs, ...clubs].map((club, i) => (
                          <ClubCard key={`col1-${i}`} {...club} />
                      ))}
                  </div>

                  {/* Column 2 (Reversed & Slower) */}
                  <div className="poster-scroll-column space-y-6 animate-scroll-down" style={{ animationDuration: '28s' }}>
                      {[...clubs, ...clubs].reverse().map((club, i) => (
                          <ClubCard key={`col2-${i}`} {...club} />
                      ))}
                  </div>

              </div>
              
              {/* Fade Overlay (Top/Bottom) */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/80 via-transparent to-white/80 h-full"></div>
          </div>

        </main>
      </div>

    </div>
  );
}