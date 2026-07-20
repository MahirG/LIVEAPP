"use client";

import { CheckCircle2, KeyRound, LoaderCircle, LogOut, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AuthState = "checking" | "signed-out" | "signed-in";

export function AuthPanel({ compact = false }: { compact?: boolean }) {
  const configured = isSupabaseConfigured();
  const [authState, setAuthState] = useState<AuthState>(configured ? "checking" : "signed-out");
  const [email, setEmail] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setAccountEmail(data.user?.email ?? "");
      setAuthState(data.user ? "signed-in" : "signed-out");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccountEmail(session?.user.email ?? "");
      setAuthState(session ? "signed-in" : "signed-out");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function requestMagicLink(event: FormEvent) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        data: { display_name: email.split("@")[0] },
      },
    });
    setLoading(false);
    setMessage(error ? error.message : "Check your inbox. Your secure sign-in link is on the way.");
  }

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  if (!configured) {
    return (
      <div className="rounded-[22px] border border-[#5d73ff]/20 bg-[#151832] p-5">
        <div className="flex items-center gap-2 text-sm font-extrabold text-white">
          <ShieldCheck className="size-[18px] text-[#8ea0ff]" /> Backend connection ready
        </div>
        <p className="mt-2 text-xs leading-5 text-[#949bb8]">
          Add the Supabase URL and publishable key from <code className="text-[#c6cced]">.env.example</code> to activate secure accounts.
        </p>
      </div>
    );
  }

  if (authState === "checking") {
    return <div className="flex items-center gap-2 text-sm text-[#8b919d]"><LoaderCircle className="size-4 animate-spin" /> Checking your session…</div>;
  }

  if (authState === "signed-in") {
    return (
      <div className="flex flex-col gap-4 rounded-[22px] border border-[#32b88d]/20 bg-[#10221d] p-5 sm:flex-row sm:items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#32b88d]/15 text-[#5bd0aa]"><CheckCircle2 className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold">Account connected</div>
          <div className="mt-1 truncate text-xs text-[#86a99e]">{accountEmail}</div>
        </div>
        <Button variant="secondary" size="sm" onClick={signOut} disabled={loading}><LogOut /> Sign out</Button>
      </div>
    );
  }

  return (
    <form onSubmit={requestMagicLink} className={compact ? "space-y-3" : "rounded-[24px] border border-white/[.08] bg-[#101217] p-5 sm:p-6"}>
      {!compact && (
        <div className="mb-5 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#5d73ff]/15 text-[#94a4ff]"><KeyRound className="size-5" /></span>
          <div><div className="text-sm font-extrabold">Passwordless sign in</div><p className="mt-1 text-xs leading-5 text-[#777e8a]">One secure email link. No password to remember or leak.</p></div>
        </div>
      )}
      <label htmlFor="auth-email" className="text-[10px] font-bold uppercase tracking-[.1em] text-[#777d89]">Email address</label>
      <div className="mt-2 flex items-center gap-2 rounded-[15px] border border-white/[.09] bg-white/[.04] px-3.5 focus-within:border-[#5d73ff]/65">
        <Mail className="size-4 text-[#6f7581]" />
        <input id="auth-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#575d69]" />
      </div>
      <Button className="mt-3 w-full" type="submit" disabled={loading || !email}>
        {loading ? <LoaderCircle className="animate-spin" /> : <Mail />} Email me a secure link
      </Button>
      {message && <p className="mt-3 text-xs leading-5 text-[#9ba5d4]" role="status">{message}</p>}
    </form>
  );
}
