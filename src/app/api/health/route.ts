import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({
      status: "ok",
      mode: "demo",
      checkedAt,
      services: { application: "healthy", database: "not_configured", video: "preview" },
    });
  }

  const started = performance.now();
  const { error } = await supabase.from("streams").select("id", { head: true, count: "exact" }).limit(1);
  const latencyMs = Math.round(performance.now() - started);

  return NextResponse.json({
    status: error ? "degraded" : "ok",
    mode: "connected",
    checkedAt,
    services: {
      application: "healthy",
      database: error ? "unavailable" : "healthy",
      databaseLatencyMs: latencyMs,
      video: process.env.LIVE_VIDEO_PROVIDER === "demo" || !process.env.LIVE_VIDEO_PROVIDER ? "preview" : "configured",
    },
  }, { status: error ? 503 : 200 });
}
