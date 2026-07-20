import { notFound } from "next/navigation";

import { LiveRoom } from "@/components/live-room";
import { getLiveStream, liveStreams } from "@/lib/live-data";

export function generateStaticParams() {
  return liveStreams.map((stream) => ({ id: stream.id }));
}

export default async function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stream = getLiveStream(id);
  if (!stream) notFound();
  return <LiveRoom stream={stream} />;
}
