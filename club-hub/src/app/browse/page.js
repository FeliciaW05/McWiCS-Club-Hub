import React from 'react';

// Reusing the Navbar for consistency
const Navbar = () => (
  <nav className="flex justify-between items-center py-6 px-8 border-b-2 border-club-dark bg-club-white sticky top-0 z-50">
    <div className="flex gap-8 text-lg font-bold tracking-tight text-club-dark">
      <a href="/" className="hover:text-club-blue hover:underline decoration-wavy">HOME</a>
      <a href="#" className="hover:text-club-blue hover:underline decoration-wavy">ABOUT</a>
      <a href="/browse" className="text-club-orange underline decoration-wavy">Browse Clubs</a>
      <a href="#" className="hover:text-club-blue hover:underline decoration-wavy">Calendar</a>
    </div>
    <button className="text-lg font-bold border-b-2 border-club-dark hover:text-club-orange hover:border-club-orange transition-colors">
      Sign up your Club
    </button>
  </nav>
);

const ClubCard = ({ title, color }) => (
  <div className={`min-w-[220px] h-[300px] ${color} border-2 border-club-dark rounded-lg shadow-[4px_4px_0px_0px_#4D2C8E] flex flex-col items-center justify-between p-4 hover:translate-y-[-5px] transition-transform cursor-pointer`}>
    <div className="w-full h-32 bg-white/50 rounded border border-club-dark/10 flex items-center justify-center text-4xl">
      🎈
    </div>
    <div className="text-center space-y-2">
        <h3 className="font-bold text-xl leading-tight text-club-dark">{title}</h3>
        <p className="text-sm italic opacity-70">Click to see more</p>
    </div>
    <div className="w-full h-2 bg-club-dark/10 rounded-full"></div>
  </div>
);

const TagButton = ({ label, icon }) => (
  <button className="flex items-center gap-2 px-4 py-2 border-2 border-club-blue text-club-blue font-bold rounded-xl bg-white hover:bg-club-cream hover:text-club-dark hover:border-club-dark transition-all shadow-sm hover:shadow-[2px_2px_0px_0px_#434AAD]">
    {label} {icon && <span className="text-xl">{icon}</span>}
  </button>
);

export default function Browse() {
  const trendingClubs = [
    { title: "McGill AI", color: "bg-white" },
    { title: "Debate Union", color: "bg-club-light" },
    { title: "HackMcGill", color: "bg-club-cream" },
    { title: "Origami Club", color: "bg-white" },
    { title: "Chem Eng", color: "bg-club-light" },
    { title: "Cinema Soc", color: "bg-club-cream" },
  ];

  return (
    <div className="min-h-screen bg-club-white text-club-dark font-sans pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 space-y-16 mt-12">
        
        {/* SECTION 1: TRENDING */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b-2 border-club-dark/20 pb-2">
            <h1 className="text-4xl font-bold tracking-tight">Trending in ClubHub</h1>
            {/* The Arrows from your sketch */}
            <div className="flex gap-2 text-3xl font-black text-club-blue animate-pulse">
                <span>→</span><span>→</span>
            </div>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x">
            {trendingClubs.map((club, i) => (
              <ClubCard key={i} {...club} />
            ))}
          </div>
        </section>

        {/* SECTION 2: SEARCH BY TAGS */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold italic border-b-2 border-club-dark/20 pb-2 inline-block">
            Search by Tags
          </h2>
          <div className="flex flex-wrap gap-4">
            <TagButton label="Free food" icon="🍔" />
            <TagButton label="Science" icon="🧬" />
            <TagButton label="Networking" icon="👔" />
            <TagButton label="Music" icon="🎵" />
            <TagButton label="Coding" icon="💻" />
            <TagButton label="Sports" icon="⚽" />
            <TagButton label="Arts" icon="🎨" />
          </div>
        </section>

        {/* SECTION 3: SEARCH BY TIME */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold italic flex items-center gap-3">
            Search by Time
          </h2>
          
          <div className="relative max-w-md group">
            <input 
              type="text" 
              placeholder="enter time..." 
              className="w-full bg-transparent border-2 border-club-dark rounded-lg px-4 py-3 text-xl focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#F17D28] transition-all placeholder:italic placeholder:text-club-dark/50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-club-dark/50 group-focus-within:text-club-orange">
                ↵
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}