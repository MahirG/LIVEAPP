import { BookOpen, Gamepad2, Mic2, Soup, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LiveStream } from "@/lib/live-data";

const sceneIcon = {
  city: Sparkles,
  studio: Sparkles,
  music: Mic2,
  gaming: Gamepad2,
  cooking: Soup,
  learning: BookOpen,
};

export function LiveScene({
  stream,
  className,
  large = false,
}: {
  stream: LiveStream;
  className?: string;
  large?: boolean;
}) {
  const Icon = sceneIcon[stream.scene];
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-gradient-to-br", stream.accent, className)}>
      <div className="absolute -left-[12%] -top-[34%] size-[80%] rounded-full bg-white/[.12] blur-3xl" />
      <div className="absolute -bottom-[36%] -right-[12%] size-[78%] rounded-full bg-black/30 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_25%,rgba(255,255,255,.22),transparent_24%),linear-gradient(180deg,transparent_45%,rgba(5,5,8,.52))]" />
      <div className="absolute left-[12%] top-[18%] h-[55%] w-[34%] rotate-[-8deg] rounded-[48%_52%_45%_55%] bg-black/15 blur-[1px]" />
      <div className="absolute right-[12%] top-[15%] grid aspect-square w-[34%] place-items-center rounded-full border border-white/[.18] bg-white/[.08] text-white/80 shadow-[inset_0_0_40px_rgba(255,255,255,.08)] backdrop-blur-sm">
        <Icon className={large ? "size-16" : "size-10"} strokeWidth={1.25} />
      </div>
      {large && (
        <>
          <div className="absolute bottom-[15%] left-[10%] h-1 w-[38%] rounded-full bg-white/20" />
          <div className="absolute bottom-[11%] left-[10%] h-1 w-[24%] rounded-full bg-white/15" />
        </>
      )}
    </div>
  );
}
