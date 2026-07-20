import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border border-white/10 bg-white/[.08] px-2.5 text-[11px] font-bold uppercase tracking-[.08em] text-white",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
