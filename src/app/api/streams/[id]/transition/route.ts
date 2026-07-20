import { NextResponse } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type StreamStatus = Database["public"]["Enums"]["stream_status"];
const allowedStatuses = new Set<StreamStatus>(["scheduled", "preflight", "live", "ended", "cancelled"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as { status?: unknown } | null;
  const status = body?.status;
  if (typeof status !== "string" || !allowedStatuses.has(status as StreamStatus)) {
    return NextResponse.json({ error: "Invalid stream status." }, { status: 400 });
  }

  if (id.startsWith("demo-")) return NextResponse.json({ mode: "demo", id, status });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ mode: "demo", id, status });

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await supabase.from("streams").update({ status: status as StreamStatus }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ mode: "connected", stream: data });
}
