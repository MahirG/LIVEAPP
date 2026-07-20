import { LockKeyhole, Sparkles } from "lucide-react";

import { AuthPanel } from "@/components/auth-panel";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Sign in" };

export default function AuthPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <div>
        <Badge className="border-[#5d73ff]/25 bg-[#5d73ff]/10 text-[#a8b4ff]"><Sparkles className="mr-1.5 size-3" /> Your LIVE identity</Badge>
        <h1 className="mt-5 max-w-xl text-[38px] font-extrabold leading-[1.03] tracking-[-.05em] sm:text-[54px]">Show up as yourself. Stay in control.</h1>
        <p className="mt-5 max-w-lg text-sm leading-7 text-[#898f9b]">Follow creators, participate in realtime chat, and start broadcasts with one secure account.</p>
        <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#6f7682]"><LockKeyhole className="size-4 text-[#4ac39d]" /> Sessions are stored in secure, HTTP-only-compatible cookies.</div>
      </div>
      <AuthPanel />
    </div>
  );
}
