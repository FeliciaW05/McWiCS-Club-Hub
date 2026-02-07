import React from 'react';

// A reusable card component for the posters
const ClubCard = ({ title, color }) => (
  <div className={`w-48 h-64 shrink-0 ${color} border-2 border-club-dark rounded-lg shadow-[4px_4px_0px_0px_#4D2C8E] flex flex-col items-center justify-center p-4`}>
    <div className="text-4xl mb-2">🎈</div>
    <span className="font-bold text-xl text-center rotate-[-5deg]">{title}</span>
    <div className="w-full h-2 bg-club-dark/10 mt-4 rounded-full"></div>
    <div className="w-2/3 h-2 bg-club-dark/10 mt-2 rounded-full"></div>
  </div>
);

const Navbar = () => (
  <nav className="flex justify-between items-center py-6 px-8 border-b-2 border-club-dark bg-club-white sticky top-0 z-50">
    <div className="flex gap-8 text-lg font-bold tracking-tight text-club-dark">
      <a href="#" className="hover:text-club-blue hover:underline decoration-wavy">HOME</a>
      <a href="#" className="hover:text-club-blue hover:underline decoration-wavy">ABOUT</a>
      <a href="#" className="hover:text-club-blue hover:underline decoration-wavy">Browse Clubs</a>
      <a href="#" className="hover:text-club-blue hover:underline decoration-wavy">Calendar</a>
    </div>
    <button className="text-lg font-bold border-b-2 border-club-dark hover:text-club-orange hover:border-club-orange transition-colors">
      Sign up your Club
    </button>
  </nav>
);

export default function Home() {
  // We duplicate the list of clubs to create a seamless infinite loop
  const clubs = [
    { title: "Science Club", color: "bg-white" },
    { title: "Art Society", color: "bg-club-cream" },
    { title: "Robotics", color: "bg-club-light" },
    { title: "Debate Team", color: "bg-club-white" },
    { title: "Chess Club", color: "bg-club-cream" },
    { title: "Music Band", color: "bg-club-light" },
  ];

  return (
    <div className="min-h-screen bg-club-white text-club-dark font-sans overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto mt-12 px-6 grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT COLUMN: Text & Search */}
        <div className="space-y-10">
          <h1 className="text-8xl font-black tracking-tighter">CLUBHUB</h1>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold italic">What is Club Hub?</h2>
            
            {/* The "handwritten" lines from your sketch */}
            <div className="space-y-4 text-xl font-medium opacity-80 max-w-md">
              <p className="border-b-2 border-club-dark pb-2">The central hub for all student life.</p>
              <p className="border-b-2 border-club-dark pb-2">Find your community & new friends.</p>
              <p className="border-b-2 border-club-dark pb-2">Never miss a campus event again.</p>
            </div>

            <button className="mt-4 px-8 py-3 border-2 border-club-dark text-2xl font-bold bg-white hover:bg-club-orange hover:text-white transition-all shadow-[4px_4px_0px_0px_#4D2C8E] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
              Browse Clubs!
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: The "Moving" Posters */}
        <div className="h-[600px] overflow-hidden relative border-x-2 border-club-dark/10 bg-club-dark/5 rounded-xl">
            <div className="flex justify-center gap-6 h-full p-4">
                
                {/* Column 1: Moves Up */}
                <div className="flex flex-col gap-6 animate-scroll-up">
                    {[...clubs, ...clubs].map((club, i) => (
                        <ClubCard key={`col1-${i}`} {...club} />
                    ))}
                </div>

                {/* Column 2: Moves Up (Slower or Offset) */}
                <div className="flex flex-col gap-6 animate-scroll-up" style={{ animationDuration: '25s' }}>
                    {[...clubs, ...clubs].reverse().map((club, i) => (
                        <ClubCard key={`col2-${i}`} {...club} />
                    ))}
                </div>

            </div>
            
            {/* Gradient overlay to make it look smooth at edges */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-club-white via-transparent to-club-white h-full"></div>
        </div>

      </main>
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