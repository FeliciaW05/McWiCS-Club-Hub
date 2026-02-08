"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

// --- SUB-COMPONENTS ---

const Navbar = () => (
  <nav className="nav-container">
    <div className="text-2xl font-black text-club-dark md:hidden">CLUBHUB</div>
    <div className="nav-links">
      <Link href="/" className="nav-link-item">
        Home
      </Link>
      <Link href="/browse" className="nav-link-item">
        Browse Clubs
      </Link>
    </div>
    <Link href="/signup">
  <button className="nav-signup-btn">Join the Hub</button>
</Link>

  </nav>
);

const ClubCard = ({ title, color, slug, imageUrl }) => (
  <Link href={`/club/${encodeURIComponent(slug)}`} className="block">
    <div
      className={`min-w-[220px] h-[300px] ${color} border-2 border-club-dark rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer overflow-hidden flex flex-col justify-between p-4`}
    >
      <div className="w-full h-32 bg-white/50 rounded border border-club-dark/10 flex items-center justify-center text-4xl mb-4 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={`${title} logo`} className="w-full h-full object-cover" />
        ) : (
          "🎈"
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl leading-tight text-club-dark">{title}</h3>
        <p className="text-sm italic opacity-70">Click to see more</p>
      </div>
      <div className="w-full h-2 bg-club-dark/10 rounded-full" />
    </div>
  </Link>
);

const TagButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 border-2 border-club-blue font-bold rounded-xl transition-all shadow-sm 
      ${
        isActive
          ? "bg-club-blue text-white shadow-[2px_2px_0px_0px_#000]"
          : "bg-white text-club-blue hover:bg-club-cream hover:text-club-dark hover:border-club-dark hover:shadow-[2px_2px_0px_0px_#434AAD]"
      }`}
  >
    {label}
  </button>
);

export default function BrowseClient({ clubs }) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const colors = ["bg-white", "bg-club-light", "bg-club-cream"];

  // Tags list from data
  const allTags = useMemo(() => {
    const tagSet = new Set();
    for (const c of clubs) {
      for (const t of c.tags || []) tagSet.add(t);
    }
    return ["All", ...Array.from(tagSet).sort()];
  }, [clubs]);

  const previewTags = allTags.slice(0, 6);

  // Filtered clubs
  const filteredClubs = useMemo(() => {
    if (selectedTag === "All") return clubs;
    return clubs.filter((c) => (c.tags || []).includes(selectedTag));
  }, [clubs, selectedTag]);

  return (
    <div className="min-h-screen bg-club-white text-club-dark font-sans pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 space-y-16 mt-12 pt-12">
        <section className="space-y-8">
          <div className="space-y-4 relative">
            <h2 className="text-3xl font-bold italic border-b-2 border-club-dark/20 pb-2 inline-block">
              Search by Tags
            </h2>

            <div className="flex flex-wrap gap-3 items-center">
              {previewTags.map((tag) => (
                <TagButton
                  key={tag}
                  label={tag}
                  isActive={selectedTag === tag}
                  onClick={() => setSelectedTag(tag)}
                />
              ))}

              {!isTagsOpen && (
                <button
                  onClick={() => setIsTagsOpen(true)}
                  className="text-club-blue font-bold hover:text-club-orange ml-2"
                >
                  See More
                </button>
              )}
            </div>

            {isTagsOpen && (
              <div className="absolute top-16 left-0 w-full md:w-2/3 bg-white border-2 border-club-dark rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] z-40">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl text-club-dark">All Tags</h3>
                  <button
                    onClick={() => setIsTagsOpen(false)}
                    className="text-gray-400 hover:text-club-orange font-bold px-2"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {allTags.map((tag) => (
                    <TagButton
                      key={tag}
                      label={tag}
                      isActive={selectedTag === tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsTagsOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-club-white/50 p-6 rounded-3xl border-2 border-club-dark/5">
            <h3 className="text-xl font-bold mb-4 text-club-dark/60">
              {selectedTag === "All" ? "All Clubs" : `Results for "${selectedTag}"`}
            </h3>

            {filteredClubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredClubs.map((club, i) => (
                  <ClubCard
                    key={club._id}              // ✅ UNIQUE KEY FIX
                    title={club.name}
                    slug={club.slug}            // ✅ URL uses slug
                    imageUrl={club.imageUrl}
                    color={colors[i % colors.length]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-xl font-bold text-gray-400">
                No clubs found with this tag 😔
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}