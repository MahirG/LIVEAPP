import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-[#7590ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090c] [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#5d73ff] text-white shadow-[0_10px_30px_rgba(93,115,255,.28)] hover:bg-[#6d81ff] active:scale-[.98]",
        secondary: "border border-white/10 bg-white/[.07] text-white hover:border-white/20 hover:bg-white/[.11]",
        ghost: "text-[#b7bbc6] hover:bg-white/[.07] hover:text-white",
        outline: "border border-white/15 bg-transparent text-white hover:border-white/30 hover:bg-white/[.05]",
        live: "bg-[#ff3f63] text-white shadow-[0_10px_30px_rgba(255,63,99,.26)] hover:bg-[#ff5776] active:scale-[.98]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-7 text-[15px]",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
