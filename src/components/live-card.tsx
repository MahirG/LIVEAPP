import Link from "next/link";
import { Eye, Radio } from "lucide-react";

import { LiveScene } from "@/components/live-scene";
import { UserAvatar } from "@/components/user-avatar";
import type { LiveStream } from "@/lib/live-data";
import { cn } from "@/lib/utils";

export function LiveCard({ stream, featured = false }: { stream: LiveStream; featured?: boolean }) {
  return (
    <article className={cn("group min-w-0", featured && "lg:col-span-2")}>
      <Link
        href={`/live/${stream.id}`}
        className={cn(
          "relative block overflow-hidden rounded-[22px] border border-white/[.08] bg-[#14161c] shadow-[0_24px_70px_rgba(0,0,0,.24)]",
          featured ? "aspect-[16/10] sm:aspect-[16/8]" : "aspect-[16/10]",
        )}
      >
        <LiveScene stream={stream} large={featured} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80 transition group-hover:opacity-65" />
        <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
          <span className="flex h-6 items-center gap-1.5 rounded-md bg-[#ff3f63] px-2 text-[10px] font-black uppercase tracking-[.08em] text-white shadow-lg">
            <Radio className="size-3" strokeWidth={3} />
            Live
          </span>
          <span className="flex h-6 items-center gap-1.5 rounded-md bg-black/35 px-2 text-[10px] font-bold text-white backdrop-blur-md">
            <Eye className="size-3" />
            {stream.viewers}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4">
          <div className="max-w-[80%]">
            <div className={cn("font-bold leading-tight tracking-[-.02em] text-white", featured ? "text-xl sm:text-2xl" : "text-[15px]")}>
              {stream.title}
            </div>
            <div className="mt-2 text-xs font-medium text-white/70">{stream.host} · {stream.category}</div>
          </div>
          <span className="grid size-10 translate-y-1 place-items-center rounded-full border border-white/20 bg-white/10 opacity-0 backdrop-blur-md transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <Radio className="size-4" />
          </span>
        </div>
      </Link>
      {!featured && (
        <div className="mt-3 flex items-center gap-3 px-1">
          <UserAvatar initials={stream.initials} className="size-9 bg-gradient-to-br from-[#5469d8] to-[#a65fcd]" live />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[#ebedf2]">{stream.host}</div>
            <div className="truncate text-xs text-[#747a87]">{stream.language}</div>
          </div>
        </div>
      )}
    </article>
  );
}
