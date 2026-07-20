export type LiveStream = {
  id: string;
  title: string;
  host: string;
  initials: string;
  handle: string;
  category: string;
  viewers: string;
  language: string;
  started: string;
  accent: string;
  scene: "city" | "studio" | "music" | "gaming" | "cooking" | "learning";
  featured?: boolean;
};

export const liveStreams: LiveStream[] = [
  {
    id: "addis-after-dark",
    title: "Addis after dark — stories from the city",
    host: "Maya A.",
    initials: "MA",
    handle: "@mayainaddis",
    category: "IRL & Culture",
    viewers: "12.8K",
    language: "English · Amharic",
    started: "18m",
    accent: "from-[#2a1858] via-[#492a78] to-[#eb5b7e]",
    scene: "city",
    featured: true,
  },
  {
    id: "future-of-design",
    title: "Designing the future of African products",
    host: "Noah Tesfaye",
    initials: "NT",
    handle: "@noahcreates",
    category: "Design",
    viewers: "4.2K",
    language: "English",
    started: "42m",
    accent: "from-[#092f46] via-[#0f5c71] to-[#28a7a1]",
    scene: "studio",
  },
  {
    id: "late-night-sessions",
    title: "Late-night acoustic sessions",
    host: "Leul & Friends",
    initials: "LF",
    handle: "@leulsessions",
    category: "Music",
    viewers: "8.6K",
    language: "Amharic",
    started: "1h 08m",
    accent: "from-[#3b1b12] via-[#8c4326] to-[#f2a74b]",
    scene: "music",
  },
  {
    id: "ranked-road",
    title: "Ranked road to top 100 — no excuses",
    host: "Kiro Gaming",
    initials: "KG",
    handle: "@kirogg",
    category: "Gaming",
    viewers: "21.3K",
    language: "English",
    started: "2h 14m",
    accent: "from-[#11172d] via-[#2444a8] to-[#8b5cf6]",
    scene: "gaming",
  },
  {
    id: "injera-lab",
    title: "The perfect injera — live kitchen lab",
    host: "Chef Saba",
    initials: "CS",
    handle: "@chefsaba",
    category: "Food",
    viewers: "3.1K",
    language: "Amharic · English",
    started: "27m",
    accent: "from-[#3c2817] via-[#80612d] to-[#dab866]",
    scene: "cooking",
  },
  {
    id: "mandarin-basics",
    title: "Mandarin basics: speak with confidence",
    host: "Lina Zhou",
    initials: "LZ",
    handle: "@learnwithlina",
    category: "Learning",
    viewers: "2.7K",
    language: "Chinese · English",
    started: "35m",
    accent: "from-[#421421] via-[#952a3b] to-[#f46b6b]",
    scene: "learning",
  },
];

export const suggestedCreators = [
  { name: "Eden Talks", handle: "@edentalks", initials: "ET", topic: "Conversations", tone: "bg-[#ef6a7b]" },
  { name: "Sam Visuals", handle: "@samvisuals", initials: "SV", topic: "Photography", tone: "bg-[#4d70dc]" },
  { name: "Miki Codes", handle: "@mikicodes", initials: "MC", topic: "Technology", tone: "bg-[#3f9b83]" },
];

export const upcomingLives = [
  { time: "19:30", title: "Startup stories from East Africa", host: "Betty K." },
  { time: "21:00", title: "Live language exchange", host: "Global Room" },
  { time: "Tomorrow", title: "Sunday coffee ceremony", host: "Hana Home" },
];

export function getLiveStream(id: string) {
  return liveStreams.find((stream) => stream.id === id);
}
