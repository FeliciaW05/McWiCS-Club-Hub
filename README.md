# McWiCS-Club-Hub
ClubHub — McGill Club Discovery Platform

Club is a unified hub that helps McGill students discover, join, and actually engage with clubs — without doom-scrolling Instagram.

Instead of traditional filters, ClubHub uses natural language input, lightweight AI-assisted matching, and smart heuristics to recommend the most relevant clubs for each user.

## Features

### Conversational Club Search
- Users describe their interests in plain English
“I like hiking, meeting people, and chill clubs”
- The system extracts tags and vibes automatically.

### Smart Recommendation Engine
Combines:
- Keyword & synonym matching
- Tag & vibe overlap
- Club quality signals (images, Instagram links, recency)
- Returns top 6 ranked clubs for clarity and focus.

### Hybrid AI + Rule-Based Logic
- Uses Gemini for semantic understanding.
- Gracefully falls back to deterministic logic if AI is unavailable.
- Always produces results (no “dead ends”).

### Two Modes of Matching
- Search mode
Triggered by short inputs like: ski, robotics, AI
- Recommendation mode
Triggered by descriptive inputs about goals, time, or vibe.


## Tech Stack

Frontend
- Next.js 16 (App Router)
- React (Client Components)
- Tailwind CSS (custom design system)

Backend
- Next.js API Routes
- MongoDB (club data storage)
- Custom ranking & scoring logic
- Optional Google Gemini API integration


## Getting Started

1. Install dependencies

```
npm install
```

2. Environment variables

Create a .env.local file:

```
MONGODB_URI=mongodb+srv://club-user:k3Pjzc435QcUMzFo@cluster0.tetblnk.mongodb.net/?appName=Cluster0
MONGODB_DB=clubhub
GEMINI_API_KEY=<VALIDAPIKEY>
```

3. Run the dev server

```
npm run dev
```

Visit:
http://localhost:3000


## Known Limitations / Future Work
- User accounts & saved preferences
- A calendar feature which allows users to see the meeting times for the clubs they’ve joined and events they’ve RSVP’d for. This could also be used to see if the club would fit in your schedule
- Notifications for RSVP’d events
- Analytics dashboard for clubs to gauge interest and facilitate planning events
- Allow clubs to collaborate (plan joint events, etc.)
- Smarter recommendations: refine the tag matching system to make it as accurate as possible