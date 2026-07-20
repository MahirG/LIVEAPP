"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Captions,
  Check,
  ChevronDown,
  Eye,
  Gift,
  Heart,
  Maximize,
  MessageCircle,
  MoreHorizontal,
  Radio,
  Send,
  Share2,
  Sparkles,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { LiveScene } from "@/components/live-scene";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import type { LiveStream } from "@/lib/live-data";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessageRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  name: string;
  initials: string;
  message: string;
  accent: string;
  supporter?: boolean;
};

const initialMessages: ChatMessage[] = [
  { id: 1, name: "Liya", initials: "LB", message: "The city looks beautiful tonight ✨", accent: "bg-[#d45778]" },
  { id: 2, name: "Yonatan", initials: "YO", message: "Can you show us the new art district?", accent: "bg-[#4f76cd]", supporter: true },
  { id: 3, name: "Samira", initials: "SA", message: "Watching from Nairobi!", accent: "bg-[#4c9b7d]" },
  { id: 4, name: "Dawit", initials: "DA", message: "That sunset is unreal", accent: "bg-[#a36fd0]" },
  { id: 5, name: "Mekdes", initials: "ME", message: "Welcome everyone joining now 👋", accent: "bg-[#d18e45]" },
];

export function LiveRoom({ stream }: { stream: LiveStream }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(2840);
  const [followed, setFollowed] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [cleanView, setCleanView] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [databaseStreamId, setDatabaseStreamId] = useState<string | null>(null);
  const [chatNotice, setChatNotice] = useState("");
  const [presenceCount, setPresenceCount] = useState<number | null>(null);

  useEffect(() => {
    const client = createClient();
    if (!client) return;
    const supabase = client;

    let disposed = false;
    let roomChannel: ReturnType<typeof supabase.channel> | null = null;

    function initialsFor(name: string) {
      return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "LI";
    }

    async function profileFor(authorId: string) {
      const { data } = await supabase.from("profiles").select("display_name, username").eq("id", authorId).maybeSingle();
      return data?.display_name || data?.username || "LIVE member";
    }

    async function connectRealtimeRoom() {
      const { data: databaseStream } = await supabase.from("streams").select("id").eq("slug", stream.id).maybeSingle();
      if (!databaseStream || disposed) return;

      setDatabaseStreamId(databaseStream.id);
      const { data: rows } = await supabase
        .from("chat_messages")
        .select("id, stream_id, author_id, body, moderation_state, reply_to_id, created_at")
        .eq("stream_id", databaseStream.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (rows && !disposed) {
        const authorIds = [...new Set(rows.map((row) => row.author_id))];
        const { data: profiles } = authorIds.length
          ? await supabase.from("profiles").select("id, display_name, username").in("id", authorIds)
          : { data: [] };
        const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name || profile.username]));
        setMessages(rows.map((row) => {
          const name = names.get(row.author_id) ?? "LIVE member";
          return { id: row.id, name, initials: initialsFor(name), message: row.body, accent: "bg-[#5d73ff]" };
        }));
      }

      roomChannel = supabase
        .channel(`stream:${databaseStream.id}`, { config: { presence: { key: crypto.randomUUID() } } })
        .on("presence", { event: "sync" }, () => {
          if (!roomChannel) return;
          setPresenceCount(Object.keys(roomChannel.presenceState()).length);
        })
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `stream_id=eq.${databaseStream.id}` },
          async (payload) => {
            const row = payload.new as ChatMessageRow;
            const name = await profileFor(row.author_id);
            if (disposed) return;
            setMessages((current) => current.some((message) => message.id === row.id)
              ? current
              : [...current, { id: row.id, name, initials: initialsFor(name), message: row.body, accent: "bg-[#5d73ff]" }]);
          },
        )
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED" && roomChannel) {
            setChatNotice("Realtime chat connected");
            await roomChannel.track({ joined_at: new Date().toISOString() });
          }
        });
    }

    void connectRealtimeRoom();
    return () => {
      disposed = true;
      if (roomChannel) void supabase.removeChannel(roomChannel);
    };
  }, [stream.id]);

  const formattedLikes = (likes / 1000).toFixed(1) + "K";

  function toggleLike() {
    setLiked((current) => {
      setLikes((count) => count + (current ? -1 : 1));
      return !current;
    });
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;

    const supabase = createClient();
    if (supabase && databaseStreamId) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setChatNotice("Sign in from your profile to participate in connected chat.");
        return;
      }

      const { error } = await supabase.from("chat_messages").insert({
        stream_id: databaseStreamId,
        author_id: userData.user.id,
        body: message,
      });
      if (error) {
        setChatNotice(error.message);
        return;
      }

      setDraft("");
      return;
    }

    setMessages((current) => [
      ...current,
      { id: current.length + 20, name: "You", initials: "MA", message, accent: "bg-[#5d73ff]" },
    ]);
    setDraft("");
  }

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-[#050609] text-white">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[.07] bg-[#090a0e] px-3 sm:px-5">
        <Link href="/" className="grid size-10 place-items-center rounded-full text-[#a7acb7] transition hover:bg-white/[.07] hover:text-white" aria-label="Back to home">
          <ArrowLeft className="size-5" />
        </Link>
        <UserAvatar initials={stream.initials} className="size-9 bg-gradient-to-br from-[#6d7fff] to-[#b45fc6]" live />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-sm font-extrabold">{stream.host}</h1>
            <span className="grid size-4 place-items-center rounded-full bg-[#5d73ff]">
              <Check className="size-2.5" strokeWidth={3.5} />
            </span>
          </div>
          <div className="truncate text-[11px] text-[#777d89]">{stream.category} · {stream.language}</div>
        </div>
        <Button
          variant={followed ? "secondary" : "default"}
          size="sm"
          className="ml-1"
          onClick={() => setFollowed((current) => !current)}
        >
          {followed ? "Following" : "Follow"}
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <div className="mr-1 hidden items-center gap-1.5 rounded-full bg-white/[.06] px-3 py-2 text-xs font-semibold text-[#b4b8c1] sm:flex">
            <Eye className="size-3.5" />
            {stream.viewers}
          </div>
          <Button variant="ghost" size="icon" aria-label="Share stream"><Share2 /></Button>
          <Button variant="ghost" size="icon" aria-label="More options"><MoreHorizontal /></Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="relative flex min-h-[58vh] flex-1 items-center justify-center overflow-hidden bg-black lg:min-h-0">
          <div className="relative aspect-[9/16] h-full max-h-[calc(100vh-64px)] w-auto max-w-full overflow-hidden bg-[#1b1730] shadow-[0_0_100px_rgba(0,0,0,.7)] sm:aspect-[16/10] sm:h-auto sm:w-[92%] sm:rounded-[20px] lg:w-[95%] xl:aspect-video">
            <LiveScene stream={stream} large />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" />

            {!cleanView && (
              <>
                <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
                  <Badge className="border-0 bg-[#ff3f63] shadow-lg">
                    <Radio className="mr-1.5 size-3" strokeWidth={3} />
                    Live
                  </Badge>
                  <span className="rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">{stream.started}</span>
                </div>

                <div className="absolute bottom-20 left-4 max-w-[76%] sm:bottom-6 sm:left-6">
                  <div className="text-lg font-extrabold tracking-[-.02em] sm:text-2xl">{stream.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 backdrop-blur-md">{stream.category}</span>
                    <span>{stream.language}</span>
                  </div>
                </div>

                {captions && (
                  <div className="absolute bottom-[124px] left-1/2 w-[78%] -translate-x-1/2 text-center sm:bottom-24 sm:w-[66%]">
                    <span className="box-decoration-clone bg-black/70 px-2 py-1 text-[13px] font-semibold leading-7 text-white shadow-lg sm:text-sm">
                      The city changes every night, but the energy always feels familiar.
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/30 p-1 backdrop-blur-md sm:bottom-5 sm:right-5">
                  <button className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white" aria-label="Volume"><Volume2 className="size-4" /></button>
                  <button
                    onClick={() => setCaptions((current) => !current)}
                    className={cn("grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white", captions && "bg-white/15 text-white")}
                    aria-label="Toggle captions"
                    aria-pressed={captions}
                  >
                    <Captions className="size-4" />
                  </button>
                  <button className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white" aria-label="Fullscreen"><Maximize className="size-4" /></button>
                </div>
              </>
            )}

            <button
              onClick={() => setCleanView((current) => !current)}
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/25 text-white/75 opacity-0 backdrop-blur-md transition hover:text-white focus-visible:opacity-100 group-hover:opacity-100 sm:right-5 sm:top-5"
              aria-label={cleanView ? "Show controls" : "Hide controls"}
            >
              {cleanView ? <Sparkles className="size-4" /> : <X className="size-4" />}
            </button>
          </div>

          {!cleanView && (
            <div className="absolute bottom-4 right-3 flex flex-col items-center gap-2 lg:bottom-8 lg:right-5">
              <button
                onClick={toggleLike}
                className="group flex flex-col items-center gap-1"
                aria-label="Like stream"
                aria-pressed={liked}
              >
                <span className={cn("grid size-11 place-items-center rounded-full border border-white/10 bg-[#111319]/80 text-white shadow-xl backdrop-blur-md transition group-hover:scale-105", liked && "border-[#ff3f63]/30 bg-[#ff3f63] text-white")}>
                  <Heart className={cn("size-[19px]", liked && "fill-current")} />
                </span>
                <span className="text-[10px] font-bold text-white/80">{formattedLikes}</span>
              </button>
              <button className="group flex flex-col items-center gap-1">
                <span className="grid size-11 place-items-center rounded-full border border-white/10 bg-[#111319]/80 text-white shadow-xl backdrop-blur-md transition group-hover:scale-105">
                  <Gift className="size-[19px]" />
                </span>
                <span className="text-[10px] font-bold text-white/80">Support</span>
              </button>
              <button onClick={() => setChatOpen((current) => !current)} className="group flex flex-col items-center gap-1 lg:hidden">
                <span className="grid size-11 place-items-center rounded-full border border-white/10 bg-[#111319]/80 text-white shadow-xl backdrop-blur-md">
                  <MessageCircle className="size-[19px]" />
                </span>
                <span className="text-[10px] font-bold text-white/80">Chat</span>
              </button>
            </div>
          )}
        </section>

        <aside className={cn(
          "flex min-h-0 w-full shrink-0 flex-col border-l border-white/[.07] bg-[#0c0e12] lg:w-[370px]",
          !chatOpen && "hidden lg:flex",
        )}>
          <div className="flex h-14 shrink-0 items-center border-b border-white/[.07] px-4">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              Live chat
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#6f7581]"><Users className="size-3" /> {presenceCount === null ? "3.4K" : presenceCount}</span>
            </div>
            <button className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold text-[#8a909b] hover:bg-white/[.05] hover:text-white">
              Top chat <ChevronDown className="size-3" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
            <div className="rounded-[14px] border border-[#5d73ff]/20 bg-[#5d73ff]/10 p-3 text-xs leading-5 text-[#afb8ef]">
              Be kind and keep personal information private. <button className="font-bold text-white">View room rules</button>
            </div>
            {messages.map((message) => (
              <div key={message.id} className="group flex gap-2.5">
                <UserAvatar initials={message.initials} tone={message.accent} className="mt-0.5 size-7 text-[9px] ring-1" />
                <div className="min-w-0 text-[13px] leading-5">
                  <span className={cn("mr-1.5 font-bold text-[#969ca8]", message.supporter && "text-[#a8b4ff]")}>{message.name}</span>
                  {message.supporter && <span className="mr-1.5 rounded bg-[#5d73ff]/20 px-1 py-0.5 text-[8px] font-extrabold uppercase text-[#a8b4ff]">Member</span>}
                  <span className="text-[#d4d7de]">{message.message}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="shrink-0 border-t border-white/[.07] p-3">
            <div className="flex items-center gap-2 rounded-[16px] border border-white/[.09] bg-white/[.045] p-1.5 pl-3 focus-within:border-[#5d73ff]/60">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Say something…"
                maxLength={240}
                className="h-8 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#5f6571]"
                aria-label="Chat message"
              />
              <button type="submit" className="grid size-9 place-items-center rounded-xl bg-[#5d73ff] text-white transition hover:bg-[#7185ff]" aria-label="Send message">
                <Send className="size-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#5f6570]">
              <span>{chatNotice || "Chat is translated to your language"}</span>
              <span>{draft.length}/240</span>
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
