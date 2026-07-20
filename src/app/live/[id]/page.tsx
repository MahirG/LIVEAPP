import { notFound } from "next/navigation";

import { LiveRoom } from "@/components/live-room";
import { getLiveStream, liveStreams } from "@/lib/live-data";
import type { LiveStream } from "@/lib/live-data";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return liveStreams.map((stream) => ({ id: stream.id }));
}

export default async function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let stream = getLiveStream(id);

  if (!stream) {
    const supabase = await createClient();
    const { data } = supabase
      ? await supabase
        .from("streams")
        .select("slug, title, topic, language, viewer_count, started_at, profiles!streams_creator_id_fkey(display_name, username)")
        .eq("slug", id)
        .maybeSingle()
      : { data: null };

    if (data) {
      const profile = data.profiles as unknown as { display_name: string; username: string } | null;
      const host = profile?.display_name || profile?.username || "LIVE creator";
      stream = {
        id: data.slug,
        title: data.title,
        host,
        initials: host.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "LI",
        handle: profile?.username ? `@${profile.username}` : "@livecreator",
        category: data.topic,
        viewers: new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(data.viewer_count),
        language: data.language,
        started: data.started_at ? "Live now" : "Starting soon",
        accent: "from-[#17224d] via-[#3f4f9f] to-[#d65d88]",
        scene: "studio",
      } satisfies LiveStream;
    }
  }

  if (!stream) notFound();
  return <LiveRoom stream={stream} />;
}
