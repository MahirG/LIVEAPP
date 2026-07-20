import Link from "next/link";
import { Radio } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label="LIVE home">
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-[14px] bg-[#5d73ff] text-white shadow-[0_10px_30px_rgba(93,115,255,.25)]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.4),transparent_40%)]" />
        <Radio className="relative size-5 transition-transform group-hover:scale-110" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-[-.03em] text-white">
          LIVE<span className="text-[#7185ff]">.</span>
        </span>
      )}
    </Link>
  );
}
