import { Search, SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react";

import { LiveCard } from "@/components/live-card";
import { Badge } from "@/components/ui/badge";
import { liveStreams } from "@/lib/live-data";

const topics = [
  { name: "IRL & Culture", count: "1.8K live", icon: "✦", gradient: "from-[#4f265d] to-[#b24d75]" },
  { name: "Music", count: "940 live", icon: "♫", gradient: "from-[#63361d] to-[#ca7241]" },
  { name: "Gaming", count: "5.2K live", icon: "◇", gradient: "from-[#203a72] to-[#6253ca]" },
  { name: "Learning", count: "620 live", icon: "A", gradient: "from-[#175a5b] to-[#43a48c]" },
];

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <Badge className="mb-3 border-[#5d73ff]/25 bg-[#5d73ff]/10 text-[#a7b3ff]"><Sparkles className="mr-1.5 size-3" /> Discover</Badge>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-.045em] sm:text-[40px]">Explore what&apos;s happening</h1>
          <p className="mt-1.5 text-sm text-[#7c828e]">Find your next community, conversation, or unexpected moment.</p>
        </div>
        <div className="flex h-11 w-full max-w-md items-center gap-2 rounded-full border border-white/[.09] bg-white/[.045] px-4 focus-within:border-[#5d73ff]/60">
          <Search className="size-4 text-[#6c727e]" />
          <input aria-label="Search every live room" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#5f6570]" placeholder="Search every live room" />
          <SlidersHorizontal className="size-4 text-[#6c727e]" />
        </div>
      </div>

      <section className="mt-9">
        <div className="flex items-center gap-2 text-lg font-extrabold"><TrendingUp className="size-5 text-[#ff657f]" /> Trending topics</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topics.map((topic) => (
            <button key={topic.name} className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${topic.gradient} p-5 text-left transition-transform hover:-translate-y-0.5`}>
              <span className="absolute -right-4 -top-9 text-[100px] font-black text-white/[.08]">{topic.icon}</span>
              <div className="relative text-base font-extrabold">{topic.name}</div>
              <div className="relative mt-1 text-xs text-white/65">{topic.count}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold tracking-[-.03em]">Live around the world</h2>
        <div className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {liveStreams.map((stream) => <LiveCard key={stream.id} stream={stream} />)}
        </div>
      </section>
    </div>
  );
}
