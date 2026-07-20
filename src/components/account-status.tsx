import Link from "next/link";

import { AuthPanel } from "@/components/auth-panel";
import { createClient } from "@/lib/supabase/server";

export async function AccountStatus() {
  const supabase = await createClient();
  if (!supabase) return <AuthPanel />;

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return (
      <div className="flex flex-col gap-4 rounded-[22px] border border-[#5d73ff]/20 bg-[#151832] p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1"><div className="text-sm font-extrabold">Make this profile yours</div><p className="mt-1 text-xs text-[#949bb8]">Sign in to save your profile, streams, follows, and chat history.</p></div>
        <Link href="/auth" className="inline-flex h-10 items-center justify-center rounded-full bg-[#5d73ff] px-5 text-xs font-bold text-white">Sign in</Link>
      </div>
    );
  }

  return <AuthPanel />;
}
