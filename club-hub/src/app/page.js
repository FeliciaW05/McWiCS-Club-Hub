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
      Sign up your Club
    </button>
  </nav>
);

const ChatWindow = () => (
  <div className="chatbot-window">
    {/* Window Header */}
    <div className="chat-header">
      <div className="flex gap-2">
        <div className="chat-dot bg-red-400"></div>
        <div className="chat-dot bg-yellow-400"></div>
        <div className="chat-dot bg-green-400"></div>
      </div>
      <span className="text-white font-bold ml-2">ClubHub AI Assistant</span>
    </div>

    {/* Chat Body (Simulated AI) */}
    <div className="chat-body">
      <div className="chat-message-ai">
        👋 Hi! I'm the ClubHub AI. Tell me your interests (e.g. "Chess", "Hiking") and I'll find a club for you!
      </div>
    </div>

    {/* Input Area */}
    <div className="chat-input-area">
      <input 
        type="text" 
        placeholder="Type here..." 
        className="chat-input"
      />
      <button className="chat-send-btn">
        Send
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
      
      {/* GLOBAL NAVBAR (Now Fixed to Top) */}
      <Navbar />

      {/* === SECTION 1: SPLASH SCREEN (Full Height) === */}
      <section className="splash-container">
        
        {/* Background Image*/}
        <img 
          src="background_mcgill.png"
          alt="University Background" 
          className="splash-bg-image"
        />

        {/* Center Content: Logo + Chatbot */}
        <h1 className="splash-logo">CLUBHUB</h1>
        <ChatWindow />

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 text-club-white animate-bounce-slow flex flex-col items-center opacity-80">
             <span className="text-xs font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md">
                Scroll Down
            </span>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={3} 
                stroke="currentColor" 
                className="w-10 h-10 drop-shadow-md"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
      </section>


      {/* === SECTION 2: ORIGINAL HOMEPAGE CONTENT === */}
      <div className="min-h-screen bg-club-white relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        
        <main className="main-grid">
          
          {/* LEFT: Info Text */}
          <div className="space-y-10 pt-4">
            <div className="space-y-6">
              <h2 className="info-heading">
                  What is Club Hub?
              </h2>
              
              <div className="info-text-group">
                <p className="info-text-item">The central hub for all McGill student life.</p>
                <p className="info-text-item">Find your community & new friends instantly.</p>
                <p className="info-text-item">Never miss a campus event again.</p>
              </div>

              <Link href="/browse">
                  <button className="cta-button">
                    Browse All Clubs →
                  </button>
              </Link>
            </div>
          </div>

          {/* RIGHT: Moving Posters Animation */}
          <div className="poster-container">
              {/* Inner wrapper for spacing/background */}
              <div className="flex justify-center gap-6 h-full p-6 bg-club-dark/5">
                  
                  {/* Column 1 */}
                  <div className="poster-scroll-column">
                      {[...clubs, ...clubs].map((club, i) => (
                          <ClubCard key={`col1-${i}`} {...club} />
                      ))}
                  </div>

                  {/* Column 2 (Reversed & Slower) */}
                  <div className="poster-scroll-column" style={{ animationDuration: '28s' }}>
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