import { cn } from "@/lib/utils";

export function UserAvatar({
  initials,
  className,
  tone = "bg-[#5d73ff]",
  live = false,
}: {
  initials: string;
  className?: string;
  tone?: string;
  live?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-grid size-10 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white ring-2 ring-[#08090c]",
        live && "ring-[#ff3f63] ring-offset-2 ring-offset-[#08090c]",
        tone,
        className,
      )}
      aria-hidden="true"
    >
      {initials}
      {live && (
        <span className="absolute -bottom-1 rounded-[4px] bg-[#ff3f63] px-1 text-[7px] font-black leading-[12px] tracking-wide ring-2 ring-[#08090c]">
          LIVE
        </span>
      )}
    </span>
  );
}
