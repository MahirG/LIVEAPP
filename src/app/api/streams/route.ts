import { NextResponse } from "next/server";

import { liveStreams } from "@/lib/live-data";
import { getLiveVideoProvider } from "@/lib/live/provider";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  const base = value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `${base || "live"}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ mode: "demo", streams: liveStreams });

  const { data, error } = await supabase
    .from("streams")
    .select("id, slug, title, topic, language, status, viewer_count, started_at, creator_id")
    .eq("status", "live")
    .eq("visibility", "public")
    .order("started_at", { ascending: false })
    .limit(24);

  if (error) return NextResponse.json({ error: "Unable to load live streams." }, { status: 500 });
  return NextResponse.json({ mode: "connected", streams: data });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { title?: unknown; topic?: unknown; language?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  const language = typeof body?.language === "string" ? body.language.trim() : "English";

  if (title.length < 3 || title.length > 90 || topic.length < 2 || topic.length > 60) {
    return NextResponse.json({ error: "Check the stream title and topic." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({
      mode: "demo",
      stream: { id: `demo-${Date.now()}`, slug: slugify(title), title, topic, status: "preflight" },
      transport: { provider: "demo", roomId: "local-preview", mode: "preview" },
    }, { status: 201 });
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const creatorId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  if (claimsError || !creatorId) return NextResponse.json({ error: "Sign in before starting a broadcast." }, { status: 401 });

  const streamId = crypto.randomUUID();
  const transport = await getLiveVideoProvider().createSession({ streamId, creatorId });
  const { data, error } = await supabase.from("streams").insert({
    id: streamId,
    creator_id: creatorId,
    slug: slugify(title),
    title,
    topic,
    language,
    status: "preflight",
    visibility: "public",
    provider: transport.provider,
    provider_room_id: transport.roomId,
  }).select().single();

  if (error) return NextResponse.json({ error: "Unable to prepare the broadcast." }, { status: 500 });
  return NextResponse.json({ mode: "connected", stream: data, transport }, { status: 201 });
}
