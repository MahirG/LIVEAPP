import Link from "next/link";
import { ArrowRight, CalendarClock, ChevronRight, Compass, Sparkles } from "lucide-react";

import { LiveCard } from "@/components/live-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { liveStreams, suggestedCreators, upcomingLives } from "@/lib/live-data";

const categories = ["For you", "IRL", "Music", "Gaming", "Learning", "Culture", "Food", "Technology"];

export default function HomePage() {
  const featured = liveStreams[0];
  const remaining = liveStreams.slice(1);

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-8 xl:flex-row">
        <section className="min-w-0 flex-1">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Badge className="mb-3 border-[#5d73ff]/25 bg-[#5d73ff]/10 text-[#9eacff]">
                <Sparkles className="mr-1.5 size-3" />
                Made for you
              </Badge>
              <h1 className="text-[30px] font-extrabold tracking-[-.045em] text-white sm:text-[38px]">
                What&apos;s live now
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#818793]">
                Real people, real moments, happening right now.
              </p>
            </div>
            <Link href="/explore" className="hidden items-center gap-1.5 text-sm font-semibold text-[#9ca8f8] hover:text-white sm:flex">
              Explore all <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {categories.map((category, index) => (
              <button
                key={category}
                className={index === 0
                  ? "h-9 shrink-0 rounded-full bg-white px-4 text-xs font-bold text-[#0c0d11]"
                  : "h-9 shrink-0 rounded-full border border-white/[.08] bg-white/[.04] px-4 text-xs font-semibold text-[#9499a5] transition hover:border-white/20 hover:text-white"}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <LiveCard stream={featured} featured />
            {remaining.slice(0, 2).map((stream) => <LiveCard key={stream.id} stream={stream} />)}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-[-.03em]">Keep exploring</h2>
              <p className="mt-1 text-xs text-[#747a87]">Fresh rooms selected for your interests</p>
            </div>
            <Button variant="ghost" size="sm">
              See more <ChevronRight />
            </Button>
          </div>

          <div className="mt-4 grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {remaining.slice(2).map((stream) => <LiveCard key={stream.id} stream={stream} />)}
          </div>
        </section>

        <aside className="w-full shrink-0 space-y-5 xl:sticky xl:top-24 xl:w-[310px] xl:self-start">
          <div className="rounded-[22px] border border-white/[.07] bg-[#101217] p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              <CalendarClock className="size-[18px] text-[#8798ff]" />
              Coming up
            </div>
            <div className="mt-4 space-y-1">
              {upcomingLives.map((live) => (
                <button key={live.title} className="group flex w-full gap-3 rounded-[14px] p-2.5 text-left transition hover:bg-white/[.05]">
                  <span className="mt-0.5 min-w-[54px] text-[11px] font-bold text-[#8798ff]">{live.time}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold leading-5 text-[#d9dce3] group-hover:text-white">{live.title}</span>
                    <span className="mt-0.5 block text-[11px] text-[#6f7581]">{live.host}</span>
                  </span>
                </button>
              ))}
            </div>
            <Button variant="secondary" className="mt-3 w-full" size="sm">View schedule</Button>
          </div>

          <div className="rounded-[22px] border border-white/[.07] bg-[#101217] p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              <Compass className="size-[18px] text-[#ef6a7b]" />
              Creators to watch
            </div>
            <div className="mt-4 space-y-4">
              {suggestedCreators.map((creator) => (
                <div key={creator.handle} className="flex items-center gap-3">
                  <UserAvatar initials={creator.initials} tone={creator.tone} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{creator.name}</div>
                    <div className="truncate text-[11px] text-[#707683]">{creator.topic}</div>
                  </div>
                  <button className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-[#c4c8d0] transition hover:border-[#7185ff]/60 hover:text-white">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-[#5d73ff]/20 bg-[#151833] p-5">
            <div className="absolute -right-10 -top-14 size-36 rounded-full bg-[#6578ff]/20 blur-2xl" />
            <div className="relative">
              <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#93a1ff]">Creator tip</div>
              <div className="mt-2 text-base font-extrabold leading-6">Your first live can be simple.</div>
              <p className="mt-1.5 text-xs leading-5 text-[#9ea4be]">We&apos;ll check your camera, sound, light, and connection before anyone sees you.</p>
              <Link href="/studio" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white">
                Open studio <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
